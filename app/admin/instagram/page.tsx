'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, Instagram } from 'lucide-react'

interface IGPost { id: string; url: string; sort_order: number }

export default function AdminInstagramPage() {
  const supabase = createClient()
  const [posts, setPosts] = useState<IGPost[]>([])
  const [newUrl, setNewUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

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

  async function deletePost(id: string) {
    await supabase.from('instagram_posts').delete().eq('id', id)
    load()
  }

  return (
    <div>
      <div className="section-title">Instagram Gönderileri</div>
      <p style={{ fontSize: 13, color: 'var(--taupe)', marginBottom: 24 }}>
        Blog sayfasında gösterilecek Instagram gönderi ve reels URL'lerini ekleyin.
        Her URL instagram.com/p/… veya instagram.com/reel/… formatında olmalı.
      </p>

      <div className="card">
        <div className="card-header"><span className="card-title">Yeni Gönderi Ekle</span></div>
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
      </div>

      <div className="card">
        <div className="card-header"><span className="card-title">Mevcut Gönderiler ({posts.length})</span></div>
        {loading && <p style={{ color: 'var(--taupe)', fontSize: 13 }}>Yükleniyor…</p>}
        {!loading && posts.length === 0 && (
          <p style={{ color: 'var(--taupe)', fontSize: 13 }}>Henüz gönderi eklenmedi.</p>
        )}
        {posts.map((post, i) => (
          <div key={post.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 600, minWidth: 20 }}>{i + 1}</span>
            <Instagram size={16} style={{ color: '#E1306C', flexShrink: 0 }} />
            <a href={post.url} target="_blank" rel="noopener noreferrer"
              style={{ flex: 1, fontSize: 12, color: 'var(--taupe)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {post.url}
            </a>
            <button className="btn btn-danger btn-sm" onClick={() => deletePost(post.id)}><Trash2 size={12} /></button>
          </div>
        ))}
      </div>
    </div>
  )
}
