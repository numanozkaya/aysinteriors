'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, Link2, Video } from 'lucide-react'

interface IGPost { id: string; url: string; sort_order: number }

export default function AdminInstagramPage() {
  const supabase = createClient()
  const [posts, setPosts] = useState<IGPost[]>([])
  const [newUrl, setNewUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [tab, setTab] = useState<'url' | 'video'>('url')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function load() {
    const { data } = await supabase.from('instagram_posts').select('*').order('sort_order')
    setPosts(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function addPost() {
    const url = newUrl.trim()
    if (!url || !url.includes('instagram.com')) return
    setAdding(true)
    await supabase.from('instagram_posts').insert({ url, sort_order: posts.length + 1 })
    setNewUrl('')
    await load()
    setAdding(false)
  }

  async function uploadVideo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('instagram-videos').upload(path, file, { upsert: true })
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('instagram-videos').getPublicUrl(path)
      await supabase.from('instagram_posts').insert({ url: publicUrl, sort_order: posts.length + 1 })
      await load()
    } else {
      alert('Video yüklenemedi: ' + error.message)
    }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function deletePost(id: string) {
    await supabase.from('instagram_posts').delete().eq('id', id)
    load()
  }

  return (
    <div>
      <div className="section-title">İçerik Yönetimi</div>
      <p style={{ fontSize: 13, color: 'var(--taupe)', marginBottom: 24 }}>
        Blog sayfasında gösterilecek içerikleri buradan yönetin.
        Instagram gönderisi/reels URL'si ekleyebilir veya kendi videonuzu yükleyebilirsiniz.
      </p>

      <div className="card">
        <div className="card-header"><span className="card-title">Yeni İçerik Ekle</span></div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button
            className={`btn ${tab === 'url' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setTab('url')}
          >
            <Link2 size={14} /> Instagram URL
          </button>
          <button
            className={`btn ${tab === 'video' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setTab('video')}
          >
            <Video size={14} /> Video Yükle
          </button>
        </div>

        {tab === 'url' ? (
          <>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                className="form-input"
                value={newUrl}
                onChange={e => setNewUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addPost()}
                placeholder="https://www.instagram.com/p/ABC123/ veya /reel/..."
                style={{ flex: 1 }}
              />
              <button className="btn btn-primary" onClick={addPost} disabled={adding || !newUrl.trim()}>
                <Plus size={14} /> {adding ? 'Ekleniyor…' : 'Ekle'}
              </button>
            </div>
            <p style={{ fontSize: 11, color: 'var(--taupe)', marginTop: 8 }}>
              Instagram'da gönderi/reel'i açıp "Kopyala → Bağlantıyı Kopyala" ile URL'yi alın.
            </p>
          </>
        ) : (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="video/mp4,video/quicktime,video/webm"
              onChange={uploadVideo}
              disabled={uploading}
              className="form-input"
              style={{ cursor: 'pointer' }}
            />
            <p style={{ fontSize: 11, color: 'var(--taupe)', marginTop: 8 }}>
              MP4 veya MOV formatında video yükleyin. Ziyaretçiler Instagram'a gitmeden doğrudan izleyebilir.
            </p>
            {uploading && <p style={{ fontSize: 12, color: 'var(--gold)', marginTop: 8 }}>Yükleniyor… lütfen bekleyin.</p>}
          </>
        )}
      </div>

      <div className="card">
        <div className="card-header"><span className="card-title">Mevcut İçerikler ({posts.length})</span></div>
        {loading && <p style={{ color: 'var(--taupe)', fontSize: 13 }}>Yükleniyor…</p>}
        {!loading && posts.length === 0 && (
          <p style={{ color: 'var(--taupe)', fontSize: 13 }}>Henüz içerik eklenmedi.</p>
        )}
        {posts.map((post, i) => (
          <div key={post.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 600, minWidth: 20 }}>{i + 1}</span>
            {post.url.includes('instagram.com')
              ? <Link2 size={16} style={{ color: '#E1306C', flexShrink: 0 }} />
              : <Video size={16} style={{ color: 'var(--gold)', flexShrink: 0 }} />
            }
            <span style={{ flex: 1, fontSize: 12, color: 'var(--taupe)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {post.url.includes('instagram.com') ? post.url : post.url.split('/').pop()}
            </span>
            <button className="btn btn-danger btn-sm" onClick={() => deletePost(post.id)}><Trash2 size={12} /></button>
          </div>
        ))}
      </div>
    </div>
  )
}
