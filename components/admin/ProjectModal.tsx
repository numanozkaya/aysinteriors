'use client'
import { useState, useRef } from 'react'
import Image from 'next/image'
import { X, Upload, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Project, Category, ProjectImage } from '@/lib/types'

// Existing DB image
interface SavedImage {
  kind: 'saved'
  id: string
  storagePath: string
  url: string
  isCover: boolean
}

// File picked by user, not yet uploaded
interface LocalImage {
  kind: 'local'
  file: File
  previewUrl: string
  isCover: boolean
}

type AnyImage = SavedImage | LocalImage

interface Props {
  project: (Project & { images: ProjectImage[] }) | null
  categories: Category[]
  onClose: () => void
  onSaved: () => void
}

export default function ProjectModal({ project, categories, onClose, onSaved }: Props) {
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const [images, setImages] = useState<AnyImage[]>(
    (project?.images ?? []).map(img => ({
      kind: 'saved' as const,
      id: img.id,
      storagePath: img.storage_path,
      url: img.url,
      isCover: img.is_cover,
    }))
  )

  function pickFiles(files: FileList) {
    const added: LocalImage[] = Array.from(files).map((file, i) => ({
      kind: 'local' as const,
      file,
      previewUrl: URL.createObjectURL(file),
      isCover: images.length === 0 && i === 0,
    }))
    setImages(prev => [...prev, ...added])
  }

  function removeImage(idx: number) {
    setImages(prev => {
      const next = [...prev]
      const removed = next.splice(idx, 1)[0]
      if (removed.kind === 'local') URL.revokeObjectURL(removed.previewUrl)
      // ensure at least one cover
      if (removed.isCover && next.length > 0 && !next.some(i => i.isCover)) {
        next[0] = { ...next[0], isCover: true }
      }
      return next
    })
  }

  function setCover(idx: number) {
    setImages(prev => prev.map((img, i) => ({ ...img, isCover: i === idx })))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const fd = new FormData(e.currentTarget)

    const cover = images.find(i => i.isCover) ?? images[0]
    const coverPreviewUrl = cover?.kind === 'local' ? cover.previewUrl : cover?.url ?? null

    const payload = {
      title: fd.get('title') as string,
      category_id: (fd.get('category_id') as string) || null,
      location: fd.get('location') as string,
      year: parseInt(fd.get('year') as string) || new Date().getFullYear(),
      area_sqm: fd.get('area_sqm') ? parseInt(fd.get('area_sqm') as string) : null,
      description: fd.get('description') as string,
      materials: (fd.get('materials') as string).split(',').map(s => s.trim()).filter(Boolean),
      featured: (fd.get('featured') as string) === 'on',
      cover_image_url: null as string | null, // updated after uploads
    }

    let projectId = project?.id

    if (project) {
      await supabase.from('projects').update(payload).eq('id', project.id)
    } else {
      const { data: newProj } = await supabase.from('projects').insert(payload).select('id').single()
      projectId = newProj?.id
    }

    if (!projectId) { setSaving(false); return }

    // Upload local files and insert DB rows
    let finalCoverUrl: string | null = null

    for (let i = 0; i < images.length; i++) {
      const img = images[i]

      if (img.kind === 'local') {
        const ext = img.file.name.split('.').pop() ?? 'jpg'
        const path = `${projectId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

        const { error } = await supabase.storage
          .from('project-images')
          .upload(path, img.file, { upsert: false })

        if (error) { console.error('upload error', error); continue }

        const { data: { publicUrl } } = supabase.storage
          .from('project-images')
          .getPublicUrl(path)

        await supabase.from('project_images').insert({
          project_id: projectId,
          storage_path: path,
          url: publicUrl,
          sort_order: i,
          is_cover: img.isCover,
        })

        if (img.isCover) finalCoverUrl = publicUrl
      } else {
        // Existing saved image — update sort_order and is_cover
        await supabase.from('project_images')
          .update({ is_cover: img.isCover, sort_order: i })
          .eq('id', img.id)

        if (img.isCover) finalCoverUrl = img.url
      }
    }

    // Delete removed saved images
    if (project) {
      const removedIds = project.images
        .filter(dbImg => !images.some(i => i.kind === 'saved' && i.id === dbImg.id))
      for (const rm of removedIds) {
        await supabase.storage.from('project-images').remove([rm.storage_path])
        await supabase.from('project_images').delete().eq('id', rm.id)
      }
    }

    // Update cover_image_url on project
    if (finalCoverUrl) {
      await supabase.from('projects').update({ cover_image_url: finalCoverUrl }).eq('id', projectId)
    }

    setSaving(false)
    onSaved()
    onClose()
  }

  const imgSrcs = images.map(i => i.kind === 'saved' ? i.url : i.previewUrl)

  return (
    <div className="modal-overlay open">
      <div className="modal-box">
        <div className="modal-head">
          <span className="modal-head-title">{project ? 'Projeyi Düzenle' : 'Yeni Proje'}</span>
          <button className="modal-close" onClick={onClose} type="button"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1, overflow: 'hidden' }}>
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

            <div className="form-group" style={{ marginTop: 16 }}>
              <label className="form-label">Görseller</label>
              <div
                className="img-upload-zone"
                onClick={() => inputRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); pickFiles(e.dataTransfer.files) }}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                  onChange={e => e.target.files && pickFiles(e.target.files)}
                />
                <Upload size={24} className="img-upload-icon" />
                <div className="img-upload-text">
                  <strong>Görsel seç</strong>
                  <span>Tıkla veya sürükle · JPG, PNG, WebP</span>
                </div>
              </div>

              {images.length > 0 && (
                <div className="img-grid">
                  {images.map((img, idx) => (
                    <div key={idx} className={`img-tile${img.isCover ? ' is-cover' : ''}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imgSrcs[idx]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {img.isCover && <span className="cover-label">Kapak</span>}
                      <button type="button" className="rm-btn" onClick={() => removeImage(idx)}><X size={12} /></button>
                      {!img.isCover && (
                        <button type="button" className="cover-btn" onClick={() => setCover(idx)} title="Kapak yap"><Star size={12} /></button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {saving && images.some(i => i.kind === 'local') && (
                <p style={{ fontSize: 12, color: 'var(--gold)', marginTop: 8 }}>Görseller yükleniyor…</p>
              )}
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
