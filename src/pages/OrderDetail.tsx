import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { callApi } from '../lib/api'
import { whatsappUrl } from '../lib/whatsapp'
import { charge } from '../lib/paypalMath'
import PageTitle from '../components/PageTitle'
export const statusLabel: Record<string, string> = { pending: 'Pending', confirmed: 'Confirmed', processing: 'Processing', shipped: 'Shipped', out_for_delivery: 'Out for delivery', delivered: 'Delivered', cancelled: 'Cancelled' }
export const payLabel: Record<string, string> = { pending: 'Payment pending', awaiting_verification: 'Awaiting verification', paid: 'Paid', failed: 'Payment failed', refunded: 'Refunded', cancelled: 'Cancelled' }
const method: Record<string, string> = { cod: 'Cash on Delivery', stc_transfer: 'STC bank transfer', paypal: 'PayPal' }
interface Item { id: string; product_name: string; unit_price_sar: number; quantity: number; line_total_sar: number }
interface Order { id: string; order_number: string; status: string; payment_method: string; payment_status: string; subtotal_sar: number; shipping_sar: number; payment_fee_sar: number; total_sar: number; address: Record<string, string>; created_at: string; order_items: Item[] }
interface Bank { bank_name: string; account_holder: string; iban: string; account_number: string; currency: string }
interface Ev { id: string; note: string; created_at: string }
export default function OrderDetail() {
  const { id } = useParams(); const { user, loading } = useAuth()
  const [o, setO] = useState<Order | null>(null); const [bank, setBank] = useState<Bank | null>(null); const [ev, setEv] = useState<Ev[]>([])
  const [file, setFile] = useState<File | null>(null); const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false); const [missing, setMissing] = useState(false)
  const load = useCallback(async () => {
    if (!supabase || !id) return
    const r = await supabase.from('orders').select('*, order_items(*)').eq('id', id).maybeSingle()
    if (!r.data) return setMissing(true)
    setO(r.data as Order)
    setEv(((await supabase.from('order_events').select('id,note,created_at').eq('order_id', id).order('created_at')).data ?? []) as Ev[])
    if (r.data.payment_method === 'stc_transfer') setBank((await supabase.from('store_settings').select('value').eq('key', 'stc_bank_details').maybeSingle()).data?.value as Bank ?? null)
  }, [id])
  useEffect(() => { if (user) void load() }, [user, load])
  const [pp, setPp] = useState<{ enabled: boolean; currency: string; rate: number; sandbox: boolean } | null>(null); const ppDone = useRef(false)
  useEffect(() => { fetch('/api/paypal-config').then(r => r.json()).then(setPp).catch(() => setPp(null)) }, [])
  useEffect(() => {
    const st = new URLSearchParams(window.location.search).get('paypal')
    if (st === 'cancel') setMsg('PayPal payment was cancelled. Your order is still open and you can try again.')
    if (st === 'return' && user && id && !ppDone.current) {
      ppDone.current = true; setMsg('Confirming your PayPal payment…')
      void callApi<{ status: string }>('paypal-capture', { orderId: id }).then(r => {
        setMsg(!r.ok ? r.error : r.data.status === 'paid' ? 'Payment confirmed. Thank you.' : r.data.status === 'pending' ? 'PayPal is still processing your payment. Your order updates when it completes.' : 'The payment did not complete. You can try again.')
        void load(); window.history.replaceState({}, '', `/order/${id}`)
      })
    }
  }, [user, id, load])
  if (loading) return <p className="py-40 text-center">Loading…</p>
  if (!user) return <Navigate to="/login" replace />
  if (missing) return <section className="py-40 text-center"><h1 className="text-3xl gold-text">Order not found</h1><Link to="/orders" className="btn-line mt-8">MY ORDERS</Link></section>
  if (!o) return <p className="py-40 text-center">Loading…</p>
  const copy = (t: string) => navigator.clipboard?.writeText(t).then(() => setMsg('Copied.'))
  const upload = async () => {
    if (!file || !supabase) return
    if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) return setMsg('Upload a JPG, PNG or PDF.')
    if (file.size > 5 * 1024 * 1024) return setMsg('The file must be 5 MB or smaller.')
    setBusy(true); setMsg('')
    const path = `${user.id}/${o.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    const up = await supabase.storage.from('receipts').upload(path, file, { contentType: file.type })
    if (up.error) { setBusy(false); return setMsg('Upload failed. Try again.') }
    const r = await callApi('submit-receipt', { orderId: o.id, path, mime: file.type, size: file.size })
    setBusy(false); if (!r.ok) return setMsg(r.error)
    setFile(null); setMsg('Receipt received. We will verify your transfer.'); void load()
  }
  const payPal = async () => { setBusy(true); const r = await callApi<{ approveUrl: string }>('paypal-create-order', { orderId: o.id }); setBusy(false); if (!r.ok) return setMsg(r.error); window.location.href = r.data.approveUrl }
  const wa = whatsappUrl(`NEW AUVDAHL ORDER\nOrder Number: ${o.order_number}\nTotal: SAR ${o.total_sar}\nPayment Method: ${method[o.payment_method]}\nPayment Status: ${payLabel[o.payment_status]}\nDelivery City: ${o.address.city}`)
  const a = o.address
  return (
    <section className="mx-auto max-w-3xl px-5 py-16"><PageTitle text={`Order ${o.order_number} — AUVDAHL`} />
      <h1 className="text-4xl gold-text">Order {o.order_number}</h1>
      <p className="mt-2 text-sm text-ivory/60">{new Date(o.created_at).toLocaleString('en-GB')} · {statusLabel[o.status]} · {payLabel[o.payment_status]}</p>
      <ul className="mt-8 divide-y divide-gold/20 border-y border-gold/20">{o.order_items.map(i => <li key={i.id} className="flex justify-between py-3 text-sm"><span>{i.product_name} × {i.quantity}</span><span>SAR {i.line_total_sar}</span></li>)}</ul>
      <dl className="mt-4 space-y-1 text-sm text-right">
        <div>Subtotal SAR {o.subtotal_sar}</div><div>Shipping SAR {o.shipping_sar}</div>{o.payment_fee_sar > 0 && <div>Cash on Delivery fee SAR {o.payment_fee_sar}</div>}
        <div className="text-lg text-gold">Total SAR {o.total_sar}</div></dl>
      <h2 className="mt-10 text-2xl text-champagne">Delivery address</h2>
      <p className="mt-2 text-sm text-ivory/80">{a.fullName}, {a.building} {a.street}, {a.district}, {a.city}, {a.region}, Saudi Arabia · {a.mobile}</p>
      <p className="mt-1 text-sm text-ivory/60">Delivery estimate available after confirmation.</p>
      {o.payment_method === 'cod' && <p className="mt-6 text-sm text-ivory/80">Pay SAR {o.total_sar} in cash on delivery. COD stays unpaid until our team confirms collection.</p>}
      {o.payment_method === 'stc_transfer' && bank && (
        <div className="mt-8 border border-gold/30 bg-luxe p-5 text-sm">
          <h2 className="text-2xl text-champagne">Bank transfer</h2>
          <p className="mt-2">Transfer exactly <b className="text-gold">SAR {o.total_sar}</b> and use <b>{o.order_number}</b> as the reference.</p>
          <p className="mt-3">{bank.bank_name} · {bank.account_holder}</p>
          <p className="mt-1">IBAN {bank.iban} <button className="underline ml-2" onClick={() => copy(bank.iban)}>Copy</button></p>
          <p className="mt-1">Account {bank.account_number} <button className="underline ml-2" onClick={() => copy(bank.account_number)}>Copy</button></p>
          {['pending', 'awaiting_verification'].includes(o.payment_status) && o.status !== 'cancelled' && <div className="mt-5">
            <label className="block">Upload your receipt (JPG, PNG or PDF, up to 5 MB)<input type="file" accept="image/jpeg,image/png,application/pdf" onChange={e => setFile(e.target.files?.[0] ?? null)} className="mt-2 block" /></label>
            <button className="btn-gold mt-3" disabled={!file || busy} onClick={upload}>{busy ? 'UPLOADING' : 'SUBMIT RECEIPT'}</button></div>}
          <p className="mt-4 text-xs text-ivory/60">An uploaded receipt is not payment. Your payment is confirmed only after we verify the transfer in our bank account.</p>
        </div>)}
      {o.payment_method === 'paypal' && ['pending', 'failed'].includes(o.payment_status) && o.status !== 'cancelled' && (
        <div className="mt-8 border border-gold/30 bg-luxe p-5 text-sm">
          <h2 className="text-2xl text-champagne">Pay with PayPal</h2>
          {pp?.enabled ? <>
            <p className="mt-2">{pp.currency === 'SAR' ? `PayPal will charge SAR ${o.total_sar}.` : `PayPal will charge ${charge(o.total_sar, pp.rate)} ${pp.currency}, converted from SAR ${o.total_sar} at 1 ${pp.currency} = ${pp.rate} SAR. PayPal or your bank may apply their own rate and fees.`}</p>
            {pp.sandbox && <p className="mt-1 text-xs text-champagne">Test mode: no real money is taken.</p>}
            <button className="btn-gold mt-4" disabled={busy} onClick={payPal}>{busy ? 'PLEASE WAIT' : 'PAY WITH PAYPAL'}</button></> : <p className="mt-2">PayPal is not available yet. Message us on WhatsApp to arrange another payment method.</p>}
        </div>)}
      {msg && <p role="status" className="mt-4 text-sm text-champagne">{msg}</p>}
      <h2 className="mt-10 text-2xl text-champagne">History</h2>
      <ul className="mt-2 space-y-1 text-sm text-ivory/70">{ev.map(e => <li key={e.id}>{new Date(e.created_at).toLocaleString('en-GB')} — {e.note}</li>)}</ul>
      <div className="mt-10 flex flex-wrap gap-3"><a href={wa} target="_blank" rel="noopener noreferrer" className="btn-gold">SEND ORDER DETAILS ON WHATSAPP</a><Link to="/orders" className="btn-line">MY ORDERS</Link></div>
    </section>
  )
}
