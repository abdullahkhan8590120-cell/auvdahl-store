import { useEffect, useState, type ReactNode } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

type Check = { userId: string; ok: boolean; error: string | null }

function Notice({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mx-auto max-w-xl px-5 py-32 text-center">
      <h1 className="text-3xl gold-text">{title}</h1>
      <div className="mt-4 text-ivory/70">{children}</div>
    </section>
  )
}

/**
 * UX guard for /admin. It is NOT the security boundary:
 * 1) role is read from public.profiles (id = auth user id),
 * 2) the database itself is then asked via is_admin() (the same function RLS uses),
 * and every admin query/action is independently enforced by RLS / server functions.
 */
export default function AdminRoute({ children }: { children: ReactNode }) {
  const { user, loading, profile, profileLoading, profileError, isAdmin, refreshProfile } = useAuth()
  const location = useLocation()
  const [check, setCheck] = useState<Check | null>(null)
  const [tries, setTries] = useState(0)
  const userId = user?.id ?? null

  useEffect(() => {
    if (!supabase || !userId || !isAdmin) { setCheck(null); return }
    let active = true
    void supabase.rpc('is_admin').then(({ data, error }) => {
      if (!active) return
      setCheck({ userId, ok: data === true, error: error ? error.message : null })
    }, () => { if (active) setCheck({ userId, ok: false, error: 'Could not reach the server to verify admin access.' }) })
    return () => { active = false }
  }, [userId, isAdmin, tries])

  if (!supabase) return <Notice title="Store not configured">Supabase environment variables are missing in this deployment.</Notice>
  if (loading || profileLoading) return <p role="status" className="py-32 text-center">Checking admin access…</p>
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />

  if (profileError) {
    return (
      <Notice title="Could not verify access">
        <p role="alert">{profileError}</p>
        <button onClick={refreshProfile} className="btn-line mt-6">TRY AGAIN</button>
      </Notice>
    )
  }
  if (!profile) {
    return <Notice title="Access denied"><p role="alert">No profile record was found for your account, so admin access cannot be granted.</p><Link to="/" className="btn-line mt-6">BACK TO STORE</Link></Notice>
  }
  if (!isAdmin) {
    return <Notice title="Access denied"><p role="alert">Your account does not have administrator permission.</p><Link to="/" className="btn-line mt-6">BACK TO STORE</Link></Notice>
  }

  const mine = check && check.userId === userId ? check : null
  if (!mine) return <p role="status" className="py-32 text-center">Checking admin access…</p>
  if (mine.error) {
    return <Notice title="Could not verify access"><p role="alert">{mine.error}</p><button onClick={() => { setCheck(null); setTries(n => n + 1) }} className="btn-line mt-6">TRY AGAIN</button></Notice>
  }
  if (!mine.ok) {
    return <Notice title="Access denied"><p role="alert">The server did not confirm administrator permission for this account.</p><Link to="/" className="btn-line mt-6">BACK TO STORE</Link></Notice>
  }
  return <>{children}</>
}
