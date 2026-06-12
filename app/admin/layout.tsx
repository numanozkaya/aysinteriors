'use client'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Folder, Package, MessageSquare, Settings, LogOut, ExternalLink, FileText, LayoutDashboard, User, Link2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

const navItems = [
  { href: '/admin/anasayfa', icon: <LayoutDashboard size={15} />, label: 'Ana Sayfa' },
  { href: '/admin/portfolio', icon: <Folder size={15} />, label: 'Portfolyo' },
  { href: '/admin/paketler', icon: <Package size={15} />, label: 'Danışmanlık Paketleri' },
  { href: '/admin/hakkimda', icon: <User size={15} />, label: 'Hakkımda' },
  { href: '/admin/blog', icon: <FileText size={15} />, label: 'Blog Yazıları' },
  { href: '/admin/instagram', icon: <Link2 size={15} />, label: 'Instagram' },
  { href: '/admin/mesajlar', icon: <MessageSquare size={15} />, label: 'Mesajlar' },
  { href: '/admin/ayarlar', icon: <Settings size={15} />, label: 'Site Ayarları' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('is_read', false)
      .then(({ count }) => setUnread(count ?? 0))
  }, [])

  if (pathname === '/admin/login') return <>{children}</>

  async function logout() {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-name">ays interiors</div>
          <div className="sidebar-brand-sub">Admin Paneli</div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item${pathname.startsWith(item.href) ? ' active' : ''}`}
            >
              {item.icon}
              {item.label}
              {item.href === '/admin/mesajlar' && unread > 0 && (
                <span className="nav-badge">{unread}</span>
              )}
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={logout}>
            <LogOut size={13} /> Çıkış Yap
          </button>
        </div>
      </aside>
      <div className="admin-main">
        <div className="topbar">
          <Link href="/" target="_blank" className="topbar-btn">
            <ExternalLink size={13} /> Siteyi Görüntüle
          </Link>
        </div>
        <div className="admin-content">{children}</div>
      </div>
    </div>
  )
}
