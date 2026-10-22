import { json } from '../lib/server'
import { ppConfig, ppFetch, settle } from '../lib/paypal'
export const config = { path: '/api/paypal-webhook' }
export default async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  const webhookId = process.env.PAYPAL_WEBHOOK_ID
  if (!ppConfig().enabled || !webhookId) return json({ error: 'Webhook not configured' }, 503)
  const raw = await req.text(); const h = (n: string) => req.headers.get(n) ?? ''
  let event: { event_type?: string; resource?: { id: string; status: string; custom_id?: string; amount: { value: string; currency_code: string }; supplementary_data?: { related_ids?: { order_id?: string } } } }
  try { event = JSON.parse(raw) } catch { return json({ error: 'Bad request' }, 400) }
  const v = await ppFetch('/v1/notifications/verify-webhook-signature', { method: 'POST', body: { auth_algo: h('paypal-auth-algo'), cert_url: h('paypal-cert-url'), transmission_id: h('paypal-transmission-id'), transmission_sig: h('paypal-transmission-sig'), transmission_time: h('paypal-transmission-time'), webhook_id: webhookId, webhook_event: event } })
  if (!v.ok || v.json.verification_status !== 'SUCCESS') return json({ error: 'Invalid signature' }, 400)
  const r = event.resource; const ref = r?.supplementary_data?.related_ids?.order_id
  if (event.event_type?.startsWith('PAYMENT.CAPTURE.') && r?.custom_id && ref && ['PAYMENT.CAPTURE.COMPLETED', 'PAYMENT.CAPTURE.PENDING', 'PAYMENT.CAPTURE.DENIED'].includes(event.event_type)) {
    try { await settle(r.custom_id, { id: ref, purchase_units: [{ payments: { captures: [{ id: r.id, status: r.status, amount: r.amount }] } }] }) }
    catch { return json({ error: 'Processing failed' }, 500) }   // PayPal will retry
  }
  return json({ ok: true })
}
