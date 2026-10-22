# Phase 4 guide (Windows 11)
## 1. Install
Install Node.js LTS. In PowerShell inside the project folder: `rmdir /s /q node_modules` (if present), `del package-lock.json`, `npm install`, `npm run build`, `npm test`. Then `npm audit` and send me the full output.
## 2. Supabase (existing project, no data is dropped)
SQL Editor, run in order: 001, seed, 002, 003 (all in `supabase/`). Send any error text. Set stock: `update public.inventory set quantity_on_hand = 10 where product_id in (select id from public.products);`
Make yourself admin: `update public.profiles set role='admin' where id=(select id from auth.users where email='YOUR_EMAIL');`
## 3. Environment
Copy `.env.example` to `.env.local` (browser values) and add the SERVER values in Netlify → Environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_ENVIRONMENT=sandbox, PAYPAL_WEBHOOK_ID, PAYPAL_CURRENCY, PAYPAL_SAR_PER_UNIT. Run locally with `npx netlify dev` (port 8888), which also needs those variables in a local `.env`.
## 4. PayPal
developer.paypal.com → Apps & Credentials → Sandbox → create an app and copy the client ID and secret. PayPal may not support SAR on your account, so charges are converted (default USD at 3.75 SAR) and the customer is shown the converted amount before paying. Webhook: add `https://YOUR-SITE/api/paypal-webhook` with events PAYMENT.CAPTURE.COMPLETED, PENDING, DENIED, and copy its ID to PAYPAL_WEBHOOK_ID (webhooks need a public URL, so use a deployed branch). Live PayPal needs a PayPal business account that is eligible for your country, plus PAYPAL_ENVIRONMENT=live and PAYPAL_LIVE_APPROVED=true; until both, live checkout stays off.
## 5. Manual test plan
Orders/inventory: place an order for 2 units with stock 10, check `reserved` = 2; try ordering more than stock and expect an out-of-stock message; press Place Order twice quickly and expect one order.
COD: total includes SAR 20, payment shows pending.
STC: upload a receipt, status becomes Awaiting Verification, never Paid; confirm another user cannot open the order URL.
PayPal sandbox: pay with a sandbox buyer, order becomes Paid only after capture; cancel on PayPal and the order stays open; reload the return URL and nothing is charged twice.
Expiry: set `reserve_expires_at` to the past on an unpaid STC order and run `select public.expire_unpaid_orders();`, then check `reserved` decreased once.
## Status
Nothing here has been executed. See the delivery message for the list.
