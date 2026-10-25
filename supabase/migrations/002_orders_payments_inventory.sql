-- AUVDAHL migration 002. Requires 001. Idempotent, drops nothing. UNTESTED against a real database.
create sequence if not exists public.order_number_seq;
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid not null references auth.users(id),
  idempotency_key uuid not null,
  status text not null default 'pending' check (status in ('pending','confirmed','processing','shipped','out_for_delivery','delivered','cancelled')),
  payment_method text not null check (payment_method in ('cod','stc_transfer','paypal')),
  payment_status text not null default 'pending' check (payment_status in ('pending','awaiting_verification','paid','failed','refunded','cancelled')),
  subtotal_sar numeric(10,2) not null, shipping_sar numeric(10,2) not null default 0,
  payment_fee_sar numeric(10,2) not null default 0, total_sar numeric(10,2) not null,
  address jsonb not null, reserve_expires_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (user_id, idempotency_key));
create index if not exists orders_user_idx on public.orders (user_id, created_at desc);
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  product_name text not null, unit_price_sar numeric(10,2) not null,
  quantity int not null check (quantity between 1 and 10), line_total_sar numeric(10,2) not null);
create index if not exists order_items_order_idx on public.order_items (order_id);
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  method text not null, status text not null default 'pending', amount_sar numeric(10,2) not null,
  provider_ref text, provider_capture_id text unique,
  verified_by uuid references auth.users(id), verified_at timestamptz, created_at timestamptz not null default now());
create table if not exists public.payment_receipts (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  storage_path text not null unique, mime_type text not null,
  size_bytes int not null check (size_bytes > 0 and size_bytes <= 5242880), created_at timestamptz not null default now());
create table if not exists public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  kind text not null, note text, created_at timestamptz not null default now());
create index if not exists order_events_order_idx on public.order_events (order_id, created_at);

alter table public.orders enable row level security; alter table public.order_items enable row level security;
alter table public.payments enable row level security; alter table public.payment_receipts enable row level security;
alter table public.order_events enable row level security;
revoke all on public.orders, public.order_items, public.payments, public.payment_receipts, public.order_events from anon, authenticated;
grant select on public.orders, public.order_items, public.payments, public.payment_receipts, public.order_events to authenticated;
-- No insert/update/delete grants: every write goes through the service-role functions below.

drop policy if exists orders_read on public.orders;
create policy orders_read on public.orders for select to authenticated using (user_id = (select auth.uid()) or public.is_admin());
drop policy if exists items_read on public.order_items;
create policy items_read on public.order_items for select to authenticated using (exists (select 1 from public.orders o where o.id = order_items.order_id));
drop policy if exists pay_read on public.payments;
create policy pay_read on public.payments for select to authenticated using (exists (select 1 from public.orders o where o.id = payments.order_id));
drop policy if exists rcpt_read on public.payment_receipts;
create policy rcpt_read on public.payment_receipts for select to authenticated using (user_id = (select auth.uid()) or public.is_admin());
drop policy if exists ev_read on public.order_events;
create policy ev_read on public.order_events for select to authenticated using (exists (select 1 from public.orders o where o.id = order_events.order_id));

-- Bank details are NOT stored in source control. Leave blank here and enter them in Admin > Settings (migration 004 / admin dashboard).
insert into public.store_settings (key, value, is_public) values
 ('cod_fee_sar','20',true), ('shipping_fee_sar','0',true),
 ('stc_bank_details','{"bank_name":"","account_holder":"","iban":"","account_number":"","currency":"SAR"}',false)
on conflict (key) do nothing;

