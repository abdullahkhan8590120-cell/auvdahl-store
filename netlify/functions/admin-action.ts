import { admin, authUser, json } from '../lib/server'
export const config = { path: '/api/admin-action' }

// Server-side admin actions. The browser only sends a request; this function
//  1) authenticates the caller from their Supabase access token,
//  2) re-checks the admin role in the database (assert_admin),
//  3) calls the SECURITY DEFINER admin_* functions from migration 003, which re-check the role again and write the audit log.
// Nothing here trusts the browser, and the service-role key never leaves the server.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled']
type Body = { action?: string; orderId?: string; productId?: string; approve?: boolean; status?: string; onHand?: number; note?: string }

const MESSAGES: Record<string, string> = {
  not_verifiable: 'This order is not awaiting bank-transfer verification.',
  not_confirmable: 'This order is not a pending cash-on-delivery order.',
  not_updatable: 'This order can no longer be updated.',
  invalid_status: 'Invalid order status.',
  invalid_stock: 'Stock on hand cannot be lower than the reserved quantity.'
}

export default async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  const user = await authUser(req)
  if (!user) return json({ error: 'Please sign in first.' }, 401)
  const b = (await req.json().catch(() => ({}))) as Body
  const sb = admin()

  const gate = await sb.rpc('assert_admin', { p: user.id })
  if (gate.error) return json({ error: 'Administrator permission required.' }, 403)

  const note = typeof b.note === 'string' ? b.note.slice(0, 500) : ''
  let result
  switch (b.action) {
    case 'verify_transfer':
      if (!b.orderId || !UUID.test(b.orderId) || typeof b.approve !== 'boolean') return json({ error: 'Invalid request.' }, 400)
      result = await sb.rpc('admin_verify_transfer', { p_admin: user.id, p_order: b.orderId, p_approve: b.approve, p_note: note }); break
    case 'confirm_cod':
      if (!b.orderId || !UUID.test(b.orderId)) return json({ error: 'Invalid request.' }, 400)
      result = await sb.rpc('admin_confirm_cod', { p_admin: user.id, p_order: b.orderId }); break
    case 'set_status':
      if (!b.orderId || !UUID.test(b.orderId) || !b.status || !STATUSES.includes(b.status)) return json({ error: 'Invalid request.' }, 400)
      result = await sb.rpc('admin_set_status', { p_admin: user.id, p_order: b.orderId, p_status: b.status }); break
    case 'adjust_stock':
      if (!b.productId || !UUID.test(b.productId) || !Number.isInteger(b.onHand) || b.onHand! < 0 || b.onHand! > 100000) return json({ error: 'Enter a whole number of units (0 or more).' }, 400)
      result = await sb.rpc('admin_adjust_stock', { p_admin: user.id, p_product: b.productId, p_on_hand: b.onHand, p_note: note }); break
    default:
      return json({ error: 'Unknown action.' }, 400)
  }
  if (result.error) {
    const code = result.error.message.split(':')[0].trim()
    if (code === 'forbidden') return json({ error: 'Administrator permission required.' }, 403)
    return json({ error: MESSAGES[code] ?? 'The action could not be completed.' }, 409)
  }
  return json({ ok: true })
}
