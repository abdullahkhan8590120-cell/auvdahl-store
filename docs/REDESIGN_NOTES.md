# Royal Obsidian redesign: change notes

## Database: no migration needed
The storefront reads fragrance notes from `src/lib/products.ts`, not from the database. For consistency, update the stored LYRANA note once in the Supabase SQL editor (prices, ids and inventory are untouched):
`update public.products set top_notes = '{Peony,Lychee,Bergamot}' where slug = 'lyrana';`
`supabase/seed/seed.sql` now has Peony and refreshes `top_notes` on re-run.

## Not touched
`netlify/`, `supabase/migrations/`, auth and admin logic, cart/pricing/validation logic, checkout flow and payment methods.

## Manual testing still required (cannot be automated here)
Sign-in and Google sign-in, order creation (COD, STC receipt upload, PayPal sandbox), admin dashboard actions, inventory reservation, the live stock badge (needs `VITE_SUPABASE_*` set and inventory entered; the seed starts stock at 0, which correctly shows "Sold out").

## Deploy (GitHub + Netlify)
1. Unzip, then `npm install`, `npm run build`, `npm test` locally and fix anything reported.
2. Preview with `npx netlify dev` (needs the server env vars listed in docs/PHASE4.md).
3. Commit to a **branch** (not main) and push; Netlify creates a deploy preview. Test the checklist above on that preview.
4. Merge to main only after you approve.
