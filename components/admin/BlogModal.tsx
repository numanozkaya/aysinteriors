'use client'
import { useState } from 'react'
import { X } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { convertToWebP } from '@/lib/webp'
import type { BlogPost } from '@/lib/types'

interface Props {
  post: BlogPost | null
  onClose: () => void
  onSaved: () => void
}

export default function BlogModal({ post, onClose, onSaved }: Props) {
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [coverUrl, setCoverUrl] = useState<string | null>(post?.cover_image_url ?? null)
  const [coverPath, setCoverPath] = useState<string | null>(post?.cover_storage_path ?? null)
  const [form, setForm] = useState({
    title: post?.title ?? '',
    slug: post?.slug ?? '',
    excerpt: post?.excerpt ?? '',
    content: post?.content ?? '',
    tags: post?.tags?.join(', ') ?? '',
    published: post?.published ?? false,
  })

  function slugify(text: string) {
    return text
      .toLowerCase()
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
      .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  async function uploadCover(file: File) {
    setUploading(true)
    try {
      const webpFile = await convertToWebP(file, 0.88)
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.webp`

      const { error } = await supabase.storage
        .from('blog-images')
        .upload(path, webpFile, { upsert: false })

      if (error) { console.error(error); return }

      const { data: { publicUrl } } = supabase.storage.from('blog-images').getPublicUrl(path)
      setCoverUrl(publicUrl)
      setCoverPath(path)
    } finally {
      setUploading(false)
    }
  }

  async function removeCover() {
    if (coverPath) {
      await supabase.storage.from('blog-images').remove([coverPath])
    }
    setCoverUrl(null)
    setCoverPath(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const payload = {
      title: form.title,
      slug: form.slug || slugify(form.title),
      excerpt: form.excerpt,
      content: form.content,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      published: form.published,
      cover_image_url: coverUrl,
      cover_storage_path: coverPath,
      updated_at: new Date().toISOString(),
    }

    if (post) {
      await supabase.from('blog_posts').update(payload).eq('id', post.id)
    } else {
      await supabase.from('blog_posts').insert(payload)
    }

    setSaving(false)
    onSaved()
    onClose()
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-box" style={{ maxWidth: 780 }}>
        <div className="modal-head">
          <span className="modal-head-title">{post ? 'Yazıyı Düzenle' : 'Yeni Blog Yazısı'}</span>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Başlık *</label>
              <input
                className="form-input"
                value={form.title}
                onChange={e => {
                  const t = e.target.value
                  setForm(f => ({ ...f, title: t, slug: f.slug || slugify(t) }))
                }}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Slug (URL)</label>
              <input
                className="form-input"
                value={form.slug}
                onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                placeholder="ornek-url-yapisinda"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Özet (SEO excerpt)</label>
              <textarea className="form-textarea" rows={2} value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">İçerik (## Başlık, ### Alt Başlık, - liste)</label>
              <textarea className="form-textarea" rows={12} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} style={{ fontFamily: 'monospace', fontSize: 13 }} />
            </div>
            <div className="form-group">
              <label className="form-label">Etiketler (virgülle ayır — SEO keywords)</label>
              <input className="form-input" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="ankara iç mimarlık, 3d render, tasarım" />
            </div>
            <div className="form-group">
              <label className="form-label">Kapak Görseli (WebP&apos;ye otomatik dönüştürülür)</label>
              {coverUrl ? (
                <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', marginBottom: 8 }}>
                  <Image src={coverUrl} alt="Kapak" fill sizes="600px" style={{ objectFit: 'cover' }} />
                  <button
                    type="button"
                    onClick={removeCover}
                    style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,.6)', border: 'none', color: '#fff', padding: '4px 10px', cursor: 'pointer', fontSize: 12 }}
                  >
                    Kaldır
                  </button>
                </div>
              ) : (
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => e.target.files?.[0] && uploadCover(e.target.files[0])}
                />
              )}
              {uploading && <p style={{ fontSize: 12, color: 'var(--taupe)', marginTop: 4 }}>Yükleniyor ve WebP&apos;ye dönüştürülüyor…</p>}
            </div>
            <div className="check-row">
              <input type="checkbox" id="published" checked={form.published} onChange={e => setForm(f => ({ ...f, published: e.target.checked }))} />
              <label htmlFor="published">Yayınla (kapalıysa taslak olarak kaydedilir)</label>
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
