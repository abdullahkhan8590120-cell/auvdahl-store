import { admin, authUser, json } from '../lib/server'
export const config = { path: '/api/submit-receipt' }
const OK = ['image/jpeg', 'image/png', 'application/pdf']
export default async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  const user = await authUser(req); if (!user) return json({ error: 'Please sign in first.' }, 401)
  const b = (await req.json().catch(() => ({}))) as { orderId?: string; path?: string; mime?: string; size?: number }
  if (!b.orderId || !b.path || !b.mime || !OK.includes(b.mime) || !Number.isInteger(b.size) || b.size! <= 0 || b.size! > 5 * 1024 * 1024) return json({ error: 'Upload a JPG, PNG or PDF up to 5 MB.' }, 400)
  const folder = `${user.id}/${b.orderId}`
  if (!b.path.startsWith(folder + '/')) return json({ error: 'Invalid receipt.' }, 400)
  const sb = admin()
  const { data: files } = await sb.storage.from('receipts').list(folder)   // confirm the file really exists
  if (!files?.some(f => `${folder}/${f.name}` === b.path)) return json({ error: 'Receipt file not found. Upload it again.' }, 400)
  const { error } = await sb.rpc('record_receipt', { p_user: user.id, p_order: b.orderId, p_path: b.path, p_mime: b.mime, p_size: b.size })
  if (error) return json({ error: 'This order cannot accept a receipt.' }, 409)
  return json({ ok: true })
}