create or replace function public.create_order(p_user uuid, p_key uuid, p_method text, p_address jsonb, p_items jsonb)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_id uuid; v_num text; v_sub numeric := 0; v_ship numeric; v_fee numeric := 0; r record; p record; inv record;
begin
  select id into v_id from public.orders where user_id = p_user and idempotency_key = p_key;
  if v_id is not null then return v_id; end if;   -- duplicate submit returns the same order
  if p_method not in ('cod','stc_transfer') then raise exception 'invalid_method'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) not between 1 and 20 then raise exception 'invalid_items'; end if;
  if coalesce(p_address->>'fullName','') = '' or coalesce(p_address->>'mobile','') = '' or coalesce(p_address->>'city','') = '' or coalesce(p_address->>'street','') = '' then raise exception 'invalid_address'; end if;
  select coalesce((value #>> '{}')::numeric, 0) into v_ship from public.store_settings where key = 'shipping_fee_sar'; v_ship := coalesce(v_ship, 0);
  if p_method = 'cod' then select coalesce((value #>> '{}')::numeric, 20) into v_fee from public.store_settings where key = 'cod_fee_sar'; v_fee := coalesce(v_fee, 20); end if;
  v_num := 'AUV-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.order_number_seq')::text, 6, '0');
  insert into public.orders (order_number, user_id, idempotency_key, payment_method, subtotal_sar, shipping_sar, payment_fee_sar, total_sar, address, reserve_expires_at)
  values (v_num, p_user, p_key, p_method, 0, v_ship, v_fee, 0, p_address, case when p_method = 'cod' then null else now() + interval '48 hours' end) returning id into v_id;
  for r in select e->>'slug' as slug, sum((e->>'qty')::int) as qty from jsonb_array_elements(p_items) e group by 1 order by 1 loop
    if r.qty < 1 or r.qty > 10 then raise exception 'invalid_quantity:%', r.slug; end if;
    select id, name, price_sar into p from public.products where slug = r.slug and is_active;
    if not found then raise exception 'product_unavailable:%', r.slug; end if;
    select * into inv from public.inventory where product_id = p.id for update;   -- row lock: concurrent buyers queue here
    if not found or inv.quantity_on_hand - inv.reserved < r.qty then raise exception 'out_of_stock:%', r.slug; end if;
    update public.inventory set reserved = reserved + r.qty, updated_at = now() where product_id = p.id;
    insert into public.order_items (order_id, product_id, product_name, unit_price_sar, quantity, line_total_sar) values (v_id, p.id, p.name, p.price_sar, r.qty, p.price_sar * r.qty);
    v_sub := v_sub + p.price_sar * r.qty;
  end loop;
  update public.orders set subtotal_sar = v_sub, total_sar = v_sub + v_ship + v_fee where id = v_id;
  insert into public.payments (order_id, method, amount_sar) values (v_id, p_method, v_sub + v_ship + v_fee);
  insert into public.order_events (order_id, kind, note) values (v_id, 'order_placed', 'Order placed');
  return v_id;
end $$;

create or replace function public.record_receipt(p_user uuid, p_order uuid, p_path text, p_mime text, p_size int)
returns void language plpgsql security definer set search_path = '' as $$
declare o record;
begin
  select * into o from public.orders where id = p_order and user_id = p_user for update;
  if not found then raise exception 'order_not_found'; end if;
  if o.payment_method <> 'stc_transfer' or o.payment_status not in ('pending','awaiting_verification') or o.status = 'cancelled' then raise exception 'receipt_not_allowed'; end if;
  if p_path not like p_user::text || '/' || p_order::text || '/%' then raise exception 'invalid_path'; end if;
  insert into public.payment_receipts (order_id, user_id, storage_path, mime_type, size_bytes) values (p_order, p_user, p_path, p_mime, p_size);
  update public.orders set payment_status = 'awaiting_verification', updated_at = now() where id = p_order;
  update public.payments set status = 'awaiting_verification' where order_id = p_order;
  insert into public.order_events (order_id, kind, note) values (p_order, 'receipt_uploaded', 'Receipt uploaded; awaiting verification by AUVDAHL');
end $$;

revoke all on function public.create_order(uuid,uuid,text,jsonb,jsonb), public.record_receipt(uuid,uuid,text,text,int) from public, anon, authenticated;
grant execute on function public.create_order(uuid,uuid,text,jsonb,jsonb), public.record_receipt(uuid,uuid,text,text,int) to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('receipts','receipts',false,5242880,array['image/jpeg','image/png','application/pdf'])
on conflict (id) do update set public = false, file_size_limit = 5242880, allowed_mime_types = excluded.allowed_mime_types;
drop policy if exists receipts_insert on storage.objects;
create policy receipts_insert on storage.objects for insert to authenticated with check (bucket_id = 'receipts' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists receipts_select on storage.objects;
create policy receipts_select on storage.objects for select to authenticated using (bucket_id = 'receipts' and ((storage.foldername(name))[1] = (select auth.uid())::text or public.is_admin()));
