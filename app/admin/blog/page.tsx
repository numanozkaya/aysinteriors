'use client'
import { useCallback, useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import BlogModal from '@/components/admin/BlogModal'
import type { BlogPost } from '@/lib/types'

export default function AdminBlogPage() {
  const supabase = createClient()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [modal, setModal] = useState<BlogPost | null | undefined>(undefined)

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false })
    setPosts(data ?? [])
  }, [supabase])

  useEffect(() => { load() }, [load])

  async function togglePublish(post: BlogPost) {
    await supabase.from('blog_posts').update({ published: !post.published }).eq('id', post.id)
    load()
  }

  async function del(id: string) {
    if (!confirm('Bu yazıyı silmek istiyor musunuz?')) return
    await supabase.from('blog_posts').delete().eq('id', id)
    load()
  }

  return (
    <div>
      <div className="section-title">Blog Yazıları</div>
      <div className="card">
        <div className="card-header">
          <span className="card-title">Yazılar</span>
          <button className="btn btn-primary" onClick={() => setModal(null)}>
            <Plus size={13} /> Yeni Yazı
          </button>
        </div>
        {posts.length === 0 && (
          <p style={{ padding: '16px 0', color: 'var(--taupe)', fontSize: 13 }}>Henüz yazı yok.</p>
        )}
        {posts.map(post => (
          <div key={post.id} className="proj-item">
            <div className="proj-info">
              <div className="proj-name">
                {post.title}
                <span style={{ marginLeft: 8, fontSize: 10, padding: '2px 8px', background: post.published ? 'rgba(200,169,122,.15)' : 'rgba(0,0,0,.06)', color: post.published ? 'var(--gold)' : 'var(--taupe)', borderRadius: 2 }}>
                  {post.published ? 'Yayında' : 'Taslak'}
                </span>
              </div>
              <div className="proj-meta">
                {post.slug} · {new Date(post.created_at).toLocaleDateString('tr-TR')}
              </div>
            </div>
            <div className="proj-actions">
              <button className="btn btn-outline btn-sm" title={post.published ? 'Yayından Kaldır' : 'Yayınla'} onClick={() => togglePublish(post)}>
                {post.published ? <EyeOff size={11} /> : <Eye size={11} />}
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => setModal(post)}><Pencil size={11} /></button>
              <button className="btn btn-danger btn-sm" onClick={() => del(post.id)}><Trash2 size={11} /></button>
            </div>
          </div>
        ))}
      </div>

      {modal !== undefined && (
        <BlogModal
          post={modal}
          onClose={() => setModal(undefined)}
          onSaved={load}
        />
      )}
    </div>
  )
}
