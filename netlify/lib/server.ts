import { createClient } from '@supabase/supabase-js'
export const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
export function admin() {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY   // server-only; never exposed to the browser
  if (!url || !key) throw new Error('server_not_configured')
  return createClient(url, key, { auth: { persistSession: false } })
}
export async function authUser(req: Request) {
  const token = req.headers.get('authorization')?.replace(/^Bearer /i, '')
  if (!token) return null
  const { data, error } = await admin().auth.getUser(token)
  return error ? null : data.user
}
const FRIENDLY: Record<string, string> = { out_of_stock: 'is out of stock', product_unavailable: 'is not available', invalid_quantity: 'has an invalid quantity' }
export function friendly(msg: string) { const [code, slug] = msg.split(':'); return FRIENDLY[code] ? `${(slug ?? 'An item').toUpperCase()} ${FRIENDLY[code]}.` : null }
