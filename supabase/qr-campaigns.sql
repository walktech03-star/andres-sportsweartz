-- =============================================================================
-- ADD-ON: QR CAMPAIGNS + BULK DISCOUNT COLUMNS
-- =============================================================================
-- Run this AFTER supabase/schema.sql. Safe to run more than once.
--
-- Adds:
--   - discount + campaign columns on orders
--   - qr_campaigns (one row per printed QR) and qr_scans (one row per scan)
-- =============================================================================

-- --- 1. Orders: discount + campaign tracking ----------------------------------
alter table if exists public.orders add column if not exists item_count integer;
alter table if exists public.orders add column if not exists discount_rate numeric(5, 4) not null default 0;
alter table if exists public.orders add column if not exists discount_amount numeric(12, 2) not null default 0;
alter table if exists public.orders add column if not exists campaign_code text;

create index if not exists orders_campaign_idx on public.orders (campaign_code, created_at desc);

-- --- 2. QR campaigns ----------------------------------------------------------
create table if not exists public.qr_campaigns (
  code text primary key,
  name text not null,
  segment text not null default 'custom'
    check (segment in ('general', 'schools', 'football', 'whatsapp', 'product', 'custom')),
  target_path text not null default '/',
  product_slug text,
  description text,
  is_active boolean not null default true,
  scan_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.qr_campaigns is 'One row per printed QR code. Scans are counted here and logged in qr_scans.';

insert into public.qr_campaigns (code, name, segment, target_path, description) values
  ('website', 'General website', 'general', '/', 'Main shop front. Print on bags, receipts and general flyers.'),
  ('schools', 'Schools and academies', 'schools', '/shop', 'For school and academy team-kit offers and bulk orders.'),
  ('football', 'Football products', 'football', '/shop', 'For jerseys, boots and match-day gear posters.'),
  ('whatsapp', 'Direct WhatsApp', 'whatsapp', '/shop', 'Opens a WhatsApp chat with ANDRES SPORTSWEARTZ directly.')
on conflict (code) do nothing;

drop trigger if exists qr_campaigns_set_updated_at on public.qr_campaigns;
create trigger qr_campaigns_set_updated_at
  before update on public.qr_campaigns
  for each row execute function public.set_updated_at();

-- --- 3. QR scans --------------------------------------------------------------
create table if not exists public.qr_scans (
  id uuid primary key default gen_random_uuid(),
  campaign_code text not null,
  target_path text,
  user_agent text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  created_at timestamptz not null default now()
);

create index if not exists qr_scans_campaign_idx on public.qr_scans (campaign_code, created_at desc);
create index if not exists qr_scans_created_idx on public.qr_scans (created_at desc);

-- --- 4. Scan counter (called by the /r/:code route) ---------------------------
create or replace function public.increment_qr_scan(p_code text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.qr_campaigns
  set scan_count = scan_count + 1
  where code = p_code;
end;
$$;

-- --- 5. Security ---------------------------------------------------------------
alter table public.qr_campaigns enable row level security;
alter table public.qr_scans enable row level security;

drop policy if exists "Admins read qr campaigns" on public.qr_campaigns;
drop policy if exists "Admins manage qr campaigns" on public.qr_campaigns;
drop policy if exists "Admins read qr scans" on public.qr_scans;

create policy "Admins read qr campaigns"
  on public.qr_campaigns for select
  using (public.is_admin());

create policy "Admins manage qr campaigns"
  on public.qr_campaigns for all
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins read qr scans"
  on public.qr_scans for select
  using (public.is_admin());
