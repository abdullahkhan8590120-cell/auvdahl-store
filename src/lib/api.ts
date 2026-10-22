import { supabase } from './supabase'
type Result<T> = { ok: true; data: T } | { ok: false; error: string }
export async function callApi<T>(fn: string, body: unknown): Promise<Result<T>> {
  const token = (await supabase?.auth.getSession())?.data.session?.access_token
  if (!token) return { ok: false, error: 'Please sign in first.' }
  try {
    const res = await fetch(`/api/${fn}`, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }, body: JSON.stringify(body) })
    const j = (await res.json().catch(() => ({}))) as { error?: string }
    return res.ok ? { ok: true, data: j as T } : { ok: false, error: j.error ?? 'Something went wrong. Try again.' }
  } catch { return { ok: false, error: 'Could not reach the order service.' } }
}
