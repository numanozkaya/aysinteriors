import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import StatsCounter from '@/components/StatsCounter'
import { createClient } from '@/lib/supabase/server'
import { Grid, MessageCircle, ArrowRight, Palette, Layers, Video } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()

  const [{ data: featuredProjects }, { data: packages }, { data: settings }] = await Promise.all([
    supabase
      .from('projects')
      .select('*, category:categories(name,slug), images:project_images(url,is_cover,sort_order)')
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(3),
    supabase
      .from('packages')
      .select('*')
      .order('sort_order')
      .limit(3),
    supabase.from('site_settings').select('key,value'),
  ])

  const s: Record<string, string> = Object.fromEntries((settings ?? []).map((r: any) => [r.key, r.value]))
  const heroUrl = s.hero_image_url || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&q=80'

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="hero" aria-label="Hero bölümü">
        <div className="hero__bg" style={{ backgroundImage: `url('${heroUrl}')` }} />
        <div className="hero__overlay" />
        <div className="hero__content">
          <span className="hero__eyebrow">ays interiors</span>
          <h1 className="hero__title">Mekânlar,<br />Hikâye Anlatır</h1>
          <hr className="hero__rule" />
          <p className="hero__subtitle">İç mimarlık ve danışmanlık hizmetleri — Ankara</p>
          <div className="hero__buttons">
            <Link href="/portfolio" className="btn btn-ghost">
              <Grid size={15} /> Portfolyoyu Keşfet
            </Link>
            <Link href="/danismanlik" className="btn btn-solid">
              <MessageCircle size={15} /> Danışmanlık Al
            </Link>
          </div>
        </div>
        <span className="hero__vertical-text" aria-hidden="true">
          Interior Design &amp; Consultancy — Ankara
        </span>
      </section>

      {/* Featured Projects */}
      <section className="section" aria-label="Öne çıkan projeler">
        <div className="container">
          <header className="section-header reveal">
            <span className="section-header__eyebrow">Seçkin Çalışmalar</span>
            <h2 className="section-header__title">Öne Çıkan Projeler</h2>
            <p className="section-header__desc">
              Her mekan, sahibinin ruhunu ve yaşam biçimini yansıtır. İşte en çok konuşulan tasarımlarımızdan bir seçki.
            </p>
          </header>
          <div className="portfolio-grid portfolio-grid--asymmetric">
            {(featuredProjects ?? []).map((project: any) => {
              const cover = project.images?.find((i: any) => i.is_cover) ?? project.images?.[0]
              return (
                <Link key={project.id} href={`/portfolio#${project.id}`} className="portfolio-card reveal">
                  <div className="portfolio-card__img-wrap">
                    {cover?.url && (
                      <Image
                        src={cover.url}
                        alt={project.title}
                        fill
                        sizes="(max-width:768px) 100vw, 50vw"
                        className="portfolio-card__img"
                      />
                    )}
                    <div className="portfolio-card__overlay">
                      <span className="portfolio-card__cat">{project.category?.name}</span>
                      <span className="portfolio-card__title">{project.title}</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
          <div className="reveal delay-3">
            <Link href="/portfolio" className="portfolio-all-link">Tüm Projeleri Gör</Link>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section" aria-label="Hizmetler">
        <div className="container">
          <header className="section-header section-header--center reveal">
            <span className="section-header__eyebrow">Ne Yapıyoruz</span>
            <h2 className="section-header__title">Hizmetlerimiz</h2>
          </header>
          <div className="services-grid">
            {[
              { icon: <Palette className="service-item__icon" />, title: 'Konsept Tasarım', desc: 'Yaşam alışkanlıklarınızı dinleyerek size özel bir tasarım dili oluşturuyoruz.' },
              { icon: <Layers className="service-item__icon" />, title: 'Uygulama Takibi', desc: 'Müteahhit, tedarikçi ve usta koordinasyonunu üstleniyoruz.' },
              { icon: <Video className="service-item__icon" />, title: 'Online Danışmanlık', desc: 'Video görüşme ve 3D görseller aracılığıyla nereden olursanız olun hizmetinizdeyiz.' },
            ].map(svc => (
              <article key={svc.title} className="service-item reveal">
                {svc.icon}
                <h3 className="service-item__title">{svc.title}</h3>
                <p className="service-item__desc">{svc.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-band" aria-label="İstatistikler">
        <div className="container">
          <div className="stats-grid">
            {[
              { count: 127, suffix: '', label: 'Tamamlanan Proje' },
              { count: 8, suffix: '', label: 'Yıl Deneyim' },
              { count: 4, suffix: '', label: 'Şehir' },
              { count: 100, suffix: '%', label: 'Müşteri Memnuniyeti' },
            ].map(stat => (
              <div key={stat.label} className="stat-item reveal">
                <span className="stat-item__number">
                  <StatsCounter target={stat.count} suffix={stat.suffix} />
                </span>
                <span className="stat-item__label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages Teaser */}
      <section className="section" style={{ background: 'var(--dark)' }} aria-label="Danışmanlık paketleri">
        <div className="container">
          <header className="section-header section-header--center reveal" style={{ color: 'var(--white)' }}>
            <span className="section-header__eyebrow">Hizmet Paketleri</span>
            <h2 className="section-header__title" style={{ color: 'var(--white)' }}>İhtiyacınıza Özel Paket</h2>
          </header>
          <div className="packages-grid">
            {(packages ?? []).map((pkg: any) => (
              <div key={pkg.id} className={`package-card${pkg.featured ? ' package-card--featured' : ''} reveal`}>
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
          <div style={{ textAlign: 'center', marginTop: '56px' }} className="reveal delay-4">
            <Link href="/danismanlik" className="btn btn-ghost">
              Tüm Paketleri İncele <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
