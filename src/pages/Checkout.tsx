import PageTitle from '../components/PageTitle'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { callApi } from '../lib/api'
import { useCart } from '../context/CartContext'
import { products, sar } from '../lib/products'
import { orderTotal, paymentFee, type PaymentMethod } from '../lib/pricing'
import { validateAddress, type AddressInput } from '../lib/validation'
const blank: AddressInput = { fullName:'', mobile:'', email:'', region:'', city:'', district:'', street:'', building:'', unit:'', postalCode:'', additionalNumber:'', notes:'' }
const regions = ['Riyadh','Makkah','Madinah','Eastern Province','Qassim','Asir','Tabuk','Hail','Northern Borders','Jazan','Najran','Al Bahah','Al Jawf']
const methods: [PaymentMethod, string][] = [['cod','Cash on Delivery (+ SAR 20)'],['paypal','PayPal'],['stc_transfer','STC bank transfer']]
export default function Checkout() {
  const c = useCart(); const nav = useNavigate(); const { user } = useAuth()
  const [busy, setBusy] = useState(false); const [ppOn, setPpOn] = useState(false); const keyRef = useRef(crypto.randomUUID())
  const [a, setA] = useState(blank); const [m, setM] = useState<PaymentMethod>('cod'); const [agree, setAgree] = useState(false)
  const [err, setErr] = useState<Record<string,string>>({}); const [msg, setMsg] = useState('')
  useEffect(() => { fetch('/api/paypal-config').then(r => r.json()).then((j: { enabled?: boolean }) => setPpOn(Boolean(j.enabled))).catch(() => setPpOn(false)) }, [])
  const items = Object.entries(c.lines).map(([s, q]) => ({ p: products.find(p => p.slug === s)!, q }))
  if (!items.length) return <section className="py-40 text-center"><h1 className="text-3xl gold-text">Nothing to check out</h1><Link to="/shop" className="btn-gold mt-8">BROWSE THE COLLECTION</Link></section>
  const field = (k: keyof AddressInput, label: string, type = 'text') => (
    <label className="block text-sm">{label}
      <input type={type} value={a[k] ?? ''} onChange={e => setA({ ...a, [k]: e.target.value })} aria-invalid={!!err[k]} className="mt-1 w-full border border-gold/30 bg-luxe px-3 py-2.5" />
      {err[k] && <span role="alert" className="text-xs text-red-400">{err[k]}</span>}
    </label>)
  const place = async (e: React.FormEvent) => {
    e.preventDefault(); const v = validateAddress(a); if (!agree) v.agree = 'Accept the policies to continue.'
    setErr(v); setMsg('')
    if (Object.keys(v).length) return
    if (!user) return setMsg('Please sign in to place your order. Your cart is saved.')
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
          <ul className="mt-4 space-y-1 text-sm">{items.map(({ p, q }) => <li key={p.slug} className="flex justify-between"><span>{p.name} × {q}</span><span>{sar(p.priceSar * q)}</span></li>)}</ul>
          <fieldset className="mt-5 space-y-2"><legend className="text-xs tracking-[.2em] text-gold">PAYMENT</legend>
            {methods.map(([k, l]) => <label key={k} className="flex items-center gap-2 text-sm"><input type="radio" name="pay" disabled={k === 'paypal' && !ppOn} checked={m === k} onChange={() => setM(k)} />{l}{k === 'paypal' && !ppOn ? ' (not available yet)' : ''}</label>)}</fieldset>
          <dl className="mt-5 space-y-1 border-t border-gold/20 pt-4 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{sar(c.subtotal)}</dd></div>
            <div className="flex justify-between"><dt>Payment fee</dt><dd>{sar(paymentFee(m))}</dd></div>
            <div className="flex justify-between"><dt>Shipping</dt><dd>Set at confirmation</dd></div>
            <div className="flex justify-between text-base text-gold"><dt>Total so far</dt><dd>{sar(orderTotal(c.subtotal, 0, m))}</dd></div></dl>
          <label className="mt-4 flex gap-2 text-xs"><input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} />I agree to the Terms, Privacy, Shipping and Returns policies.</label>
          {err.agree && <span role="alert" className="text-xs text-red-400">{err.agree}</span>}
          <button type="submit" disabled={busy} className="btn-gold mt-5 w-full">{busy ? 'PLACING ORDER' : 'PLACE ORDER'}</button>
          {msg && <p role="status" className="mt-3 text-xs text-champagne">{msg}</p>}
        </aside>
      </form>
    </section>
  )
}
