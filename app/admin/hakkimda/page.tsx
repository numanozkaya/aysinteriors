'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, Save, Check } from 'lucide-react'
import type { Profile } from '@/lib/types'

type S = Record<string, string>

export default function AdminHakkimdaPage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [settings, setSettings] = useState<S>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('profile').select('*').eq('id', 1).single(),
      supabase.from('site_settings').select('key,value'),
    ]).then(([{ data: p }, { data: s }]) => {
      setProfile(p)
      const m: S = {}
      ;(s ?? []).forEach((r: any) => { m[r.key] = r.value })
      setSettings(m)
      setLoading(false)
    })
  }, [])

  function setProp<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile(p => p ? { ...p, [key]: value } : p)
  }

  function setSetting(key: string, value: string) {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  async function flash(id: string) {
    setSaved(id)
    setTimeout(() => setSaved(null), 2500)
  }

  async function saveProfile() {
    if (!profile) return
    setSaving('profile')
    await supabase.from('profile').update({
      full_name: profile.full_name,
      title: profile.title,
      short_bio: profile.short_bio,
      long_bio: profile.long_bio,
    }).eq('id', 1)
    setSaving(null)
    flash('profile')
  }

  async function savePageSettings() {
    setSaving('page')
    const keys = ['hakkimda_eyebrow', 'hakkimda_hero_sub', 'hakkimda_img2', 'hakkimda_img3']
    const rows = keys.map(key => ({ key, value: settings[key] ?? '' }))
    await supabase.from('site_settings').upsert(rows, { onConflict: 'key' })
    setSaving(null)
    flash('page')
  }

  async function uploadImage(file: File, settingKey: string) {
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `hakkimda/${settingKey}-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('profile-images').upload(path, file, { upsert: true })
    if (error) { console.error(error); return }
    const { data: { publicUrl } } = supabase.storage.from('profile-images').getPublicUrl(path)
    setSetting(settingKey, publicUrl)
  }

  async function uploadAvatar(file: File) {
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `avatar-${Date.now()}.${ext}`
    setSaving('avatar')
    const { error } = await supabase.storage.from('profile-images').upload(path, file, { upsert: true })
    if (error) { console.error(error); setSaving(null); return }
    const { data: { publicUrl } } = supabase.storage.from('profile-images').getPublicUrl(path)
    setProfile(p => p ? { ...p, avatar_url: publicUrl } : p)
    await supabase.from('profile').update({ avatar_url: publicUrl }).eq('id', 1)
    setSaving(null)
    flash('avatar')
  }

  if (loading) return <div style={{ padding: 32, color: 'var(--taupe)' }}>Yükleniyor…</div>

  return (
    <div>
      <div className="section-title">Hakkımda Sayfası</div>

      {/* ── Profil Görseli ── */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <span className="card-title">Profil Görseli</span>
          {saved === 'avatar' && <span style={{ fontSize: 12, color: 'var(--gold)' }}><Check size={13} /> Güncellendi</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24 }}>
          <div style={{
            position: 'relative', width: 140, height: 175, flexShrink: 0,
            background: 'var(--border)', overflow: 'hidden',
          }}>
            {profile?.avatar_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt="Profil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
          </div>
          <div>
            <p style={{ fontSize: 13, color: 'var(--taupe)', marginBottom: 12 }}>
              Portre fotoğrafınızı yükleyin. Önerilen: dikey oran (4:5), en az 800×1000 px.
            </p>
            <UploadBtn
              label="Görsel Yükle"
              disabled={saving === 'avatar'}
              onFile={uploadAvatar}
            />
          </div>
        </div>
      </div>

      {/* ── İsim & Unvan & Bio ── */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <span className="card-title">Kişisel Bilgiler</span>
          <SaveBtn id="profile" saving={saving} saved={saved} onClick={saveProfile} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Ad Soyad *</label>
            <input className="form-input" value={profile?.full_name ?? ''} onChange={e => setProp('full_name', e.target.value)} placeholder="Ayşe Yılmaz" />
          </div>
          <div className="form-group">
            <label className="form-label">Unvan</label>
            <input className="form-input" value={profile?.title ?? ''} onChange={e => setProp('title', e.target.value)} placeholder="İç Mimar & Tasarım Danışmanı" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Kısa Bio <span style={{ fontSize: 11, color: 'var(--taupe)' }}>(ana sayfada özet olarak gösterilir)</span></label>
          <textarea className="form-textarea" rows={2} value={profile?.short_bio ?? ''} onChange={e => setProp('short_bio', e.target.value)} placeholder="Bir-iki cümlelik tanıtım metni…" />
        </div>
        <div className="form-group">
          <label className="form-label">Hakkımda Metni <span style={{ fontSize: 11, color: 'var(--taupe)' }}>(hakkımda sayfasında tam metin — paragrafları boş satırla ayırın)</span></label>
          <textarea className="form-textarea" rows={10} value={profile?.long_bio ?? ''} onChange={e => setProp('long_bio', e.target.value)} placeholder={'8 yılı aşkın bir deneyimle...\n\nEğitimimi Bilkent Üniversitesi\'nde...'} />
        </div>
      </div>

      {/* ── Sayfa ayarları & ek görseller ── */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <span className="card-title">Sayfa Ayarları & Ek Görseller</span>
          <SaveBtn id="page" saving={saving} saved={saved} onClick={savePageSettings} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Eyebrow yazısı</label>
            <input className="form-input" value={settings.hakkimda_eyebrow ?? ''} onChange={e => setSetting('hakkimda_eyebrow', e.target.value)} placeholder="Tasarımcı Hakkında" />
          </div>
          <div className="form-group">
            <label className="form-label">Hero alt yazısı</label>
            <input className="form-input" value={settings.hakkimda_hero_sub ?? ''} onChange={e => setSetting('hakkimda_hero_sub', e.target.value)} placeholder="Tasarımcı ile tanışın" />
          </div>
        </div>
        <div className="form-row">
          <ImgSettingField
            label="2. Görsel (opsiyonel, sayfa ortasında geniş)"
            settingKey="hakkimda_img2"
            value={settings.hakkimda_img2 ?? ''}
            onChange={v => setSetting('hakkimda_img2', v)}
            onUpload={f => uploadImage(f, 'hakkimda_img2')}
          />
          <ImgSettingField
            label="3. Görsel (opsiyonel, yan yana)"
            settingKey="hakkimda_img3"
            value={settings.hakkimda_img3 ?? ''}
            onChange={v => setSetting('hakkimda_img3', v)}
            onUpload={f => uploadImage(f, 'hakkimda_img3')}
          />
        </div>
      </div>
    </div>
  )
}

// ── small helpers ──────────────────────────────────────────

function SaveBtn({ id, saving, saved, onClick }: {
  id: string; saving: string | null; saved: string | null; onClick: () => void
}) {
  const isSaving = saving === id
  const isSaved = saved === id
  return (
    <button className={`btn btn-sm ${isSaved ? 'btn-primary' : 'btn-outline'}`} onClick={onClick} disabled={isSaving} style={{ minWidth: 100 }}>
      {isSaving ? 'Kaydediliyor…' : isSaved ? <><Check size={13} /> Kaydedildi</> : <><Save size={13} /> Kaydet</>}
    </button>
  )
}

function UploadBtn({ label, disabled, onFile }: { label: string; disabled: boolean; onFile: (f: File) => void }) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <>
      <button className="btn btn-outline btn-sm" onClick={() => ref.current?.click()} disabled={disabled}>
        <Upload size={13} /> {disabled ? 'Yükleniyor…' : label}
      </button>
      <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && onFile(e.target.files[0])} />
    </>
  )
}

function ImgSettingField({ label, settingKey, value, onChange, onUpload }: {
  label: string; settingKey: string
  value: string; onChange: (v: string) => void; onUpload: (f: File) => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div style={{ display: 'flex', gap: 8 }}>
        <input className="form-input" value={value} onChange={e => onChange(e.target.value)} placeholder="URL veya yükle →" />
        <button type="button" className="btn btn-outline btn-sm" onClick={() => ref.current?.click()} style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
          <Upload size={13} /> Yükle
        </button>
        <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && onUpload(e.target.files[0])} />
      </div>
      {value && <img src={value} alt="" style={{ marginTop: 8, height: 72, width: '100%', maxWidth: 200, objectFit: 'cover', borderRadius: 4, border: '1px solid var(--border)' }} />}
    </div>
  )
}
