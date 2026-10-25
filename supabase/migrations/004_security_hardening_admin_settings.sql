-- AUVDAHL migration 004. Requires 001-003. Idempotent. Drops NO tables, deletes NO rows, keeps all data.
-- What it does:
--  1. Bank-transfer details stop being publicly readable (is_public -> false). The values already stored are kept unchanged.
--  2. Exact stock counts stop being publicly readable; the storefront gets only in/low/out via stock_status().
--  3. Adds service-role functions for: reading bank details for the order owner, editing bank details (admin),
--     and switching a product on/off sale (admin). All admin functions re-check the admin role and write the audit log.

-- 1 ---------------------------------------------------------------------------------------------
update public.store_settings set is_public = false where key = 'stc_bank_details';

-- 2 ---------------------------------------------------------------------------------------------
revoke select on public.inventory from anon;
drop policy if exists inventory_read on public.inventory;
create policy inventory_read on public.inventory for select to authenticated using (public.is_admin());

create or replace function public.stock_status() returns table (slug text, status text)
language sql stable security definer set search_path = '' as $$
  select p.slug,
    case when not p.is_active then 'out'
         when i.product_id is null then 'unknown'
         when i.quantity_on_hand - i.reserved <= 0 then 'out'
         when i.quantity_on_hand - i.reserved <= i.low_stock_threshold then 'low'
         else 'in' end
  from public.products p left join public.inventory i on i.product_id = p.id $$;
revoke all on function public.stock_status() from public;
grant execute on function public.stock_status() to anon, authenticated;

-- 3 ---------------------------------------------------------------------------------------------
-- Bank details are returned only to the signed-in owner of a bank-transfer order that can still be paid.
create or replace function public.get_stc_bank_details(p_user uuid, p_order uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare o record; v jsonb;
begin
  select * into o from public.orders where id = p_order and user_id = p_user;
  if not found or o.payment_method <> 'stc_transfer' or o.status = 'cancelled' then raise exception 'not_allowed'; end if;
  select value into v from public.store_settings where key = 'stc_bank_details';
  return v;
end $$;

create or replace function public.admin_set_bank_details(p_admin uuid, p_details jsonb) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform public.assert_admin(p_admin);
  insert into public.store_settings (key, value, is_public) values ('stc_bank_details', p_details, false)
  on conflict (key) do update set value = excluded.value, is_public = false, updated_at = now();
  insert into public.admin_audit_logs (admin_id, action, entity, entity_id, details)
  values (p_admin, 'set_bank_details', 'setting', 'stc_bank_details', jsonb_build_object('changed', true));   -- values themselves are never logged
end $$;

create or replace function public.admin_set_product_active(p_admin uuid, p_product uuid, p_active boolean) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform public.assert_admin(p_admin);
  update public.products set is_active = p_active where id = p_product;
  if not found then raise exception 'product_not_found'; end if;
  insert into public.admin_audit_logs (admin_id, action, entity, entity_id, details)
  values (p_admin, 'set_product_active', 'product', p_product::text, jsonb_build_object('active', p_active));
end $$;

do $$ declare f record; begin
  for f in select oid::regprocedure as sig from pg_proc where pronamespace = 'public'::regnamespace
           and proname in ('get_stc_bank_details','admin_set_bank_details','admin_set_product_active') loop
    execute format('revoke all on function %s from public, anon, authenticated', f.sig);
    execute format('grant execute on function %s to service_role', f.sig);
  end loop; end $$;
