-- =============================================================================
-- ANDRES SPORTSWEARTZ - DATABASE SCHEMA
-- =============================================================================
-- HOW TO USE THIS FILE
--   1. Open your Supabase project.
--   2. Click "SQL Editor" in the left menu.
--   3. Click "New query".
--   4. Copy ALL the text in this file and paste it into the editor.
--   5. Click "Run".
--
-- This file is safe to run more than once. It uses "if not exists" everywhere,
-- so re-running it will not delete your data.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. EXTENSIONS
-- -----------------------------------------------------------------------------
create extension if not exists "pgcrypto";


-- -----------------------------------------------------------------------------
-- 2. ENUM TYPES
--    These limit the allowed values, so bad statuses cannot be stored.
-- -----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type order_status as enum (
      'new', 'confirmed', 'preparing', 'out_for_delivery', 'completed', 'cancelled'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'payment_status') then
    create type payment_status as enum ('pending', 'paid', 'failed', 'refunded');
  end if;
end $$;


-- -----------------------------------------------------------------------------
-- 3. SHARED TRIGGER FUNCTION
--    Automatically updates the "updated_at" column on every edit.
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- -----------------------------------------------------------------------------
-- 4. ADMIN USERS
--    Stores WHO is allowed into the admin dashboard.
--    Passwords are NEVER stored here. Supabase Auth handles passwords securely.
-- -----------------------------------------------------------------------------
create table if not exists public.admin_users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text,
  role text not null default 'owner' check (role in ('owner', 'manager')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  last_login_at timestamptz
);

comment on table public.admin_users is 'Allow list of staff accounts permitted to use the admin dashboard.';


-- Helper used by the security policies below.
-- It answers: "is the person making this request an active admin?"
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users au
    where au.id = auth.uid()
      and au.is_active = true
  );
$$;

-- -----------------------------------------------------------------------------
-- 5. CATEGORIES
-- -----------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists categories_active_idx on public.categories (is_active, sort_order);

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();


-- -----------------------------------------------------------------------------
-- 6. PRODUCTS
-- -----------------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories (id) on delete set null,
  name text not null,
  slug text not null unique,
  short_description text,
  description text,
  price numeric(12, 2) not null check (price >= 0),
  currency text not null default 'TZS',
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  stock_status text not null default 'in_stock'
    check (stock_status in ('in_stock', 'low_stock', 'out_of_stock', 'preorder')),
  accent_color text not null default '#1769e0',
  badge text,
  is_featured boolean not null default false,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_published_idx on public.products (is_published, is_featured);
create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_slug_idx on public.products (slug);

-- Add accent_color and badge
alter table if exists public.products add column if not exists accent_color text not null default '#1769e0';
alter table if exists public.products add column if not exists badge text;


drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();


-- -----------------------------------------------------------------------------
-- 7. PRODUCT IMAGES
--    The image FILES live in Supabase Storage. This table stores the links,
--    plus the alt text used for accessibility and search engines.
-- -----------------------------------------------------------------------------
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  image_url text not null,
  alt_text text,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists product_images_product_idx on public.product_images (product_id, sort_order);


-- -----------------------------------------------------------------------------
-- 8. PRODUCT VARIANTS
--    Sizes, colours and any other option a customer can choose.
-- -----------------------------------------------------------------------------
create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  variant_type text not null default 'size',
  variant_name text not null,
  sku text,
  additional_price numeric(12, 2) not null default 0,
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, variant_type, variant_name)
);

create index if not exists product_variants_product_idx on public.product_variants (product_id, variant_type);

drop trigger if exists product_variants_set_updated_at on public.product_variants;
create trigger product_variants_set_updated_at
  before update on public.product_variants
  for each row execute function public.set_updated_at();
-- -----------------------------------------------------------------------------
-- 9. CUSTOMERS
--    Customers do not need an account to order. We keep their contact details
--    so the business can recognise repeat buyers later.
-- -----------------------------------------------------------------------------
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone_number text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customers_phone_idx on public.customers (phone_number);

drop trigger if exists customers_set_updated_at on public.customers;
create trigger customers_set_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();


-- -----------------------------------------------------------------------------
-- 10. ORDER NUMBER GENERATOR
--     Creates friendly references such as ASW-20260925-0042
-- -----------------------------------------------------------------------------
create sequence if not exists public.order_reference_seq start 1;

create or replace function public.generate_order_reference()
returns text
language plpgsql
as $$
declare
  next_number integer;
begin
  next_number := nextval('public.order_reference_seq');
  return 'ASW-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(next_number::text, 4, '0');
end;
$$;


-- -----------------------------------------------------------------------------
-- 11. ORDERS
--     The customer name and phone are COPIED into the order, so the historical
--     record stays correct even if the customer row is edited later.
-- -----------------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_reference text not null unique default public.generate_order_reference(),
  customer_id uuid references public.customers (id) on delete set null,
  customer_name_snapshot text not null,
  customer_phone_snapshot text not null,
  delivery_location text not null,
  delivery_address text not null,
  customer_notes text,
  subtotal numeric(12, 2) not null check (subtotal >= 0),
  delivery_fee numeric(12, 2) not null default 0 check (delivery_fee >= 0),
  total_amount numeric(12, 2) not null check (total_amount >= 0),
  currency text not null default 'TZS',
  order_status order_status not null default 'new',
  payment_status payment_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_status_idx on public.orders (order_status, created_at desc);
create index if not exists orders_created_idx on public.orders (created_at desc);
create index if not exists orders_reference_idx on public.orders (order_reference);

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();


