'use client'
import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import ProjectModal from '@/components/admin/ProjectModal'
import type { Category, Project, ProjectImage } from '@/lib/types'

type ProjectWithImages = Project & { images: ProjectImage[]; category: Category | null }

function slugify(text: string) {
  return text.trim().toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export default function AdminPortfolioPage() {
  const supabase = createClient()
  const [projects, setProjects] = useState<ProjectWithImages[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [modalProject, setModalProject] = useState<ProjectWithImages | null | undefined>(undefined)
  const [newCatName, setNewCatName] = useState('')

  const load = useCallback(async () => {
    const [{ data: p }, { data: c }] = await Promise.all([
      supabase
        .from('projects')
        .select('*, category:categories(id,name,slug), images:project_images(id,url,storage_path,is_cover,sort_order)')
        .order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('sort_order'),
    ])
    setProjects((p ?? []) as unknown as ProjectWithImages[])
    setCategories(c ?? [])
  }, [supabase])

  useEffect(() => { load() }, [load])

  async function addCategory() {
    if (!newCatName.trim()) return
    const { error } = await supabase.from('categories').insert({
      name: newCatName.trim(),
      slug: slugify(newCatName),
      sort_order: categories.length + 1,
    })
    if (!error) {
      setNewCatName('')
      load()
    }
  }

  async function deleteCategory(id: string) {
    if (!confirm('Bu kategoriyi silmek istiyor musunuz?')) return
    await supabase.from('categories').delete().eq('id', id)
    load()
  }

  async function deleteProject(id: string) {
    if (!confirm('Bu projeyi silmek istiyor musunuz?')) return
    await supabase.from('projects').delete().eq('id', id)
    load()
  }

  return (
    <div>
      <div className="section-title">Portfolyo Yönetimi</div>

      <div className="card">
        <div className="card-header"><span className="card-title">Kategoriler</span></div>
        <div style={{ marginBottom: 12 }}>
          {categories.map(c => (
            <span key={c.id} className="cat-tag">
              {c.name}
              <button onClick={() => deleteCategory(c.id)}>×</button>
            </span>
          ))}
        </div>
        <div className="gap-row">
          <input
            className="form-input"
            value={newCatName}
            onChange={e => setNewCatName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCategory()}
            placeholder="Kategori adı (örn: Oturma Odası)"
            style={{ maxWidth: 240 }}
          />
          {newCatName && (
            <span style={{ fontSize: 11, color: 'var(--taupe)' }}>slug: {slugify(newCatName)}</span>
          )}
          <button className="btn btn-primary" onClick={addCategory}><Plus size={13} /> Ekle</button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Projeler</span>
          <button className="btn btn-primary" onClick={() => setModalProject(null)}>
            <Plus size={13} /> Yeni Proje
          </button>
        </div>
        {projects.map(p => {
          const cover = p.images.find(i => i.is_cover) ?? p.images[0]
          return (
            <div key={p.id} className="proj-item">
              {cover?.url ? (
                <div style={{ width: 72, height: 54, position: 'relative', flexShrink: 0 }}>
                  <Image src={cover.url} alt={p.title} fill sizes="72px" style={{ objectFit: 'cover' }} />
                </div>
              ) : (
                <div className="proj-thumb" />
              )}
              <div className="proj-info">
                <div className="proj-name">{p.title}</div>
                <div className="proj-meta">{p.category?.name} · {p.location} · {p.year}</div>
              </div>
              <div className="proj-actions">
                <button className="btn btn-outline btn-sm" onClick={() => setModalProject(p)}><Pencil size={11} /></button>
                <button className="btn btn-danger btn-sm" onClick={() => deleteProject(p.id)}><Trash2 size={11} /></button>
              </div>
            </div>
          )
        })}
        {projects.length === 0 && (
          <p style={{ padding: '16px 0', color: 'var(--taupe)', fontSize: 13 }}>Henüz proje yok. Yeni proje ekleyin.</p>
        )}
      </div>

      {modalProject !== undefined && (
        <ProjectModal
          project={modalProject}
          categories={categories}
          onClose={() => setModalProject(undefined)}
          onSaved={load}
        />
      )}
    </div>
  )
}
