'use client'
import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'

export default function AdminAyarlarPage() {
  const supabase = createClient()
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [profile, setProfile] = useState<Profile | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saved, setSaved] = useState(false)

  const load = useCallback(async () => {
    const [{ data: s }, { data: p }] = await Promise.all([
      supabase.from('site_settings').select('key,value'),
      supabase.from('profile').select('*').eq('id', 1).single(),
    ])
    setSettings(Object.fromEntries((s ?? []).map(r => [r.key, r.value])))
    setProfile(p)
  }, [])

  useEffect(() => { load() }, [load])

  async function saveSettings() {
    for (const [key, value] of Object.entries(settings)) {
      await supabase.from('site_settings').upsert({ key, value })
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function saveProfile() {
    if (!profile) return
    await supabase.from('profile').update(profile).eq('id', 1)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function uploadHero(file: File) {
    setUploading(true)
    const path = `hero-${Date.now()}.${file.name.split('.').pop()}`
    await supabase.storage.from('site-assets').upload(path, file, { upsert: true })
    const { data: { publicUrl } } = supabase.storage.from('site-assets').getPublicUrl(path)
    setSettings(s => ({ ...s, hero_image_url: publicUrl }))
    await supabase.from('site_settings').upsert({ key: 'hero_image_url', value: publicUrl })
    setUploading(false)
  }

  async function uploadAvatar(file: File) {
    setUploading(true)
    const path = `avatar-${Date.now()}.${file.name.split('.').pop()}`
    await supabase.storage.from('profile-images').upload(path, file, { upsert: true })
    const { data: { publicUrl } } = supabase.storage.from('profile-images').getPublicUrl(path)
    setProfile(p => p ? { ...p, avatar_url: publicUrl } : p)
    await supabase.from('profile').update({ avatar_url: publicUrl }).eq('id', 1)
    setUploading(false)
  }

  return (
    <div>
      <div className="section-title">Site Ayarları</div>

      <div className="card">
        <div className="card-header"><span className="card-title">Genel Ayarlar</span></div>
        {([['site_title', 'Site Başlığı'], ['site_description', 'SEO Açıklaması'], ['footer_text', 'Footer Metni'], ['maps_embed_url', 'Google Maps Embed URL']] as [string, string][]).map(([k, l]) => (
          <div key={k} className="form-group">
            <label className="form-label">{l}</label>
            <input className="form-input" value={settings[k] ?? ''} onChange={e => setSettings(s => ({ ...s, [k]: e.target.value }))} />
          </div>
        ))}
        <div className="form-group">
          <label className="form-label">Hero Görseli</label>
          {settings.hero_image_url && (
            <div style={{ position: 'relative', width: 200, height: 120, marginBottom: 8 }}>
              <Image src={settings.hero_image_url} alt="Hero" fill sizes="200px" style={{ objectFit: 'cover' }} />
            </div>
          )}
          <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && uploadHero(e.target.files[0])} />
          {uploading && <span style={{ fontSize: 11, color: 'var(--taupe)' }}>Yükleniyor…</span>}
        </div>
        <button className="btn btn-primary" onClick={saveSettings}>{saved ? 'Kaydedildi ✓' : 'Kaydet'}</button>
      </div>

      <div className="card">
        <div className="card-header"><span className="card-title">Profil Bilgileri</span></div>
        {profile && (
          <>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Ad Soyad</label>
                <input className="form-input" value={profile.full_name} onChange={e => setProfile(p => p ? { ...p, full_name: e.target.value } : p)} />
              </div>
              <div className="form-group">
                <label className="form-label">Unvan</label>
                <input className="form-input" value={profile.title} onChange={e => setProfile(p => p ? { ...p, title: e.target.value } : p)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Kısa Bio</label>
              <textarea className="form-textarea" rows={2} value={profile.short_bio} onChange={e => setProfile(p => p ? { ...p, short_bio: e.target.value } : p)} />
            </div>
            <div className="form-group">
              <label className="form-label">Uzun Bio</label>
              <textarea className="form-textarea" rows={4} value={profile.long_bio} onChange={e => setProfile(p => p ? { ...p, long_bio: e.target.value } : p)} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">E-posta</label>
                <input className="form-input" type="email" value={profile.email} onChange={e => setProfile(p => p ? { ...p, email: e.target.value } : p)} />
              </div>
              <div className="form-group">
                <label className="form-label">Telefon</label>
                <input className="form-input" value={profile.phone} onChange={e => setProfile(p => p ? { ...p, phone: e.target.value } : p)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Instagram (@kullanici)</label>
                <input className="form-input" value={profile.instagram} onChange={e => setProfile(p => p ? { ...p, instagram: e.target.value } : p)} />
              </div>
              <div className="form-group">
                <label className="form-label">Pinterest URL</label>
                <input className="form-input" value={profile.pinterest} onChange={e => setProfile(p => p ? { ...p, pinterest: e.target.value } : p)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Profil Fotoğrafı</label>
              {profile.avatar_url && (
                <div style={{ position: 'relative', width: 100, height: 100, borderRadius: '50%', overflow: 'hidden', marginBottom: 8 }}>
                  <Image src={profile.avatar_url} alt="Avatar" fill sizes="100px" style={{ objectFit: 'cover' }} />
                </div>
              )}
              <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && uploadAvatar(e.target.files[0])} />
            </div>
            <button className="btn btn-primary" onClick={saveProfile}>{saved ? 'Kaydedildi ✓' : 'Kaydet'}</button>
          </>
        )}
      </div>

      <div className="card">
        <div className="card-header"><span className="card-title">Şifre Değiştir</span></div>
        <PasswordChangeForm />
      </div>
    </div>
  )
}

function PasswordChangeForm() {
  const supabase = createClient()
  const [newPass, setNewPass] = useState('')
  const [confirm, setConfirm] = useState('')
  const [msg, setMsg] = useState('')

  async function change() {
    if (newPass !== confirm) { setMsg('Şifreler eşleşmiyor.'); return }
    if (newPass.length < 6) { setMsg('Şifre en az 6 karakter olmalı.'); return }
    const { error } = await supabase.auth.updateUser({ password: newPass })
    setMsg(error ? error.message : 'Şifre güncellendi.')
    setNewPass('')
    setConfirm('')
  }

  return (
    <>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Yeni Şifre</label>
          <input className="form-input" type="password" value={newPass} onChange={e => setNewPass(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Tekrar</label>
          <input className="form-input" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} />
        </div>
      </div>
      {msg && <p style={{ fontSize: 12, marginBottom: 8, color: msg.includes('güncellendi') ? 'green' : '#c0392b' }}>{msg}</p>}
      <button className="btn btn-primary" onClick={change}>Güncelle</button>
    </>
  )
}
