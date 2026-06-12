import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ContactForm from '@/components/ContactForm'
import { MapPin, Mail, Phone } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'İletişim — Ays Interiors',
}

export default async function IletisimPage({ searchParams }: { searchParams: Promise<{ paket?: string }> }) {
  const supabase = await createClient()
  const params = await searchParams
  const { data: profile } = await supabase.from('profile').select('email,phone').eq('id', 1).single()
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
              <ContactForm defaultService={params.paket} />
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
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}
