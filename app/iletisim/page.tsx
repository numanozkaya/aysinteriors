import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ContactForm from '@/components/ContactForm'
import { MapPin, Mail, Phone } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

function IgIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

export const metadata: Metadata = {
  title: 'İletişim — Ays Interiors | İç Mimarlık Danışmanlık',
  description: 'Ays Interiors ile iletişime geçin. İç mimarlık projeleriniz için ücretsiz keşif görüşmesi talep edin. Türkiye geneli ve online danışmanlık hizmetleri.',
  keywords: ['iç mimar iletişim', 'iç tasarım teklif', 'iç mimarlık randevu', 'online iç mimarlık danışmanlık', 'interior design contact'],
  openGraph: {
    title: 'İletişim — Ays Interiors',
    description: 'İç mimarlık projeniz için bizimle iletişime geçin. Türkiye geneli ve online danışmanlık.',
    type: 'website',
    locale: 'tr_TR',
  },
  alternates: { canonical: 'https://aysinteriors.com/iletisim' },
}

export default async function IletisimPage({ searchParams }: { searchParams: Promise<{ paket?: string }> }) {
  const supabase = await createClient()
  const params = await searchParams
  const { data: profile } = await supabase.from('profile').select('email,phone,instagram').eq('id', 1).single()
  const { data: settingsRows } = await supabase.from('site_settings').select('key,value')
  const s: Record<string, string> = Object.fromEntries((settingsRows ?? []).map((r: any) => [r.key, r.value]))

  return (
    <>
      <Navbar />
      <section className="page-hero">
        <div className="page-hero-content"><h1>İletişim</h1><p>Projenizi konuşalım</p></div>
      </section>
      <section className="section">
        <div className="container">
          <div className="contact-grid">
            <div>
              <div className="section-header reveal">
                <span className="section-label">Mesaj Gönderin</span>
                <h2>Benimle İletişime Geçin</h2>
              </div>
              <div className="contact-form-wrapper">
                <ContactForm defaultService={params.paket} />
              </div>
            </div>
            <div className="contact-info">
              {profile?.email && (
                <div className="contact-info__item">
                  <Mail size={18} />
                  <a href={`mailto:${profile.email}`}>{profile.email}</a>
                </div>
              )}
              {profile?.phone && (
                <div className="contact-info__item">
                  <Phone size={18} />
                  <span>{profile.phone}</span>
                </div>
              )}
              <div className="contact-info__item">
                <MapPin size={18} />
                <span>Çankaya, Ankara, Türkiye</span>
              </div>
              {s.maps_embed_url && (
                <div style={{ marginTop: '32px' }}>
                  <iframe src={s.maps_embed_url} width="100%" height="300" style={{ border: 0 }} loading="lazy" title="Konum" />
                </div>
              )}

              {/* Instagram CTA */}
              {profile?.instagram && (
                <a
                  href={`https://instagram.com/${profile.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ig-contact-cta"
                >
                  <IgIcon />
                  <div>
                    <span className="ig-contact-cta__label">Instagram</span>
                    <span className="ig-contact-cta__handle">@{profile.instagram.replace('@', '')}</span>
                  </div>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Instagram banner ── */}
      {profile?.instagram && (
        <section className="ig-banner">
          <IgIcon />
          <div className="ig-banner__text">
            <span className="ig-banner__eyebrow">İlham almak için</span>
            <span className="ig-banner__handle">@{profile.instagram.replace('@', '')}</span>
          </div>
          <a
            href={`https://instagram.com/${profile.instagram.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ig-follow-btn"
          >
            Takip Et
          </a>
        </section>
      )}

      <Footer />
    </>
  )
}
