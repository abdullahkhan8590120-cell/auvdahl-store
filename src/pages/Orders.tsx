import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import PageTitle from '../components/PageTitle'
import { payLabel, statusLabel } from './OrderDetail'
interface Row { id: string; order_number: string; status: string; payment_status: string; total_sar: number; created_at: string }
export default function Orders() {
  const { user, loading } = useAuth(); const [rows, setRows] = useState<Row[] | null>(null)
  useEffect(() => { if (supabase && user) void supabase.from('orders').select('id,order_number,status,payment_status,total_sar,created_at').order('created_at', { ascending: false }).then(r => setRows((r.data ?? []) as Row[])) }, [user])
  if (loading) return <p className="py-40 text-center">Loading…</p>
  if (!user) return <Navigate to="/login" replace state={{ from: window.location.pathname }} />
  return (
    <section className="mx-auto max-w-4xl px-5 py-16"><PageTitle text="My orders — AUVDAHL" />
      <h1 className="text-4xl gold-text">My orders</h1>
      {rows && rows.length === 0 && <p className="mt-6 text-ivory/60">No orders yet. <Link to="/shop" className="underline">Browse the collection</Link></p>}
      <ul className="mt-8 divide-y divide-gold/20 border-y border-gold/20">{rows?.map(o => (
        <li key={o.id}><Link to={`/order/${o.id}`} className="flex flex-wrap items-center justify-between gap-2 py-4 hover:text-champagne"><span className="tracking-[.1em]">{o.order_number}</span><span className="text-sm text-ivory/60">{new Date(o.created_at).toLocaleDateString('en-GB')} · {statusLabel[o.status]} · {payLabel[o.payment_status]}</span><span className="text-gold">SAR {o.total_sar}</span></Link></li>))}</ul>
    </section>
  )
}
