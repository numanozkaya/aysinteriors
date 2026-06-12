import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Danışmanlık Paketleri — Ays Interiors | İç Mimarlık Hizmetleri',
  description: 'Ays Interiors iç mimarlık danışmanlık paketleri. Konsept tasarım, 3D görselleştirme ve uçtan uca uygulama takibi. Türkiye geneli ve yurt dışı projelerde mimari çözüm.',
  keywords: ['iç mimarlık danışmanlık', 'uçtan uca iç mimari çözüm', 'mimari çözüm', 'iç tasarım paketi', '3d render', 'interior design consultancy turkey'],
  openGraph: {
    title: 'Danışmanlık Paketleri — Ays Interiors',
    description: 'Uçtan uca iç mimari çözüm paketleri. Konsept tasarımdan 3D render\'a, uygulamaya kadar her adım.',
    type: 'website',
    locale: 'tr_TR',
  },
  alternates: { canonical: 'https://aysinteriors.com/danismanlik' },
}

const FALLBACK_PACKAGES = [
  {
    id: 'p1', title: 'Temel Danışmanlık', slogan: 'Hızlı ve etkili çözümler', price: 'Teklif Alın',
    features: ['1 oda konsept tasarımı', '2D plan çizimi', 'Malzeme & renk önerileri', '2 revizyon hakkı', 'Online sunum'],
    featured: false, cta_text: 'Bilgi Al',
  },
  {
    id: 'p2', title: 'Profesyonel Paket', slogan: 'Eksiksiz tasarım deneyimi', price: 'Teklif Alın',
    features: ['Tüm mekan konsept tasarımı', '2D + 3D görselleştirme', 'Mobilya & aksesuar seçimi', 'Tedarikçi önerileri', 'Sınırsız revizyon', '3 ay destek'],
    featured: true, cta_text: 'Hemen Başla',
  },
  {
    id: 'p3', title: 'Premium & Anahtar Teslim', slogan: 'Baştan sona biz halledelim', price: 'Teklif Alın',
    features: ['Uçtan uca proje yönetimi', '3D render + sanal tur', 'Şantiye denetimi', 'Müteahhit koordinasyonu', 'Anahtar teslim teslimat', 'Garanti & sonrası destek'],
    featured: false, cta_text: 'Teklif Al',
  },
]

export default async function DanismanlikPage() {
  const supabase = await createClient()
  const { data: packages } = await supabase.from('packages').select('*').order('sort_order')

  const displayPackages = (packages && packages.length > 0) ? packages : FALLBACK_PACKAGES

  return (
    <>
      <Navbar />
      <section className="page-hero">
        <div className="page-hero-content">
          <h1>Danışmanlık</h1>
          <p>Size özel tasarım danışmanlığı</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <header className="section-header section-header--center" style={{ marginBottom: '3rem' }}>
            <span className="section-header__eyebrow">Hizmet Paketleri</span>
            <h2 className="section-header__title">İhtiyacınıza Özel Paket</h2>
            <p className="section-header__desc">
              Konsept tasarımdan anahtar teslim uygulamaya, her bütçe ve ihtiyaca uygun paketler.
              İlk görüşme ücretsiz.
            </p>
          </header>
          <div className="packages-grid">
            {displayPackages.map((pkg: any) => (
              <div key={pkg.id} className={`package-card${pkg.featured ? ' package-card--featured' : ''}`}>
                {pkg.featured && <span className="package-badge">En Popüler</span>}
                <h3 className="package-card__title">{pkg.title}</h3>
                <p className="package-card__slogan">{pkg.slogan}</p>
                {pkg.price && <p className="package-card__price">{pkg.price}</p>}
                <ul className="package-card__features">
                  {pkg.features.map((f: string) => <li key={f}>{f}</li>)}
                </ul>
                <Link
                  href={`/iletisim?paket=${encodeURIComponent(pkg.title)}`}
                  className={`btn package-card__cta${pkg.featured ? ' btn-ghost' : ' btn-ghost--dark'}`}
                >
                  {pkg.cta_text}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}
