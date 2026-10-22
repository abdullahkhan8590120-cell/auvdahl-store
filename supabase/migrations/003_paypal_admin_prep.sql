-- AUVDAHL migration 003. Requires 001 + 002. Idempotent, drops nothing, keeps all data. UNTESTED against a real database.
alter table public.payments add column if not exists charge_amount numeric(12,2);
alter table public.payments add column if not exists charge_currency text;
alter table public.orders add column if not exists stock_released boolean not null default false;
alter table public.orders add column if not exists stock_deducted boolean not null default false;

-- allow PayPal orders in create_order without re-pasting the function body
do $$ declare d text; begin
  d := pg_get_functiondef('public.create_order(uuid,uuid,text,jsonb,jsonb)'::regprocedure);
  d := replace(d, '(''cod'',''stc_transfer'')', '(''cod'',''stc_transfer'',''paypal'')');
  execute d; end $$;

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(), admin_id uuid not null references auth.users(id),
  action text not null, entity text not null, entity_id text, details jsonb, created_at timestamptz not null default now());
alter table public.admin_audit_logs enable row level security;
revoke all on public.admin_audit_logs from anon, authenticated;
grant select on public.admin_audit_logs to authenticated;
drop policy if exists audit_read on public.admin_audit_logs;
create policy audit_read on public.admin_audit_logs for select to authenticated using (public.is_admin());

create or replace function public.assert_admin(p uuid) returns void language plpgsql stable security definer set search_path = '' as $$
begin if not exists (select 1 from public.profiles where id = p and role = 'admin') then raise exception 'forbidden'; end if; end $$;

create or replace function public.release_order_stock(p_order uuid) returns void language plpgsql security definer set search_path = '' as $$
declare o record;
begin
  select * into o from public.orders where id = p_order for update;
  if not found or o.stock_released or o.stock_deducted then return; end if;   -- idempotent: never restores twice
  update public.inventory i set reserved = greatest(i.reserved - oi.quantity, 0), updated_at = now()
    from public.order_items oi where oi.order_id = p_order and oi.product_id = i.product_id;
  update public.orders set stock_released = true where id = p_order;
end $$;

create or replace function public.expire_unpaid_orders() returns int language plpgsql security definer set search_path = '' as $$
declare r record; n int := 0;
begin
  for r in select id from public.orders where status = 'pending' and payment_method in ('stc_transfer','paypal')
      and payment_status in ('pending','failed') and reserve_expires_at is not null and reserve_expires_at < now() for update skip locked loop
    perform public.release_order_stock(r.id);
    update public.orders set status = 'cancelled', payment_status = 'cancelled', updated_at = now() where id = r.id;
    update public.payments set status = 'cancelled' where order_id = r.id;
    insert into public.order_events (order_id, kind, note) values (r.id, 'expired', 'Order expired because payment was not received in time');
    n := n + 1;
  end loop;
  return n;
end $$;

create or replace function public.set_paypal_intent(p_user uuid, p_order uuid, p_ref text, p_amount numeric, p_currency text) returns void
language plpgsql security definer set search_path = '' as $$
declare o record;
begin
  select * into o from public.orders where id = p_order and user_id = p_user for update;
  if not found or o.payment_method <> 'paypal' or o.status = 'cancelled' or o.payment_status not in ('pending','failed') then raise exception 'paypal_not_allowed'; end if;
  update public.payments set provider_ref = p_ref, charge_amount = p_amount, charge_currency = upper(p_currency), status = 'pending' where order_id = p_order;
  update public.orders set payment_status = 'pending' where id = p_order;
end $$;

create or replace function public.apply_paypal_result(p_order uuid, p_ref text, p_capture text, p_status text, p_amount numeric, p_currency text) returns text
language plpgsql security definer set search_path = '' as $$
declare o record; pay record;
begin
  select * into o from public.orders where id = p_order for update;
  if not found or o.payment_method <> 'paypal' then raise exception 'order_not_found'; end if;
  select * into pay from public.payments where order_id = p_order for update;
  if pay.provider_ref is distinct from p_ref then raise exception 'reference_mismatch'; end if;
  if o.payment_status = 'paid' then return 'paid'; end if;   -- duplicate capture or webhook: no second update
  if pay.charge_amount is distinct from p_amount or pay.charge_currency is distinct from upper(p_currency) then
    insert into public.order_events (order_id, kind, note) values (p_order, 'paypal_mismatch', 'PayPal amount or currency did not match; payment NOT accepted');
    return 'mismatch';
  end if;
  if p_status = 'COMPLETED' then
    update public.payments set status = 'paid', provider_capture_id = p_capture, verified_at = now() where order_id = p_order;
    update public.orders set payment_status = 'paid', updated_at = now(), reserve_expires_at = null where id = p_order;
    if o.status = 'cancelled' then
      insert into public.order_events (order_id, kind, note) values (p_order, 'paid_after_cancel', 'PayPal payment arrived after cancellation: needs manual review or refund');
      return 'review';
    end if;
    update public.orders set status = case when status = 'pending' then 'confirmed' else status end where id = p_order;
    insert into public.order_events (order_id, kind, note) values (p_order, 'paypal_paid', 'Payment confirmed by PayPal');
    return 'paid';
  elsif p_status = 'PENDING' then
    insert into public.order_events (order_id, kind, note) values (p_order, 'paypal_pending', 'PayPal payment is pending');
    return 'pending';
  end if;
  update public.payments set status = 'failed' where order_id = p_order;
  update public.orders set payment_status = 'failed', updated_at = now() where id = p_order;
  insert into public.order_events (order_id, kind, note) values (p_order, 'paypal_failed', 'PayPal payment did not complete');
  return 'failed';
