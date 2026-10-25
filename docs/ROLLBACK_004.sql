-- Undo migration 004. Restores the previous (less private) behaviour. Deletes no data.
update public.store_settings set is_public = true where key = 'stc_bank_details';
grant select on public.inventory to anon;
drop policy if exists inventory_read on public.inventory;
create policy inventory_read on public.inventory for select to anon, authenticated using (true);
drop function if exists public.stock_status();
drop function if exists public.get_stc_bank_details(uuid, uuid);
drop function if exists public.admin_set_bank_details(uuid, jsonb);
drop function if exists public.admin_set_product_active(uuid, uuid, boolean);
