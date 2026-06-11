# Ays Interiors — Next.js + Supabase Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate Ays Interiors from vanilla HTML/localStorage to Next.js 14 App Router + Supabase + Vercel, preserving all existing visual design.

**Architecture:** Public pages as Server Components (Supabase data fetched server-side). Admin panel as Client Components behind Supabase Auth middleware. Images stored in Supabase Storage at original quality; Vercel Image Optimization serves WebP to visitors automatically.

**Tech Stack:** Next.js 14, TypeScript, @supabase/ssr, @supabase/supabase-js, lucide-react, Vercel

**GitHub Remote:** `https://github.com/ozkayanuman/aysinteriors.git` (already configured as `origin`)

---

## File Map

```
(root)
├── app/
│   ├── layout.tsx                  # Root layout: fonts, globals.css, metadata
│   ├── page.tsx                    # Ana sayfa
│   ├── portfolio/page.tsx
│   ├── danismanlik/page.tsx
│   ├── hakkimda/page.tsx
│   ├── iletisim/page.tsx
│   └── admin/
│       ├── layout.tsx              # Admin shell (sidebar, topbar)
│       ├── login/page.tsx
│       ├── portfolio/page.tsx
│       ├── paketler/page.tsx
│       ├── mesajlar/page.tsx
│       └── ayarlar/page.tsx
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── Lightbox.tsx
│   ├── ContactForm.tsx             # 'use client' form
│   └── admin/
│       ├── ProjectModal.tsx
│       ├── PackageModal.tsx
│       └── ImageUploader.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # createBrowserClient
│   │   ├── server.ts               # createServerClient (Server Components)
│   │   └── middleware.ts           # createServerClient (middleware)
│   └── types.ts                    # Database types + convenience aliases
├── middleware.ts                   # Protects /admin/* routes
├── app/globals.css                 # Migrated from css/style.css
└── supabase/
    └── schema.sql                  # Full DB schema + RLS + seed data
```

---

## Task 1: Archive legacy files & initialize Next.js

**Files:**
- Archive: move HTML/CSS to `_legacy/`
- Create: Next.js project in root

- [ ] **Step 1: Move legacy files**

```bash
mkdir -p _legacy/css _legacy/admin
mv index.html portfolio.html danismanlik.html hakkimda.html iletisim.html sitemap.xml robots.txt _legacy/
mv css/style.css _legacy/css/
mv admin/login.html admin/panel.html _legacy/admin/
```

- [ ] **Step 2: Initialize Next.js**

```bash
npx create-next-app@latest . --typescript --eslint --app --no-tailwind --no-src-dir --import-alias "@/*" --yes
```

When prompted about existing files, confirm overwrite of package.json only.

- [ ] **Step 3: Remove boilerplate**

```bash
rm -rf app/globals.css app/page.tsx app/page.module.css public/next.svg public/vercel.svg
```

- [ ] **Step 4: Install dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr lucide-react
```

- [ ] **Step 5: Create .env.local**

```bash
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EOF
```

- [ ] **Step 6: Update .gitignore — add .env.local if not present**

Open `.gitignore` and confirm `.env.local` is listed. Add if missing.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: initialize Next.js 14 App Router, archive legacy HTML"
git push origin master
```

---

## Task 2: Supabase project setup (manual)

**Files:** `.env.local`

- [ ] **Step 1: Create Supabase project**

Go to https://supabase.com/dashboard → New Project → name: `aysinteriors`, choose region closest to Turkey (eu-central-1).

- [ ] **Step 2: Copy credentials**

Project Settings → API → copy `Project URL` and `anon public` key into `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
```

- [ ] **Step 3: Create storage buckets**

In Supabase Dashboard → Storage → New bucket for each:
- `project-images` → Public: ON
- `profile-images` → Public: ON
- `site-assets` → Public: ON

- [ ] **Step 4: Create admin user**

Supabase Dashboard → Authentication → Users → Add user:
- Email: your admin email
- Password: strong password
- Confirm email: ON (or use "Auto Confirm" in Auth settings for simplicity)

---

## Task 3: Database schema

**Files:** `supabase/schema.sql`

- [ ] **Step 1: Create schema file**

```bash
mkdir -p supabase
```

Create `supabase/schema.sql`:

```sql
-- categories
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_order int not null default 0
);

-- projects
create table projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category_id uuid references categories(id) on delete set null,
  location text not null default '',
  year int not null default extract(year from now())::int,
  area_sqm int,
  description text not null default '',
  materials text[] not null default '{}',
  featured boolean not null default false,
  cover_image_url text,
  created_at timestamptz not null default now()
);

-- project_images
create table project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  storage_path text not null,
  url text not null,
  sort_order int not null default 0,
  is_cover boolean not null default false
);

-- packages
create table packages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slogan text not null default '',
  price text,
  features text[] not null default '{}',
  featured boolean not null default false,
  cta_text text not null default 'Bilgi Al',
  theme text not null default 'standard',
  sort_order int not null default 0
);

-- messages
create table messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  service text,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- profile (single row, id always 1)
create table profile (
  id int primary key default 1,
  full_name text not null default '',
  title text not null default '',
  short_bio text not null default '',
  long_bio text not null default '',
  avatar_url text,
  email text not null default '',
  phone text not null default '',
  instagram text not null default '',
  pinterest text not null default '',
  linkedin text not null default ''
);

-- site_settings (key-value)
create table site_settings (
  key text primary key,
  value text not null default ''
);

-- Seed: default profile row
insert into profile (id) values (1) on conflict do nothing;

-- Seed: default site settings
insert into site_settings (key, value) values
  ('site_title', 'Ays Interiors — İç Mimarlık & Danışmanlık'),
  ('site_description', 'Ankara merkezli lüks iç mimarlık ve danışmanlık stüdyosu.'),
  ('hero_image_url', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&q=80'),
  ('footer_text', '© 2025 Ays Interiors. Tüm hakları saklıdır.'),
  ('maps_embed_url', '')
on conflict do nothing;

-- Seed: default categories
insert into categories (name, slug, sort_order) values
  ('Salon', 'salon', 1),
  ('Mutfak', 'mutfak', 2),
  ('Banyo', 'banyo', 3),
  ('Yatak Odası', 'yatak-odasi', 4),
  ('Ofis', 'ofis', 5)
on conflict do nothing;

-- Enable RLS
alter table categories enable row level security;
alter table projects enable row level security;
alter table project_images enable row level security;
alter table packages enable row level security;
alter table messages enable row level security;
alter table profile enable row level security;
alter table site_settings enable row level security;

-- Public SELECT policies
create policy "public read categories" on categories for select using (true);
create policy "public read projects" on projects for select using (true);
create policy "public read project_images" on project_images for select using (true);
create policy "public read packages" on packages for select using (true);
create policy "public read profile" on profile for select using (true);
create policy "public read site_settings" on site_settings for select using (true);

-- Authenticated write policies
create policy "auth all categories" on categories for all using (auth.role() = 'authenticated');
create policy "auth all projects" on projects for all using (auth.role() = 'authenticated');
create policy "auth all project_images" on project_images for all using (auth.role() = 'authenticated');
create policy "auth all packages" on packages for all using (auth.role() = 'authenticated');
create policy "auth read messages" on messages for select using (auth.role() = 'authenticated');
create policy "auth update messages" on messages for update using (auth.role() = 'authenticated');
create policy "auth delete messages" on messages for delete using (auth.role() = 'authenticated');
create policy "public insert messages" on messages for insert with check (true);
create policy "auth all profile" on profile for all using (auth.role() = 'authenticated');
create policy "auth all site_settings" on site_settings for all using (auth.role() = 'authenticated');

-- Storage policies: allow authenticated uploads, public reads
create policy "public read project-images"
  on storage.objects for select using (bucket_id = 'project-images');
create policy "auth upload project-images"
  on storage.objects for insert with check (bucket_id = 'project-images' and auth.role() = 'authenticated');
create policy "auth delete project-images"
  on storage.objects for delete using (bucket_id = 'project-images' and auth.role() = 'authenticated');

create policy "public read profile-images"
  on storage.objects for select using (bucket_id = 'profile-images');
create policy "auth upload profile-images"
  on storage.objects for insert with check (bucket_id = 'profile-images' and auth.role() = 'authenticated');
create policy "auth delete profile-images"
  on storage.objects for delete using (bucket_id = 'profile-images' and auth.role() = 'authenticated');

create policy "public read site-assets"
  on storage.objects for select using (bucket_id = 'site-assets');
create policy "auth upload site-assets"
  on storage.objects for insert with check (bucket_id = 'site-assets' and auth.role() = 'authenticated');
create policy "auth delete site-assets"
  on storage.objects for delete using (bucket_id = 'site-assets' and auth.role() = 'authenticated');
```

