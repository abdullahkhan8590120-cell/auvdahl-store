# Database migrations

Your existing Supabase project already has 001, 002 and 003 applied. **Only `004_security_hardening_admin_settings.sql` is new.** It is idempotent, drops no table, deletes no row and changes no price, product, inventory quantity, account or order.

## What 004 changes
1. `store_settings.stc_bank_details` becomes private (`is_public = false`). The stored values are untouched.
2. Anonymous visitors can no longer read the `inventory` table. Admins still can. The storefront uses `stock_status()` (returns only in / low / out per product).
3. Adds service-role-only functions: `get_stc_bank_details`, `admin_set_bank_details`, `admin_set_product_active`.

## Before you run it
In the Supabase SQL editor, run this and keep a note of the result (a simple backup of the setting):
```sql
select key, value, is_public from public.store_settings where key = 'stc_bank_details';
```
**Check the IBAN in that result.** A Saudi IBAN is exactly 24 characters starting with SA. If it is not, correct it in Admin > Settings after deploying.

## Run order and timing
1. Run 004 (paste the file in the SQL editor, Run).
2. Deploy the new site straight afterwards.

Between steps 1 and 2 the old site cannot show bank details to new bank-transfer customers (it read them publicly). Do it at a quiet time, a few minutes apart. If you deploy first, the new site shows "bank details not available online, message us on WhatsApp" until 004 is run.

## Verify after running
```sql
select key, is_public from public.store_settings where key = 'stc_bank_details';   -- is_public = false
select * from public.stock_status();                                              -- 6 rows: in / low / out
select proname from pg_proc where proname in ('get_stc_bank_details','admin_set_bank_details','admin_set_product_active');  -- 3 rows
```

## Rollback of 004 (only if needed; this makes bank details and stock public again)
See `docs/ROLLBACK_004.sql`.
