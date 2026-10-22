import PageTitle from '../components/PageTitle'
import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { validateAddress, type AddressInput } from '../lib/validation'
interface Addr extends AddressInput { id: string }
const blank: AddressInput = { fullName: '', mobile: '', email: '', region: '', city: '', district: '', street: '', building: '', unit: '', postalCode: '', additionalNumber: '', notes: '' }
const input = 'mt-1 w-full border border-gold/30 bg-luxe px-3 py-2'
export default function Account() {
  const { user, loading, signOut, isAdmin } = useAuth()
  const [name, setName] = useState(''); const [phone, setPhone] = useState(''); const [note, setNote] = useState('')
  const [addrs, setAddrs] = useState<Addr[]>([]); const [form, setForm] = useState(blank); const [errs, setErrs] = useState<Record<string, string>>({})
  const load = useCallback(async () => {
    if (!supabase || !user) return
    const p = await supabase.from('profiles').select('full_name,phone').eq('id', user.id).maybeSingle()
    setName(p.data?.full_name ?? ''); setPhone(p.data?.phone ?? '')
    const a = await supabase.from('addresses').select('*').order('created_at', { ascending: false })
    setAddrs((a.data ?? []).map(r => ({ id: r.id, fullName: r.full_name, mobile: r.mobile, email: r.email ?? '', region: r.region, city: r.city, district: r.district, street: r.street, building: r.building })))
  }, [user])
  useEffect(() => { void load() }, [load])
  if (loading) return <p className="py-40 text-center">Loading…</p>
  if (!user) return <Navigate to="/login" replace />
  const saveProfile = async () => { const r = await supabase!.from('profiles').update({ full_name: name.trim(), phone: phone.trim() || null }).eq('id', user.id); setNote(r.error ? r.error.message : 'Profile saved.') }
  const addAddr = async (e: React.FormEvent) => {
    e.preventDefault(); const v = validateAddress(form); setErrs(v); if (Object.keys(v).length) return
    const r = await supabase!.from('addresses').insert({ user_id: user.id, full_name: form.fullName.trim(), mobile: form.mobile.replace(/[\s-]/g, ''), email: form.email, region: form.region, city: form.city, district: form.district, street: form.street, building: form.building, unit: form.unit || null, postal_code: form.postalCode || null, additional_number: form.additionalNumber || null, notes: form.notes || null })
    if (r.error) setNote(r.error.message); else { setForm(blank); void load() }
  }
  const del = async (id: string) => { await supabase!.from('addresses').delete().eq('id', id); void load() }
  const f = (k: keyof AddressInput, label: string) => <label className="block text-sm">{label}<input value={form[k] ?? ''} onChange={e => setForm({ ...form, [k]: e.target.value })} className={input} />{errs[k] && <span role="alert" className="text-xs text-red-400">{errs[k]}</span>}</label>
  return (
    <section className="mx-auto max-w-4xl px-5 py-16">
      <PageTitle text="My AUVDAHL" />
      <div className="flex items-center justify-between"><h1 className="text-4xl gold-text">MY AUVDAHL</h1><button onClick={signOut} className="btn-line !py-2">SIGN OUT</button></div>
      <p className="mt-2 text-sm text-ivory/60">{user.email}</p>
      <h2 className="mt-12 text-2xl text-champagne">Personal information</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm">Full name<input value={name} onChange={e => setName(e.target.value)} className={input} /></label><label className="text-sm">Phone<input value={phone} onChange={e => setPhone(e.target.value)} className={input} /></label></div>
      <button onClick={saveProfile} className="btn-gold mt-4">SAVE PROFILE</button>
      <h2 className="mt-14 text-2xl text-champagne">Saved addresses</h2>
      {addrs.length === 0 && <p className="mt-3 text-sm text-ivory/60">No saved addresses yet. Add one below.</p>}
      <ul className="mt-4 space-y-3">{addrs.map(a => <li key={a.id} className="flex justify-between gap-4 border border-gold/20 p-4 text-sm"><span>{a.fullName}, {a.building} {a.street}, {a.district}, {a.city}, {a.region} · {a.mobile}</span><button onClick={() => del(a.id)} className="underline text-ivory/60">Delete</button></li>)}</ul>
      <form onSubmit={addAddr} noValidate className="mt-6 grid gap-4 sm:grid-cols-2">
        {f('fullName', 'Full name')}{f('mobile', 'Mobile (05XXXXXXXX)')}{f('email', 'Email')}{f('region', 'Region')}{f('city', 'City')}{f('district', 'District')}{f('street', 'Street name')}{f('building', 'Building number')}{f('unit', 'Unit (optional)')}{f('postalCode', 'Postal code (optional)')}{f('additionalNumber', 'Additional number (optional)')}
        <button className="btn-line sm:col-span-2">ADD ADDRESS</button>
      </form>
      {note && <p role="status" className="mt-4 text-sm text-champagne">{note}</p>}
      <h2 className="mt-14 text-2xl text-champagne">My orders</h2>
      <Link to="/orders" className="btn-line mt-3">VIEW MY ORDERS</Link>
      {isAdmin && <><h2 className="mt-14 text-2xl text-champagne">Administration</h2><Link to="/admin" className="btn-gold mt-3">OPEN ADMIN DASHBOARD</Link></>}
    </section>
  )
}
