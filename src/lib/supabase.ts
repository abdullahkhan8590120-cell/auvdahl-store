import { createClient } from '@supabase/supabase-js'
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
export const supabaseConfigured = Boolean(url && key)
// Only the public anon key is ever used in the browser. The service-role key lives in Netlify Functions only.
export const supabase = supabaseConfigured ? createClient(url!, key!) : null