-- -----------------------------------------------------------------------------
-- 12. ORDER ITEMS
--     IMPORTANT: product name, size and price are SNAPSHOTS. If the owner later
--     edits or deletes a product, the old order still shows exactly what the
--     customer bought, at the price they agreed to pay.
-- -----------------------------------------------------------------------------
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name_snapshot text not null,
  product_sku_snapshot text,
  selected_size text,
  selected_variant text,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  line_total numeric(12, 2) not null check (line_total >= 0),
  created_at timestamptz not null default now()
);

create index if not exists order_items_order_idx on public.order_items (order_id);


-- -----------------------------------------------------------------------------
-- 13. BUSINESS SETTINGS
--     Edited by the owner in the admin dashboard. Nothing here is hard-coded
--     into the website.
-- -----------------------------------------------------------------------------
create table if not exists public.business_settings (
  id integer primary key default 1 check (id = 1),
  business_name text not null default 'Andres Sportsweartz',
  logo_url text,
  whatsapp_number text not null default '255627546360',
  phone_number text,
  email text,
  currency text not null default 'TZS',
  business_address text,
  business_hours text,
  delivery_information text,
  facebook_url text,
  instagram_url text,
  tiktok_url text,
  updated_at timestamptz not null default now()
);

insert into public.business_settings (id)
values (1)
on conflict (id) do nothing;

drop trigger if exists business_settings_set_updated_at on public.business_settings;
create trigger business_settings_set_updated_at
  before update on public.business_settings
  for each row execute function public.set_updated_at();
-- -----------------------------------------------------------------------------
-- 14. ROW LEVEL SECURITY
--     This is the most important security section.
--
--     RULE: the public website may READ published shop content.
--           The public website may NEVER read orders, customers or settings.
--           Only an active admin may change shop content.
-- -----------------------------------------------------------------------------
alter table public.admin_users       enable row level security;
alter table public.categories        enable row level security;
alter table public.products          enable row level security;
alter table public.product_images    enable row level security;
alter table public.product_variants  enable row level security;
alter table public.customers         enable row level security;
alter table public.orders            enable row level security;
alter table public.order_items       enable row level security;
alter table public.business_settings enable row level security;

-- Remove old policies so this file can be re-run safely.
drop policy if exists "Public can read active categories" on public.categories;
drop policy if exists "Public can read published products" on public.products;
drop policy if exists "Public can read images of published products" on public.product_images;
drop policy if exists "Public can read variants of published products" on public.product_variants;
drop policy if exists "Admins manage categories" on public.categories;
drop policy if exists "Admins manage products" on public.products;
drop policy if exists "Admins manage product images" on public.product_images;
drop policy if exists "Admins manage product variants" on public.product_variants;
drop policy if exists "Admins read admin users" on public.admin_users;
drop policy if exists "Admins read customers" on public.customers;
drop policy if exists "Admins read orders" on public.orders;
drop policy if exists "Admins update orders" on public.orders;
drop policy if exists "Admins read order items" on public.order_items;
drop policy if exists "Admins read settings" on public.business_settings;
drop policy if exists "Admins update settings" on public.business_settings;

-- --- Public (storefront) READ access -----------------------------------------
create policy "Public can read active categories"
  on public.categories for select
  using (is_active = true);

create policy "Public can read published products"
  on public.products for select
  using (is_published = true);

create policy "Public can read images of published products"
  on public.product_images for select
  using (
    exists (
      select 1 from public.products p
      where p.id = product_images.product_id and p.is_published = true
    )
  );

create policy "Public can read variants of published products"
  on public.product_variants for select
  using (
    exists (
      select 1 from public.products p
      where p.id = product_variants.product_id and p.is_published = true
    )
  );

-- --- Admin access -------------------------------------------------------------
create policy "Admins read admin users"
  on public.admin_users for select
  using (public.is_admin() or auth.uid() = id);

create policy "Admins manage categories"
  on public.categories for all
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins manage products"
  on public.products for all
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins manage product images"
  on public.product_images for all
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins manage product variants"
  on public.product_variants for all
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins read customers"
  on public.customers for select
  using (public.is_admin());

create policy "Admins read orders"
  on public.orders for select
  using (public.is_admin());

create policy "Admins update orders"
  on public.orders for update
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins read order items"
  on public.order_items for select
  using (public.is_admin());

create policy "Admins read settings"
  on public.business_settings for select
  using (public.is_admin());

create policy "Admins update settings"
  on public.business_settings for update
  using (public.is_admin()) with check (public.is_admin());

-- NOTE: there is intentionally NO public insert/update/delete policy anywhere.
-- Orders are written by the trusted server using the service role key, which
-- bypasses these policies. A customer browser can therefore never write to the
-- database directly.


-- -----------------------------------------------------------------------------
-- 15. IMAGE STORAGE
--     Public read (so product photos display), admin-only write.
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "Public can view product images" on storage.objects;
drop policy if exists "Admins can upload product images" on storage.objects;
drop policy if exists "Admins can update product images" on storage.objects;
drop policy if exists "Admins can delete product images" on storage.objects;

create policy "Public can view product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Admins can upload product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "Admins can update product images"
  on storage.objects for update
  using (bucket_id = 'product-images' and public.is_admin());

create policy "Admins can delete product images"
  on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_admin());


-- -----------------------------------------------------------------------------
-- 16. STARTER CATEGORIES
-- -----------------------------------------------------------------------------
insert into public.categories (name, slug, sort_order)
values
  ('Sports shoes', 'sports-shoes', 1),
  ('Training kits', 'training-kits', 2),
  ('Sportswear', 'sportswear', 3),
  ('Accessories', 'accessories', 4)
on conflict (slug) do nothing;

-- =============================================================================
-- END OF SCHEMA
-- =============================================================================