end $$;

-- Admin operations for Phase 5. Called only by server functions that have already authenticated the caller; each re-checks the admin role and writes an audit log.
create or replace function public.admin_verify_transfer(p_admin uuid, p_order uuid, p_approve boolean, p_note text) returns void
language plpgsql security definer set search_path = '' as $$
declare o record;
begin
  perform public.assert_admin(p_admin);
  select * into o from public.orders where id = p_order for update;
  if not found or o.payment_method <> 'stc_transfer' or o.payment_status <> 'awaiting_verification' then raise exception 'not_verifiable'; end if;
  if p_approve then
    update public.payments set status = 'paid', verified_by = p_admin, verified_at = now() where order_id = p_order;
    update public.orders set payment_status = 'paid', status = case when status = 'pending' then 'confirmed' else status end, reserve_expires_at = null, updated_at = now() where id = p_order;
  else
    update public.payments set status = 'pending' where order_id = p_order;
    update public.orders set payment_status = 'pending', updated_at = now() where id = p_order;
  end if;
  insert into public.order_events (order_id, kind, note) values (p_order, case when p_approve then 'transfer_verified' else 'transfer_rejected' end, case when p_approve then 'Bank transfer verified' else 'Bank transfer could not be verified; please contact us' end);
  insert into public.admin_audit_logs (admin_id, action, entity, entity_id, details) values (p_admin, case when p_approve then 'verify_transfer' else 'reject_transfer' end, 'order', p_order::text, jsonb_build_object('note', p_note));
end $$;

create or replace function public.admin_confirm_cod(p_admin uuid, p_order uuid) returns void language plpgsql security definer set search_path = '' as $$
declare o record;
begin
  perform public.assert_admin(p_admin);
  select * into o from public.orders where id = p_order for update;
  if not found or o.payment_method <> 'cod' or o.payment_status <> 'pending' or o.status = 'cancelled' then raise exception 'not_confirmable'; end if;
  update public.payments set status = 'paid', verified_by = p_admin, verified_at = now() where order_id = p_order;
  update public.orders set payment_status = 'paid', updated_at = now() where id = p_order;
  insert into public.order_events (order_id, kind, note) values (p_order, 'cod_collected', 'Cash payment collected');
  insert into public.admin_audit_logs (admin_id, action, entity, entity_id) values (p_admin, 'confirm_cod', 'order', p_order::text);
end $$;

create or replace function public.admin_set_status(p_admin uuid, p_order uuid, p_status text) returns void language plpgsql security definer set search_path = '' as $$
declare o record;
begin
  perform public.assert_admin(p_admin);
  if p_status not in ('pending','confirmed','processing','shipped','out_for_delivery','delivered','cancelled') then raise exception 'invalid_status'; end if;
  select * into o from public.orders where id = p_order for update;
  if not found or o.status = 'cancelled' then raise exception 'not_updatable'; end if;
  if p_status = 'cancelled' then perform public.release_order_stock(p_order); end if;
  if p_status in ('shipped','out_for_delivery','delivered') and not o.stock_deducted and not o.stock_released then
    update public.inventory i set quantity_on_hand = greatest(i.quantity_on_hand - oi.quantity, 0), reserved = greatest(i.reserved - oi.quantity, 0), updated_at = now()
      from public.order_items oi where oi.order_id = p_order and oi.product_id = i.product_id;
    update public.orders set stock_deducted = true where id = p_order;
  end if;
  update public.orders set status = p_status, updated_at = now() where id = p_order;
  insert into public.order_events (order_id, kind, note) values (p_order, 'status_' || p_status, 'Order status: ' || p_status);
  insert into public.admin_audit_logs (admin_id, action, entity, entity_id, details) values (p_admin, 'set_status', 'order', p_order::text, jsonb_build_object('status', p_status));
end $$;

create or replace function public.admin_adjust_stock(p_admin uuid, p_product uuid, p_on_hand int, p_note text) returns void language plpgsql security definer set search_path = '' as $$
declare inv record;
begin
  perform public.assert_admin(p_admin);
  select * into inv from public.inventory where product_id = p_product for update;
  if not found or p_on_hand < inv.reserved then raise exception 'invalid_stock'; end if;
  update public.inventory set quantity_on_hand = p_on_hand, updated_at = now() where product_id = p_product;
  insert into public.admin_audit_logs (admin_id, action, entity, entity_id, details) values (p_admin, 'adjust_stock', 'product', p_product::text, jsonb_build_object('from', inv.quantity_on_hand, 'to', p_on_hand, 'note', p_note));
end $$;

do $$ declare f record; begin
  for f in select oid::regprocedure as sig from pg_proc where pronamespace = 'public'::regnamespace and proname in
    ('assert_admin','release_order_stock','expire_unpaid_orders','set_paypal_intent','apply_paypal_result','admin_verify_transfer','admin_confirm_cod','admin_set_status','admin_adjust_stock') loop
    execute format('revoke all on function %s from public, anon, authenticated', f.sig);
    execute format('grant execute on function %s to service_role', f.sig);
  end loop; end $$;
