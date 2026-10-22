import PageTitle from '../components/PageTitle'
import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { supabase, supabaseConfigured } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { isEmail } from '../lib/validation'
type Mode = 'login' | 'register' | 'forgot' | 'reset'
const titles: Record<Mode, string> = { login: 'Sign in', register: 'Create account', forgot: 'Reset password', reset: 'Choose a new password' }
export default function Auth({ mode }: { mode: Mode }) {
  const { user } = useAuth(); const nav = useNavigate()
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [name, setName] = useState('')
  const [msg, setMsg] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  if (user && mode !== 'reset') return <Navigate to="/account" replace />
  if (!supabaseConfigured || !supabase) return <section className="py-40 text-center px-6"><h1 className="text-3xl gold-text">Accounts are not connected yet</h1><p className="mt-3 text-ivory/60">Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (see docs/SETUP_SUPABASE.md).</p></section>
  const sb = supabase
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setMsg('')
    if (mode !== 'reset' && !isEmail(email)) return setError('Enter a valid email address.')
    if (mode !== 'forgot' && password.length < 8) return setError('Password must be at least 8 characters.')
    if (mode === 'register' && name.trim().length < 3) return setError('Enter your full name.')
    setBusy(true)
    const origin = window.location.origin
    const r = mode === 'login' ? await sb.auth.signInWithPassword({ email, password })
      : mode === 'register' ? await sb.auth.signUp({ email, password, options: { data: { full_name: name.trim() }, emailRedirectTo: `${origin}/account` } })
      : mode === 'forgot' ? await sb.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/reset-password` })
      : await sb.auth.updateUser({ password })
    setBusy(false)
    if (r.error) return setError(r.error.message)
    if (mode === 'register') setMsg('Check your email to confirm your account.')
    else if (mode === 'forgot') setMsg('If that email has an account, a reset link is on its way.')
    else if (mode === 'reset') { setMsg('Password updated.'); setTimeout(() => nav('/account'), 800) }
  }
  const google = () => sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/account` } })
  const input = 'mt-1 w-full border border-gold/30 bg-luxe px-3 py-2.5'
  return (
    <section className="mx-auto max-w-md px-5 py-20">
      <PageTitle text={`${titles[mode]} — AUVDAHL`} />
      <h1 className="text-center text-4xl gold-text">{titles[mode]}</h1>
      <form onSubmit={submit} noValidate className="mt-8 space-y-4">
        {mode === 'register' && <label className="block text-sm">Full name<input value={name} onChange={e => setName(e.target.value)} autoComplete="name" className={input} /></label>}
        {mode !== 'reset' && <label className="block text-sm">Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" className={input} /></label>}
        {mode !== 'forgot' && <label className="block text-sm">{mode === 'reset' ? 'New password' : 'Password'}<input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} className={input} /></label>}
        {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
        {msg && <p role="status" className="text-sm text-champagne">{msg}</p>}
        <button className="btn-gold w-full" disabled={busy}>{busy ? 'PLEASE WAIT' : titles[mode].toUpperCase()}</button>
      </form>
      {(mode === 'login' || mode === 'register') && <button onClick={google} className="btn-line mt-4 w-full">CONTINUE WITH GOOGLE</button>}
      <p className="mt-6 text-center text-sm text-ivory/60 space-x-4">
        {mode !== 'login' && <Link to="/login" className="underline">Sign in</Link>}
        {mode !== 'register' && <Link to="/register" className="underline">Create account</Link>}
        {mode === 'login' && <Link to="/forgot-password" className="underline">Forgot password?</Link>}
      </p>
    </section>
  )
}
