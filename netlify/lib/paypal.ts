import { admin } from './server'
export function ppConfig() {
  const e = process.env; const live = e.PAYPAL_ENVIRONMENT === 'live'
  const currency = (e.PAYPAL_CURRENCY || 'USD').toUpperCase()
  const rate = currency === 'SAR' ? 1 : Number(e.PAYPAL_SAR_PER_UNIT || '3.75')
  // Live stays OFF until PAYPAL_LIVE_APPROVED=true is set deliberately.
  const enabled = Boolean(e.PAYPAL_CLIENT_ID && e.PAYPAL_CLIENT_SECRET) && (!live || e.PAYPAL_LIVE_APPROVED === 'true') && rate > 0
  return { enabled, live, currency, rate, base: live ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com' }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function ppFetch(path: string, init: { method?: string; body?: unknown; requestId?: string } = {}): Promise<{ ok: boolean; status: number; json: any }> {
  const c = ppConfig(); const e = process.env
  const basic = Buffer.from(`${e.PAYPAL_CLIENT_ID}:${e.PAYPAL_CLIENT_SECRET}`).toString('base64')
  const t = await fetch(`${c.base}/v1/oauth2/token`, { method: 'POST', headers: { authorization: `Basic ${basic}`, 'content-type': 'application/x-www-form-urlencoded' }, body: 'grant_type=client_credentials' })
  if (!t.ok) throw new Error('paypal_auth')
  const { access_token } = (await t.json()) as { access_token: string }
  const res = await fetch(`${c.base}${path}`, { method: init.method ?? 'GET', headers: { authorization: `Bearer ${access_token}`, 'content-type': 'application/json', ...(init.requestId ? { 'PayPal-Request-Id': init.requestId } : {}) }, body: init.body === undefined ? undefined : JSON.stringify(init.body) })
  return { ok: res.ok, status: res.status, json: await res.json().catch(() => ({})) }
}
// Records the outcome only through the database function, which re-checks reference, amount and currency.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function settle(orderId: string, order: any): Promise<string> {
  const cap = order?.purchase_units?.[0]?.payments?.captures?.[0]
  if (!cap) return 'pending'
  const { data, error } = await admin().rpc('apply_paypal_result', { p_order: orderId, p_ref: order.id, p_capture: cap.id, p_status: cap.status, p_amount: Number(cap.amount.value), p_currency: cap.amount.currency_code })
  if (error) throw new Error(error.message)
  return data as string
}
