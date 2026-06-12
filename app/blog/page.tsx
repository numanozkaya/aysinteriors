import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import InstagramGrid from '@/components/InstagramGrid'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import type { BlogPost } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Blog & Instagram — Ays Interiors | İç Mimarlık & Tasarım',
  description: 'Ankara iç mimarlık, 3D render, uçtan uca mimari çözüm ve tasarım trendleri hakkında uzman blog yazıları ve Instagram içerikleri.',
  keywords: 'ankara iç mimarlık, 3d render, iç mimar blog, mimari çözüm, 3 boyutlu görselleştirme',
  openGraph: {
    title: 'Blog & Instagram — Ays Interiors',
    description: 'İç mimarlık ve tasarım hakkında uzman yazılar ve Instagram içerikleri',
    type: 'website',
  },
}

export default async function BlogPage() {
  const supabase = await createClient()

  const [{ data: posts }, { data: igPosts }, { data: profileData }] = await Promise.all([
    supabase.from('blog_posts').select('id, title, slug, excerpt, cover_image_url, tags, created_at').eq('published', true).order('created_at', { ascending: false }),
    supabase.from('instagram_posts').select('id, url').order('sort_order'),
    supabase.from('profile').select('instagram').eq('id', 1).single(),
  ])

  const igHandle = profileData?.instagram?.replace('@', '') ?? 'icmimaraysenurtaskiran'

  return (
    <>
      <Navbar />
      <section className="page-hero">
        <div className="page-hero-content">
          <h1>Blog & İlham</h1>
          <p>İç mimarlık, tasarım ve ilham</p>
        </div>
      </section>

      {/* ── Written blog posts ── */}
      {posts && posts.length > 0 && (
        <section className="section">
          <div className="container">
            <header className="section-header reveal">
              <span className="section-header__eyebrow">Yazılar</span>
              <h2 className="section-header__title">Blog</h2>
            </header>
            <div className="blog-grid">
              {posts.map((post: Partial<BlogPost>) => (
                <article key={post.id} className="blog-card reveal">
                  <Link href={`/blog/${post.slug}`} className="blog-card__link">
                    <div className="blog-card__img-wrap">
                      {post.cover_image_url ? (
                        <Image src={post.cover_image_url} alt={post.title ?? ''} fill sizes="(max-width:768px) 100vw, 33vw" className="blog-card__img" />
                      ) : (
                        <div className="blog-card__img-placeholder" />
                      )}
                    </div>
                    <div className="blog-card__body">
                      {post.tags && post.tags.length > 0 && <span className="blog-card__tag">{post.tags[0]}</span>}
                      <h2 className="blog-card__title">{post.title}</h2>
                      <p className="blog-card__excerpt">{post.excerpt}</p>
                      <span className="blog-card__read">Devamını Oku →</span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Instagram section ── */}
      <section className="section" style={{ background: posts && posts.length > 0 ? 'var(--bg)' : undefined, borderTop: posts && posts.length > 0 ? '1px solid var(--border)' : undefined }}>
        <div className="container">
          <header className="section-header section-header--center reveal">
            <span className="section-header__eyebrow">Instagram</span>
            <h2 className="section-header__title">@{igHandle}</h2>
            <p className="section-header__desc">
              Projeler, süreçler ve ilham — Instagram'da takip edin.
            </p>
            <a
              href={`https://instagram.com/${igHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ig-follow-btn"
            >
              <IgIcon />
              Instagram'da Takip Et
            </a>
          </header>

          {igPosts && igPosts.length > 0 ? (
            <InstagramGrid posts={igPosts} />
          ) : (
            <div className="ig-placeholder">
              <IgIcon size={48} />
              <p>@{igHandle}</p>
              <a
                href={`https://instagram.com/${igHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ig-follow-btn"
              >
                Profili Ziyaret Et
              </a>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  )
}

function IgIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  )
}
