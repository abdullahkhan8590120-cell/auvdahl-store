-- AUVDAHL migration 001: profiles, addresses, catalogue, inventory, settings.
-- Safe on a fresh project: every statement is idempotent and nothing is dropped.
-- UNTESTED against a real database: run in the Supabase SQL editor and report any error.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text, phone text,
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'))
  on conflict (id) do nothing;
  return new;
end $$;
revoke all on function public.handle_new_user() from public, anon, authenticated;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin') $$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text, full_name text not null, mobile text not null, email text,
  country text not null default 'Saudi Arabia',
  region text not null, city text not null, district text not null, street text not null, building text not null,
  unit text, postal_code text, additional_number text, notes text,
  is_default boolean not null default false, created_at timestamptz not null default now(),
  constraint addr_mobile check (mobile ~ '^(\+?966|0)?5[0-9]{8}$'),
  constraint addr_postal check (postal_code is null or postal_code ~ '^[0-9]{5}$'),
  constraint addr_additional check (additional_number is null or additional_number ~ '^[0-9]{4}$'));
create index if not exists addresses_user_idx on public.addresses (user_id);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique, name text not null,
  price_sar numeric(10,2) not null check (price_sar >= 0), size_ml int not null default 50,
  family text not null, top_notes text[] not null default '{}', heart_notes text[] not null default '{}', base_notes text[] not null default '{}',
  description text not null, image_key text, is_active boolean not null default true, sort_order int not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now());
drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products for each row execute function public.touch_updated_at();

create table if not exists public.inventory (
  product_id uuid primary key references public.products(id) on delete cascade,
  quantity_on_hand int not null default 0 check (quantity_on_hand >= 0),
  reserved int not null default 0 check (reserved >= 0),
  low_stock_threshold int not null default 5, updated_at timestamptz not null default now(),
  constraint reserved_le_onhand check (reserved <= quantity_on_hand));

create table if not exists public.store_settings (
  key text primary key, value jsonb not null, is_public boolean not null default false, updated_at timestamptz not null default now());

-- RLS (never disabled)
alter table public.profiles enable row level security; alter table public.addresses enable row level security;
alter table public.products enable row level security; alter table public.inventory enable row level security;
alter table public.store_settings enable row level security;

-- Grants (new tables are NOT auto-exposed in this project, so be explicit and minimal)
revoke all on public.profiles, public.addresses, public.products, public.inventory, public.store_settings from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, phone) on public.profiles to authenticated;   -- role is NOT updatable by customers
grant select, insert, update, delete on public.addresses to authenticated;
grant select on public.products, public.inventory, public.store_settings to anon, authenticated;
-- All writes to products, inventory and settings happen server-side with the service role (admin functions, Phase 5).

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated using (id = (select auth.uid()) or public.is_admin());
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

drop policy if exists addr_own on public.addresses;
create policy addr_own on public.addresses for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy if exists products_read on public.products;
create policy products_read on public.products for select to anon, authenticated using (is_active or public.is_admin());
drop policy if exists inventory_read on public.inventory;
create policy inventory_read on public.inventory for select to anon, authenticated using (true);
drop policy if exists settings_read on public.store_settings;
create policy settings_read on public.store_settings for select to anon, authenticated using (is_public or public.is_admin());