- [ ] **Step 2: Run schema in Supabase**

Supabase Dashboard → SQL Editor → paste contents of `supabase/schema.sql` → Run.

- [ ] **Step 3: Commit**

```bash
git add supabase/schema.sql
git commit -m "feat: add Supabase schema with RLS and seed data"
git push origin master
```

---

## Task 4: TypeScript types + Supabase clients

**Files:**
- Create: `lib/types.ts`
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `middleware.ts`

- [ ] **Step 1: Create `lib/types.ts`**

```typescript
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type Project = {
  id: string
  title: string
  category_id: string | null
  location: string
  year: number
  area_sqm: number | null
  description: string
  materials: string[]
  featured: boolean
  cover_image_url: string | null
  created_at: string
}

export type ProjectImage = {
  id: string
  project_id: string
  storage_path: string
  url: string
  sort_order: number
  is_cover: boolean
}

export type Category = {
  id: string
  name: string
  slug: string
  sort_order: number
}

export type Package = {
  id: string
  title: string
  slogan: string
  price: string | null
  features: string[]
  featured: boolean
  cta_text: string
  theme: string
  sort_order: number
}

export type Message = {
  id: string
  name: string
  email: string
  phone: string | null
  service: string | null
  message: string
  is_read: boolean
  created_at: string
}

export type Profile = {
  id: number
  full_name: string
  title: string
  short_bio: string
  long_bio: string
  avatar_url: string | null
  email: string
  phone: string
  instagram: string
  pinterest: string
  linkedin: string
}

export type SiteSettings = Record<string, string>

export type ProjectWithImages = Project & {
  images: ProjectImage[]
  category: Category | null
}
```

- [ ] **Step 2: Create `lib/supabase/client.ts`**

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 3: Create `lib/supabase/server.ts`**

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

- [ ] **Step 4: Create `middleware.ts` (root)**

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  const isLoginPage = request.nextUrl.pathname === '/admin/login'

  if (isAdminRoute && !isLoginPage && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    return NextResponse.redirect(url)
  }

  if (isLoginPage && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/portfolio'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*'],
}
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add lib/ middleware.ts
git commit -m "feat: add Supabase clients, middleware, TypeScript types"
git push origin master
```

---

## Task 5: Global layout & CSS

**Files:**
- Create: `app/globals.css`
- Create: `app/layout.tsx`

- [ ] **Step 1: Create `app/globals.css`**

Copy `_legacy/css/style.css` to `app/globals.css`, then prepend Google Fonts import at the top:

```css
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500;1,600&family=Jost:wght@300;400&display=swap');

/* rest of style.css content here */
```

- [ ] **Step 2: Create `app/layout.tsx`**

```tsx
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
```

- [ ] **Step 3: Verify dev server starts**

```bash
npm run dev
```

Expected: server starts at http://localhost:3000 with no errors (blank page is fine).

- [ ] **Step 4: Commit**

```bash
git add app/globals.css app/layout.tsx
git commit -m "feat: global layout and migrated CSS"
git push origin master
```

---

## Task 6: Navbar & Footer components

**Files:**
- Create: `components/Navbar.tsx`
- Create: `components/Footer.tsx`

- [ ] **Step 1: Create `components/Navbar.tsx`**

```tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'

const links = [
  { href: '/', label: 'Ana Sayfa' },
  { href: '/portfolio', label: 'Portfolyo' },
  { href: '/danismanlik', label: 'Danışmanlık' },
  { href: '/hakkimda', label: 'Hakkımda' },
  { href: '/iletisim', label: 'İletişim' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}`} aria-label="Ana navigasyon">
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
```

- [ ] **Step 2: Create `components/Footer.tsx`**

```tsx
import Link from 'next/link'
import { MapPin, Mail, Phone, Instagram, LayoutGrid, Home } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export default async function Footer() {
  const supabase = createClient()
  const { data: settings } = await supabase
    .from('site_settings')
    .select('key, value')

  const s: Record<string, string> = Object.fromEntries(
    (settings ?? []).map(r => [r.key, r.value])
  )

  const { data: profile } = await supabase
    .from('profile')
    .select('email, phone, instagram, pinterest')
    .eq('id', 1)
    .single()

  return (
    <footer className="footer" aria-label="Site altbilgisi">
      <div className="container">
        <div className="footer__grid">
          <div>
            <Link href="/" className="footer__logo">ays interiors</Link>
            <p className="footer__tagline">
              İç mimarlık ve danışmanlık hizmetleri. Her mekân bir hikâye taşır; o hikâyeyi birlikte yazalım.
            </p>
            <div className="footer__social" aria-label="Sosyal medya">
              {profile?.instagram && (
                <a href={`https://instagram.com/${profile.instagram.replace('@','')}`} className="footer__social-link" aria-label="Instagram">
                  <Instagram size={16} />
                </a>
              )}
              {profile?.pinterest && (
                <a href={profile.pinterest} className="footer__social-link" aria-label="Pinterest">
                  <LayoutGrid size={16} />
                </a>
              )}
            </div>
          </div>
          <div>
            <p className="footer__col-title">Hızlı Bağlantılar</p>
            <nav className="footer__links">
              {[['/', 'Ana Sayfa'], ['/portfolio', 'Portfolyo'], ['/danismanlik', 'Danışmanlık'], ['/hakkimda', 'Hakkımda'], ['/iletisim', 'İletişim']].map(([href, label]) => (
                <Link key={href} href={href} className="footer__link">{label}</Link>
              ))}
            </nav>
          </div>
          <div>
            <p className="footer__col-title">İletişim</p>
            <div className="footer__contact-item">
              <MapPin size={14} className="footer__contact-icon" />
              <span className="footer__contact-text">Çankaya, Ankara, Türkiye</span>
            </div>
            {profile?.email && (
              <div className="footer__contact-item">
                <Mail size={14} className="footer__contact-icon" />
                <a href={`mailto:${profile.email}`} className="footer__contact-text">{profile.email}</a>
              </div>
            )}
            {profile?.phone && (
              <div className="footer__contact-item">
                <Phone size={14} className="footer__contact-icon" />
                <span className="footer__contact-text">{profile.phone}</span>
              </div>
            )}
          </div>
        </div>
        <div className="footer__bottom">
          <span>{s.footer_text ?? '© 2025 Ays Interiors.'}</span>
          <Link href="/admin/login" className="footer__admin-link">Yönetici</Link>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/
git commit -m "feat: Navbar and Footer components"
git push origin master
```

---

## Task 7: Ana Sayfa (app/page.tsx)

**Files:**
- Create: `app/page.tsx`
- Create: `components/StatsCounter.tsx`

- [ ] **Step 1: Create `components/StatsCounter.tsx`** (client component for count-up animation)

```tsx
'use client'
import { useEffect, useRef, useState } from 'react'

export default function StatsCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      const duration = 1800
      const start = Date.now()
      const tick = () => {
        const elapsed = Date.now() - start
        const progress = Math.min(elapsed / duration, 1)
        setCount(Math.floor(progress * target))
        if (progress < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])

  return <span ref={ref}>{count}{suffix}</span>
}
```

- [ ] **Step 2: Create `app/page.tsx`**

```tsx
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import StatsCounter from '@/components/StatsCounter'
import { createClient } from '@/lib/supabase/server'
import { Grid, MessageCircle, ArrowRight, Palette, Layers, Video } from 'lucide-react'

