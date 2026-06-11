import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PortfolioGrid from '@/components/PortfolioGrid'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Portfolyo — Ays Interiors',
  description: 'Ays Interiors iç mimarlık portfolyosu. Salon, mutfak, banyo, yatak odası ve ofis tasarım projelerimizi inceleyin.',
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
