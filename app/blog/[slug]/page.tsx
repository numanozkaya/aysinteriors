import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import DOMPurify from 'isomorphic-dompurify'
import type { Metadata } from 'next'


type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: post } = await supabase
    .from('blog_posts')
    .select('title, excerpt, cover_image_url, tags')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!post) return { title: 'Yazı Bulunamadı' }

  return {
    title: `${post.title} — Ays Interiors Blog`,
    description: post.excerpt,
    keywords: post.tags?.join(', '),
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      images: post.cover_image_url ? [post.cover_image_url] : [],
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!post) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.cover_image_url,
    datePublished: post.created_at,
    dateModified: post.updated_at,
    author: { '@type': 'Organization', name: 'Ays Interiors' },
    publisher: {
      '@type': 'Organization',
      name: 'Ays Interiors',
      logo: { '@type': 'ImageObject', url: 'https://aysinteriors.com/logo.png' },
    },
  }

  // Convert markdown-style ## headings and \n to HTML paragraphs
  function renderContent(content: string): string {
    return content
      .split('\n')
      .map(line => {
        if (line.startsWith('### ')) return `<h3>${line.slice(4)}</h3>`
        if (line.startsWith('## ')) return `<h2>${line.slice(3)}</h2>`
        if (line.startsWith('**') && line.endsWith('**')) return `<strong>${line.slice(2, -2)}</strong>`
        if (line.startsWith('- ')) return `<li>${line.slice(2)}</li>`
        if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ')) {
          return `<li>${line.replace(/^\d+\.\s/, '')}</li>`
        }
        if (line.trim() === '') return '<br />'
        return `<p>${line}</p>`
      })
      .join('')
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      {post.cover_image_url && (
        <div className="blog-post-hero">
          <Image
            src={post.cover_image_url}
            alt={post.title}
            fill
            sizes="100vw"
            priority
            className="blog-post-hero__img"
          />
          <div className="blog-post-hero__overlay" />
          <div className="blog-post-hero__content">
            <div className="container">
              {post.tags?.length > 0 && (
                <div className="blog-post-hero__tags">
                  {post.tags.map((tag: string) => (
                    <span key={tag} className="blog-tag">{tag}</span>
                  ))}
                </div>
              )}
              <h1 className="blog-post-hero__title">{post.title}</h1>
              <p className="blog-post-hero__date">
                {new Date(post.created_at).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      )}

      {!post.cover_image_url && (
        <section className="page-hero">
          <div className="page-hero-content">
            <h1>{post.title}</h1>
            <p>{new Date(post.created_at).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          <div className="blog-post-layout">
            <article className="blog-post-content">
              <div
                className="blog-prose"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(renderContent(post.content)) }}
              />
            </article>
            <aside className="blog-post-sidebar">
              <div className="blog-sidebar-card">
                <h3>Ays Interiors</h3>
                <p>Ankara merkezli lüks iç mimarlık stüdyosu. Konseptten teslimata uçtan uca hizmet.</p>
                <Link href="/iletisim" className="btn btn-solid" style={{ display: 'block', textAlign: 'center', marginTop: '16px' }}>
                  Danışmanlık Al
                </Link>
              </div>
              {post.tags?.length > 0 && (
                <div className="blog-sidebar-card" style={{ marginTop: '16px' }}>
                  <h3>Etiketler</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                    {post.tags.map((tag: string) => (
                      <span key={tag} className="blog-tag">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>

          <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid var(--border)' }}>
            <Link href="/blog" style={{ color: 'var(--taupe)', fontSize: '0.85rem', letterSpacing: '0.1em' }}>
              ← Tüm Yazılara Dön
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
