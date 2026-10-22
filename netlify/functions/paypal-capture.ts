import { admin, authUser, json } from '../lib/server'
import { ppConfig, ppFetch, settle } from '../lib/paypal'
export const config = { path: '/api/paypal-capture' }
export default async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  if (!ppConfig().enabled) return json({ error: 'PayPal is not available yet.' }, 503)
  const user = await authUser(req); if (!user) return json({ error: 'Please sign in first.' }, 401)
  const { orderId } = (await req.json().catch(() => ({}))) as { orderId?: string }
  const sb = admin()
  const { data: o } = await sb.from('orders').select('id,user_id,payment_method,payments(provider_ref)').eq('id', orderId ?? '').maybeSingle()
  const pay = Array.isArray(o?.payments) ? o?.payments[0] : o?.payments
  if (!o || o.user_id !== user.id || o.payment_method !== 'paypal' || !pay?.provider_ref) return json({ error: 'No PayPal payment to confirm for this order.' }, 409)
  try {
    // Idempotent capture: the same request id returns the same result and cannot charge twice.
    let r = await ppFetch(`/v2/checkout/orders/${pay.provider_ref}/capture`, { method: 'POST', requestId: `auv-capture-${o.id}`, body: {} })
    if (!r.ok && JSON.stringify(r.json).includes('ORDER_ALREADY_CAPTURED')) r = await ppFetch(`/v2/checkout/orders/${pay.provider_ref}`)
    if (!r.ok) return json({ status: 'failed' })   // e.g. buyer never approved; nothing is marked paid
    if (r.json.purchase_units?.[0]?.custom_id !== o.id) return json({ error: 'Payment reference mismatch.' }, 409)
    const status = await settle(o.id, r.json)
    if (status === 'mismatch' || status === 'review') return json({ error: 'We could not verify this payment automatically. Contact us on WhatsApp with your order number.' }, 409)
    return json({ status })
  } catch { return json({ error: 'We could not confirm the payment. Do not pay again; contact us if you were charged.' }, 502) }
}
