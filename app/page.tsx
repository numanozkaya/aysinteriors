import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import StatsCounter from '@/components/StatsCounter'
import { createClient } from '@/lib/supabase/server'
import { Grid, MessageCircle, ArrowRight, Palette, Layers, Video, CheckCircle2, Pencil, Ruler, Eye, Package } from 'lucide-react'
import type { Metadata } from 'next'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'Ays Interiors — İç Mimarlık & Danışmanlık',
  description: 'Lüks iç mimarlık ve danışmanlık hizmetleri. Konsept tasarımdan 2D/3D render\'a, uçtan uca iç mimari çözümler. Türkiye geneli ve yurt dışı konut, ofis ve ticari mekan tasarımı.',
  keywords: [
    'iç mimarlık',
    'iç mimar',
    'iç mimarlık proje',
    'uçtan uca iç mimari çözüm',
    'mimari çözüm',
    '2d 3d render',
    '3 boyutlu görselleştirme',
    'ankara iç mimarlık',
    'salon tasarımı',
    'mutfak tasarımı',
    'yatak odası tasarımı',
    'ofis tasarımı',
    'iç mimarlık danışmanlık',
    'lüks iç tasarım',
    'interior design turkey',
    'interior architect istanbul',
    'luxury interior design',
  ],
  openGraph: {
    title: 'Ays Interiors — İç Mimarlık & Danışmanlık',
    description: 'Mekânlar, Hikâye Anlatır. Türkiye ve dünya genelinde uçtan uca iç mimari çözümler, 2D/3D render ve danışmanlık.',
    url: 'https://aysinteriors.com',
    type: 'website',
    locale: 'tr_TR',
    images: [{ url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80', width: 1200, height: 630, alt: 'Ays Interiors İç Mimarlık' }],
  },
  alternates: { canonical: 'https://aysinteriors.com' },
}

const FALLBACK_PROJECTS = [
  {
    id: 'f1',
    title: 'Modern Salon Tasarımı',
    category: { name: 'Salon' },
    coverUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
  },
  {
    id: 'f2',
    title: 'Minimalist Mutfak',
    category: { name: 'Mutfak' },
    coverUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
  },
  {
    id: 'f3',
    title: 'Lüks Banyo Konsepti',
    category: { name: 'Banyo' },
    coverUrl: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80',
  },
]

const PROCESS_STEPS = [
  {
    number: '01',
    icon: <MessageCircle size={22} />,
    title: 'Keşif & Analiz',
    desc: 'Yaşam alışkanlıklarınızı, beklentilerinizi ve mekânınızın potansiyelini birlikte keşfediyoruz.',
  },
  {
    number: '02',
    icon: <Pencil size={22} />,
    title: 'Konsept Tasarım',
    desc: 'Ruh halinize ve zevkinize özel bir tasarım dili oluşturuyoruz; moodboard ve 2D planlar hazırlıyoruz.',
  },
  {
    number: '03',
    icon: <Ruler size={22} />,
    title: '3D Görselleştirme',
    desc: 'Projenizi hayata geçirmeden önce gerçekçi 3D render\'larla tam olarak görmenizi sağlıyoruz.',
  },
  {
    number: '04',
    icon: <CheckCircle2 size={22} />,
    title: 'Uygulama & Teslim',
    desc: 'Müteahhit ve tedarikçi koordinasyonunu üstlenerek projeyi eksiksiz teslim ediyoruz.',
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': 'https://aysinteriors.com',
  name: 'Ays Interiors',
  description: 'Lüks iç mimarlık ve danışmanlık stüdyosu. Uçtan uca iç mimari çözümler, 2D/3D render. Türkiye ve yurt dışı projeler.',
  url: 'https://aysinteriors.com',
  telephone: '',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Çankaya',
    addressRegion: 'Ankara',
    addressCountry: 'TR',
  },
  areaServed: ['Ankara', 'İstanbul', 'Türkiye'],
  priceRange: '₺₺₺',
  serviceType: ['İç Mimarlık', 'İç Tasarım Danışmanlığı', '3D Görselleştirme', 'Uygulama Takibi'],
  image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80',
  sameAs: [],
}

export default async function HomePage() {
  const supabase = await createClient()

  const [{ data: featuredProjects }, { data: packages }, { data: settings }, { data: blogPosts }] = await Promise.all([
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
    supabase
      .from('blog_posts')
      .select('id,title,slug,excerpt,tags,cover_image_url,created_at')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(3),
  ])

  const s: Record<string, string> = Object.fromEntries((settings ?? []).map((r: any) => [r.key, r.value]))
  const heroUrl = s.hero_image_url || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&q=80'

  const displayProjects = (featuredProjects && featuredProjects.length > 0)
    ? featuredProjects.map((p: any) => ({
        id: p.id,
        title: p.title,
        category: p.category,
        coverUrl: p.images?.find((i: any) => i.is_cover)?.url ?? p.images?.[0]?.url ?? null,
      }))
    : FALLBACK_PROJECTS

  return (
    <>
      <Script
        id="json-ld-local-business"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      {/* Hero */}
      <section className="hero" aria-label="Hero bölümü">
        <div className="hero__bg" style={{ backgroundImage: `url('${heroUrl}')` }} />
        <div className="hero__overlay" />
        <div className="hero__content">
          <span className="hero__eyebrow">ays interiors</span>
          <h1 className="hero__title">Mekânlar,<br />Hikâye Anlatır</h1>
          <hr className="hero__rule" />
          <p className="hero__subtitle">Uçtan uca iç mimarlık ve danışmanlık — Türkiye & Dünya</p>
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
            {displayProjects.map((project, i) => (
              <Link key={project.id} href={`/portfolio`} className="portfolio-card reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className="portfolio-card__img-wrap">
                  {project.coverUrl && (
                    <Image
                      src={project.coverUrl}
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
            ))}
          </div>
          <div className="reveal delay-3" style={{ textAlign: 'center', marginTop: '48px' }}>
            <Link href="/portfolio" className="btn btn-ghost--dark btn-ghost">Tüm Projeleri Gör <ArrowRight size={14} /></Link>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section" style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)' }} aria-label="Hizmetler">
        <div className="container">
          <header className="section-header section-header--center reveal">
            <span className="section-header__eyebrow">Ne Yapıyoruz</span>
            <h2 className="section-header__title">Hizmetlerimiz</h2>
            <p className="section-header__desc">
              Ankara iç mimarlık sektöründe 2D çizimden 3D görselleştirmeye, uygulama takibine kadar her adımda yanınızdayız.
            </p>
          </header>
          <div className="services-grid">
            {[
              { icon: <Palette className="service-item__icon" />, title: 'Konsept Tasarım', desc: 'Yaşam alışkanlıklarınızı dinleyerek size özel bir tasarım dili ve 2D/3D proje görseli oluşturuyoruz.' },
              { icon: <Layers className="service-item__icon" />, title: 'Uygulama Takibi', desc: 'Müteahhit, tedarikçi ve usta koordinasyonunu üstlenerek uçtan uca iç mimari çözüm sunuyoruz.' },
              { icon: <Video className="service-item__icon" />, title: 'Online Danışmanlık', desc: 'Video görüşme ve 3 boyutlu görselleştirme aracılığıyla nereden olursanız olun hizmetinizdeyiz.' },
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

      {/* Process */}
      <section className="section section--process" aria-label="Çalışma süreci">
        <div className="container">
          <header className="section-header section-header--center reveal">
            <span className="section-header__eyebrow">Nasıl Çalışıyoruz</span>
            <h2 className="section-header__title">Sürecimiz</h2>
            <p className="section-header__desc">
              İlk görüşmeden teslimata kadar şeffaf, adım adım bir iç mimarlık deneyimi.
            </p>
          </header>
          <div className="process-grid">
            {PROCESS_STEPS.map((step, i) => (
              <article key={step.number} className={`process-step reveal delay-${i + 1}`}>
                <span className="process-step__number">{step.number}</span>
                <div className="process-step__icon">{step.icon}</div>
                <h3 className="process-step__title">{step.title}</h3>
                <p className="process-step__desc">{step.desc}</p>
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

      {/* About Teaser */}
      <section className="section about-teaser" aria-label="Tasarımcı hakkında">
        <div className="container">
          <div className="about-teaser__grid">
            <div className="about-teaser__img-wrap reveal reveal--left">
              <Image
                src="https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=900&q=80"
                alt="Ays Interiors iç mimar Ankara"
                fill
                sizes="(max-width:900px) 100vw, 50vw"
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div className="about-teaser__content reveal reveal--right">
              <span className="section-header__eyebrow">Tasarımcı Hakkında</span>
              <h2>Mekânları<br />Yaşayan Sanatlar<br />Olarak Tasarlıyorum</h2>
              <p>
                Her projeye biricik bir bakış açısı getiriyorum.
                Yaşam kalitesini artıran, estetik ile işlevselliği harmanlayan tasarımlar için
                8 yılı aşkın deneyimimi ve tutkumu her detaya yansıtıyorum.
              </p>
              <Link href="/hakkimda" className="btn btn-ghost--dark btn-ghost" style={{ marginTop: '2rem' }}>
                Daha Fazla Öğren <ArrowRight size={14} />
              </Link>
            </div>
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

      {/* Blog Teaser */}
      {(blogPosts && blogPosts.length > 0) && (
        <section className="section" aria-label="Blog">
          <div className="container">
            <header className="section-header reveal">
              <span className="section-header__eyebrow">İlham & Bilgi</span>
              <h2 className="section-header__title">Blog</h2>
              <p className="section-header__desc">
                Ankara iç mimarlık trendleri, 3D render ipuçları ve tasarım ilhamı için yazılarımızı okuyun.
              </p>
            </header>
            <div className="blog-grid">
              {(blogPosts ?? []).map((post: any, i: number) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className={`blog-card reveal delay-${i + 1}`}>
                  <div className="blog-card__link">
                    <div className="blog-card__img-wrap">
                      {post.cover_image_url ? (
                        <Image
                          src={post.cover_image_url}
                          alt={post.title}
                          fill
                          sizes="(max-width:640px) 100vw, 33vw"
                          className="blog-card__img"
                        />
                      ) : (
                        <div className="blog-card__img-placeholder" />
                      )}
                    </div>
                    <div className="blog-card__body">
                      {post.tags?.[0] && <span className="blog-card__tag">{post.tags[0]}</span>}
                      <h3 className="blog-card__title">{post.title}</h3>
                      <p className="blog-card__excerpt">{post.excerpt}</p>
                      <span className="blog-card__read">Devamını Oku →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '48px' }} className="reveal delay-4">
              <Link href="/blog" className="btn btn-ghost--dark btn-ghost">
                Tüm Yazıları Gör <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </>
  )
}
