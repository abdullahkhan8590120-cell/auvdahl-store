# Audit: redesigned project vs original (final pass)

**Compared:** the original upload (`auvdahl-store-main`) and the redesign (this project). The redesign changed only the storefront (pages, components, styles, SEO, images). Nothing under `netlify/`, `supabase/migrations/`, `src/admin/`, auth or the cart/pricing code was removed or rewritten by it, so no working feature was lost.

## Already working and kept as is
Cart (localStorage, max 10 per item), server-priced orders (`create_order` ignores browser prices), idempotent order creation, stock reservation with row locks, COD (stays unpaid until an admin confirms collection), STC transfer (receipt upload never marks paid; only an admin approves), PayPal (server create + capture + signed webhook, amount/currency re-checked in the database, stays disabled until configured), private receipts bucket, RLS on every table (customers cannot read others' orders, change `role`, prices, stock or payment status), admin actions re-checked on the server and written to an audit log, hourly expiry of unpaid reservations.

## Found and fixed in this pass
| # | Finding | Fix |
|---|---|---|
| 1 | **Personal bank details (name, IBAN, account number) were hardcoded in migration 002 and publicly readable.** | Removed from source; migration 004 makes the setting private; customers get them only through an authenticated function for their own bank-transfer order; admins edit them in Admin > Settings. |
| 2 | **The IBAN in that file is malformed** (23 characters, fails the checksum; Saudi IBANs are 24). | The admin form now validates Saudi IBANs. **You must check what customers currently see.** |
| 3 | Exact stock counts were public. | Public gets only in/low/out via `stock_status()`. |
| 4 | The site URL in my earlier SEO work used a wrong subdomain (it omitted "-store"). | Now `https://auvdahl-store.netlify.app` everywhere. |
| 5 | Order page showed "Shipping SAR 0", implying free shipping while checkout says shipping is set at confirmation. | Shows "to be confirmed by AUVDAHL" unless a fee is configured. |
| 6 | Admin could not take a product off sale; fulfilment view lacked building, unit, postal code, notes, email. | Added On sale / Off sale toggle (audited) and the full address. |
| 7 | Saved addresses were not usable at checkout; sign-in lost the checkout page. | Checkout offers saved addresses, prefills email, and sign-in returns to checkout. |
| 8 | No Node version pinned for Vite 7; `/api/*` relied on implicit routing. | `NODE_VERSION=22`, explicit `/api/*` rule, security headers. |

## Not built (outside this project's current scope)
Order confirmation emails (no email service is wired), customer-side order cancellation, refunds workflow (admins handle refunds outside the site), a COD on/off switch, sales analytics beyond the loaded 100 orders.
