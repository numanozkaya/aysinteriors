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
}

export default function Lightbox({ project, imageIndex, onClose, onPrev, onNext }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, onPrev, onNext])

  const img = project.images[imageIndex]

  return (
    <div className="lightbox" onClick={onClose} role="dialog" aria-modal="true">
      <div className="lightbox__inner" onClick={e => e.stopPropagation()}>
        <button className="lightbox__close" onClick={onClose} aria-label="Kapat"><X size={20} /></button>
        <div className="lightbox__img-wrap">
          {img?.url && (
            <Image src={img.url} alt={project.title} fill sizes="90vw" style={{ objectFit: 'contain' }} />
          )}
          {project.images.length > 1 && (
            <>
              <button className="lightbox__prev" onClick={onPrev} aria-label="Önceki"><ChevronLeft size={28} /></button>
              <button className="lightbox__next" onClick={onNext} aria-label="Sonraki"><ChevronRight size={28} /></button>
            </>
          )}
        </div>
        <div className="lightbox__meta">
          <h3 className="lightbox__title">{project.title}</h3>
          {project.category && <span className="lightbox__cat">{project.category.name}</span>}
          <p className="lightbox__info">{project.location} · {project.year}{project.area_sqm ? ` · ${project.area_sqm} m²` : ''}</p>
          {project.description && <p className="lightbox__desc">{project.description}</p>}
          {project.materials.length > 0 && (
            <ul className="lightbox__materials">
              {project.materials.map(m => <li key={m}>{m}</li>)}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
