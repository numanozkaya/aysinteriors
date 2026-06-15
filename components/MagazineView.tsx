'use client'
import { useState, useCallback, useEffect, useRef } from 'react'
import Image from 'next/image'
import Lightbox from './Lightbox'
import type { Category, ProjectWithImages } from '@/lib/types'

interface MagazinePage {
  project: ProjectWithImages
  category: Category
  indexInCategory: number
  totalInCategory: number
}

interface Props {
  projects: ProjectWithImages[]
  categories: Category[]
}

export default function MagazineView({ projects, categories }: Props) {
  const pages: MagazinePage[] = []
  const sortedCats = [...categories].sort((a, b) => a.sort_order - b.sort_order)

  for (const cat of sortedCats) {
    const catProjects = projects.filter(p => p.category?.id === cat.id)
    catProjects.forEach((proj, idx) => {
      pages.push({
        project: proj,
        category: cat,
        indexInCategory: idx,
        totalInCategory: catProjects.length,
      })
    })
  }

  const uncategorized = projects.filter(p => !p.category)
  uncategorized.forEach((proj, idx) => {
    pages.push({
      project: proj,
      category: { id: '', name: 'Diğer', slug: 'diger', sort_order: 999 },
      indexInCategory: idx,
      totalInCategory: uncategorized.length,
    })
  })

  const [currentIndex, setCurrentIndex] = useState(0)
  const [pendingIndex, setPendingIndex] = useState<number | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [textVisible, setTextVisible] = useState(true)
  const [lightboxProject, setLightboxProject] = useState<ProjectWithImages | null>(null)
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0)

  const leafRef = useRef<HTMLDivElement>(null)
  const isAnimatingRef = useRef(false)
  const touchStartX = useRef<number | null>(null)
  const mouseStartX = useRef<number | null>(null)
  const mouseDragged = useRef(false)

  const getCoverImage = (proj: ProjectWithImages) => {
    const cover = proj.images.find(i => i.is_cover) ?? proj.images[0]
    return cover?.url ?? null
  }

  const goTo = useCallback(
    (targetIndex: number) => {
      if (isAnimatingRef.current || targetIndex === currentIndex) return
      if (targetIndex < 0 || targetIndex >= pages.length) return
      isAnimatingRef.current = true
      setIsAnimating(true)
      setTextVisible(false)
      setPendingIndex(targetIndex)
    },
    [currentIndex, pages.length],
  )

  // Trigger 3D flip after React commits new pendingIndex to DOM
  useEffect(() => {
    if (pendingIndex === null) return
    const leaf = leafRef.current
    if (!leaf) return

    requestAnimationFrame(() => {
      leaf.classList.add('mag-leaf--flipping')

      const timer = setTimeout(() => {
        leaf.style.transition = 'none'
        leaf.classList.remove('mag-leaf--flipping')
        void leaf.offsetHeight
        leaf.style.transition = ''

        setCurrentIndex(pendingIndex)
        setPendingIndex(null)
        setIsAnimating(false)
        isAnimatingRef.current = false
        setTimeout(() => setTextVisible(true), 60)
      }, 940)

      return () => clearTimeout(timer)
    })
  }, [pendingIndex])

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goTo(currentIndex + 1)
      if (e.key === 'ArrowLeft') goTo(currentIndex - 1)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [goTo, currentIndex])

  // Touch swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 60) {
      if (diff > 0) goTo(currentIndex + 1)
      else goTo(currentIndex - 1)
    }
    touchStartX.current = null
  }

  // Mouse drag
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only primary button, ignore clicks on arrow buttons
    if (e.button !== 0) return
    mouseStartX.current = e.clientX
    mouseDragged.current = false
  }
  const handleMouseMove = (e: React.MouseEvent) => {
    if (mouseStartX.current === null) return
    if (Math.abs(e.clientX - mouseStartX.current) > 8) {
      mouseDragged.current = true
    }
  }
  const handleMouseUp = (e: React.MouseEvent) => {
    if (mouseStartX.current === null) return
    const diff = mouseStartX.current - e.clientX
    if (mouseDragged.current && Math.abs(diff) > 80) {
      if (diff > 0) goTo(currentIndex + 1)
      else goTo(currentIndex - 1)
    }
    mouseStartX.current = null
    mouseDragged.current = false
  }
  const handleMouseLeave = () => {
    mouseStartX.current = null
    mouseDragged.current = false
  }

  if (pages.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-state__title">Henüz proje eklenmemiş</p>
      </div>
    )
  }

  const displayPage = pages[currentIndex]
  const flipTargetPage = pendingIndex !== null ? pages[pendingIndex] : null

  const baseImgUrl = flipTargetPage
    ? getCoverImage(flipTargetPage.project)
    : getCoverImage(displayPage.project)

  const leafFrontUrl = getCoverImage(displayPage.project)
  const leafBackUrl = flipTargetPage ? getCoverImage(flipTargetPage.project) : null

  const catGroups = sortedCats
    .map(cat => ({
      cat,
      firstPageIndex: pages.findIndex(p => p.category.id === cat.id),
      count: pages.filter(p => p.category.id === cat.id).length,
    }))
    .filter(g => g.count > 0)

  const canPrev = currentIndex > 0 && !isAnimating
  const canNext = currentIndex < pages.length - 1 && !isAnimating

  return (
    <>
      <div className="magazine-outer">
        {/* Magazine book + side arrows wrapper */}
        <div
          className="magazine-book-wrap"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {/* LEFT ARROW — overlaid on the left side */}
          <button
            className={`mag-side-arrow mag-side-arrow--left${!canPrev ? ' mag-side-arrow--hidden' : ''}`}
            onClick={e => { e.stopPropagation(); goTo(currentIndex - 1) }}
            disabled={!canPrev}
            aria-label="Önceki sayfa"
          >
            <span>‹</span>
          </button>

          <div className="magazine-book">
            {/* LEFT — text side */}
            <div className={`mag-left${textVisible ? ' mag-left--visible' : ' mag-left--hidden'}`}>
              <div className="mag-left__inner">
                <p className="mag-left__issue">Ays Interiors · {displayPage.project.year}</p>
                <p className="mag-left__cat">— {displayPage.category.name}</p>
                <h2 className="mag-left__title">{displayPage.project.title}</h2>
                {displayPage.project.location && (
                  <p className="mag-left__location">{displayPage.project.location}</p>
                )}
                <hr className="mag-left__rule" />
                {displayPage.project.description && (
                  <p className="mag-left__desc">{displayPage.project.description}</p>
                )}
                <div className="mag-left__meta">
                  {displayPage.project.area_sqm && (
                    <div className="mag-meta-item">
                      <span className="mag-meta-label">Alan</span>
                      <span className="mag-meta-val">{displayPage.project.area_sqm} m²</span>
                    </div>
                  )}
                  <div className="mag-meta-item">
                    <span className="mag-meta-label">Yıl</span>
                    <span className="mag-meta-val">{displayPage.project.year}</span>
                  </div>
                  {displayPage.project.location && (
                    <div className="mag-meta-item">
                      <span className="mag-meta-label">Konum</span>
                      <span className="mag-meta-val">{displayPage.project.location}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="mag-left__footer">
                <span className="mag-left__footer-cat">{displayPage.category.name}</span>
                <span className="mag-left__footer-num">
                  {String(displayPage.indexInCategory + 1).padStart(2, '0')} /{' '}
                  {String(displayPage.totalInCategory).padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* SPINE */}
            <div className="mag-spine" aria-hidden />

            {/* RIGHT — image side */}
            <div className="mag-right-wrap">
              <div className="mag-right">
                {baseImgUrl ? (
                  <Image
                    src={baseImgUrl}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 55vw"
                    className="mag-img"
                    priority
                  />
                ) : (
                  <div className="mag-right__placeholder" />
                )}

                {/* 3D flipping leaf */}
                <div className="mag-leaf" ref={leafRef}>
                  <div className="mag-leaf__face mag-leaf__face--front">
                    {leafFrontUrl ? (
                      <Image
                        src={leafFrontUrl}
                        alt={displayPage.project.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 55vw"
                        className="mag-img"
                      />
                    ) : (
                      <div className="mag-right__placeholder" />
                    )}
                    <div className="mag-leaf__shadow" aria-hidden />
                  </div>

                  <div className="mag-leaf__face mag-leaf__face--back">
                    {leafBackUrl ? (
                      <Image
                        src={leafBackUrl}
                        alt={flipTargetPage?.project.title ?? ''}
                        fill
                        sizes="(max-width: 768px) 100vw, 55vw"
                        className="mag-img"
                      />
                    ) : (
                      <div className="mag-right__placeholder" />
                    )}
                  </div>
                </div>

                {/* Lightbox — only fires if not dragging */}
                <button
                  className="mag-lightbox-trigger"
                  onClick={() => {
                    if (!isAnimating && !mouseDragged.current) {
                      setLightboxProject(displayPage.project)
                      setLightboxImageIndex(0)
                    }
                  }}
                  aria-label="Görseli büyüt"
                />

                <span className="mag-page-num" aria-hidden>
                  {String(currentIndex + 1).padStart(2, '0')} /{' '}
                  {String(pages.length).padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT ARROW — overlaid on the right side */}
          <button
            className={`mag-side-arrow mag-side-arrow--right${!canNext ? ' mag-side-arrow--hidden' : ''}`}
            onClick={e => { e.stopPropagation(); goTo(currentIndex + 1) }}
            disabled={!canNext}
            aria-label="Sonraki sayfa"
          >
            <span>›</span>
          </button>
        </div>

        {/* Bottom progress nav — no arrows here anymore */}
        <nav className="mag-nav" aria-label="Dergi navigasyonu">
          <p className="mag-nav__label">
            {displayPage.category.name} · {displayPage.indexInCategory + 1} /{' '}
            {displayPage.totalInCategory}
          </p>
          <div className="mag-nav__tracks">
            {catGroups.map(({ cat, firstPageIndex, count }) => {
              const isActive = displayPage.category.id === cat.id
              const progress = isActive
                ? (displayPage.indexInCategory + 1) / count
                : currentIndex >= firstPageIndex + count
                  ? 1
                  : 0
              return (
                <div
                  key={cat.id}
                  className={`mag-cat-track${isActive ? ' mag-cat-track--active' : ''}`}
                  onClick={() => goTo(firstPageIndex)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && goTo(firstPageIndex)}
                  title={cat.name}
                >
                  <div className="mag-cat-track__bar">
                    <div
                      className="mag-cat-track__fill"
                      style={{ width: `${progress * 100}%` }}
                    />
                  </div>
                  <span className="mag-cat-track__label">{cat.name}</span>
                </div>
              )
            })}
          </div>
        </nav>
      </div>

      {lightboxProject && (
        <Lightbox
          project={lightboxProject}
          imageIndex={lightboxImageIndex}
          onClose={() => setLightboxProject(null)}
          onPrev={() => setLightboxImageIndex(i => Math.max(0, i - 1))}
          onNext={() =>
            setLightboxImageIndex(i => Math.min(lightboxProject.images.length - 1, i + 1))
          }
          onJump={setLightboxImageIndex}
        />
      )}
    </>
  )
}
