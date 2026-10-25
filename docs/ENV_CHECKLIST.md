# Environment variables (never put real values in Git, in a ZIP or in a chat)

Set them in **Netlify > Site configuration > Environment variables**. Mark secrets as secret values. After changing any variable, trigger a new deploy.

## Needed for the shop to work
| Variable | Where from | Notes |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase > Project Settings > API > Project URL | Public (built into the site) |
| `VITE_SUPABASE_ANON_KEY` | Same page, anon / publishable key | Public by design. Never use the service_role key here |
| `SUPABASE_URL` | Same Project URL | Server only |
| `SUPABASE_SERVICE_ROLE_KEY` | Same page, service_role key | **Secret. Server only.** Never prefix with VITE_ |

## Optional
| Variable | Default | Notes |
|---|---|---|
| `VITE_WHATSAPP_NUMBER` | 966532903358 | Digits only, with country code |
| `VITE_SITE_URL` | https://auvdahl-store.netlify.app | Change only if you add a custom domain |

## PayPal (leave all unset to keep PayPal switched off; checkout then shows "not available yet")
`PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` (secret), `PAYPAL_ENVIRONMENT` (`sandbox` first), `PAYPAL_WEBHOOK_ID`, `PAYPAL_CURRENCY` (default USD), `PAYPAL_SAR_PER_UNIT` (default 3.75), `PAYPAL_LIVE_APPROVED` (`true` only when you deliberately go live). Webhook URL to register at PayPal: `https://auvdahl-store.netlify.app/api/paypal-webhook` with events PAYMENT.CAPTURE.COMPLETED, PENDING and DENIED.

## Not used
`RESEND_API_KEY`, `EMAIL_FROM`, `ADMIN_NOTIFICATION_EMAIL`: no emails are sent yet.

## Supabase dashboard settings (Authentication > URL Configuration)
Site URL `https://auvdahl-store.netlify.app`. Redirect URLs: `https://auvdahl-store.netlify.app/**`, `https://*--auvdahl-store.netlify.app/**` (branch/deploy previews), `http://localhost:5173/**`.
