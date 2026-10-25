import PageTitle from '../components/PageTitle'
import ProductImage from '../components/ProductImage'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { callApi } from '../lib/api'
import { supabase } from '../lib/supabase'
import { useCart } from '../context/CartContext'
import { products, sar } from '../lib/products'
import { COD_FEE_SAR, type PaymentMethod } from '../lib/pricing'
import { validateAddress, type AddressInput } from '../lib/validation'
const blank: AddressInput = { fullName:'', mobile:'', email:'', region:'', city:'', district:'', street:'', building:'', unit:'', postalCode:'', additionalNumber:'', notes:'' }
const regions = ['Riyadh','Makkah','Madinah','Eastern Province','Qassim','Asir','Tabuk','Hail','Northern Borders','Jazan','Najran','Al Bahah','Al Jawf']
const methods: [PaymentMethod, string][] = [['cod','Cash on Delivery'],['paypal','PayPal'],['stc_transfer','STC bank transfer']]
export default function Checkout() {
  const c = useCart(); const nav = useNavigate(); const { user } = useAuth()
  const [busy, setBusy] = useState(false); const [ppOn, setPpOn] = useState(false); const keyRef = useRef(crypto.randomUUID())
  const [a, setA] = useState(blank); const [m, setM] = useState<PaymentMethod>('cod'); const [agree, setAgree] = useState(false)
  const [err, setErr] = useState<Record<string,string>>({}); const [msg, setMsg] = useState(''); const [needSignIn, setNeedSignIn] = useState(false)
  // Fees shown here mirror the public store_settings the server uses to price the order (the server remains the source of truth).
  const [fees, setFees] = useState({ ship: 0, cod: COD_FEE_SAR })
  useEffect(() => { if (supabase) void supabase.from('store_settings').select('key,value').in('key', ['shipping_fee_sar', 'cod_fee_sar']).then(({ data }) => { const v = (k: string) => { const n = Number(((data ?? []) as { key: string; value: unknown }[]).find(r => r.key === k)?.value); return Number.isFinite(n) && n >= 0 ? n : undefined }; setFees(f => ({ ship: v('shipping_fee_sar') ?? f.ship, cod: v('cod_fee_sar') ?? f.cod })) }) }, [])
  const [saved, setSaved] = useState<(AddressInput & { id: string })[]>([])
  // Signed-in customers: prefill email and offer their saved addresses (RLS returns only their own rows).
  useEffect(() => {
    if (!user) return
    setA(x => (x.email ? x : { ...x, email: user.email ?? '' }))
    if (!supabase) return
    void supabase.from('addresses').select('*').order('created_at', { ascending: false }).then(({ data }) => setSaved((data ?? []).map(r => ({ id: r.id, fullName: r.full_name, mobile: r.mobile, email: r.email ?? user.email ?? '', region: r.region, city: r.city, district: r.district, street: r.street, building: r.building, unit: r.unit ?? '', postalCode: r.postal_code ?? '', additionalNumber: r.additional_number ?? '', notes: r.notes ?? '' }))))
  }, [user])
  useEffect(() => { fetch('/api/paypal-config').then(r => r.json()).then((j: { enabled?: boolean }) => setPpOn(Boolean(j.enabled))).catch(() => setPpOn(false)) }, [])
  const items = Object.entries(c.lines).map(([s, q]) => ({ p: products.find(p => p.slug === s)!, q }))
  if (!items.length) return <section className="py-40 text-center"><h1 className="text-3xl gold-text">Nothing to check out</h1><Link to="/shop" className="btn-gold mt-8">BROWSE THE COLLECTION</Link></section>
  const field = (k: keyof AddressInput, label: string, type = 'text') => (
    <label className="block text-sm">{label}
      <input type={type} value={a[k] ?? ''} onChange={e => setA({ ...a, [k]: e.target.value })} aria-invalid={!!err[k]} className="mt-1 min-h-[44px] w-full border border-gold/30 bg-luxe px-3 py-2.5" />
      {err[k] && <span role="alert" className="text-xs text-red-400">{err[k]}</span>}
    </label>)
  const place = async (e: React.FormEvent) => {
    e.preventDefault(); const v = validateAddress(a); if (!agree) v.agree = 'Accept the policies to continue.'
    setErr(v); setMsg(''); setNeedSignIn(false)
    if (Object.keys(v).length) return
    if (!user) { setNeedSignIn(true); return }
    setBusy(true)
    const r = await callApi<{ orderId: string }>('create-order', { key: keyRef.current, method: m, address: a, items: items.map(({ p, q }) => ({ slug: p.slug, qty: q })) })
    setBusy(false)
    if (!r.ok) return setMsg(r.error)
    c.clear(); nav(`/order/${r.data.orderId}`)
  }
  return (
    <section className="mx-auto max-w-5xl px-5 py-16">
      <PageTitle text="Checkout — AUVDAHL" />
      <h1 className="text-4xl gold-text">Checkout</h1>
      <form onSubmit={place} noValidate className="mt-10 grid gap-10 md:grid-cols-[1fr_340px]">
        <div className="grid gap-4 sm:grid-cols-2">
          {saved.length > 0 && <label className="block text-sm sm:col-span-2">Use a saved address
            <select defaultValue="" onChange={e => { const f = saved.find(x => x.id === e.target.value); if (f) { const { id: _id, ...rest } = f; setA(rest) } }} className="mt-1 w-full border border-gold/30 bg-luxe px-3 py-2.5">
              <option value="">Enter a new address</option>{saved.map(x => <option key={x.id} value={x.id}>{x.fullName}, {x.street}, {x.city}</option>)}</select></label>}
          {field('fullName','Full name')}{field('mobile','Mobile (05XXXXXXXX)','tel')}
          <div className="sm:col-span-2">{field('email','Email','email')}</div>
          <label className="block text-sm">Region
            <select value={a.region} onChange={e => setA({ ...a, region: e.target.value })} className="mt-1 w-full border border-gold/30 bg-luxe px-3 py-2.5"><option value="">Select</option>{regions.map(r => <option key={r}>{r}</option>)}</select>
            {err.region && <span role="alert" className="text-xs text-red-400">{err.region}</span>}</label>
          {field('city','City')}{field('district','District')}{field('street','Street name')}{field('building','Building number')}{field('unit','Apartment / unit (optional)')}{field('postalCode','Postal code (optional)')}{field('additionalNumber','Additional number (optional)')}
          <div className="sm:col-span-2">{field('notes','Delivery instructions (optional)')}</div>
          <p className="text-xs text-ivory/50 sm:col-span-2">Country: Saudi Arabia</p>
        </div>
        <aside className="h-fit border border-gold/30 bg-luxe p-5">
          <h2 className="text-2xl text-champagne">Order summary</h2>
          <ul className="mt-4 space-y-3 text-sm">{items.map(({ p, q }) => <li key={p.slug} className="flex items-center gap-3"><span className="w-14 shrink-0 border border-gold/20 bg-obsidian"><ProductImage slug={p.slug} name={p.name} sizes="56px" /></span><span className="flex-1">{p.name} × {q}</span><span>{sar(p.priceSar * q)}</span></li>)}</ul>
          <fieldset className="mt-5 space-y-2"><legend className="text-xs tracking-[.2em] text-gold">PAYMENT</legend>
            {methods.map(([k, l]) => <label key={k} className="flex items-center gap-2 text-sm"><input type="radio" name="pay" disabled={k === 'paypal' && !ppOn} checked={m === k} onChange={() => setM(k)} />{l}{k === 'cod' ? ` (+ SAR ${fees.cod})` : ''}{k === 'paypal' && !ppOn ? ' (not available yet)' : ''}</label>)}</fieldset>
          <dl className="mt-5 space-y-1 border-t border-gold/20 pt-4 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{sar(c.subtotal)}</dd></div>
            <div className="flex justify-between"><dt>Payment fee</dt><dd>{sar(m === 'cod' ? fees.cod : 0)}</dd></div>
            <div className="flex justify-between"><dt>Shipping</dt><dd>{fees.ship > 0 ? sar(fees.ship) : 'Set at confirmation'}</dd></div>
            <div className="flex justify-between text-base text-gold"><dt>{fees.ship > 0 ? 'Total' : 'Total so far'}</dt><dd>{sar(c.subtotal + fees.ship + (m === 'cod' ? fees.cod : 0))}</dd></div></dl>
          <label className="mt-4 flex gap-2 text-xs"><input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} />I agree to the <Link to="/terms" target="_blank" className="mx-1 underline">Terms</Link>, <Link to="/privacy" target="_blank" className="mx-1 underline">Privacy</Link>, <Link to="/shipping" target="_blank" className="mx-1 underline">Shipping</Link> and <Link to="/returns" target="_blank" className="mx-1 underline">Returns</Link> policies.</label>
          {err.agree && <span role="alert" className="text-xs text-red-400">{err.agree}</span>}
          <button type="submit" disabled={busy} className="btn-gold mt-5 w-full">{busy ? 'PLACING ORDER' : 'PLACE ORDER'}</button>
          {needSignIn && <p role="alert" className="mt-3 text-sm text-champagne">Sign in to place your order. Your cart is saved. <Link to="/login" state={{ from: '/checkout' }} className="underline">Sign in</Link> or <Link to="/register" state={{ from: '/checkout' }} className="underline">create an account</Link>.</p>}
          {msg && <p role="status" className="mt-3 text-xs text-champagne">{msg}</p>}
        </aside>
      </form>
    </section>
  )
}
