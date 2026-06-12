import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Mail, Phone, Camera, LayoutGrid } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export default async function Footer() {
  const supabase = await createClient()
  const { data: settings } = await supabase
    .from('site_settings')
    .select('key, value')

  const s: Record<string, string> = Object.fromEntries(
    (settings ?? []).map((r: any) => [r.key, r.value])
  )

  const { data: profile } = await supabase
    .from('profile')
    .select('email, phone, instagram, pinterest')
    .eq('id', 1)
    .single()

  return (
    <footer className="footer" aria-label="Site altbilgisi">
      <div className="container">
        <div className="footer__grid">
          <div>
            <Link href="/" className="footer__logo" aria-label="Ays Interiors Ana Sayfa">
              <Image src="/ays-logo.png" alt="Ays Interiors" width={220} height={88} className="footer__logo-img" />
              <span className="footer__logo-text">ays interiors</span>
            </Link>
            <p className="footer__tagline">
              İç mimarlık ve danışmanlık hizmetleri. Her mekân bir hikâye taşır; o hikâyeyi birlikte yazalım.
            </p>
            <div className="footer__social" aria-label="Sosyal medya">
              {profile?.instagram && (
                <a href={`https://instagram.com/${profile.instagram.replace('@', '')}`} className="footer__social-link" aria-label="Instagram">
                  <Camera size={16} />
                </a>
              )}
              {profile?.pinterest && (
                <a href={profile.pinterest} className="footer__social-link" aria-label="Pinterest">
                  <LayoutGrid size={16} />
                </a>
              )}
            </div>
          </div>
          <div>
            <p className="footer__col-title">Hızlı Bağlantılar</p>
            <nav className="footer__links">
              {([['/', 'Ana Sayfa'], ['/portfolio', 'Portfolyo'], ['/danismanlik', 'Danışmanlık'], ['/hakkimda', 'Hakkımda'], ['/iletisim', 'İletişim']] as const).map(([href, label]) => (
                <Link key={href} href={href} className="footer__link">{label}</Link>
              ))}
            </nav>
          </div>
          <div>
            <p className="footer__col-title">İletişim</p>
            <div className="footer__contact-item">
              <MapPin size={14} className="footer__contact-icon" />
              <span className="footer__contact-text">Çankaya, Ankara, Türkiye</span>
            </div>
            {profile?.email && (
              <div className="footer__contact-item">
                <Mail size={14} className="footer__contact-icon" />
                <a href={`mailto:${profile.email}`} className="footer__contact-text">{profile.email}</a>
              </div>
            )}
            {profile?.phone && (
              <div className="footer__contact-item">
                <Phone size={14} className="footer__contact-icon" />
                <span className="footer__contact-text">{profile.phone}</span>
              </div>
            )}
          </div>
        </div>
        <div className="footer__bottom">
          <span>{s.footer_text ?? '© 2025 Ays Interiors.'}</span>
          <Link href="/admin/login" className="footer__admin-link">Yönetici</Link>
        </div>
      </div>
    </footer>
  )
}
