'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, Save, Check } from 'lucide-react'

type S = Record<string, string>

const DEFAULTS: S = {
  hero_eyebrow: 'ays interiors',
  hero_title: 'Mekânlar,\nHikâye Anlatır',
  hero_subtitle: 'Uçtan uca iç mimarlık & danışmanlık — Türkiye & Dünya',
  hero_image_url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&q=80',
  hero_btn1_text: 'Portfolyoyu Keşfet',
  hero_btn2_text: 'Danışmanlık Al',

  about_title: 'Zarafeti Mekânınıza\nTaşıyoruz',
  about_text1: 'Ays Interiors, yaşam alanlarınızı ihtiyaçlarınıza, zevkinize ve ruhunuza uygun biçimde dönüştürmek için kuruldu. Konsept tasarımdan anahtar teslim uygulamaya, her adımda profesyonel, kişiselleştirilmiş ve estetik çözümler sunuyoruz.',
  about_text2: 'Türkiye geneli ve uluslararası projelerde 8 yılı aşkın deneyimimizle, konut, ofis ve ticari mekânları yaşayan birer sanat eserine dönüştürüyoruz.',
  about_img_main: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=900&q=80',
  about_img_accent: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=600&q=80',

  svc_1_title: 'Konsept Geliştirme & İç Mekan Tasarımı',
  svc_1_desc: 'Konut, ofis ve ticari alanlar için yaşam tarzınıza özel, özgün iç tasarım çözümleri.',
  svc_1_img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=700&q=80',
  svc_2_title: '3D Modelleme & Görselleştirme',
  svc_2_desc: 'Projeyi hayata geçirmeden önce gerçekçi 3D render ve sanal tur ile tam olarak görün.',
  svc_2_img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=700&q=80',
  svc_3_title: 'Proje Yönetimi & Uygulama',
  svc_3_desc: 'Müteahhit ve tedarikçi koordinasyonu, şantiye denetimi — anahtar teslim çözümler.',
  svc_3_img: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=700&q=80',
  svc_4_title: 'Mobilya & Aksesuar Seçimi',
  svc_4_desc: 'Mekânınıza özel mobilya, kumaş, aydınlatma ve aksesuar seçimi ile stili tamamlıyoruz.',
  svc_4_img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=700&q=80',
  svc_5_title: 'Danışmanlık & Renovasyon',
  svc_5_desc: 'Mevcut mekanınızı minimal bütçeyle maksimum etki yaratacak şekilde dönüştürüyoruz.',
  svc_5_img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=700&q=80',
  svc_6_title: 'Online Tasarım Hizmeti',
  svc_6_desc: 'Türkiye ve yurt dışından müşterilerimize video görüşme ile uzaktan danışmanlık.',
  svc_6_img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=700&q=80',

  render_title: 'Projenizi İnşa\nEtmeden Önce Görün',
  render_img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1400&q=80',
  render_bullet1: 'Fotorealistik 3D render görseller',
  render_bullet2: '360° sanal tur deneyimi',
  render_bullet3: 'Malzeme & renk simülasyonu',
  render_bullet4: 'Farklı konsept alternatifleri',
  render_bullet5: 'Sunum hazır çizimler & planlar',

  stat_1_count: '127', stat_1_suffix: '+', stat_1_label: 'Tamamlanan Proje',
  stat_2_count: '8',   stat_2_suffix: '+', stat_2_label: 'Yıl Deneyim',
  stat_3_count: '4',   stat_3_suffix: '',  stat_3_label: 'Şehir',
  stat_4_count: '100', stat_4_suffix: '%', stat_4_label: 'Müşteri Memnuniyeti',

  gallery_1: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80',
  gallery_2: 'https://images.unsplash.com/photo-1615529328331-f8917597711f?w=600&q=80',
  gallery_3: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=600&q=80',
  gallery_4: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80',
  gallery_5: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=600&q=80',

  process_1_title: 'Keşif & Analiz',      process_1_desc: 'İhtiyaçlarınızı, zevklerinizi ve bütçenizi birlikte değerlendiriyoruz.',
  process_2_title: 'Konsept & 2D Plan',   process_2_desc: 'Moodboard, renk paleti ve 2D zemin planı hazırlıyoruz.',
  process_3_title: '3D Görselleştirme',   process_3_desc: 'Gerçekçi 3D render ve sanal tur ile projeyi yaşıyorsunuz.',
  process_4_title: 'Uygulama & Teslim',   process_4_desc: 'Şantiye yönetimi ve koordinasyonla anahtar teslim bitiriyoruz.',

  cta_eyebrow: 'Hayalinizi Gerçekleştirelim',
  cta_title: 'Hayaliniz\nGerçek Olsun',
  cta_text: 'Projenizi konuşmak için bize ulaşın — ilk görüşme ücretsiz.',
  cta_img: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1600&q=80',
  cta_btn1_text: 'Ücretsiz Görüşme Talep Et',
  cta_btn2_text: 'Projelerimizi İncele',
}

// ── sub-components ─────────────────────────────────────────

