'use client'
import { useState } from 'react'
import Image from 'next/image'
import Lightbox from './Lightbox'
import type { ProjectWithImages } from '@/lib/types'

interface Props {
  projects: ProjectWithImages[]
}

export default function HomeFeaturedProjects({ projects }: Props) {
  const [lightboxProject, setLightboxProject] = useState<ProjectWithImages | null>(null)
  const [lightboxIdx, setLightboxIdx] = useState(0)

  function open(project: ProjectWithImages) {
    setLightboxProject(project)
    setLightboxIdx(0)
  }

  return (
    <>
      <div className="hp-projects-grid">
        {projects.map((p, i) => {
          const cover = p.images.find(img => img.is_cover) ?? p.images[0]
          return (
            <button
              key={p.id}
              className={`hp-project-card reveal delay-${i + 1}`}
              onClick={() => open(p)}
              aria-label={`${p.title} projesini görüntüle`}
            >
              <div className="hp-project-card__img">
                {cover?.url && (
                  <Image
                    src={cover.url}
                    alt={p.title}
                    fill
                    sizes="(max-width:768px) 100vw, 40vw"
                    style={{ objectFit: 'cover' }}
                  />
                )}
              </div>
              <div className="hp-project-card__info">
                <span className="hp-project-card__cat">{p.category?.name}</span>
                <span className="hp-project-card__title">{p.title}</span>
              </div>
            </button>
          )
        })}
      </div>

      {lightboxProject && (
        <Lightbox
          project={lightboxProject}
          imageIndex={lightboxIdx}
          onClose={() => setLightboxProject(null)}
          onPrev={() => setLightboxIdx(i => Math.max(0, i - 1))}
          onNext={() => setLightboxIdx(i => Math.min(lightboxProject.images.length - 1, i + 1))}
          onJump={setLightboxIdx}
        />
      )}
    </>
  )
}
