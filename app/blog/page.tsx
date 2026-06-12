import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import type { BlogPost } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Blog — Ays Interiors | İç Mimarlık & Tasarım',
  description: 'Ankara iç mimarlık, 3D render, uçtan uca mimari çözüm ve tasarım trendleri hakkında uzman blog yazıları.',
  keywords: 'ankara iç mimarlık, 3d render, iç mimar blog, mimari çözüm, 3 boyutlu görselleştirme',
  openGraph: {
    title: 'Blog — Ays Interiors',
    description: 'İç mimarlık ve tasarım hakkında uzman yazılar',
    type: 'website',
  },
}

export default async function BlogPage() {
  const supabase = await createClient()
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, cover_image_url, tags, created_at')
    .eq('published', true)
    .order('created_at', { ascending: false })

  return (
    <>
      <Navbar />
      <section className="page-hero">
        <div className="page-hero-content">
          <h1>Blog</h1>
          <p>İç mimarlık, tasarım ve ilham</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {(!posts || posts.length === 0) ? (
            <p style={{ color: 'var(--taupe)', textAlign: 'center', padding: '60px 0' }}>Yakında yazılar yayınlanacak.</p>
          ) : (
            <div className="blog-grid">
              {posts.map((post: Partial<BlogPost>) => (
                <article key={post.id} className="blog-card">
                  <Link href={`/blog/${post.slug}`} className="blog-card__link">
                    <div className="blog-card__img-wrap">
                      {post.cover_image_url ? (
                        <Image
                          src={post.cover_image_url}
                          alt={post.title ?? ''}
                          fill
                          sizes="(max-width:768px) 100vw, (max-width:1024px) 50vw, 33vw"
                          className="blog-card__img"
                        />
                      ) : (
                        <div className="blog-card__img-placeholder" />
                      )}
                    </div>
                    <div className="blog-card__body">
                      {post.tags && post.tags.length > 0 && (
                        <span className="blog-card__tag">{post.tags[0]}</span>
                      )}
                      <h2 className="blog-card__title">{post.title}</h2>
                      <p className="blog-card__excerpt">{post.excerpt}</p>
                      <span className="blog-card__read">Devamını Oku →</span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  )
}
