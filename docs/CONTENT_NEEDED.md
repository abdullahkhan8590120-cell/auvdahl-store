# Content AUVDAHL must provide before publishing

Edit `src/content/siteContent.ts` (policies, contact, socials) and `src/pages/About.tsx` (set `STORY_PROVIDED = true`). Until text exists, those pages show a dashed "Content required" box and are `noindex`.

| Page | Needed |
|---|---|
| Shipping | Delivery time per region, courier and tracking, order processing time |
| Returns | Return window, item condition rules, damaged/incorrect items, refund method per payment type and timing, who pays return shipping |
| Privacy | Your approved privacy policy (data handled: accounts, addresses, orders, uploaded receipts; services used; retention; rights; contact). Have it reviewed for Saudi PDPL |
| Terms | Business name/registration, whether prices include VAT, order acceptance and cancellation, liability, governing law |
| Contact | Customer-service email; optional hours and address |
| Our Story | Your founding story in your own words |
| Footer | Social links (leave empty to hide) |

Once Shipping, Returns, Privacy, Terms and About are complete, add them to `public/sitemap.xml`.

## Also needed before launch (operations decisions, not invented by the site)
- **Bank transfer details:** enter and double-check them in Admin > Settings (the form rejects an invalid Saudi IBAN). The IBAN that was in the old migration file was malformed.
- **Shipping fee:** the database setting `shipping_fee_sar` is 0, so orders currently carry no shipping charge and show "to be confirmed". Decide your policy; to charge a flat fee run `update public.store_settings set value = '25' where key = 'shipping_fee_sar';` (use your own amount).
- **COD fee** is SAR 20 in the database and in the checkout screen.
- **Stock:** enter real quantities in Admin > Inventory (the seed starts at 0).
