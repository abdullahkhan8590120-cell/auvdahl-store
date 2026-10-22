import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
interface Auth { user: User | null; loading: boolean; recovery: boolean; signOut: () => Promise<void> }
const Ctx = createContext<Auth>({ user: null, loading: false, recovery: false, signOut: async () => {} })
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(Boolean(supabase)); const [recovery, setRecovery] = useState(false)
  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false) })
    const { data } = supabase.auth.onAuthStateChange((ev, s) => { setSession(s); if (ev === 'PASSWORD_RECOVERY') setRecovery(true) })
    return () => data.subscription.unsubscribe()
  }, [])
  return <Ctx.Provider value={{ user: session?.user ?? null, loading, recovery, signOut: async () => { await supabase?.auth.signOut() } }}>{children}</Ctx.Provider>
}
export const useAuth = () => useContext(Ctx)