function TextField({ label, k, v, set, multiline }: {
  label: string; k: string
  v: (key: string) => string
  set: (key: string, val: string) => void
  multiline?: boolean
}) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {multiline
        ? <textarea className="form-textarea" rows={3} value={v(k)} onChange={e => set(k, e.target.value)} />
        : <input className="form-input" value={v(k)} onChange={e => set(k, e.target.value)} />}
    </div>
  )
}

function ImgField({ label, k, v, set, upload }: {
  label: string; k: string
  v: (key: string) => string
  set: (key: string, val: string) => void
  upload: (file: File, key: string) => Promise<void>
}) {
  const ref = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFile(file: File) {
    setUploading(true)
    await upload(file, k)
    setUploading(false)
  }

  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          className="form-input"
          value={v(k)}
          onChange={e => set(k, e.target.value)}
          placeholder="Görsel URL veya yükle →"
        />
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => ref.current?.click()}
          disabled={uploading}
          style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          <Upload size={13} /> {uploading ? '…' : 'Yükle'}
        </button>
        <input
          ref={ref}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </div>
      {v(k) && (
        <img
          src={v(k)}
          alt=""
          style={{ marginTop: 8, height: 72, width: '100%', maxWidth: 200, objectFit: 'cover', borderRadius: 4, border: '1px solid var(--border)' }}
        />
      )}
    </div>
  )
}

function Section({ id, title, children, keys, onSave, saving, saved }: {
  id: string; title: string; children: React.ReactNode
  keys: string[]; onSave: (id: string, keys: string[]) => Promise<void>
  saving: string | null; saved: string | null
}) {
  const isSaving = saving === id
  const isSaved = saved === id

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <div className="card-header">
        <span className="card-title">{title}</span>
        <button
          className={`btn ${isSaved ? 'btn-primary' : 'btn-outline'} btn-sm`}
          onClick={() => onSave(id, keys)}
          disabled={isSaving}
          style={{ minWidth: 100 }}
        >
          {isSaving ? 'Kaydediliyor…' : isSaved ? <><Check size={13} /> Kaydedildi</> : <><Save size={13} /> Kaydet</>}
        </button>
      </div>
      <div style={{ padding: '4px 0' }}>{children}</div>
    </div>
  )
}

// ── main page ──────────────────────────────────────────────

