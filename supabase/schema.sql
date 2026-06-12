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

-- admins table: only UIDs listed here can write to the database.
-- After creating your admin user in Supabase Auth, run:
--   insert into admins (user_id) values ('<your-auth-uid>');
create table admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table admins enable row level security;
create policy "admins read self" on admins for select using (auth.uid() = user_id);

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

-- Admin-only write policies (scoped to admins table, not just any authenticated user)
create policy "admin all categories" on categories for all
  using (exists (select 1 from admins where user_id = auth.uid()));
create policy "admin all projects" on projects for all
  using (exists (select 1 from admins where user_id = auth.uid()));
create policy "admin all project_images" on project_images for all
  using (exists (select 1 from admins where user_id = auth.uid()));
create policy "admin all packages" on packages for all
  using (exists (select 1 from admins where user_id = auth.uid()));
create policy "admin read messages" on messages for select
  using (exists (select 1 from admins where user_id = auth.uid()));
create policy "admin update messages" on messages for update
  using (exists (select 1 from admins where user_id = auth.uid()));
create policy "admin delete messages" on messages for delete
  using (exists (select 1 from admins where user_id = auth.uid()));
create policy "public insert messages" on messages for insert with check (true);
create policy "admin all profile" on profile for all
  using (exists (select 1 from admins where user_id = auth.uid()));
create policy "admin all site_settings" on site_settings for all
  using (exists (select 1 from admins where user_id = auth.uid()));

-- Storage policies: public reads, admin-only uploads/deletes
create policy "public read project-images"
  on storage.objects for select using (bucket_id = 'project-images');
create policy "admin upload project-images"
  on storage.objects for insert with check (
    bucket_id = 'project-images'
    and exists (select 1 from admins where user_id = auth.uid())
  );
create policy "admin delete project-images"
  on storage.objects for delete using (
    bucket_id = 'project-images'
    and exists (select 1 from admins where user_id = auth.uid())
  );

create policy "public read profile-images"
  on storage.objects for select using (bucket_id = 'profile-images');
create policy "admin upload profile-images"
  on storage.objects for insert with check (
    bucket_id = 'profile-images'
    and exists (select 1 from admins where user_id = auth.uid())
  );
create policy "admin delete profile-images"
  on storage.objects for delete using (
    bucket_id = 'profile-images'
    and exists (select 1 from admins where user_id = auth.uid())
  );

create policy "public read site-assets"
  on storage.objects for select using (bucket_id = 'site-assets');
create policy "admin upload site-assets"
  on storage.objects for insert with check (
    bucket_id = 'site-assets'
    and exists (select 1 from admins where user_id = auth.uid())
  );
create policy "admin delete site-assets"
  on storage.objects for delete using (
    bucket_id = 'site-assets'
    and exists (select 1 from admins where user_id = auth.uid())
  );

-- blog_posts
create table blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null default '',
  content text not null default '',
  cover_image_url text,
  cover_storage_path text,
  published boolean not null default false,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table blog_posts enable row level security;
create policy "public read published blog_posts" on blog_posts for select using (published = true);
create policy "admin all blog_posts" on blog_posts for all
  using (exists (select 1 from admins where user_id = auth.uid()));

-- blog-images storage bucket policies
create policy "public read blog-images"
  on storage.objects for select using (bucket_id = 'blog-images');
create policy "admin upload blog-images"
  on storage.objects for insert with check (
    bucket_id = 'blog-images'
    and exists (select 1 from admins where user_id = auth.uid())
  );
create policy "admin delete blog-images"
  on storage.objects for delete using (
    bucket_id = 'blog-images'
    and exists (select 1 from admins where user_id = auth.uid())
  );
