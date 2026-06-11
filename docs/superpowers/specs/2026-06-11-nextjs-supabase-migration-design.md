# Ays Interiors — Next.js + Supabase Migration Design

Date: 2026-06-11

## Overview

Migrate existing vanilla HTML/CSS/JS portfolio site to Next.js 14 App Router + Supabase + Vercel. Visual design is preserved. Backend changes from localStorage/base64 to PostgreSQL + Supabase Storage.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 App Router |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth (email + password) |
| File Storage | Supabase Storage (public buckets) |
| Image Delivery | Vercel Image Optimization (auto WebP) |
| Deployment | Vercel |
| Styling | Existing CSS migrated to globals.css |

## Architecture

- Public pages: Server Components, data fetched server-side, no hydration overhead, SEO-ready
- Admin pages: Client Components, protected via `middleware.ts` + Supabase session check
- Auth flow: every `/admin/*` request checked in middleware → redirect to `/admin/login` if no session

## Route Structure

```
app/
├── (public)/
│   ├── page.tsx              # Ana sayfa
│   ├── portfolio/page.tsx
│   ├── danismanlik/page.tsx
│   ├── hakkimda/page.tsx
│   └── iletisim/page.tsx
├── admin/
│   ├── login/page.tsx
│   ├── portfolio/page.tsx    # Proje & kategori yönetimi
│   ├── paketler/page.tsx
│   ├── mesajlar/page.tsx
│   └── ayarlar/page.tsx
└── layout.tsx
```

## Database Schema (Supabase PostgreSQL)

### projects
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| title | text | |
| category_id | uuid FK | → categories.id |
| location | text | |
| year | int | |
| area_sqm | int? | |
| description | text | |
| materials | text[] | |
| featured | bool | anasayfada göster |
| cover_image_url | text | Supabase Storage URL |
| created_at | timestamptz | |

### project_images
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| project_id | uuid FK | → projects.id |
| storage_path | text | Supabase Storage path |
| url | text | Public CDN URL |
| sort_order | int | |
| is_cover | bool | |

### categories
| Column | Type |
|---|---|
| id | uuid PK |
| name | text |
| slug | text |
| sort_order | int |

### packages
| Column | Type |
|---|---|
| id | uuid PK |
| title | text |
| slogan | text |
| price | text? |
| features | text[] |
| featured | bool |
| cta_text | text |
| theme | text |
| sort_order | int |

### messages
| Column | Type |
|---|---|
| id | uuid PK |
| name | text |
| email | text |
| phone | text? |
| service | text? |
| message | text |
| is_read | bool |
| created_at | timestamptz |

### profile (single row)
| Column | Type |
|---|---|
| id | int PK (always 1) |
| full_name | text |
| title | text |
| short_bio | text |
| long_bio | text |
| avatar_url | text |
| email | text |
| phone | text |
| instagram | text |
| pinterest | text |
| linkedin | text |

> Education & certifications deferred to a future iteration.

### site_settings (key-value)
| Column | Type |
|---|---|
| key | text PK |
| value | text |

Keys: `site_title`, `site_description`, `hero_image_url`, `footer_text`, `maps_embed_url`

## Storage Buckets

| Bucket | Access | Usage |
|---|---|---|
| project-images | public | Proje fotoğrafları |
| profile-images | public | Profil & hakkımda görseli |
| site-assets | public | Hero, OG image |

## Image Upload Flow

1. Admin selects file(s) — any format (JPEG, PNG, HEIC, etc.)
2. File uploaded directly to Supabase Storage via `@supabase/storage-js`
3. Public URL stored in `project_images.url`
4. Site renders via Next.js `<Image>` — Vercel auto-converts to WebP, resizes, caches
5. Original file preserved in storage at full quality

## RLS Policies

- All tables: `SELECT` public (anonymous)
- `INSERT/UPDATE/DELETE`: authenticated users only
- Storage buckets: public read, authenticated write

## Migration Strategy

1. `create-next-app` in new directory
2. Copy `css/style.css` → `app/globals.css`
3. Convert each HTML page to Next.js page component (preserve HTML structure)
4. Replace `localStorage` reads → Supabase server queries
5. Rebuild admin panel with same visual design + Supabase Auth/Storage
6. Deploy to Vercel, connect Supabase env vars
