'use client'
import { useEffect } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { ProjectWithImages } from '@/lib/types'

interface Props {
  project: ProjectWithImages
  imageIndex: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  onJump: (idx: number) => void
}

export default function Lightbox({ project, imageIndex, onClose, onPrev, onNext, onJump }: Props) {
  const images = project.images.slice().sort((a, b) => a.sort_order - b.sort_order)
  const img = images[imageIndex]
  const total = images.length

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose, onPrev, onNext])

  return (
    <div className="lb" onClick={onClose} role="dialog" aria-modal="true" aria-label={project.title}>

      {/* ── main image area ── */}
      <div className="lb__stage" onClick={e => e.stopPropagation()}>
        {img?.url && (
          <Image
            src={img.url}
            alt={project.title}
            fill
            sizes="100vw"
            style={{ objectFit: 'contain' }}
            priority
          />
        )}

        {/* close */}
        <button className="lb__close" onClick={onClose} aria-label="Kapat"><X size={20} /></button>

        {/* counter */}
        {total > 1 && (
          <span className="lb__counter">{imageIndex + 1} / {total}</span>
        )}

        {/* arrows */}
        {total > 1 && (
          <>
            <button
              className="lb__arrow lb__arrow--prev"
              onClick={e => { e.stopPropagation(); onPrev() }}
              aria-label="Önceki"
              disabled={imageIndex === 0}
            >
              <ChevronLeft size={32} />
            </button>
            <button
              className="lb__arrow lb__arrow--next"
              onClick={e => { e.stopPropagation(); onNext() }}
              aria-label="Sonraki"
              disabled={imageIndex === total - 1}
            >
              <ChevronRight size={32} />
            </button>
          </>
        )}
      </div>

      {/* ── bottom info bar ── */}
      <div className="lb__bar" onClick={e => e.stopPropagation()}>
        <div className="lb__bar-left">
          {project.category && <span className="lb__bar-cat">{project.category.name}</span>}
          <span className="lb__bar-title">{project.title}</span>
          <span className="lb__bar-meta">
            {[project.location, project.year, project.area_sqm ? `${project.area_sqm} m²` : null]
              .filter(Boolean).join(' · ')}
          </span>
        </div>
        {project.materials.length > 0 && (
          <div className="lb__bar-materials">
            {project.materials.map(m => <span key={m} className="lb__mat">{m}</span>)}
          </div>
        )}
      </div>

      {/* ── thumbnail strip ── */}
      {total > 1 && (
        <div className="lb__thumbs" onClick={e => e.stopPropagation()}>
          {images.map((im, i) => (
            <button
              key={im.id}
              className={`lb__thumb${i === imageIndex ? ' active' : ''}`}
              onClick={() => onJump(i)}
              aria-label={`Görsel ${i + 1}`}
            >
              <Image src={im.url} alt="" fill sizes="72px" style={{ objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
