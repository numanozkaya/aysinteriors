import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ays Interiors — İç Mimarlık & Danışmanlık',
  description: 'Ankara merkezli lüks iç mimarlık ve danışmanlık stüdyosu. Mekânları hikâyelere dönüştürüyoruz.',
  metadataBase: new URL('https://aysinteriors.com'),
  openGraph: {
    title: 'Ays Interiors — İç Mimarlık & Danışmanlık',
    description: 'Mekânlar, Hikâye Anlatır. Ankara merkezli lüks iç tasarım stüdyosu.',
    url: 'https://aysinteriors.com',
    type: 'website',
    locale: 'tr_TR',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  )
}
