import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Danışmanlık — Ays Interiors',
  description: 'Ays Interiors danışmanlık paketleri.',
}

export default async function DanismanlikPage() {
  const supabase = await createClient()
  const { data: packages } = await supabase.from('packages').select('*').order('sort_order')

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
          <div className="packages-grid">
            {(packages ?? []).map((pkg: any) => (
              <div key={pkg.id} className={`package-card${pkg.featured ? ' package-card--featured' : ''}`}>
                {pkg.featured && <span className="package-badge">En Popüler</span>}
                <h3 className="package-card__title">{pkg.title}</h3>
                <p className="package-card__slogan">{pkg.slogan}</p>
                {pkg.price && <p className="package-card__price">{pkg.price}</p>}
                <ul className="package-card__features">
                  {pkg.features.map((f: string) => <li key={f}>{f}</li>)}
                </ul>
                <Link href={`/iletisim?paket=${pkg.id}`} className="btn btn-ghost package-card__cta">
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
