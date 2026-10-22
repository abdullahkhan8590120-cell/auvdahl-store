import { admin, authUser, json } from '../lib/server'
import { ppConfig, ppFetch } from '../lib/paypal'
import { charge } from '../../src/lib/paypalMath'
export const config = { path: '/api/paypal-create-order' }
export default async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  const cfg = ppConfig(); if (!cfg.enabled) return json({ error: 'PayPal is not available yet.' }, 503)
  const user = await authUser(req); if (!user) return json({ error: 'Please sign in first.' }, 401)
  const { orderId } = (await req.json().catch(() => ({}))) as { orderId?: string }
  const sb = admin()
  const { data: o } = await sb.from('orders').select('id,order_number,user_id,total_sar,payment_method,payment_status,status').eq('id', orderId ?? '').maybeSingle()
  if (!o || o.user_id !== user.id || o.payment_method !== 'paypal' || o.status === 'cancelled' || !['pending', 'failed'].includes(o.payment_status)) return json({ error: 'This order cannot be paid with PayPal.' }, 409)
  const value = charge(Number(o.total_sar), cfg.rate)   // amount comes from the database, never the browser
  const origin = new URL(req.url).origin
  const r = await ppFetch('/v2/checkout/orders', { method: 'POST', requestId: `auv-create-${o.id}-${value}-${cfg.currency}`, body: {
    intent: 'CAPTURE',
    purchase_units: [{ reference_id: o.order_number, custom_id: o.id, invoice_id: o.order_number, description: `AUVDAHL order ${o.order_number}`, amount: { currency_code: cfg.currency, value } }],
    payment_source: { paypal: { experience_context: { brand_name: 'AUVDAHL', user_action: 'PAY_NOW', shipping_preference: 'NO_SHIPPING', return_url: `${origin}/order/${o.id}?paypal=return`, cancel_url: `${origin}/order/${o.id}?paypal=cancel` } } } } })
  const link = (r.json.links ?? []).find((l: { rel: string }) => l.rel === 'payer-action' || l.rel === 'approve')?.href as string | undefined
  if (!r.ok || !r.json.id || !link || !new URL(link).hostname.endsWith('paypal.com')) return json({ error: 'PayPal could not start the payment. Try again.' }, 502)
  const { error } = await sb.rpc('set_paypal_intent', { p_user: user.id, p_order: o.id, p_ref: r.json.id, p_amount: Number(value), p_currency: cfg.currency })
  if (error) return json({ error: 'This order cannot be paid with PayPal.' }, 409)
  return json({ approveUrl: link })
}
