'use client'
import { useCallback, useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Package } from '@/lib/types'

export default function AdminPaketlerPage() {
  const supabase = createClient()
  const [packages, setPackages] = useState<Package[]>([])
  const [editing, setEditing] = useState<Package | null | undefined>(undefined)
  const [form, setForm] = useState({ title: '', slogan: '', price: '', features: '', featured: false, cta_text: 'Bilgi Al', theme: 'standard' })

  const load = useCallback(async () => {
    const { data } = await supabase.from('packages').select('*').order('sort_order')
    setPackages(data ?? [])
  }, [])

  useEffect(() => { load() }, [load])

  function openNew() {
    setEditing(null)
    setForm({ title: '', slogan: '', price: '', features: '', featured: false, cta_text: 'Bilgi Al', theme: 'standard' })
  }

  function openEdit(pkg: Package) {
    setEditing(pkg)
    setForm({ title: pkg.title, slogan: pkg.slogan, price: pkg.price ?? '', features: pkg.features.join('\n'), featured: pkg.featured, cta_text: pkg.cta_text, theme: pkg.theme })
  }

  async function save() {
    const payload = {
      ...form,
      price: form.price || null,
      features: form.features.split('\n').map(s => s.trim()).filter(Boolean),
      sort_order: editing?.sort_order ?? packages.length,
    }
    if (editing) {
      await supabase.from('packages').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('packages').insert(payload)
    }
    setEditing(undefined)
    load()
  }

  async function del(id: string) {
    if (!confirm('Paketi silmek istiyor musunuz?')) return
    await supabase.from('packages').delete().eq('id', id)
    load()
  }

  const showForm = editing !== undefined

  return (
    <div>
      <div className="section-title">Danışmanlık Paketleri</div>
      <div className="card">
        <div className="card-header">
          <span className="card-title">Paketler</span>
          <button className="btn btn-primary" onClick={openNew}><Plus size={13} /> Yeni Paket</button>
        </div>
        {packages.map(pkg => (
          <div key={pkg.id} className="proj-item">
            <div className="proj-info">
              <div className="proj-name">
                {pkg.title} {pkg.featured && <span className="nav-badge">Öne Çıkan</span>}
              </div>
              <div className="proj-meta">{pkg.price ?? 'Fiyatsız'} · {pkg.features.length} özellik</div>
            </div>
            <div className="proj-actions">
              <button className="btn btn-outline btn-sm" onClick={() => openEdit(pkg)}><Pencil size={11} /></button>
              <button className="btn btn-danger btn-sm" onClick={() => del(pkg.id)}><Trash2 size={11} /></button>
            </div>
          </div>
        ))}
        {packages.length === 0 && (
          <p style={{ padding: '16px 0', color: 'var(--taupe)', fontSize: 13 }}>Henüz paket yok.</p>
        )}
      </div>

      {showForm && (
        <div className="modal-overlay open">
          <div className="modal-box modal-box--sm">
            <div className="modal-head">
              <span className="modal-head-title">{editing ? 'Paketi Düzenle' : 'Yeni Paket'}</span>
              <button className="modal-close" onClick={() => setEditing(undefined)}>×</button>
            </div>
            <div className="modal-body">
              {([['title', 'Başlık *'], ['slogan', 'Slogan'], ['price', 'Fiyat'], ['cta_text', 'CTA Butonu']] as [string, string][]).map(([k, l]) => (
                <div key={k} className="form-group">
                  <label className="form-label">{l}</label>
                  <input className="form-input" value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Özellikler (her satır bir özellik)</label>
                <textarea className="form-textarea" rows={5} value={form.features} onChange={e => setForm(f => ({ ...f, features: e.target.value }))} />
              </div>
              <div className="check-row">
                <input type="checkbox" id="pkg-featured" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} />
                <label htmlFor="pkg-featured">Öne çıkan paket</label>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-outline" onClick={() => setEditing(undefined)}>İptal</button>
              <button className="btn btn-primary" onClick={save}>Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
