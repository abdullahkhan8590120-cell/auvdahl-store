import { admin, authUser, friendly, json } from '../lib/server'
import { validateAddress, type AddressInput } from '../../src/lib/validation'
export const config = { path: '/api/create-order' }
export default async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  const user = await authUser(req); if (!user) return json({ error: 'Please sign in first.' }, 401)
  let b: { key?: string; method?: string; address?: AddressInput; items?: { slug: string; qty: number }[] }
  try { b = await req.json() } catch { return json({ error: 'Invalid request.' }, 400) }
  if (!b.key || !/^[0-9a-f-]{36}$/i.test(b.key)) return json({ error: 'Invalid request.' }, 400)
  if (!['cod', 'stc_transfer', 'paypal'].includes(b.method ?? '')) return json({ error: 'Choose a supported payment method.' }, 400)
  if (!b.address || Object.keys(validateAddress(b.address)).length) return json({ error: 'Check your delivery details.' }, 400)
  if (!Array.isArray(b.items) || !b.items.every(i => typeof i.slug === 'string' && Number.isInteger(i.qty))) return json({ error: 'Invalid cart.' }, 400)
  // Prices and totals are ignored from the browser: the database computes them.
  const { data, error } = await admin().rpc('create_order', { p_user: user.id, p_key: b.key, p_method: b.method, p_address: b.address, p_items: b.items.map(i => ({ slug: i.slug, qty: i.qty })) })
  if (error) { const f = friendly(error.message); return json({ error: f ?? 'We could not place your order. Please try again.' }, f ? 409 : 500) }
  return json({ orderId: data })
}
