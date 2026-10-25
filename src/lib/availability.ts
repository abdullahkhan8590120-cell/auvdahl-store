import { useEffect, useState } from 'react'
import { supabase } from './supabase'
// Stock status comes from the database function stock_status() (migration 004). The browser never sees exact quantities.
// 'unknown' = could not be read (function missing, offline, Supabase not configured): the UI then says availability is confirmed at checkout.
export type Stock = 'in' | 'low' | 'out' | 'unknown'
let cache: Record<string, Stock> | null = null
let inflight: Promise<Record<string, Stock>> | null = null
async function load(): Promise<Record<string, Stock>> {
  if (!supabase) return {}
  const { data, error } = await supabase.rpc('stock_status')
  if (error || !Array.isArray(data)) return {}
  const out: Record<string, Stock> = {}
  for (const r of data as { slug: string; status: string }[]) out[r.slug] = r.status === 'in' || r.status === 'low' || r.status === 'out' ? r.status : 'unknown'
  return out
}
export function useAvailability(): { stock: (slug: string) => Stock; loaded: boolean } {
  const [map, setMap] = useState<Record<string, Stock> | null>(cache)
  useEffect(() => {
    if (cache) return
    let live = true
    inflight ??= load().catch(() => ({}))
    inflight.then(m => { cache = m; if (live) setMap(m) })
    return () => { live = false }
  }, [])
  return { stock: slug => map?.[slug] ?? 'unknown', loaded: map !== null }
}
export const stockLabel = (s: Stock) => s === 'in' ? 'In stock' : s === 'low' ? 'Low stock' : s === 'out' ? 'Sold out' : 'Availability confirmed at checkout'
