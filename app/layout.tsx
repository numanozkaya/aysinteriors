import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    template: '%s | Ays Interiors',
    default: 'Ays Interiors — İç Mimarlık & Danışmanlık',
  },
  description: 'Lüks iç mimarlık ve danışmanlık stüdyosu. Konsept tasarımdan 3D render\'a, uçtan uca iç mimari çözümler. Türkiye ve yurt dışı projeler.',
  metadataBase: new URL('https://aysinteriors.com'),
  openGraph: {
    title: 'Ays Interiors — Ankara İç Mimarlık & Danışmanlık',
    description: 'Mekânlar, Hikâye Anlatır. Ankara\'da uçtan uca iç mimari çözümler.',
    url: 'https://aysinteriors.com',
    siteName: 'Ays Interiors',
    type: 'website',
    locale: 'tr_TR',
    images: [{ url: '/ays-logo.png', width: 400, height: 160, alt: 'Ays Interiors Logo' }],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: '/ays-logo.png',
    shortcut: '/ays-logo.png',
    apple: '/ays-logo.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  )
}
