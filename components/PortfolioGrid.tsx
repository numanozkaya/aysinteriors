'use client'
import { useState } from 'react'
import Image from 'next/image'
import Lightbox from './Lightbox'
import type { Category, ProjectWithImages } from '@/lib/types'

interface Props {
  projects: ProjectWithImages[]
  categories: Category[]
}

export default function PortfolioGrid({ projects, categories }: Props) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null)
  const [lightboxProject, setLightboxProject] = useState<ProjectWithImages | null>(null)
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0)

  const filtered = activeSlug
    ? projects.filter(p => p.category?.slug === activeSlug)
    : projects

  function openLightbox(project: ProjectWithImages, idx = 0) {
    setLightboxProject(project)
    setLightboxImageIndex(idx)
  }

  return (
    <>
      <div className="portfolio-filters" role="tablist" aria-label="Kategori filtresi">
        <button
          className={`portfolio-filter${!activeSlug ? ' active' : ''}`}
          onClick={() => setActiveSlug(null)}
          role="tab"
        >
          Tümü
        </button>
        {categories.map(c => (
          <button
            key={c.id}
            className={`portfolio-filter${activeSlug === c.slug ? ' active' : ''}`}
            onClick={() => setActiveSlug(c.slug)}
            role="tab"
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="portfolio-grid portfolio-grid--3col">
        {filtered.map(project => {
          const cover = project.images.find(i => i.is_cover) ?? project.images[0]
          return (
            <article
              key={project.id}
              id={project.id}
              className="portfolio-card"
              onClick={() => openLightbox(project)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && openLightbox(project)}
            >
              <div className="portfolio-card__img-wrap">
                {cover?.url ? (
                  <Image
                    src={cover.url}
                    alt={project.title}
                    fill
                    sizes="(max-width:768px) 100vw, (max-width:1024px) 50vw, 33vw"
                    className="portfolio-card__img"
                  />
                ) : (
                  <div className="portfolio-card__placeholder" />
                )}
                <div className="portfolio-card__overlay">
                  {project.category && <span className="portfolio-card__cat">{project.category.name}</span>}
                  <span className="portfolio-card__title">{project.title}</span>
                  <span className="portfolio-card__city">{project.location} · {project.year}</span>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {lightboxProject && (
        <Lightbox
          project={lightboxProject}
          imageIndex={lightboxImageIndex}
          onClose={() => setLightboxProject(null)}
          onPrev={() => setLightboxImageIndex(i => Math.max(0, i - 1))}
          onNext={() => setLightboxImageIndex(i => Math.min(lightboxProject.images.length - 1, i + 1))}
          onJump={setLightboxImageIndex}
        />
      )}
    </>
  )
}
