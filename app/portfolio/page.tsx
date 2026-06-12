import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PortfolioGrid from '@/components/PortfolioGrid'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Portfolyo — Ays Interiors | İç Mimarlık Projeleri',
  description: 'Ays Interiors iç mimarlık proje portfolyosu. Tamamlanan salon, mutfak, banyo, yatak odası, ofis ve ticari mekan iç tasarım projelerimizi inceleyin.',
  keywords: ['iç mimarlık proje', 'iç tasarım portfolyo', 'salon tasarımı', 'mutfak tasarımı', 'iç mimarlık örnekleri', 'interior design portfolio turkey'],
  openGraph: {
    title: 'Portfolyo — Ays Interiors | İç Mimarlık Projeleri',
    description: 'Tamamlanan iç mimarlık ve tasarım projelerimiz. Konut, ofis ve ticari mekan iç tasarım örnekleri.',
    type: 'website',
    locale: 'tr_TR',
  },
  alternates: { canonical: 'https://aysinteriors.com/portfolio' },
}

export default async function PortfolioPage() {
  const supabase = await createClient()

  const [{ data: projects }, { data: categories }] = await Promise.all([
    supabase
      .from('projects')
      .select('*, category:categories(id,name,slug), images:project_images(id,url,storage_path,is_cover,sort_order)')
      .order('created_at', { ascending: false }),
    supabase.from('categories').select('*').order('sort_order'),
  ])

  return (
    <>
      <Navbar />
      <section className="page-hero">
        <div className="page-hero-content">
          <h1>Portfolyo</h1>
          <p>Her mekân, bir hikâye taşır</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <PortfolioGrid
            projects={(projects ?? []) as any}
            categories={categories ?? []}
          />
        </div>
      </section>
      <Footer />
    </>
  )
}
