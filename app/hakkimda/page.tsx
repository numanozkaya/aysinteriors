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

  const [{ data: profile }, { data: rawSettings }] = await Promise.all([
    supabase.from('profile').select('*').eq('id', 1).single(),
    supabase.from('site_settings').select('key,value'),
  ])

  const s: Record<string, string> = Object.fromEntries(
    (rawSettings ?? []).map((r: any) => [r.key, r.value])
  )

  const eyebrow = s.hakkimda_eyebrow || 'Tasarımcı Hakkında'
  const heroSub = s.hakkimda_hero_sub || 'Tasarımcı ile tanışın'
  const img2 = s.hakkimda_img2 || null
  const img3 = s.hakkimda_img3 || null

  const bio = profile?.long_bio || profile?.short_bio || ''
  const bioParagraphs = bio.split(/\n\n+/).filter(Boolean)

  return (
    <>
      <Navbar />

      <section className="page-hero">
        <div className="page-hero-content">
          <h1>Hakkımda</h1>
          <p>{heroSub}</p>
        </div>
      </section>

      {/* ── Main bio section ── */}
      <section className="section">
        <div className="container">
          <div className="about-grid reveal">

            {/* Portrait */}
            <div className="about-img-wrap">
              {profile?.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.full_name || 'Tasarımcı'}
                  fill
                  sizes="(max-width:768px) 100vw, 40vw"
                  style={{ objectFit: 'cover' }}
                  priority
                />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'var(--border)' }} />
              )}
            </div>

            {/* Text */}
            <div className="about-content">
              <span className="section-header__eyebrow">{eyebrow}</span>
              <h2 style={{ marginBottom: '8px' }}>{profile?.full_name || 'Ays Interiors'}</h2>
              {profile?.title && (
                <p style={{
                  fontFamily: 'var(--font-heading)', fontStyle: 'italic',
                  fontSize: '1.15rem', color: 'var(--gold)', marginBottom: '28px',
                }}>
                  {profile.title}
                </p>
              )}

              {bioParagraphs.length > 0
                ? bioParagraphs.map((para, i) => (
                    <p key={i} style={{ marginBottom: '1.2rem', lineHeight: 1.85, color: 'var(--taupe)' }}>
                      {para}
                    </p>
                  ))
                : (
                  <p style={{ color: 'var(--taupe)', lineHeight: 1.85 }}>
                    İç mimarlık tutkusuyla kurulan Ays Interiors, mekânları yaşayan birer sanat
                    eserine dönüştürmek için çalışıyor.
                  </p>
                )
              }

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '36px' }}>
                <Link href="/iletisim" className="btn btn-solid">İletişime Geç</Link>
                <Link href="/portfolio" className="btn btn-ghost--dark btn-ghost">Projeleri İncele</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Extra images (if set) ── */}
      {(img2 || img3) && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div style={{
              display: 'grid',
              gridTemplateColumns: img2 && img3 ? '1fr 1fr' : '1fr',
              gap: '20px',
            }}>
              {img2 && (
                <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden' }} className="reveal">
                  <Image src={img2} alt="Atölye" fill sizes="(max-width:768px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
                </div>
              )}
              {img3 && (
                <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden' }} className="reveal">
                  <Image src={img3} alt="Proje" fill sizes="(max-width:768px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA strip ── */}
      <section className="section" style={{ background: 'var(--dark)', paddingTop: '72px', paddingBottom: '72px' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="section-header__eyebrow">Birlikte Çalışalım</span>
          <h2 style={{ color: 'var(--white)', marginTop: '12px', marginBottom: '16px' }}>
            Hayalinizi Gerçeğe Dönüştürelim
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', maxWidth: '480px', margin: '0 auto 32px' }}>
            Projenizi konuşmak için bize ulaşın — ilk görüşme ücretsiz.
          </p>
          <Link href="/iletisim" className="btn btn-solid">Ücretsiz Görüşme Al</Link>
        </div>
      </section>

      <Footer />
    </>
  )
}
