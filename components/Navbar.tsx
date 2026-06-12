'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

const links = [
  { href: '/', label: 'Ana Sayfa' },
  { href: '/portfolio', label: 'Portfolyo' },
  { href: '/danismanlik', label: 'Danışmanlık' },
  { href: '/hakkimda', label: 'Hakkımda' },
  { href: '/iletisim', label: 'İletişim' },
]

export default function Navbar() {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const solid = !isHome || scrolled

  return (
    <>
      <nav className={`navbar${solid ? ' navbar--scrolled' : ''}`} aria-label="Ana navigasyon">
        <div className="navbar__inner">
          <Link href="/" className="navbar__logo" aria-label="Ays Interiors Ana Sayfa">
            ays interiors
          </Link>
          <div className="navbar__nav" role="list">
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className={`navbar__link${pathname === l.href ? ' active' : ''}`}
                role="listitem"
              >
                {l.label}
              </Link>
            ))}
            <Link href="/danismanlik" className="btn btn-solid navbar__cta">Danışmanlık Al</Link>
          </div>
          <button
            className="navbar__hamburger"
            onClick={() => setMobileOpen(true)}
            aria-label="Menüyü aç"
            aria-expanded={mobileOpen}
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      <div className={`mobile-nav${mobileOpen ? ' mobile-nav--open' : ''}`} role="dialog" aria-modal="true">
        <button className="mobile-nav__close" onClick={() => setMobileOpen(false)} aria-label="Menüyü kapat">
          <X size={16} /><span>Kapat</span>
        </button>
        {links.map(l => (
          <Link key={l.href} href={l.href} className="mobile-nav__link" onClick={() => setMobileOpen(false)}>
            {l.label}
          </Link>
        ))}
      </div>
    </>
  )
}
