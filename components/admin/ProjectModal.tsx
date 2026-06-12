'use client'
import { useState, useRef } from 'react'
import Image from 'next/image'
import { X, Upload, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Project, Category, ProjectImage } from '@/lib/types'

interface PendingImage {
  file?: File
  storagePath: string
  url: string
  isCover: boolean
}

interface Props {
  project: (Project & { images: ProjectImage[] }) | null
  categories: Category[]
  onClose: () => void
  onSaved: () => void
}

export default function ProjectModal({ project, categories, onClose, onSaved }: Props) {
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [pending, setPending] = useState<PendingImage[]>(
    (project?.images ?? []).map((img, i) => ({
      storagePath: img.storage_path,
      url: img.url,
      isCover: img.is_cover,
    }))
  )
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(files: FileList) {
    setUploading(true)
    const added: PendingImage[] = []

    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()
      const tempPath = `pending/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error } = await supabase.storage
        .from('project-images')
        .upload(tempPath, file, { upsert: false })

      if (error) { console.error(error); continue }

      const { data: { publicUrl } } = supabase.storage
        .from('project-images')
        .getPublicUrl(tempPath)

      added.push({
        file,
        storagePath: tempPath,
        url: publicUrl,
        isCover: pending.length === 0 && added.length === 0,
      })
    }

    setPending(prev => [...prev, ...added])
    setUploading(false)
  }

  function removeImage(idx: number) {
    setPending(prev => {
      const next = prev.filter((_, i) => i !== idx)
      if (prev[idx].isCover && next.length > 0) next[0].isCover = true
      return next
    })
  }

  function setCover(idx: number) {
    setPending(prev => prev.map((img, i) => ({ ...img, isCover: i === idx })))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const fd = new FormData(e.currentTarget)

    const cover = pending.find(i => i.isCover) ?? pending[0]
    const payload = {
      title: fd.get('title') as string,
      category_id: (fd.get('category_id') as string) || null,
      location: fd.get('location') as string,
      year: parseInt(fd.get('year') as string) || new Date().getFullYear(),
      area_sqm: fd.get('area_sqm') ? parseInt(fd.get('area_sqm') as string) : null,
      description: fd.get('description') as string,
      materials: (fd.get('materials') as string).split(',').map(s => s.trim()).filter(Boolean),
      featured: (fd.get('featured') as string) === 'on',
      cover_image_url: cover?.url ?? null,
    }

    let projectId = project?.id

    if (project) {
      await supabase.from('projects').update(payload).eq('id', project.id)
    } else {
      const { data: newProj } = await supabase.from('projects').insert(payload).select('id').single()
      projectId = newProj?.id
    }

    if (projectId) {
      // Move pending images from pending/ to projectId/ folder and insert DB rows
      for (let i = 0; i < pending.length; i++) {
        const img = pending[i]
        let finalPath = img.storagePath

        // If it's a new upload (still in pending/ folder), move it
        if (img.storagePath.startsWith('pending/')) {
          const newPath = `${projectId}/${img.storagePath.split('/').pop()}`
          await supabase.storage.from('project-images').move(img.storagePath, newPath)
          const { data: { publicUrl } } = supabase.storage.from('project-images').getPublicUrl(newPath)
          finalPath = newPath

          // Check if DB row already exists (for existing projects)
          const existing = project?.images.find(im => im.storage_path === img.storagePath)
          if (!existing) {
            await supabase.from('project_images').insert({
              project_id: projectId,
              storage_path: finalPath,
              url: publicUrl,
              sort_order: i,
              is_cover: img.isCover,
            })
          }
        } else {
          // Existing image — update is_cover
          const dbImg = project?.images.find(im => im.storage_path === img.storagePath)
          if (dbImg) {
            await supabase.from('project_images').update({ is_cover: img.isCover, sort_order: i }).eq('id', dbImg.id)
          }
        }
      }

      // Delete removed images
      if (project) {
        const removedImgs = project.images.filter(dbImg =>
          !pending.some(p => p.storagePath === dbImg.storage_path)
        )
        for (const rm of removedImgs) {
          await supabase.storage.from('project-images').remove([rm.storage_path])
          await supabase.from('project_images').delete().eq('id', rm.id)
        }
      }
    }

    setSaving(false)
    onSaved()
    onClose()
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-box">
        <div className="modal-head">
          <span className="modal-head-title">{project ? 'Projeyi Düzenle' : 'Yeni Proje'}</span>
          <button className="modal-close" onClick={onClose} type="button"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}>
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
              <input className="form-input" name="materials" defaultValue={project?.materials?.join(', ')} placeholder="Mermer, Ahşap, Çelik" />
            </div>
            <div className="check-row">
              <input type="checkbox" id="featured" name="featured" defaultChecked={project?.featured} />
              <label htmlFor="featured">Anasayfada öne çıkar</label>
            </div>

            {/* Image upload */}
            <div className="form-group" style={{ marginTop: 16 }}>
              <label className="form-label">Görseller</label>
              <div
                className="img-upload-zone"
                onClick={() => inputRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                  onChange={e => e.target.files && handleFiles(e.target.files)}
                />
                <Upload size={24} className="img-upload-icon" />
                <div className="img-upload-text">
                  <strong>Görsel yükle</strong>
                  <span>Tıkla veya sürükle · JPG, PNG, WebP</span>
                </div>
                {uploading && <p style={{ marginTop: 8, fontSize: 12, color: 'var(--gold)' }}>Yükleniyor…</p>}
              </div>

              {pending.length > 0 && (
                <div className="img-grid">
                  {pending.map((img, idx) => (
                    <div key={img.storagePath} className={`img-tile${img.isCover ? ' is-cover' : ''}`}>
                      <Image src={img.url} alt="" fill sizes="96px" style={{ objectFit: 'cover' }} />
                      {img.isCover && <span className="cover-label">Kapak</span>}
                      <button type="button" className="rm-btn" onClick={() => removeImage(idx)}><X size={12} /></button>
                      {!img.isCover && (
                        <button type="button" className="cover-btn" onClick={() => setCover(idx)} title="Kapak yap"><Star size={12} /></button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="modal-foot">
            <button type="button" className="btn btn-outline" onClick={onClose}>İptal</button>
            <button type="submit" className="btn btn-primary" disabled={saving || uploading}>
              {saving ? 'Kaydediliyor…' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
