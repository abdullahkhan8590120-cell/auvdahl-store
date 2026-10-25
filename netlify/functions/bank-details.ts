import { admin, authUser, json } from '../lib/server'
export const config = { path: '/api/bank-details' }
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
// Bank-transfer details are private: returned only to the signed-in owner of a bank-transfer order that is not cancelled.
export default async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  const user = await authUser(req); if (!user) return json({ error: 'Please sign in first.' }, 401)
  const { orderId } = (await req.json().catch(() => ({}))) as { orderId?: string }
  if (!orderId || !UUID.test(orderId)) return json({ error: 'Invalid request.' }, 400)
  const { data, error } = await admin().rpc('get_stc_bank_details', { p_user: user.id, p_order: orderId })
  if (error) return json({ error: 'Bank details are not available for this order.' }, 403)
  return json({ details: data })
}
