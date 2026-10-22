import { Fragment, useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { callApi } from '../lib/api'
import PageTitle from '../components/PageTitle'

// Column names below come from supabase/migrations 001-003.
type Order = {
  id: string; order_number: string; status: string; payment_status: string; payment_method: string
  total_sar: number; created_at: string; address: Record<string, string> | null
}
type Payment = { order_id: string; method: string; status: string; amount_sar: number; provider_ref: string | null; verified_at: string | null }
type Receipt = { order_id: string; storage_path: string; created_at: string }
type Item = { order_id: string; product_name: string; quantity: number }
type Stock = { product_id: string; quantity_on_hand: number; reserved: number; low_stock_threshold: number }
type Product = { id: string; name: string; price_sar: number; is_active: boolean }

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled']
const label = (s: string) => s.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())
const field = 'border border-gold/30 bg-luxe px-2 py-1 text-sm'

export default function AdminDashboard() {
  const [tab, setTab] = useState<'orders' | 'inventory'>('orders')
  const [orders, setOrders] = useState<Order[]>([])
  const [payments, setPayments] = useState<Record<string, Payment>>({})
  const [receipts, setReceipts] = useState<Record<string, Receipt[]>>({})
  const [items, setItems] = useState<Record<string, Item[]>>({})
  const [stock, setStock] = useState<Stock[]>([])
  const [products, setProducts] = useState<Record<string, Product>>({})
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState('')
  const [open, setOpen] = useState<string | null>(null)
  const [edits, setEdits] = useState<Record<string, string>>({})
  const [receiptLink, setReceiptLink] = useState<{ url: string; order: string } | null>(null)

  const load = useCallback(async () => {
    if (!supabase) return
    setLoading(true)
    const errs: string[] = []
    const o = await supabase.from('orders')
      .select('id,order_number,status,payment_status,payment_method,total_sar,created_at,address')
      .order('created_at', { ascending: false }).limit(100)
    if (o.error) errs.push(`Orders: ${o.error.message}`)
    const list = (o.data ?? []) as Order[]
    setOrders(list)
    const ids = list.map(x => x.id)
    const [p, r, i, s, pr] = await Promise.all([
      ids.length ? supabase.from('payments').select('order_id,method,status,amount_sar,provider_ref,verified_at').in('order_id', ids) : Promise.resolve({ data: [], error: null }),
      ids.length ? supabase.from('payment_receipts').select('order_id,storage_path,created_at').in('order_id', ids).order('created_at', { ascending: false }) : Promise.resolve({ data: [], error: null }),
      ids.length ? supabase.from('order_items').select('order_id,product_name,quantity').in('order_id', ids) : Promise.resolve({ data: [], error: null }),
      supabase.from('inventory').select('product_id,quantity_on_hand,reserved,low_stock_threshold'),
      supabase.from('products').select('id,name,price_sar,is_active').order('sort_order')
    ])
    if (p.error) errs.push(`Payments: ${p.error.message}`)
    if (r.error) errs.push(`Receipts: ${r.error.message}`)
    if (i.error) errs.push(`Order items: ${i.error.message}`)
    if (s.error) errs.push(`Inventory: ${s.error.message}`)
    if (pr.error) errs.push(`Products: ${pr.error.message}`)
    const group = <T extends { order_id: string }>(rows: T[] | null) => (rows ?? []).reduce<Record<string, T[]>>((m, x) => { (m[x.order_id] ??= []).push(x); return m }, {})
    setPayments(Object.fromEntries(((p.data ?? []) as Payment[]).map(x => [x.order_id, x])))
    setReceipts(group((r.data ?? []) as Receipt[]))
    setItems(group((i.data ?? []) as Item[]))
    setStock((s.data ?? []) as Stock[])
    setProducts(Object.fromEntries(((pr.data ?? []) as Product[]).map(x => [x.id, x])))
    setErrors(errs)
    setLoading(false)
  }, [])
  useEffect(() => { void load() }, [load])

  // Every action is performed by the Netlify function, which re-verifies the admin role server-side.
  const run = async (key: string, body: Record<string, unknown>, ok: string): Promise<boolean> => {
    setBusy(key); setNote(''); setErrors([])
    const res = await callApi<{ ok: boolean }>('admin-action', body)
    setBusy('')
    if (!res.ok) { setErrors([res.error]); return false }
    setNote(ok); await load(); return true
  }
  const viewReceipt = async (orderId: string, path: string) => {
    if (!supabase) return
    setBusy('rcpt' + orderId); setReceiptLink(null)
    const { data, error } = await supabase.storage.from('receipts').createSignedUrl(path, 120)
    setBusy('')
    if (error || !data) setErrors([`Receipt: ${error?.message ?? 'could not create a link'}`])
    else setReceiptLink({ url: data.signedUrl, order: orderId })
  }

  const awaiting = orders.filter(o => o.payment_status === 'awaiting_verification').length
  const paidValue = orders.filter(o => o.payment_status === 'paid').reduce((s, o) => s + Number(o.total_sar), 0)
  const lowStock = stock.filter(s => s.quantity_on_hand - s.reserved <= s.low_stock_threshold).length
  const stats: [string, string | number][] = [
    ['Recent orders', orders.length], ['Awaiting bank verification', awaiting],
    ['Paid order value (SAR)', paidValue.toFixed(2)], ['Low-stock products', lowStock]
  ]

  return (
    <section className="mx-auto max-w-7xl px-5 py-16">
      <PageTitle text="Admin Dashboard — AUVDAHL" />
      <p className="text-sm tracking-widest text-gold">AUVDAHL MANAGEMENT</p>
      <h1 className="mt-3 text-4xl gold-text">Admin Dashboard</h1>
      <p className="mt-3 text-ivory/60">Orders, payments and inventory.</p>

      {errors.length > 0 && <div role="alert" className="mt-6 border border-red-400/40 p-4 text-sm text-red-400">{errors.map(e => <p key={e}>{e}</p>)}</div>}
      {note && <p role="status" className="mt-6 text-sm text-champagne">{note}</p>}
      {receiptLink && <p className="mt-3 text-sm"><a href={receiptLink.url} target="_blank" rel="noopener noreferrer" className="underline text-champagne">Open receipt ↗</a> <span className="text-ivory/50">(link expires in 2 minutes)</span></p>}

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(([l, v]) => <div key={l} className="border border-gold/30 bg-luxe p-6"><p className="text-sm text-ivory/60">{l}</p><p className="mt-3 text-3xl text-gold">{v}</p></div>)}
      </div>

      <div className="mt-12 flex gap-3" role="tablist">
        {(['orders', 'inventory'] as const).map(t => <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={tab === t ? 'btn-gold !py-2' : 'btn-line !py-2'}>{t.toUpperCase()}</button>)}
        <button onClick={() => void load()} disabled={loading} className="btn-line !py-2 ml-auto">{loading ? 'LOADING…' : 'REFRESH'}</button>
      </div>

      {tab === 'orders' && <>
        <p className="mt-4 text-xs text-ivory/50">Showing up to 100 recent orders. Figures above are based on these loaded orders, not all-time totals.</p>
        <div className="mt-4 overflow-x-auto border border-gold/20">
          <table className="w-full text-left text-sm">
            <thead className="bg-luxe text-gold"><tr>{['Order', 'Customer', 'Payment', 'Status', 'Total', 'Actions'].map(h => <th key={h} className="p-4">{h}</th>)}</tr></thead>
            <tbody>{orders.map(o => {
              const pay = payments[o.id]; const rc = receipts[o.id] ?? []; const cancelled = o.status === 'cancelled'; const b = (k: string) => busy === k + o.id
              return (
                <Fragment key={o.id}>
                  <tr className="border-t border-gold/20 align-top">
                    <td className="p-4"><button onClick={() => setOpen(open === o.id ? null : o.id)} className="underline" aria-expanded={open === o.id}>{o.order_number}</button><div className="text-xs text-ivory/50">{new Date(o.created_at).toLocaleString('en-GB')}</div></td>
                    <td className="p-4">{o.address?.fullName ?? '—'}<div className="text-xs text-ivory/50">{o.address?.city ?? ''}</div></td>
                    <td className="p-4">{label(o.payment_method)}<div className="text-xs text-ivory/60">{label(o.payment_status)}</div></td>
                    <td className="p-4">
                      <select aria-label={`Status for ${o.order_number}`} value={o.status} disabled={cancelled || Boolean(busy)} className={field}
                        onChange={e => { const s = e.target.value; if (s === 'cancelled' && !window.confirm('Cancel this order and release its reserved stock?')) return; void run('st' + o.id, { action: 'set_status', orderId: o.id, status: s }, `${o.order_number} set to ${label(s)}.`) }}>
                        {STATUSES.map(s => <option key={s} value={s}>{label(s)}</option>)}
                      </select>
                    </td>
                    <td className="p-4 text-gold whitespace-nowrap">SAR {Number(o.total_sar).toFixed(2)}</td>
                    <td className="p-4 space-x-2 space-y-2">
                      {o.payment_method === 'stc_transfer' && o.payment_status === 'awaiting_verification' && !cancelled && <>
                        {rc[0] && <button disabled={Boolean(busy)} onClick={() => void viewReceipt(o.id, rc[0].storage_path)} className="btn-line !px-3 !py-1.5 !text-xs">{b('rcpt') ? '…' : 'RECEIPT'}</button>}
                        <button disabled={Boolean(busy)} onClick={() => window.confirm('Approve this bank transfer as paid?') && void run('v' + o.id, { action: 'verify_transfer', orderId: o.id, approve: true }, `Transfer for ${o.order_number} verified.`)} className="btn-gold !px-3 !py-1.5 !text-xs">APPROVE</button>
                        <button disabled={Boolean(busy)} onClick={() => window.confirm('Reject this transfer? The customer will be asked to contact you.') && void run('v' + o.id, { action: 'verify_transfer', orderId: o.id, approve: false }, `Transfer for ${o.order_number} rejected.`)} className="btn-line !px-3 !py-1.5 !text-xs">REJECT</button>
                      </>}
                      {o.payment_method === 'cod' && o.payment_status === 'pending' && !cancelled &&
                        <button disabled={Boolean(busy)} onClick={() => window.confirm('Mark cash as collected?') && void run('c' + o.id, { action: 'confirm_cod', orderId: o.id }, `Cash collected for ${o.order_number}.`)} className="btn-gold !px-3 !py-1.5 !text-xs">COD COLLECTED</button>}
                    </td>
                  </tr>
                  {open === o.id && <tr className="border-t border-gold/10 bg-luxe/60"><td colSpan={6} className="p-4 text-xs text-ivory/70">
                    <p><span className="text-gold">Items:</span> {(items[o.id] ?? []).map(i => `${i.product_name} × ${i.quantity}`).join(', ') || '—'}</p>
                    <p className="mt-1"><span className="text-gold">Payment record:</span> {pay ? `${label(pay.status)} · SAR ${Number(pay.amount_sar).toFixed(2)}${pay.provider_ref ? ` · ref ${pay.provider_ref}` : ''}${pay.verified_at ? ` · verified ${new Date(pay.verified_at).toLocaleString('en-GB')}` : ''}` : '—'}</p>
                    <p className="mt-1"><span className="text-gold">Contact:</span> {o.address?.mobile ?? '—'} · {[o.address?.street, o.address?.district, o.address?.city].filter(Boolean).join(', ') || '—'}</p>
                    <p className="mt-1"><span className="text-gold">Receipts uploaded:</span> {rc.length}</p>
                  </td></tr>}
                </Fragment>
              )
            })}</tbody>
          </table>
          {!loading && orders.length === 0 && errors.length === 0 && <p className="p-6 text-center text-ivory/60">No orders yet.</p>}
        </div>
      </>}

      {tab === 'inventory' && <div className="mt-6 overflow-x-auto border border-gold/20">
        <table className="w-full text-left text-sm">
          <thead className="bg-luxe text-gold"><tr>{['Product', 'On hand', 'Reserved', 'Available', 'Set on hand'].map(h => <th key={h} className="p-4">{h}</th>)}</tr></thead>
          <tbody>{stock.map(s => {
            const p = products[s.product_id]; const avail = s.quantity_on_hand - s.reserved; const low = avail <= s.low_stock_threshold
            return (
              <tr key={s.product_id} className="border-t border-gold/20">
                <td className="p-4">{p?.name ?? s.product_id}{p && !p.is_active && <span className="ml-2 text-xs text-ivory/50">(inactive)</span>}</td>
                <td className="p-4">{s.quantity_on_hand}</td><td className="p-4">{s.reserved}</td>
                <td className={`p-4 ${low ? 'text-red-400' : ''}`}>{avail}{low ? ' · low' : ''}</td>
                <td className="p-4"><input type="number" min={s.reserved} step={1} inputMode="numeric" aria-label={`New stock for ${p?.name ?? 'product'}`} className={`${field} w-24`} value={edits[s.product_id] ?? ''} placeholder={String(s.quantity_on_hand)} onChange={e => setEdits({ ...edits, [s.product_id]: e.target.value })} />
                  <button disabled={Boolean(busy) || edits[s.product_id] === undefined || edits[s.product_id] === ''} className="btn-line !px-3 !py-1.5 !text-xs ml-2"
                    onClick={() => { const n = Number(edits[s.product_id]); void run('s' + s.product_id, { action: 'adjust_stock', productId: s.product_id, onHand: n }, `${p?.name ?? 'Stock'} updated to ${n}.`).then(done => { if (done) setEdits(e => { const c = { ...e }; delete c[s.product_id]; return c }) }) }}>SAVE</button></td>
              </tr>
            )
          })}</tbody>
        </table>
        {!loading && stock.length === 0 && errors.length === 0 && <p className="p-6 text-center text-ivory/60">No inventory records found.</p>}
      </div>}
    </section>
  )
}