export default async function HomePage() {
  const supabase = createClient()

  const [{ data: featuredProjects }, { data: packages }, { data: settings }] = await Promise.all([
    supabase
      .from('projects')
      .select('*, category:categories(name,slug), images:project_images(url,is_cover,sort_order)')
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(3),
    supabase
      .from('packages')
      .select('*')
      .order('sort_order')
      .limit(3),
    supabase.from('site_settings').select('key,value'),
  ])

  const s: Record<string, string> = Object.fromEntries((settings ?? []).map(r => [r.key, r.value]))
  const heroUrl = s.hero_image_url || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&q=80'

  return (
    <>
      <div className="site-loader" id="siteLoader">
        <span className="site-loader__logo">ays interiors</span>
      </div>

      <Navbar />

      {/* Hero */}
      <section className="hero" aria-label="Hero bölümü">
        <div className="hero__bg" style={{ backgroundImage: `url('${heroUrl}')` }} />
        <div className="hero__overlay" />
        <div className="hero__content">
          <span className="hero__eyebrow">ays interiors</span>
          <h1 className="hero__title">Mekânlar,<br />Hikâye Anlatır</h1>
          <hr className="hero__rule" />
          <p className="hero__subtitle">İç mimarlık ve danışmanlık hizmetleri — Ankara</p>
          <div className="hero__buttons">
            <Link href="/portfolio" className="btn btn-ghost">
              <Grid size={15} /> Portfolyoyu Keşfet
            </Link>
            <Link href="/danismanlik" className="btn btn-solid">
              <MessageCircle size={15} /> Danışmanlık Al
            </Link>
          </div>
        </div>
        <span className="hero__vertical-text" aria-hidden="true">
          Interior Design &amp; Consultancy — Ankara
        </span>
      </section>

      {/* Featured Projects */}
      <section className="section" aria-label="Öne çıkan projeler">
        <div className="container">
          <header className="section-header reveal">
            <span className="section-header__eyebrow">Seçkin Çalışmalar</span>
            <h2 className="section-header__title">Öne Çıkan Projeler</h2>
          </header>
          <div className="portfolio-grid portfolio-grid--asymmetric">
            {(featuredProjects ?? []).map(project => {
              const cover = project.images?.find((i: any) => i.is_cover) ?? project.images?.[0]
              return (
                <Link key={project.id} href={`/portfolio#${project.id}`} className="portfolio-card reveal">
                  <div className="portfolio-card__img-wrap">
                    {cover?.url && (
                      <Image
                        src={cover.url}
                        alt={project.title}
                        fill
                        sizes="(max-width:768px) 100vw, 50vw"
                        className="portfolio-card__img"
                      />
                    )}
                    <div className="portfolio-card__overlay">
                      <span className="portfolio-card__cat">{project.category?.name}</span>
                      <span className="portfolio-card__title">{project.title}</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
          <div className="reveal delay-3">
            <Link href="/portfolio" className="portfolio-all-link">Tüm Projeleri Gör</Link>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section" aria-label="Hizmetler">
        <div className="container">
          <header className="section-header section-header--center reveal">
            <span className="section-header__eyebrow">Ne Yapıyoruz</span>
            <h2 className="section-header__title">Hizmetlerimiz</h2>
          </header>
          <div className="services-grid">
            {[
              { icon: <Palette className="service-item__icon" />, title: 'Konsept Tasarım', desc: 'Yaşam alışkanlıklarınızı dinleyerek size özel bir tasarım dili oluşturuyoruz.' },
              { icon: <Layers className="service-item__icon" />, title: 'Uygulama Takibi', desc: 'Müteahhit, tedarikçi ve usta koordinasyonunu üstleniyoruz.' },
              { icon: <Video className="service-item__icon" />, title: 'Online Danışmanlık', desc: 'Video görüşme ve 3D görseller aracılığıyla nereden olursanız olun hizmetinizdeyiz.' },
            ].map(s => (
              <article key={s.title} className="service-item reveal">
                {s.icon}
                <h3 className="service-item__title">{s.title}</h3>
                <p className="service-item__desc">{s.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-band" aria-label="İstatistikler">
        <div className="container">
          <div className="stats-grid">
            {[
              { count: 127, suffix: '', label: 'Tamamlanan Proje' },
              { count: 8, suffix: '', label: 'Yıl Deneyim' },
              { count: 4, suffix: '', label: 'Şehir' },
              { count: 100, suffix: '%', label: 'Müşteri Memnuniyeti' },
            ].map(stat => (
              <div key={stat.label} className="stat-item reveal">
                <span className="stat-item__number">
                  <StatsCounter target={stat.count} suffix={stat.suffix} />
                </span>
                <span className="stat-item__label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages Teaser */}
      <section className="section" style={{ background: 'var(--dark)' }} aria-label="Danışmanlık paketleri">
        <div className="container">
          <header className="section-header section-header--center reveal" style={{ color: 'var(--white)' }}>
            <span className="section-header__eyebrow">Hizmet Paketleri</span>
            <h2 className="section-header__title" style={{ color: 'var(--white)' }}>İhtiyacınıza Özel Paket</h2>
          </header>
          <div className="packages-grid">
            {(packages ?? []).map(pkg => (
              <div key={pkg.id} className={`package-card${pkg.featured ? ' package-card--featured' : ''} reveal`}>
                {pkg.featured && <span className="package-badge">En Popüler</span>}
                <h3 className="package-card__title">{pkg.title}</h3>
                <p className="package-card__slogan">{pkg.slogan}</p>
                {pkg.price && <p className="package-card__price">{pkg.price}</p>}
                <ul className="package-card__features">
                  {pkg.features.map((f: string) => <li key={f}>{f}</li>)}
                </ul>
                <Link href={`/iletisim?paket=${pkg.id}`} className="btn btn-ghost package-card__cta">
                  {pkg.cta_text}
                </Link>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '56px' }} className="reveal delay-4">
            <Link href="/danismanlik" className="btn btn-ghost">
              Tüm Paketleri İncele <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
```

- [ ] **Step 3: Verify page renders**

```bash
npm run dev
```

Open http://localhost:3000. Expected: hero section visible, no TypeScript errors in terminal.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx components/StatsCounter.tsx
git commit -m "feat: ana sayfa (homepage) Server Component"
git push origin master
```

---

## Task 8: Portfolio sayfası

**Files:**
- Create: `app/portfolio/page.tsx`
- Create: `components/Lightbox.tsx`
- Create: `components/PortfolioGrid.tsx`

- [ ] **Step 1: Create `components/Lightbox.tsx`**

```tsx
'use client'
import { useEffect } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { ProjectWithImages } from '@/lib/types'

interface Props {
  project: ProjectWithImages
  imageIndex: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}

export default function Lightbox({ project, imageIndex, onClose, onPrev, onNext }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, onPrev, onNext])

  const img = project.images[imageIndex]

  return (
    <div className="lightbox" onClick={onClose} role="dialog" aria-modal="true">
      <div className="lightbox__inner" onClick={e => e.stopPropagation()}>
        <button className="lightbox__close" onClick={onClose} aria-label="Kapat"><X size={20} /></button>
        <div className="lightbox__img-wrap">
          {img?.url && (
            <Image src={img.url} alt={project.title} fill sizes="90vw" style={{ objectFit: 'contain' }} />
          )}
          {project.images.length > 1 && (
            <>
              <button className="lightbox__prev" onClick={onPrev} aria-label="Önceki"><ChevronLeft size={28} /></button>
              <button className="lightbox__next" onClick={onNext} aria-label="Sonraki"><ChevronRight size={28} /></button>
            </>
          )}
        </div>
        <div className="lightbox__meta">
          <h3 className="lightbox__title">{project.title}</h3>
          {project.category && <span className="lightbox__cat">{project.category.name}</span>}
          <p className="lightbox__info">{project.location} · {project.year}{project.area_sqm ? ` · ${project.area_sqm} m²` : ''}</p>
          {project.description && <p className="lightbox__desc">{project.description}</p>}
          {project.materials.length > 0 && (
            <ul className="lightbox__materials">
              {project.materials.map(m => <li key={m}>{m}</li>)}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `components/PortfolioGrid.tsx`**

```tsx
'use client'
import { useState } from 'react'
import Image from 'next/image'
import Lightbox from './Lightbox'
import type { Category, ProjectWithImages } from '@/lib/types'

interface Props {
  projects: ProjectWithImages[]
  categories: Category[]
}

export default function PortfolioGrid({ projects, categories }: Props) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null)
  const [lightboxProject, setLightboxProject] = useState<ProjectWithImages | null>(null)
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0)

  const filtered = activeSlug
    ? projects.filter(p => p.category?.slug === activeSlug)
    : projects

  function openLightbox(project: ProjectWithImages, idx = 0) {
    setLightboxProject(project)
    setLightboxImageIndex(idx)
  }

  return (
    <>
      <div className="portfolio-filters" role="tablist" aria-label="Kategori filtresi">
        <button
          className={`portfolio-filter${!activeSlug ? ' active' : ''}`}
          onClick={() => setActiveSlug(null)}
          role="tab"
        >
          Tümü
        </button>
        {categories.map(c => (
          <button
            key={c.id}
            className={`portfolio-filter${activeSlug === c.slug ? ' active' : ''}`}
            onClick={() => setActiveSlug(c.slug)}
            role="tab"
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="portfolio-grid portfolio-grid--3col">
        {filtered.map(project => {
          const cover = project.images.find(i => i.is_cover) ?? project.images[0]
          return (
            <article
              key={project.id}
              id={project.id}
              className="portfolio-card"
              onClick={() => openLightbox(project)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && openLightbox(project)}
            >
              <div className="portfolio-card__img-wrap">
                {cover?.url ? (
                  <Image
                    src={cover.url}
                    alt={project.title}
                    fill
                    sizes="(max-width:768px) 100vw, (max-width:1024px) 50vw, 33vw"
                    className="portfolio-card__img"
                  />
                ) : (
                  <div className="portfolio-card__placeholder" />
                )}
                <div className="portfolio-card__overlay">
                  {project.category && <span className="portfolio-card__cat">{project.category.name}</span>}
                  <span className="portfolio-card__title">{project.title}</span>
                  <span className="portfolio-card__city">{project.location} · {project.year}</span>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {lightboxProject && (
        <Lightbox
          project={lightboxProject}
          imageIndex={lightboxImageIndex}
          onClose={() => setLightboxProject(null)}
          onPrev={() => setLightboxImageIndex(i => Math.max(0, i - 1))}
          onNext={() => setLightboxImageIndex(i => Math.min(lightboxProject.images.length - 1, i + 1))}
        />
      )}
    </>
  )
}
```

- [ ] **Step 3: Create `app/portfolio/page.tsx`**

```tsx
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
  const supabase = createClient()

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
```

- [ ] **Step 4: Commit**

```bash
git add app/portfolio/ components/Lightbox.tsx components/PortfolioGrid.tsx
git commit -m "feat: portfolio page with category filter and lightbox"
git push origin master
```

---

## Task 9: Danışmanlık, Hakkımda, İletişim sayfaları

**Files:**
- Create: `app/danismanlik/page.tsx`
- Create: `app/hakkimda/page.tsx`
- Create: `app/iletisim/page.tsx`
- Create: `components/ContactForm.tsx`

- [ ] **Step 1: Create `app/danismanlik/page.tsx`**

```tsx
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Danışmanlık — Ays Interiors',
  description: 'Ays Interiors danışmanlık paketleri. Konsept tasarımdan uygulama takibine kadar size özel hizmet.',
}

export default async function DanismanlikPage() {
  const supabase = createClient()
  const { data: packages } = await supabase.from('packages').select('*').order('sort_order')

  return (
    <>
      <Navbar />
      <section className="page-hero">
        <div className="page-hero-content">
          <h1>Danışmanlık</h1>
          <p>Size özel tasarım danışmanlığı</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="packages-grid">
            {(packages ?? []).map(pkg => (
              <div key={pkg.id} className={`package-card${pkg.featured ? ' package-card--featured' : ''}`}>
                {pkg.featured && <span className="package-badge">En Popüler</span>}
                <h3 className="package-card__title">{pkg.title}</h3>
                <p className="package-card__slogan">{pkg.slogan}</p>
                {pkg.price && <p className="package-card__price">{pkg.price}</p>}
                <ul className="package-card__features">
                  {pkg.features.map((f: string) => <li key={f}>{f}</li>)}
                </ul>
                <Link href={`/iletisim?paket=${pkg.id}`} className="btn btn-ghost package-card__cta">
                  {pkg.cta_text}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}
```

- [ ] **Step 2: Create `app/hakkimda/page.tsx`**

```tsx
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hakkımda — Ays Interiors',
}

export default async function HakkimdaPage() {
  const supabase = createClient()
  const { data: profile } = await supabase.from('profile').select('*').eq('id', 1).single()

  return (
    <>
      <Navbar />
      <section className="page-hero">
        <div className="page-hero-content">
          <h1>Hakkımda</h1>
          <p>Tasarımcı ile tanışın</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="about-grid">
            <div className="about-img-wrap">
              {profile?.avatar_url ? (
                <Image src={profile.avatar_url} alt={profile.full_name} fill sizes="40vw" style={{ objectFit: 'cover' }} />
              ) : (
                <div className="about-img-placeholder" />
              )}
            </div>
            <div className="about-content">
              <span className="section-header__eyebrow">Tasarımcı Hakkında</span>
              <h2>{profile?.full_name ?? 'Ays Interiors'}</h2>
              <p className="about-title">{profile?.title}</p>
              <p className="about-bio">{profile?.long_bio || profile?.short_bio}</p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '32px' }}>
                <Link href="/iletisim" className="btn btn-solid">İletişime Geç</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}
```

- [ ] **Step 3: Create `components/ContactForm.tsx`**

```tsx
'use client'
import { useState, FormEvent } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ContactForm({ defaultService }: { defaultService?: string }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const supabase = createClient()

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')
    const fd = new FormData(e.currentTarget)

    const { error } = await supabase.from('messages').insert({
      name: fd.get('name') as string,
      email: fd.get('email') as string,
      phone: (fd.get('phone') as string) || null,
      service: (fd.get('service') as string) || null,
      message: fd.get('message') as string,
    })

    setStatus(error ? 'error' : 'success')
  }

  if (status === 'success') {
    return (
      <div className="form-success">
        <h3>Mesajınız İletildi</h3>
        <p>En kısa sürede size dönüş yapacağız.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label htmlFor="name">Ad Soyad *</label>
        <input type="text" id="name" name="name" required placeholder="Adınız Soyadınız" />
      </div>
      <div className="grid-2">
        <div className="form-group">
          <label htmlFor="email">E-posta *</label>
          <input type="email" id="email" name="email" required placeholder="ornek@mail.com" />
        </div>
        <div className="form-group">
          <label htmlFor="phone">Telefon</label>
          <input type="tel" id="phone" name="phone" placeholder="+90 5xx xxx xx xx" />
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="service">İlgilenilen Hizmet</label>
        <select id="service" name="service" defaultValue={defaultService ?? ''}>
          <option value="">Seçiniz</option>
          <option value="Konsept Tasarım">Konsept Tasarım</option>
          <option value="Uygulama Takibi">Uygulama Takibi</option>
          <option value="Online Danışmanlık">Online Danışmanlık</option>
          <option value="Diğer">Diğer</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="message">Mesajınız *</label>
        <textarea id="message" name="message" rows={5} required placeholder="Projeniz hakkında bilgi verin..." />
      </div>
      {status === 'error' && <p style={{ color: '#c0392b', marginBottom: '1rem' }}>Bir hata oluştu, lütfen tekrar deneyin.</p>}
      <button type="submit" className="btn btn-ghost dark" disabled={status === 'sending'} style={{ width: '100%' }}>
        {status === 'sending' ? 'Gönderiliyor…' : 'Mesaj Gönder'}
      </button>
    </form>
  )
}
```

- [ ] **Step 4: Create `app/iletisim/page.tsx`**

```tsx
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ContactForm from '@/components/ContactForm'
import { MapPin, Mail, Phone } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'İletişim — Ays Interiors',
}

export default async function IletisimPage({ searchParams }: { searchParams: { paket?: string } }) {
  const supabase = createClient()
  const { data: profile } = await supabase.from('profile').select('email,phone').eq('id', 1).single()
  const { data: settings } = await supabase.from('site_settings').select('key,value')
  const s: Record<string, string> = Object.fromEntries((settings ?? []).map(r => [r.key, r.value]))

  return (
    <>
      <Navbar />
      <section className="page-hero">
        <div className="page-hero-content"><h1>İletişim</h1><p>Projenizi konuşalım</p></div>
      </section>
      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'start' }}>
            <div>
              <div className="section-header reveal">
                <span className="section-label">Mesaj Gönderin</span>
                <h2>Benimle İletişime Geçin</h2>
              </div>
              <ContactForm defaultService={searchParams.paket} />
            </div>
            <div className="contact-info">
              {profile?.email && (
                <div className="contact-info__item">
                  <Mail size={18} />
                  <a href={`mailto:${profile.email}`}>{profile.email}</a>
                </div>
              )}
              {profile?.phone && (
                <div className="contact-info__item">
                  <Phone size={18} />
                  <span>{profile.phone}</span>
                </div>
              )}
              <div className="contact-info__item">
                <MapPin size={18} />
                <span>Çankaya, Ankara, Türkiye</span>
              </div>
              {s.maps_embed_url && (
                <div className="contact-map" style={{ marginTop: '32px' }}>
                  <iframe src={s.maps_embed_url} width="100%" height="300" style={{ border: 0 }} loading="lazy" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add app/danismanlik/ app/hakkimda/ app/iletisim/ components/ContactForm.tsx
git commit -m "feat: danışmanlık, hakkımda, iletişim sayfaları"
git push origin master
```

---

## Task 10: Admin Login

**Files:**
- Create: `app/admin/login/page.tsx`

- [ ] **Step 1: Create `app/admin/login/page.tsx`**

```tsx
'use client'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminLoginPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const fd = new FormData(e.currentTarget)

    const { error } = await supabase.auth.signInWithPassword({
      email: fd.get('email') as string,
      password: fd.get('password') as string,
    })

    if (error) {
      setError('E-posta veya şifre hatalı.')
      setLoading(false)
      return
    }

    router.push('/admin/portfolio')
    router.refresh()
  }

  return (
    <div className="admin-login">
      <div className="admin-login__box">
        <div className="admin-login__logo">ays interiors</div>
        <p className="admin-login__subtitle">Yönetici Girişi</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">E-posta</label>
            <input className="form-input" type="email" id="email" name="email" required autoComplete="email" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Şifre</label>
            <input className="form-input" type="password" id="password" name="password" required autoComplete="current-password" />
          </div>
          {error && <p className="admin-login__error">{error}</p>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Giriş yapılıyor…' : 'Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add admin login CSS to `app/globals.css`**

Append to end of `app/globals.css`:

```css
/* ── Admin Login ── */
.admin-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
}
.admin-login__box {
  width: 100%;
  max-width: 380px;
  padding: 48px 40px;
  background: var(--white);
  border: 1px solid var(--border);
}
.admin-login__logo {
  font-family: var(--font-heading);
  font-style: italic;
  font-size: 1.8rem;
  text-align: center;
  margin-bottom: 8px;
  color: var(--dark);
}
.admin-login__subtitle {
  text-align: center;
  font-size: 0.75rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--taupe);
  margin-bottom: 32px;
}
.admin-login__error {
  color: #c0392b;
  font-size: 0.8rem;
  margin-bottom: 12px;
}
```

- [ ] **Step 3: Commit**

```bash
git add app/admin/login/
git commit -m "feat: admin login page with Supabase Auth"
git push origin master
```

---

## Task 11: Admin Layout & Shell

**Files:**
- Create: `app/admin/layout.tsx`

- [ ] **Step 1: Create `app/admin/layout.tsx`**

```tsx
'use client'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Folder, Package, User, MessageSquare, Settings, LogOut, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

const navItems = [
  { href: '/admin/portfolio', icon: <Folder size={15} />, label: 'Portfolyo' },
  { href: '/admin/paketler', icon: <Package size={15} />, label: 'Danışmanlık Paketleri' },
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
```

- [ ] **Step 2: Add admin layout CSS to `app/globals.css`**

Append to end of `app/globals.css`:

```css
/* ── Admin Layout ── */
.admin-layout { display: flex; height: 100vh; overflow: hidden; }
.sidebar { width: 240px; flex-shrink: 0; background: var(--dark); display: flex; flex-direction: column; overflow-y: auto; }
.sidebar-brand { padding: 20px; border-bottom: 1px solid rgba(255,255,255,.08); }
.sidebar-brand-name { font-family: var(--font-heading); font-style: italic; font-size: 18px; color: #fff; }
.sidebar-brand-sub { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,.3); margin-top: 2px; }
.sidebar-nav { flex: 1; padding: 8px 0; }
.nav-item { display: flex; align-items: center; gap: 10px; padding: 11px 20px; font-size: 13px; color: rgba(255,255,255,.5); cursor: pointer; border-left: 2px solid transparent; transition: all .2s; text-decoration: none; }
.nav-item:hover { background: rgba(255,255,255,.04); color: #fff; }
.nav-item.active { background: rgba(200,169,122,.12); color: var(--gold); border-left-color: var(--gold); }
.nav-badge { background: var(--gold); color: #fff; font-size: 10px; padding: 1px 6px; border-radius: 10px; margin-left: auto; }
.sidebar-footer { padding: 16px 20px; border-top: 1px solid rgba(255,255,255,.08); }
.logout-btn { width: 100%; padding: 8px; background: transparent; border: 1px solid rgba(255,255,255,.12); color: rgba(255,255,255,.4); font-family: var(--font-body); font-size: 11px; letter-spacing: 1px; text-transform: uppercase; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all .2s; }
.logout-btn:hover { border-color: rgba(255,255,255,.3); color: #fff; }
.admin-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.topbar { height: 56px; background: #fff; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: flex-end; padding: 0 24px; flex-shrink: 0; }
.topbar-btn { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border: 1px solid var(--border); background: transparent; font-family: var(--font-body); font-size: 12px; color: var(--taupe); cursor: pointer; transition: all .2s; text-decoration: none; }
.topbar-btn:hover { border-color: var(--dark); color: var(--dark); }
.admin-content { flex: 1; overflow-y: auto; padding: 28px; background: #F0EDE8; }
```

- [ ] **Step 3: Commit**

```bash
git add app/admin/layout.tsx
git commit -m "feat: admin layout with sidebar navigation"
git push origin master
```

---

## Task 12: Admin Portfolio Management

**Files:**
- Create: `app/admin/portfolio/page.tsx`
- Create: `components/admin/ImageUploader.tsx`
- Create: `components/admin/ProjectModal.tsx`

- [ ] **Step 1: Create `components/admin/ImageUploader.tsx`**

```tsx
'use client'
import { useRef, useState } from 'react'
import Image from 'next/image'
import { Upload, X, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { ProjectImage } from '@/lib/types'

interface Props {
  projectId: string
  existing: ProjectImage[]
  onChange: (images: ProjectImage[]) => void
}

export default function ImageUploader({ projectId, existing, onChange }: Props) {
  const [images, setImages] = useState<ProjectImage[]>(existing)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  async function handleFiles(files: FileList) {
    setUploading(true)
    const newImages: ProjectImage[] = []

    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()
      const path = `${projectId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(path, file, { upsert: false })

      if (uploadError) continue

      const { data: { publicUrl } } = supabase.storage
        .from('project-images')
        .getPublicUrl(path)

      const { data: img } = await supabase
        .from('project_images')
        .insert({
          project_id: projectId,
          storage_path: path,
          url: publicUrl,
          sort_order: images.length + newImages.length,
          is_cover: images.length === 0 && newImages.length === 0,
        })
        .select()
        .single()

      if (img) newImages.push(img as ProjectImage)
    }

    const updated = [...images, ...newImages]
    setImages(updated)
    onChange(updated)
    setUploading(false)
  }

  async function remove(img: ProjectImage) {
    await supabase.storage.from('project-images').remove([img.storage_path])
    await supabase.from('project_images').delete().eq('id', img.id)
    const updated = images.filter(i => i.id !== img.id)
    setImages(updated)
    onChange(updated)
  }

  async function setCover(img: ProjectImage) {
    await supabase.from('project_images').update({ is_cover: false }).eq('project_id', projectId)
    await supabase.from('project_images').update({ is_cover: true }).eq('id', img.id)
    const updated = images.map(i => ({ ...i, is_cover: i.id === img.id }))
    setImages(updated)
    onChange(updated)
  }

  return (
    <div>
      <div
        className="img-upload-zone"
        onClick={() => inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={e => e.target.files && handleFiles(e.target.files)}
        />
        <Upload size={24} className="img-upload-icon" />
        <div className="img-upload-text">
          <strong>Görsel yükle</strong>
          <span>Tıkla veya sürükle — herhangi format, kalite korunur</span>
        </div>
        {uploading && <p style={{ marginTop: 8, fontSize: 12, color: 'var(--taupe)' }}>Yükleniyor…</p>}
      </div>

      {images.length > 0 && (
        <div className="img-grid">
          {images.map(img => (
            <div key={img.id} className={`img-tile${img.is_cover ? ' is-cover' : ''}`}>
              <Image src={img.url} alt="" fill sizes="96px" style={{ objectFit: 'cover' }} />
              {img.is_cover && <span className="cover-label">Kapak</span>}
              <button className="rm-btn" onClick={() => remove(img)} aria-label="Kaldır"><X size={12} /></button>
              {!img.is_cover && (
                <button className="cover-btn" onClick={() => setCover(img)} aria-label="Kapak yap"><Star size={12} /></button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create `components/admin/ProjectModal.tsx`**

```tsx
'use client'
import { useState } from 'react'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import ImageUploader from './ImageUploader'
import type { Project, Category, ProjectImage } from '@/lib/types'

interface Props {
  project: (Project & { images: ProjectImage[] }) | null
  categories: Category[]
  onClose: () => void
  onSaved: () => void
}

export default function ProjectModal({ project, categories, onClose, onSaved }: Props) {
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [images, setImages] = useState<ProjectImage[]>(project?.images ?? [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const fd = new FormData(e.currentTarget)

    const cover = images.find(i => i.is_cover) ?? images[0]
    const payload = {
      title: fd.get('title') as string,
      category_id: (fd.get('category_id') as string) || null,
      location: fd.get('location') as string,
      year: parseInt(fd.get('year') as string),
      area_sqm: fd.get('area_sqm') ? parseInt(fd.get('area_sqm') as string) : null,
      description: fd.get('description') as string,
      materials: (fd.get('materials') as string).split(',').map(s => s.trim()).filter(Boolean),
      featured: (fd.get('featured') as string) === 'on',
      cover_image_url: cover?.url ?? null,
    }

    if (project) {
      await supabase.from('projects').update(payload).eq('id', project.id)
    } else {
      await supabase.from('projects').insert(payload)
    }

    setSaving(false)
    onSaved()
    onClose()
  }

  const tempId = project?.id ?? `temp-${Date.now()}`

  return (
    <div className="modal-overlay open">
      <div className="modal-box">
        <div className="modal-head">
          <span className="modal-head-title">{project ? 'Projeyi Düzenle' : 'Yeni Proje'}</span>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Proje Adı *</label>
                <input className="form-input" name="title" required defaultValue={project?.title} />
              </div>
              <div className="form-group">
                <label className="form-label">Kategori</label>
                <select className="form-select" name="category_id" defaultValue={project?.category_id ?? ''}>
                  <option value="">Seçiniz</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Konum</label>
                <input className="form-input" name="location" defaultValue={project?.location} />
              </div>
              <div className="form-group">
                <label className="form-label">Yıl</label>
                <input className="form-input" type="number" name="year" defaultValue={project?.year ?? new Date().getFullYear()} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Alan (m²)</label>
              <input className="form-input" type="number" name="area_sqm" defaultValue={project?.area_sqm ?? ''} />
            </div>
            <div className="form-group">
              <label className="form-label">Açıklama</label>
              <textarea className="form-textarea" name="description" rows={3} defaultValue={project?.description} />
            </div>
            <div className="form-group">
              <label className="form-label">Malzemeler (virgülle ayır)</label>
              <input className="form-input" name="materials" defaultValue={project?.materials?.join(', ')} />
            </div>
            <div className="check-row">
              <input type="checkbox" id="featured" name="featured" defaultChecked={project?.featured} />
              <label htmlFor="featured">Anasayfada öne çıkar</label>
            </div>
            <div className="form-group" style={{ marginTop: 16 }}>
              <label className="form-label">Görseller</label>
              <ImageUploader
                projectId={project?.id ?? tempId}
                existing={images}
                onChange={setImages}
              />
            </div>
          </div>
          <div className="modal-foot">
            <button type="button" className="btn btn-outline" onClick={onClose}>İptal</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Kaydediliyor…' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create `app/admin/portfolio/page.tsx`**

```tsx
'use client'
import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import ProjectModal from '@/components/admin/ProjectModal'
import type { Category, Project, ProjectImage } from '@/lib/types'

type ProjectWithImages = Project & { images: ProjectImage[]; category: Category | null }

export default function AdminPortfolioPage() {
  const supabase = createClient()
  const [projects, setProjects] = useState<ProjectWithImages[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [modalProject, setModalProject] = useState<ProjectWithImages | null | undefined>(undefined)
  const [newCatName, setNewCatName] = useState('')
  const [newCatSlug, setNewCatSlug] = useState('')

  const load = useCallback(async () => {
    const [{ data: p }, { data: c }] = await Promise.all([
      supabase
        .from('projects')
        .select('*, category:categories(id,name,slug), images:project_images(id,url,storage_path,is_cover,sort_order)')
        .order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('sort_order'),
    ])
    setProjects((p ?? []) as any)
    setCategories(c ?? [])
  }, [])

  useEffect(() => { load() }, [load])

  async function addCategory() {
    if (!newCatName.trim()) return
    await supabase.from('categories').insert({ name: newCatName.trim(), slug: newCatSlug.trim() || newCatName.trim().toLowerCase().replace(/\s+/g, '-') })
    setNewCatName(''); setNewCatSlug('')
    load()
  }

  async function deleteCategory(id: string) {
    if (!confirm('Bu kategoriyi silmek istiyor musunuz?')) return
    await supabase.from('categories').delete().eq('id', id)
    load()
  }

  async function deleteProject(id: string) {
    if (!confirm('Bu projeyi silmek istiyor musunuz?')) return
    await supabase.from('projects').delete().eq('id', id)
    load()
  }

  return (
    <div>
      <div className="section-title">Portfolyo Yönetimi</div>

      {/* Categories */}
      <div className="card">
        <div className="card-header"><span className="card-title">Kategoriler</span></div>
        <div style={{ marginBottom: 12 }}>
          {categories.map(c => (
            <span key={c.id} className="cat-tag">
              {c.name}
              <button onClick={() => deleteCategory(c.id)}>×</button>
            </span>
          ))}
        </div>
        <div className="gap-row">
          <input className="form-input" value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Kategori adı" style={{ maxWidth: 180 }} />
          <input className="form-input" value={newCatSlug} onChange={e => setNewCatSlug(e.target.value)} placeholder="slug" style={{ maxWidth: 140 }} />
          <button className="btn btn-primary" onClick={addCategory}><Plus size={13} /> Ekle</button>
        </div>
      </div>

      {/* Projects */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Projeler</span>
          <button className="btn btn-primary" onClick={() => setModalProject(null)}>
            <Plus size={13} /> Yeni Proje
          </button>
        </div>
        {projects.map(p => {
          const cover = p.images.find(i => i.is_cover) ?? p.images[0]
          return (
            <div key={p.id} className="proj-item">
              {cover?.url ? (
                <div style={{ width: 72, height: 54, position: 'relative', flexShrink: 0 }}>
                  <Image src={cover.url} alt={p.title} fill sizes="72px" style={{ objectFit: 'cover' }} />
                </div>
              ) : (
                <div className="proj-thumb" />
              )}
              <div className="proj-info">
                <div className="proj-name">{p.title}</div>
                <div className="proj-meta">{p.category?.name} · {p.location} · {p.year}</div>
              </div>
              <div className="proj-actions">
                <button className="btn btn-outline btn-sm" onClick={() => setModalProject(p)}><Pencil size={11} /></button>
                <button className="btn btn-danger btn-sm" onClick={() => deleteProject(p.id)}><Trash2 size={11} /></button>
              </div>
            </div>
          )
        })}
      </div>

      {modalProject !== undefined && (
        <ProjectModal
          project={modalProject}
          categories={categories}
          onClose={() => setModalProject(undefined)}
          onSaved={load}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add app/admin/portfolio/ components/admin/
git commit -m "feat: admin portfolio management with Supabase Storage image upload"
git push origin master
```

---

## Task 13: Admin Paketler, Mesajlar, Ayarlar

**Files:**
- Create: `app/admin/paketler/page.tsx`
- Create: `app/admin/mesajlar/page.tsx`
- Create: `app/admin/ayarlar/page.tsx`

- [ ] **Step 1: Create `app/admin/paketler/page.tsx`**

```tsx
'use client'
import { useCallback, useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Package } from '@/lib/types'

export default function AdminPaketlerPage() {
  const supabase = createClient()
  const [packages, setPackages] = useState<Package[]>([])
  const [editing, setEditing] = useState<Package | null>(null)
  const [form, setForm] = useState({ title: '', slogan: '', price: '', features: '', featured: false, cta_text: 'Bilgi Al', theme: 'standard' })

  const load = useCallback(async () => {
    const { data } = await supabase.from('packages').select('*').order('sort_order')
    setPackages(data ?? [])
  }, [])

  useEffect(() => { load() }, [load])

  function openNew() {
    setEditing(null)
    setForm({ title: '', slogan: '', price: '', features: '', featured: false, cta_text: 'Bilgi Al', theme: 'standard' })
  }

  function openEdit(pkg: Package) {
    setEditing(pkg)
    setForm({ title: pkg.title, slogan: pkg.slogan, price: pkg.price ?? '', features: pkg.features.join('\n'), featured: pkg.featured, cta_text: pkg.cta_text, theme: pkg.theme })
  }

  async function save() {
    const payload = { ...form, price: form.price || null, features: form.features.split('\n').map(s => s.trim()).filter(Boolean), sort_order: editing?.sort_order ?? packages.length }
    if (editing) await supabase.from('packages').update(payload).eq('id', editing.id)
    else await supabase.from('packages').insert(payload)
    setEditing(undefined as any)
    load()
  }

  async function del(id: string) {
    if (!confirm('Paketi silmek istiyor musunuz?')) return
    await supabase.from('packages').delete().eq('id', id)
    load()
  }

  const showForm = editing !== undefined

  return (
    <div>
      <div className="section-title">Danışmanlık Paketleri</div>
      <div className="card">
        <div className="card-header">
          <span className="card-title">Paketler</span>
          <button className="btn btn-primary" onClick={openNew}><Plus size={13} /> Yeni Paket</button>
        </div>
        {packages.map(pkg => (
          <div key={pkg.id} className="proj-item">
            <div className="proj-info">
              <div className="proj-name">{pkg.title} {pkg.featured && <span className="nav-badge">Öne Çıkan</span>}</div>
              <div className="proj-meta">{pkg.price ?? 'Fiyatsız'} · {pkg.features.length} özellik</div>
            </div>
            <div className="proj-actions">
              <button className="btn btn-outline btn-sm" onClick={() => openEdit(pkg)}><Pencil size={11} /></button>
              <button className="btn btn-danger btn-sm" onClick={() => del(pkg.id)}><Trash2 size={11} /></button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="modal-overlay open">
          <div className="modal-box modal-box--sm">
            <div className="modal-head">
              <span className="modal-head-title">{editing ? 'Paketi Düzenle' : 'Yeni Paket'}</span>
              <button className="modal-close" onClick={() => setEditing(undefined as any)}>×</button>
            </div>
            <div className="modal-body">
              {[['title','Başlık *'],['slogan','Slogan'],['price','Fiyat'],['cta_text','CTA Butonu']].map(([k, l]) => (
                <div key={k} className="form-group">
                  <label className="form-label">{l}</label>
                  <input className="form-input" value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Özellikler (her satır bir özellik)</label>
                <textarea className="form-textarea" rows={5} value={form.features} onChange={e => setForm(f => ({ ...f, features: e.target.value }))} />
              </div>
              <div className="check-row">
                <input type="checkbox" id="pkg-featured" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} />
                <label htmlFor="pkg-featured">Öne çıkan paket</label>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-outline" onClick={() => setEditing(undefined as any)}>İptal</button>
              <button className="btn btn-primary" onClick={save}>Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create `app/admin/mesajlar/page.tsx`**

```tsx
'use client'
import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Trash2 } from 'lucide-react'
import type { Message } from '@/lib/types'

export default function AdminMesajlarPage() {
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>([])
  const [selected, setSelected] = useState<Message | null>(null)

  const load = useCallback(async () => {
    const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: false })
    setMessages(data ?? [])
  }, [])

  useEffect(() => { load() }, [load])

  async function open(msg: Message) {
    setSelected(msg)
    if (!msg.is_read) {
      await supabase.from('messages').update({ is_read: true }).eq('id', msg.id)
      setMessages(m => m.map(x => x.id === msg.id ? { ...x, is_read: true } : x))
    }
  }

  async function del(id: string) {
    if (!confirm('Mesajı silmek istiyor musunuz?')) return
    await supabase.from('messages').delete().eq('id', id)
    setMessages(m => m.filter(x => x.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  return (
    <div>
      <div className="section-title">Mesajlar</div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {messages.length === 0 && <p style={{ padding: 20, color: 'var(--taupe)' }}>Henüz mesaj yok.</p>}
        {messages.map(msg => (
          <div key={msg.id} className={`msg-row${!msg.is_read ? ' unread' : ''}`} onClick={() => open(msg)}>
            <div className="msg-row-top">
              <span className="msg-name">{msg.name}</span>
              <span className="msg-date">{new Date(msg.created_at).toLocaleDateString('tr-TR')}</span>
            </div>
            <div className="msg-preview">{msg.email} {msg.service ? `· ${msg.service}` : ''}</div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="modal-overlay open">
          <div className="modal-box">
            <div className="modal-head">
              <span className="modal-head-title">{selected.name}</span>
              <button className="modal-close" onClick={() => setSelected(null)}>×</button>
            </div>
            <div className="modal-body">
              <p><strong>E-posta:</strong> <a href={`mailto:${selected.email}`}>{selected.email}</a></p>
              {selected.phone && <p><strong>Telefon:</strong> {selected.phone}</p>}
              {selected.service && <p><strong>Hizmet:</strong> {selected.service}</p>}
              <p style={{ marginTop: 16 }}>{selected.message}</p>
              <p style={{ marginTop: 16, fontSize: 11, color: 'var(--taupe)' }}>{new Date(selected.created_at).toLocaleString('tr-TR')}</p>
            </div>
            <div className="modal-foot">
              <button className="btn btn-danger" onClick={() => del(selected.id)}><Trash2 size={13} /> Sil</button>
              <button className="btn btn-outline" onClick={() => setSelected(null)}>Kapat</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Create `app/admin/ayarlar/page.tsx`**

```tsx
'use client'
import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'

export default function AdminAyarlarPage() {
  const supabase = createClient()
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [profile, setProfile] = useState<Profile | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saved, setSaved] = useState(false)

  const load = useCallback(async () => {
    const [{ data: s }, { data: p }] = await Promise.all([
      supabase.from('site_settings').select('key,value'),
      supabase.from('profile').select('*').eq('id', 1).single(),
    ])
    setSettings(Object.fromEntries((s ?? []).map(r => [r.key, r.value])))
    setProfile(p)
  }, [])

  useEffect(() => { load() }, [load])

  async function saveSettings() {
    for (const [key, value] of Object.entries(settings)) {
      await supabase.from('site_settings').upsert({ key, value })
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function saveProfile() {
    if (!profile) return
    await supabase.from('profile').update(profile).eq('id', 1)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function uploadHero(file: File) {
    setUploading(true)
    const path = `hero-${Date.now()}.${file.name.split('.').pop()}`
    await supabase.storage.from('site-assets').upload(path, file, { upsert: true })
    const { data: { publicUrl } } = supabase.storage.from('site-assets').getPublicUrl(path)
    setSettings(s => ({ ...s, hero_image_url: publicUrl }))
    await supabase.from('site_settings').upsert({ key: 'hero_image_url', value: publicUrl })
    setUploading(false)
  }

  async function uploadAvatar(file: File) {
    setUploading(true)
    const path = `avatar-${Date.now()}.${file.name.split('.').pop()}`
    await supabase.storage.from('profile-images').upload(path, file, { upsert: true })
    const { data: { publicUrl } } = supabase.storage.from('profile-images').getPublicUrl(path)
    setProfile(p => p ? { ...p, avatar_url: publicUrl } : p)
    await supabase.from('profile').update({ avatar_url: publicUrl }).eq('id', 1)
    setUploading(false)
  }

  return (
    <div>
      <div className="section-title">Site Ayarları</div>

      {/* Site Settings */}
      <div className="card">
        <div className="card-header"><span className="card-title">Genel Ayarlar</span></div>
        {[['site_title','Site Başlığı'],['site_description','SEO Açıklaması'],['footer_text','Footer Metni'],['maps_embed_url','Google Maps Embed URL']].map(([k, l]) => (
          <div key={k} className="form-group">
            <label className="form-label">{l}</label>
            <input className="form-input" value={settings[k] ?? ''} onChange={e => setSettings(s => ({ ...s, [k]: e.target.value }))} />
          </div>
        ))}
        <div className="form-group">
          <label className="form-label">Hero Görseli</label>
          {settings.hero_image_url && (
            <div style={{ position: 'relative', width: 200, height: 120, marginBottom: 8 }}>
              <Image src={settings.hero_image_url} alt="Hero" fill sizes="200px" style={{ objectFit: 'cover' }} />
            </div>
          )}
          <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && uploadHero(e.target.files[0])} />
          {uploading && <span style={{ fontSize: 11, color: 'var(--taupe)' }}>Yükleniyor…</span>}
        </div>
        <button className="btn btn-primary" onClick={saveSettings}>{saved ? 'Kaydedildi ✓' : 'Kaydet'}</button>
      </div>

      {/* Profile */}
      <div className="card">
        <div className="card-header"><span className="card-title">Profil Bilgileri</span></div>
        {profile && (
          <>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Ad Soyad</label>
                <input className="form-input" value={profile.full_name} onChange={e => setProfile(p => p ? { ...p, full_name: e.target.value } : p)} />
              </div>
              <div className="form-group">
                <label className="form-label">Unvan</label>
                <input className="form-input" value={profile.title} onChange={e => setProfile(p => p ? { ...p, title: e.target.value } : p)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Kısa Bio</label>
              <textarea className="form-textarea" rows={2} value={profile.short_bio} onChange={e => setProfile(p => p ? { ...p, short_bio: e.target.value } : p)} />
            </div>
            <div className="form-group">
              <label className="form-label">Uzun Bio</label>
              <textarea className="form-textarea" rows={4} value={profile.long_bio} onChange={e => setProfile(p => p ? { ...p, long_bio: e.target.value } : p)} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">E-posta</label>
                <input className="form-input" type="email" value={profile.email} onChange={e => setProfile(p => p ? { ...p, email: e.target.value } : p)} />
              </div>
              <div className="form-group">
                <label className="form-label">Telefon</label>
                <input className="form-input" value={profile.phone} onChange={e => setProfile(p => p ? { ...p, phone: e.target.value } : p)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Instagram (@kullanici)</label>
                <input className="form-input" value={profile.instagram} onChange={e => setProfile(p => p ? { ...p, instagram: e.target.value } : p)} />
              </div>
              <div className="form-group">
                <label className="form-label">Pinterest URL</label>
                <input className="form-input" value={profile.pinterest} onChange={e => setProfile(p => p ? { ...p, pinterest: e.target.value } : p)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Profil Fotoğrafı</label>
              {profile.avatar_url && (
                <div style={{ position: 'relative', width: 100, height: 100, borderRadius: '50%', overflow: 'hidden', marginBottom: 8 }}>
                  <Image src={profile.avatar_url} alt="Avatar" fill sizes="100px" style={{ objectFit: 'cover' }} />
                </div>
              )}
              <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && uploadAvatar(e.target.files[0])} />
            </div>
            <button className="btn btn-primary" onClick={saveProfile}>{saved ? 'Kaydedildi ✓' : 'Kaydet'}</button>
          </>
        )}
      </div>

      {/* Password Change */}
      <div className="card">
        <div className="card-header"><span className="card-title">Şifre Değiştir</span></div>
        <PasswordChangeForm />
      </div>
    </div>
  )
}

function PasswordChangeForm() {
  const supabase = createClient()
  const [newPass, setNewPass] = useState('')
  const [confirm, setConfirm] = useState('')
  const [msg, setMsg] = useState('')

  async function change() {
    if (newPass !== confirm) { setMsg('Şifreler eşleşmiyor.'); return }
    if (newPass.length < 6) { setMsg('Şifre en az 6 karakter olmalı.'); return }
    const { error } = await supabase.auth.updateUser({ password: newPass })
    setMsg(error ? error.message : 'Şifre güncellendi.')
    setNewPass(''); setConfirm('')
  }

  return (
    <>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Yeni Şifre</label>
          <input className="form-input" type="password" value={newPass} onChange={e => setNewPass(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Tekrar</label>
          <input className="form-input" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} />
        </div>
      </div>
      {msg && <p style={{ fontSize: 12, marginBottom: 8, color: msg.includes('güncellendi') ? 'green' : '#c0392b' }}>{msg}</p>}
      <button className="btn btn-primary" onClick={change}>Güncelle</button>
    </>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add app/admin/paketler/ app/admin/mesajlar/ app/admin/ayarlar/
git commit -m "feat: admin paketler, mesajlar, ayarlar sayfaları"
git push origin master
```

---

## Task 14: next.config & image domains

**Files:**
- Modify: `next.config.ts` (or `next.config.js`)

- [ ] **Step 1: Update `next.config.ts`**

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
}

export default nextConfig
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: build completes with no errors. Fix any TypeScript errors shown.

- [ ] **Step 3: Commit**

```bash
git add next.config.ts
git commit -m "feat: configure Next.js image optimization for Supabase Storage"
git push origin master
```

---

## Task 15: Vercel deployment

- [ ] **Step 1: Install Vercel CLI**

```bash
npm install -g vercel
```

- [ ] **Step 2: Link project to Vercel**

```bash
vercel link
```

When prompted:
- Link to existing project? No → create new
- Project name: `aysinteriors`
- Framework: Next.js (auto-detected)

- [ ] **Step 3: Add environment variables to Vercel**

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Paste values when prompted. Add to Production, Preview, and Development.

- [ ] **Step 4: Deploy to production**

```bash
vercel --prod
```

Expected: deployment URL printed. Visit it and verify:
- [ ] Ana sayfa loads with hero image
- [ ] /portfolio shows projects (empty list is fine)
- [ ] /admin/login shows login form
- [ ] Logging in redirects to /admin/portfolio

- [ ] **Step 5: Add custom domain (optional)**

Vercel Dashboard → Project → Settings → Domains → add `aysinteriors.com`
Follow DNS instructions.

- [ ] **Step 6: Final push**

```bash
git add .vercel/
git commit -m "chore: add Vercel project config"
git push origin master
```

---

## Self-Review Checklist

**Spec coverage:**
- ✅ Next.js App Router — Task 1
- ✅ Supabase PostgreSQL schema with RLS — Task 3
- ✅ Supabase Auth (email/password) — Tasks 2, 10
- ✅ Middleware protecting /admin/* — Task 4
- ✅ TypeScript types — Task 4
- ✅ Supabase Storage image upload (original quality) — Tasks 2, 12
- ✅ Vercel Image Optimization (WebP) — Tasks 13, 14 (next/image throughout)
- ✅ Public pages as Server Components — Tasks 7, 8, 9
- ✅ Admin panel: portfolio, categories, packages, messages, settings — Tasks 11–13
- ✅ Contact form → messages table — Task 9
- ✅ Vercel deployment — Task 15
- ✅ GitHub push at every task

**Deferred (out of scope per design):**
- Education & certifications section on profile
