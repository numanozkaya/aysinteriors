'use client'
import { useEffect } from 'react'
import Script from 'next/script'

interface Post { id: string; url: string }

export default function InstagramGrid({ posts }: { posts: Post[] }) {
  useEffect(() => {
    const win = window as any
    if (win.instgrm?.Embeds) win.instgrm.Embeds.process()
  }, [posts])

  if (!posts.length) return null

  return (
    <>
      <Script
        src="https://www.instagram.com/embed.js"
        strategy="lazyOnload"
        onLoad={() => {
          const win = window as any
          win.instgrm?.Embeds?.process()
        }}
      />
      <div className="ig-grid">
        {posts.map(post => (
          <div key={post.id} className="ig-item">
            <blockquote
              className="instagram-media"
              data-instgrm-permalink={post.url}
              data-instgrm-version="14"
              style={{ background: '#fff', border: 0, borderRadius: 3, margin: '0 auto', maxWidth: 540, minWidth: 280, width: '100%' }}
            />
          </div>
        ))}
      </div>
    </>
  )
}
