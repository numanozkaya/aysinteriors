'use client'
import { useState } from 'react'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import ImageUploader from './ImageUploader'
import type { Project, Category, ProjectImage } from '@/lib/types'

interface Props {
  project: (Project & { images: ProjectImage[] }) | null
  categories: Category[]
  onClose: () => void
  onSaved: () => void
}

export default function ProjectModal({ project, categories, onClose, onSaved }: Props) {
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [images, setImages] = useState<ProjectImage[]>(project?.images ?? [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const fd = new FormData(e.currentTarget)

    const cover = images.find(i => i.is_cover) ?? images[0]
    const payload = {
      title: fd.get('title') as string,
      category_id: (fd.get('category_id') as string) || null,
      location: fd.get('location') as string,
      year: parseInt(fd.get('year') as string),
      area_sqm: fd.get('area_sqm') ? parseInt(fd.get('area_sqm') as string) : null,
      description: fd.get('description') as string,
      materials: (fd.get('materials') as string).split(',').map(s => s.trim()).filter(Boolean),
      featured: (fd.get('featured') as string) === 'on',
      cover_image_url: cover?.url ?? null,
    }

    if (project) {
      await supabase.from('projects').update(payload).eq('id', project.id)
    } else {
      await supabase.from('projects').insert(payload)
    }

    setSaving(false)
    onSaved()
    onClose()
  }

  const tempId = project?.id ?? `temp-${Date.now()}`

  return (
    <div className="modal-overlay open">
      <div className="modal-box">
        <div className="modal-head">
          <span className="modal-head-title">{project ? 'Projeyi Düzenle' : 'Yeni Proje'}</span>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Proje Adı *</label>
                <input className="form-input" name="title" required defaultValue={project?.title} />
              </div>
              <div className="form-group">
                <label className="form-label">Kategori</label>
                <select className="form-select" name="category_id" defaultValue={project?.category_id ?? ''}>
                  <option value="">Seçiniz</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Konum</label>
                <input className="form-input" name="location" defaultValue={project?.location} />
              </div>
              <div className="form-group">
                <label className="form-label">Yıl</label>
                <input className="form-input" type="number" name="year" defaultValue={project?.year ?? new Date().getFullYear()} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Alan (m²)</label>
              <input className="form-input" type="number" name="area_sqm" defaultValue={project?.area_sqm ?? ''} />
            </div>
            <div className="form-group">
              <label className="form-label">Açıklama</label>
              <textarea className="form-textarea" name="description" rows={3} defaultValue={project?.description} />
            </div>
            <div className="form-group">
              <label className="form-label">Malzemeler (virgülle ayır)</label>
              <input className="form-input" name="materials" defaultValue={project?.materials?.join(', ')} />
            </div>
            <div className="check-row">
              <input type="checkbox" id="featured" name="featured" defaultChecked={project?.featured} />
              <label htmlFor="featured">Anasayfada öne çıkar</label>
            </div>
            <div className="form-group" style={{ marginTop: 16 }}>
              <label className="form-label">Görseller</label>
              <ImageUploader
                projectId={project?.id ?? tempId}
                existing={images}
                onChange={setImages}
              />
            </div>
          </div>
          <div className="modal-foot">
            <button type="button" className="btn btn-outline" onClick={onClose}>İptal</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Kaydediliyor…' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
