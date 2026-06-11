'use client'
import { useRef, useState } from 'react'
import Image from 'next/image'
import { Upload, X, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { ProjectImage } from '@/lib/types'

interface Props {
  projectId: string
  existing: ProjectImage[]
  onChange: (images: ProjectImage[]) => void
}

export default function ImageUploader({ projectId, existing, onChange }: Props) {
  const [images, setImages] = useState<ProjectImage[]>(existing)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  async function handleFiles(files: FileList) {
    setUploading(true)
    const newImages: ProjectImage[] = []

    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()
      const path = `${projectId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(path, file, { upsert: false })

      if (uploadError) continue

      const { data: { publicUrl } } = supabase.storage
        .from('project-images')
        .getPublicUrl(path)

      const { data: img } = await supabase
        .from('project_images')
        .insert({
          project_id: projectId,
          storage_path: path,
          url: publicUrl,
          sort_order: images.length + newImages.length,
          is_cover: images.length === 0 && newImages.length === 0,
        })
        .select()
        .single()

      if (img) newImages.push(img as ProjectImage)
    }

    const updated = [...images, ...newImages]
    setImages(updated)
    onChange(updated)
    setUploading(false)
  }

  async function remove(img: ProjectImage) {
    await supabase.storage.from('project-images').remove([img.storage_path])
    await supabase.from('project_images').delete().eq('id', img.id)
    const updated = images.filter(i => i.id !== img.id)
    setImages(updated)
    onChange(updated)
  }

  async function setCover(img: ProjectImage) {
    await supabase.from('project_images').update({ is_cover: false }).eq('project_id', projectId)
    await supabase.from('project_images').update({ is_cover: true }).eq('id', img.id)
    const updated = images.map(i => ({ ...i, is_cover: i.id === img.id }))
    setImages(updated)
    onChange(updated)
  }

  return (
    <div>
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
          <span>Tıkla veya sürükle — herhangi format, kalite korunur</span>
        </div>
        {uploading && <p style={{ marginTop: 8, fontSize: 12, color: 'var(--taupe)' }}>Yükleniyor…</p>}
      </div>

      {images.length > 0 && (
        <div className="img-grid">
          {images.map(img => (
            <div key={img.id} className={`img-tile${img.is_cover ? ' is-cover' : ''}`}>
              <Image src={img.url} alt="" fill sizes="96px" style={{ objectFit: 'cover' }} />
              {img.is_cover && <span className="cover-label">Kapak</span>}
              <button className="rm-btn" onClick={() => remove(img)} aria-label="Kaldır"><X size={12} /></button>
              {!img.is_cover && (
                <button className="cover-btn" onClick={() => setCover(img)} aria-label="Kapak yap"><Star size={12} /></button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
