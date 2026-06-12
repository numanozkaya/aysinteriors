import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import StatsCounter from '@/components/StatsCounter'
import { createClient } from '@/lib/supabase/server'
import { ArrowRight, MessageCircle, CheckCircle2, Pencil, Ruler, Box } from 'lucide-react'
import type { Metadata } from 'next'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'Ays Interiors — İç Mimarlık & Danışmanlık',
  description: 'Lüks iç mimarlık ve danışmanlık hizmetleri. Konsept tasarımdan 2D/3D render\'a, uçtan uca iç mimari çözümler. Türkiye ve yurt dışı projeler.',
  keywords: [
    'iç mimarlık', 'iç mimar', 'iç mimarlık proje', 'uçtan uca iç mimari çözüm',
    'mimari çözüm', '2d 3d render', '3 boyutlu görselleştirme', 'ankara iç mimarlık',
    'salon tasarımı', 'mutfak tasarımı', 'lüks iç tasarım', 'interior design turkey',
  ],
  openGraph: {
    title: 'Ays Interiors — İç Mimarlık & Danışmanlık',
    description: 'Mekânlar, Hikâye Anlatır. Türkiye genelinde uçtan uca iç mimari çözümler.',
    url: 'https://aysinteriors.com', type: 'website', locale: 'tr_TR',
    images: [{ url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80', width: 1200, height: 630 }],
  },
  alternates: { canonical: 'https://aysinteriors.com' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Ays Interiors',
  description: 'Lüks iç mimarlık ve danışmanlık stüdyosu. Uçtan uca iç mimari çözümler, 2D/3D render.',
  url: 'https://aysinteriors.com',
  address: { '@type': 'PostalAddress', addressLocality: 'Çankaya', addressRegion: 'Ankara', addressCountry: 'TR' },
  areaServed: ['Ankara', 'İstanbul', 'Türkiye'],
  priceRange: '₺₺₺',
  image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80',
}

// Static services — always visible
const SERVICES = [
  {
    title: 'Konsept Geliştirme & İç Mekan Tasarımı',
    desc: 'Konut, ofis ve ticari alanlar için yaşam tarzınıza özel, özgün iç tasarım çözümleri.',
    img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=700&q=80',
  },
  {
    title: '3D Modelleme & Görselleştirme',
    desc: 'Projeyi hayata geçirmeden önce gerçekçi 3D render ve sanal tur ile tam olarak görün.',
    img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=700&q=80',
  },
  {
    title: 'Proje Yönetimi & Uygulama',
    desc: 'Müteahhit ve tedarikçi koordinasyonu, şantiye denetimi — anahtar teslim çözümler.',
    img: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=700&q=80',
  },
  {
    title: 'Mobilya & Aksesuar Seçimi',
    desc: 'Mekânınıza özel mobilya, kumaş, aydınlatma ve aksesuar seçimi ile stili tamamlıyoruz.',
    img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=700&q=80',
  },
  {
    title: 'Danışmanlık & Renovasyon',
    desc: 'Mevcut mekanınızı minimal bütçeyle maksimum etki yaratacak şekilde dönüştürüyoruz.',
    img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=700&q=80',
  },
  {
    title: 'Online Tasarım Hizmeti',
    desc: 'Türkiye ve yurt dışından müşterilerimize video görüşme ile uzaktan danışmanlık.',
    img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=700&q=80',
  },
]

// Static gallery strip
const GALLERY = [
  'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80',
  'https://images.unsplash.com/photo-1615529328331-f8917597711f?w=600&q=80',
  'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=600&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80',
  'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=600&q=80',
]

// Fallback projects if DB empty
const FALLBACK_PROJECTS = [
  { id: 'f1', title: 'Modern Salon Tasarımı', cat: 'Salon', img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80' },
  { id: 'f2', title: 'Minimalist Mutfak', cat: 'Mutfak', img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80' },
  { id: 'f3', title: 'Lüks Banyo Konsepti', cat: 'Banyo', img: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80' },
]

// Fallback packages if DB empty
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

export default async function HomePage() {
  const supabase = await createClient()

  const [{ data: featuredProjects }, { data: packages }, { data: settings }, { data: blogPosts }] = await Promise.all([
    supabase.from('projects').select('*, category:categories(name,slug), images:project_images(url,is_cover,sort_order)').eq('featured', true).order('created_at', { ascending: false }).limit(3),
    supabase.from('packages').select('*').order('sort_order').limit(3),
    supabase.from('site_settings').select('key,value'),
    supabase.from('blog_posts').select('id,title,slug,excerpt,tags,cover_image_url,created_at').eq('published', true).order('created_at', { ascending: false }).limit(3),
  ])

  const s: Record<string, string> = Object.fromEntries((settings ?? []).map((r: any) => [r.key, r.value]))
  const heroUrl = s.hero_image_url || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&q=80'

  const displayProjects = (featuredProjects && featuredProjects.length > 0)
    ? featuredProjects.map((p: any) => ({
        id: p.id, title: p.title,
        cat: p.category?.name ?? '',
        img: p.images?.find((i: any) => i.is_cover)?.url ?? p.images?.[0]?.url ?? null,
      }))
    : FALLBACK_PROJECTS

  const displayPackages = (packages && packages.length > 0) ? packages : FALLBACK_PACKAGES

  return (
    <>
      <Script id="json-ld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="hero" aria-label="Hero">
        <div className="hero__bg" style={{ backgroundImage: `url('${heroUrl}')` }} />
        <div className="hero__overlay" />
        <div className="hero__content">
          <span className="hero__eyebrow">ays interiors</span>
          <h1 className="hero__title">Mekânlar,<br />Hikâye Anlatır</h1>
          <hr className="hero__rule" />
          <p className="hero__subtitle">Uçtan uca iç mimarlık & danışmanlık — Türkiye & Dünya</p>
          <div className="hero__buttons">
            <Link href="/portfolio" className="btn btn-ghost">Portfolyoyu Keşfet</Link>
            <Link href="/iletisim" className="btn btn-solid"><MessageCircle size={15} /> Danışmanlık Al</Link>
          </div>
        </div>
        <span className="hero__vertical-text" aria-hidden="true">Interior Design & Consultancy</span>
      </section>

      {/* ── Hakkımızda teaser ─────────────────────────── */}
      <section className="section hp-about" aria-label="Hakkımızda">
        <div className="container">
          <div className="hp-about__grid">
            <div className="hp-about__imgs reveal reveal--left">
              <div className="hp-about__img-main">
                <Image src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=900&q=80" alt="İç mimarlık proje" fill sizes="45vw" style={{ objectFit: 'cover' }} />
              </div>
              <div className="hp-about__img-accent">
                <Image src="https://images.unsplash.com/photo-1600210492493-0946911123ea?w=600&q=80" alt="Tasarım detayı" fill sizes="25vw" style={{ objectFit: 'cover' }} />
              </div>
            </div>
            <div className="hp-about__text reveal reveal--right">
              <span className="section-header__eyebrow">Ays Interiors</span>
              <h2>Zarafeti Mekânınıza<br />Taşıyoruz</h2>
              <p>
                Ays Interiors, yaşam alanlarınızı ihtiyaçlarınıza, zevkinize ve ruhunuza uygun
                biçimde dönüştürmek için kuruldu. Konsept tasarımdan anahtar teslim uygulamaya,
                her adımda profesyonel, kişiselleştirilmiş ve estetik çözümler sunuyoruz.
              </p>
              <p style={{ marginTop: '1rem' }}>
                Türkiye geneli ve uluslararası projelerde 8 yılı aşkın deneyimimizle,
                konut, ofis ve ticari mekânları yaşayan birer sanat eserine dönüştürüyoruz.
              </p>
              <Link href="/hakkimda" className="btn btn-ghost--dark btn-ghost" style={{ marginTop: '2rem' }}>
                Daha Fazla Öğren <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Services grid ─────────────────────────────── */}
      <section className="section" style={{ background: 'var(--dark)' }} aria-label="Hizmetler">
        <div className="container">
          <header className="section-header section-header--center reveal" style={{ color: 'var(--white)' }}>
            <span className="section-header__eyebrow">Ne Yapıyoruz</span>
            <h2 className="section-header__title" style={{ color: 'var(--white)' }}>Hizmetlerimiz</h2>
            <p className="section-header__desc" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Konsept tasarımdan 3D görselleştirmeye, mobilya seçiminden anahtar teslim uygulamaya kadar.
            </p>
          </header>
          <div className="hp-services-grid">
            {SERVICES.map((svc, i) => (
              <article key={svc.title} className={`hp-service-card reveal delay-${(i % 3) + 1}`}>
                <div className="hp-service-card__img">
                  <Image src={svc.img} alt={svc.title} fill sizes="(max-width:640px) 100vw, 33vw" style={{ objectFit: 'cover' }} />
                  <div className="hp-service-card__overlay" />
                </div>
                <div className="hp-service-card__body">
                  <h3 className="hp-service-card__title">{svc.title}</h3>
                  <p className="hp-service-card__desc">{svc.desc}</p>
                  <Link href="/danismanlik" className="hp-service-card__link">Keşfet <ArrowRight size={13} /></Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3D Render showcase ────────────────────────── */}
      <section className="hp-render-section" aria-label="3D Görselleştirme">
        <div className="hp-render-section__img">
          <Image
            src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1400&q=80"
            alt="3D render iç mimarlık görselleştirme"
            fill
            sizes="60vw"
            style={{ objectFit: 'cover' }}
          />
          <div className="hp-render-section__overlay" />
        </div>
        <div className="hp-render-section__content reveal reveal--right">
          <span className="section-header__eyebrow">3D Modelleme & Görselleştirme</span>
          <h2>Projenizi İnşa<br />Etmeden Önce Görün</h2>
          <ul className="hp-render-list">
            {[
              'Fotorealistik 3D render görseller',
              '360° sanal tur deneyimi',
              'Malzeme & renk simülasyonu',
              'Farklı konsept alternatifleri',
              'Sunum hazır çizimler & planlar',
            ].map(item => (
              <li key={item}><CheckCircle2 size={15} />{item}</li>
            ))}
          </ul>
          <Link href="/iletisim" className="btn btn-solid" style={{ marginTop: '2rem' }}>
            3D Teklif Al <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ── Featured projects ─────────────────────────── */}
      <section className="section" aria-label="Öne çıkan projeler">
        <div className="container">
          <header className="section-header reveal">
            <span className="section-header__eyebrow">Seçkin Çalışmalar</span>
            <h2 className="section-header__title">Öne Çıkan Projeler</h2>
            <p className="section-header__desc">Her mekan, sahibinin ruhunu yansıtır. İşte öne çıkan tasarımlarımızdan bir seçki.</p>
          </header>
          <div className="hp-projects-grid">
            {displayProjects.map((p, i) => (
              <Link key={p.id} href="/portfolio" className={`hp-project-card reveal delay-${i + 1}`}>
                <div className="hp-project-card__img">
                  {p.img && <Image src={p.img} alt={p.title} fill sizes="(max-width:768px) 100vw, 40vw" style={{ objectFit: 'cover' }} />}
                </div>
                <div className="hp-project-card__info">
                  <span className="hp-project-card__cat">{p.cat}</span>
                  <span className="hp-project-card__title">{p.title}</span>
                </div>
              </Link>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '48px' }} className="reveal">
            <Link href="/portfolio" className="btn btn-ghost--dark btn-ghost">Tüm Projeleri Gör <ArrowRight size={14} /></Link>
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────── */}
      <section className="stats-band" aria-label="İstatistikler">
        <div className="container">
          <div className="stats-grid">
            {[
              { count: 127, suffix: '+', label: 'Tamamlanan Proje' },
              { count: 8, suffix: '+', label: 'Yıl Deneyim' },
              { count: 4, suffix: '', label: 'Şehir' },
              { count: 100, suffix: '%', label: 'Müşteri Memnuniyeti' },
            ].map(stat => (
              <div key={stat.label} className="stat-item reveal">
                <span className="stat-item__number"><StatsCounter target={stat.count} suffix={stat.suffix} /></span>
                <span className="stat-item__label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Gallery strip ─────────────────────────────── */}
      <section className="hp-gallery" aria-label="İlham galerisi">
        {GALLERY.map((src, i) => (
          <div key={i} className="hp-gallery__item reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
            <Image src={src} alt={`İç mimarlık ilham ${i + 1}`} fill sizes="20vw" style={{ objectFit: 'cover' }} />
          </div>
        ))}
      </section>

      {/* ── Process ───────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)' }} aria-label="Süreç">
        <div className="container">
          <header className="section-header section-header--center reveal">
            <span className="section-header__eyebrow">Nasıl Çalışıyoruz</span>
            <h2 className="section-header__title">Sürecimiz</h2>
            <p className="section-header__desc">İlk görüşmeden teslimata kadar şeffaf, adım adım bir deneyim.</p>
          </header>
          <div className="hp-process-grid">
            {[
              { n: '01', icon: <MessageCircle size={20} />, title: 'Keşif & Analiz', desc: 'İhtiyaçlarınızı, zevklerinizi ve bütçenizi birlikte değerlendiriyoruz.' },
              { n: '02', icon: <Pencil size={20} />, title: 'Konsept & 2D Plan', desc: 'Moodboard, renk paleti ve 2D zemin planı hazırlıyoruz.' },
              { n: '03', icon: <Box size={20} />, title: '3D Görselleştirme', desc: 'Gerçekçi 3D render ve sanal tur ile projeyi yaşıyorsunuz.' },
              { n: '04', icon: <Ruler size={20} />, title: 'Uygulama & Teslim', desc: 'Şantiye yönetimi ve koordinasyonla anahtar teslim bitiriyoruz.' },
            ].map((step, i) => (
              <article key={step.n} className={`hp-process-step reveal delay-${i + 1}`}>
                <span className="hp-process-step__n">{step.n}</span>
                <div className="hp-process-step__icon">{step.icon}</div>
                <h3 className="hp-process-step__title">{step.title}</h3>
                <p className="hp-process-step__desc">{step.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA dark banner ───────────────────────────── */}
      <section className="hp-cta-banner" aria-label="Harekete geçin">
        <div className="hp-cta-banner__bg">
          <Image src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1600&q=80" alt="Lüks iç tasarım" fill sizes="100vw" style={{ objectFit: 'cover' }} />
          <div className="hp-cta-banner__overlay" />
        </div>
        <div className="hp-cta-banner__content reveal">
          <span className="section-header__eyebrow">Hayalinizi Gerçekleştirelim</span>
          <h2>Hayaliniz<br /><em>Gerçek Olsun</em></h2>
          <p>Projenizi konuşmak için bize ulaşın — ilk görüşme ücretsiz.</p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '2rem' }}>
            <Link href="/iletisim" className="btn btn-solid">Ücretsiz Görüşme Talep Et</Link>
            <Link href="/portfolio" className="btn btn-ghost">Projelerimizi İncele</Link>
          </div>
        </div>
      </section>

      {/* ── Packages ──────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--dark)' }} aria-label="Paketler">
        <div className="container">
          <header className="section-header section-header--center reveal" style={{ color: 'var(--white)' }}>
            <span className="section-header__eyebrow">Hizmet Paketleri</span>
            <h2 className="section-header__title" style={{ color: 'var(--white)' }}>İhtiyacınıza Özel Paket</h2>
          </header>
          <div className="packages-grid">
            {displayPackages.map((pkg: any, i: number) => (
              <div key={pkg.id} className={`package-card${pkg.featured ? ' package-card--featured' : ''} reveal delay-${i + 1}`}>
                {pkg.featured && <span className="package-badge">En Popüler</span>}
                <h3 className="package-card__title">{pkg.title}</h3>
                <p className="package-card__slogan">{pkg.slogan}</p>
                {pkg.price && <p className="package-card__price">{pkg.price}</p>}
                <ul className="package-card__features">
                  {pkg.features.map((f: string) => <li key={f}>{f}</li>)}
                </ul>
                <Link href="/iletisim" className="btn btn-ghost package-card__cta">{pkg.cta_text}</Link>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '56px' }} className="reveal">
            <Link href="/danismanlik" className="btn btn-ghost">Tüm Paketleri İncele <ArrowRight size={15} /></Link>
          </div>
        </div>
      </section>

      {/* ── Blog teaser ───────────────────────────────── */}
      {blogPosts && blogPosts.length > 0 && (
        <section className="section" aria-label="Blog">
          <div className="container">
            <header className="section-header reveal">
              <span className="section-header__eyebrow">İlham & Bilgi</span>
              <h2 className="section-header__title">Blog</h2>
              <p className="section-header__desc">İç mimarlık trendleri, 3D render ipuçları ve tasarım ilhamı.</p>
            </header>
            <div className="blog-grid">
              {blogPosts.map((post: any, i: number) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className={`blog-card reveal delay-${i + 1}`}>
                  <div className="blog-card__link">
                    <div className="blog-card__img-wrap">
                      {post.cover_image_url
                        ? <Image src={post.cover_image_url} alt={post.title} fill sizes="33vw" className="blog-card__img" />
                        : <div className="blog-card__img-placeholder" />}
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
            <div style={{ textAlign: 'center', marginTop: '48px' }} className="reveal">
              <Link href="/blog" className="btn btn-ghost--dark btn-ghost">Tüm Yazıları Gör <ArrowRight size={14} /></Link>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </>
  )
}
