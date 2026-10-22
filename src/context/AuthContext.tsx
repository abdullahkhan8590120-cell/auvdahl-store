import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export type Role = 'customer' | 'admin'
export interface Profile { id: string; full_name: string | null; role: Role }
interface Auth {
  user: User | null
  loading: boolean
  recovery: boolean
  signOut: () => Promise<void>
  /** Row from public.profiles where profiles.id = auth user id (null if none / not signed in). */
  profile: Profile | null
  /** True while the signed-in user's profile row is still being fetched. */
  profileLoading: boolean
  /** Human-readable message if the profile could not be loaded. */
  profileError: string | null
  /** UI hint only. Real authorization is enforced by Supabase RLS and the server functions. */
  isAdmin: boolean
  refreshProfile: () => void
}
const Ctx = createContext<Auth>({
  user: null, loading: false, recovery: false, signOut: async () => {},
  profile: null, profileLoading: false, profileError: null, isAdmin: false, refreshProfile: () => {}
})

// Profile state is tagged with the user id it belongs to, so a stale result can never be shown for another user.
type ProfileState = { userId: string; status: 'loading' | 'ready' | 'error'; profile: Profile | null; error: string | null }

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(Boolean(supabase)); const [recovery, setRecovery] = useState(false)
  const [ps, setPs] = useState<ProfileState | null>(null)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false) })
    const { data } = supabase.auth.onAuthStateChange((ev, s) => { setSession(s); if (ev === 'PASSWORD_RECOVERY') setRecovery(true) })
    return () => data.subscription.unsubscribe()
  }, [])

  const userId = session?.user?.id ?? null

  // Load the role from public.profiles. Keyed on the user id (not the session object) so token refreshes do not refetch.
  useEffect(() => {
    if (!supabase || !userId) { setPs(null); return }
    let active = true
    setPs({ userId, status: 'loading', profile: null, error: null })
    void supabase.from('profiles').select('id,full_name,role').eq('id', userId).maybeSingle().then(({ data, error }) => {
      if (!active) return
      if (error) {
        setPs({ userId, status: 'error', profile: null, error: `Could not load your account profile: ${error.message}` })
      } else {
        setPs({ userId, status: 'ready', profile: (data as Profile | null) ?? null, error: null })
      }
    }, () => {
      if (active) setPs({ userId, status: 'error', profile: null, error: 'Could not load your account profile. Check your connection and try again.' })
    })
    return () => { active = false }
  }, [userId, retry])

  const refreshProfile = useCallback(() => setRetry(n => n + 1), [])
  const mine = ps && ps.userId === userId ? ps : null
  const profileLoading = Boolean(userId) && (!mine || mine.status === 'loading')
  const profile = mine?.status === 'ready' ? mine.profile : null

  return (
    <Ctx.Provider value={{
      user: session?.user ?? null, loading, recovery,
      signOut: async () => { await supabase?.auth.signOut() },
      profile, profileLoading, profileError: mine?.status === 'error' ? mine.error : null,
      isAdmin: profile?.role === 'admin', refreshProfile
    }}>{children}</Ctx.Provider>
  )
}
export const useAuth = () => useContext(Ctx)