export default function AnaSayfaAdmin() {
  const supabase = createClient()
  const [s, setS] = useState<S>({ ...DEFAULTS })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)

  useEffect(() => {
    supabase.from('site_settings').select('key,value').then(({ data }) => {
      const m: S = { ...DEFAULTS }
      ;(data ?? []).forEach((r: any) => { m[r.key] = r.value })
      setS(m)
      setLoading(false)
    })
  }, [])

  const v = (key: string) => s[key] ?? DEFAULTS[key] ?? ''
  const set = (key: string, value: string) => setS(prev => ({ ...prev, [key]: value }))

  async function saveSection(sectionId: string, keys: string[]) {
    setSaving(sectionId)
    const rows = keys.map(key => ({ key, value: s[key] ?? '' }))
    await supabase.from('site_settings').upsert(rows, { onConflict: 'key' })
    setSaving(null)
    setSaved(sectionId)
    setTimeout(() => setSaved(null), 2500)
  }

  async function uploadImg(file: File, key: string) {
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `homepage/${key}-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('site-assets').upload(path, file, { upsert: true })
    if (error) { console.error('upload error', error); return }
    const { data: { publicUrl } } = supabase.storage.from('site-assets').getPublicUrl(path)
    set(key, publicUrl)
  }

  if (loading) return <div style={{ padding: 32, color: 'var(--taupe)' }}>Yükleniyor…</div>

  return (
    <div>
      <div className="section-title">Ana Sayfa Yönetimi</div>
      <p style={{ fontSize: 13, color: 'var(--taupe)', marginBottom: 24 }}>
        Her bölümü düzenleyip ayrı ayrı kaydedin. Değişiklikler anında canlıya yansır.
      </p>

      {/* Hero */}
      <Section id="hero" title="Hero Bölümü" keys={['hero_eyebrow','hero_title','hero_subtitle','hero_image_url','hero_btn1_text','hero_btn2_text']}
        onSave={saveSection} saving={saving} saved={saved}>
        <TextField label="Üst yazı (eyebrow)" k="hero_eyebrow" v={v} set={set} />
        <TextField label='Başlık (\\n = yeni satır)' k="hero_title" v={v} set={set} multiline />
        <TextField label="Alt yazı" k="hero_subtitle" v={v} set={set} />
        <ImgField label="Arka plan görseli" k="hero_image_url" v={v} set={set} upload={uploadImg} />
        <div className="form-row">
          <TextField label="1. Buton metni" k="hero_btn1_text" v={v} set={set} />
          <TextField label="2. Buton metni" k="hero_btn2_text" v={v} set={set} />
        </div>
      </Section>

      {/* Hakkımızda */}
      <Section id="about" title="Hakkımızda Bölümü" keys={['about_title','about_text1','about_text2','about_img_main','about_img_accent']}
        onSave={saveSection} saving={saving} saved={saved}>
        <TextField label='Başlık (\\n = yeni satır)' k="about_title" v={v} set={set} multiline />
        <TextField label="1. Paragraf" k="about_text1" v={v} set={set} multiline />
        <TextField label="2. Paragraf" k="about_text2" v={v} set={set} multiline />
        <div className="form-row">
          <ImgField label="Ana görsel" k="about_img_main" v={v} set={set} upload={uploadImg} />
          <ImgField label="Vurgu görseli" k="about_img_accent" v={v} set={set} upload={uploadImg} />
        </div>
      </Section>

      {/* Hizmetler */}
      <Section id="services" title="Hizmetler (6 Kart)"
        keys={[1,2,3,4,5,6].flatMap(i => [`svc_${i}_title`,`svc_${i}_desc`,`svc_${i}_img`])}
        onSave={saveSection} saving={saving} saved={saved}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 4, padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 12 }}>
                Hizmet {i}
              </div>
              <TextField label="Başlık" k={`svc_${i}_title`} v={v} set={set} />
              <TextField label="Açıklama" k={`svc_${i}_desc`} v={v} set={set} multiline />
              <ImgField label="Görsel" k={`svc_${i}_img`} v={v} set={set} upload={uploadImg} />
            </div>
          ))}
        </div>
      </Section>

      {/* 3D Render */}
      <Section id="render" title="3D Render Bölümü"
        keys={['render_title','render_img','render_bullet1','render_bullet2','render_bullet3','render_bullet4','render_bullet5']}
        onSave={saveSection} saving={saving} saved={saved}>
        <TextField label='Başlık (\\n = yeni satır)' k="render_title" v={v} set={set} multiline />
        <ImgField label="Görsel" k="render_img" v={v} set={set} upload={uploadImg} />
        <div style={{ marginTop: 8 }}>
          <label className="form-label">Madde Listesi (5 satır)</label>
          {[1,2,3,4,5].map(i => (
            <input key={i} className="form-input" style={{ marginBottom: 6 }}
              value={v(`render_bullet${i}`)} onChange={e => set(`render_bullet${i}`, e.target.value)} />
          ))}
        </div>
      </Section>

      {/* Stats */}
      <Section id="stats" title="İstatistikler (4 Rakam)"
        keys={[1,2,3,4].flatMap(i => [`stat_${i}_count`,`stat_${i}_suffix`,`stat_${i}_label`])}
        onSave={saveSection} saving={saving} saved={saved}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '120px 72px 1fr', gap: 10, marginBottom: 10 }}>
            <div className="form-group" style={{ margin: 0 }}>
              {i === 1 && <label className="form-label">Sayı</label>}
              <input className="form-input" value={v(`stat_${i}_count`)} onChange={e => set(`stat_${i}_count`, e.target.value)} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              {i === 1 && <label className="form-label">Ek (+, %)</label>}
              <input className="form-input" value={v(`stat_${i}_suffix`)} onChange={e => set(`stat_${i}_suffix`, e.target.value)} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              {i === 1 && <label className="form-label">Etiket</label>}
              <input className="form-input" value={v(`stat_${i}_label`)} onChange={e => set(`stat_${i}_label`, e.target.value)} />
            </div>
          </div>
        ))}
      </Section>

      {/* Gallery */}
      <Section id="gallery" title="Galeri Şeridi (5 Görsel)"
        keys={[1,2,3,4,5].map(i => `gallery_${i}`)}
        onSave={saveSection} saving={saving} saved={saved}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {[1,2,3,4,5].map(i => (
            <ImgField key={i} label={`Görsel ${i}`} k={`gallery_${i}`} v={v} set={set} upload={uploadImg} />
          ))}
        </div>
      </Section>

      {/* Process */}
      <Section id="process" title="Süreç Adımları (4 Adım)"
        keys={[1,2,3,4].flatMap(i => [`process_${i}_title`,`process_${i}_desc`])}
        onSave={saveSection} saving={saving} saved={saved}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12, marginBottom: 12 }}>
            <TextField label={i === 1 ? 'Adım başlığı' : ''} k={`process_${i}_title`} v={v} set={set} />
            <TextField label={i === 1 ? 'Açıklama' : ''} k={`process_${i}_desc`} v={v} set={set} />
          </div>
        ))}
      </Section>

      {/* CTA */}
      <Section id="cta" title="CTA Banner"
        keys={['cta_eyebrow','cta_title','cta_text','cta_img','cta_btn1_text','cta_btn2_text']}
        onSave={saveSection} saving={saving} saved={saved}>
        <TextField label="Üst yazı" k="cta_eyebrow" v={v} set={set} />
        <TextField label='Başlık (\\n = yeni satır)' k="cta_title" v={v} set={set} multiline />
        <TextField label="Açıklama metni" k="cta_text" v={v} set={set} multiline />
        <ImgField label="Arka plan görseli" k="cta_img" v={v} set={set} upload={uploadImg} />
        <div className="form-row">
          <TextField label="1. Buton metni" k="cta_btn1_text" v={v} set={set} />
          <TextField label="2. Buton metni" k="cta_btn2_text" v={v} set={set} />
        </div>
      </Section>
    </div>
  )
}
