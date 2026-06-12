import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hakkımda — Ays Interiors | İç Mimar & Tasarım Danışmanı',
  description: 'Ays Interiors kurucusu hakkında. 8+ yıl deneyimli iç mimar, 127 tamamlanan proje. Lüks konut, ofis ve ticari mekan tasarımı uzmanı. Türkiye ve yurt dışı projeler.',
  keywords: ['iç mimar', 'iç mimarlık uzmanı', 'iç tasarım danışmanı', 'luxury interior designer turkey', 'iç mimar portfolio'],
  openGraph: {
    title: 'Hakkımda — Ays Interiors | İç Mimar & Tasarım Danışmanı',
    description: '8+ yıllık deneyim, 127 tamamlanan proje. Lüks konut ve ofis tasarımı uzmanı.',
    type: 'profile',
    locale: 'tr_TR',
  },
  alternates: { canonical: 'https://aysinteriors.com/hakkimda' },
}

export default async function HakkimdaPage() {
  const supabase = await createClient()
  const { data: profile } = await supabase.from('profile').select('*').eq('id', 1).single()

  return (
    <>
      <Navbar />
      <section className="page-hero">
        <div className="page-hero-content">
          <h1>Hakkımda</h1>
          <p>Tasarımcı ile tanışın</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="about-grid">
            <div className="about-img-wrap" style={{ position: 'relative', aspectRatio: '4/5', overflow: 'hidden' }}>
              {profile?.avatar_url ? (
                <Image src={profile.avatar_url} alt={profile.full_name || 'Tasarımcı'} fill sizes="40vw" style={{ objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'var(--border)' }} />
              )}
            </div>
            <div className="about-content">
              <span className="section-header__eyebrow">Tasarımcı Hakkında</span>
              <h2>{profile?.full_name || 'Ays Interiors'}</h2>
              {profile?.title && <p className="about-title">{profile.title}</p>}
              <p className="about-bio">{profile?.long_bio || profile?.short_bio || ''}</p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '32px' }}>
                <Link href="/iletisim" className="btn btn-solid">İletişime Geç</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}
