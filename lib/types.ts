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

export type BlogPost = {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image_url: string | null
  cover_storage_path: string | null
  published: boolean
  tags: string[]
  created_at: string
  updated_at: string
}
