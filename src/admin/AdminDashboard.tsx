
import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

type Order = {
  id: string
  order_number: string
  status: string
  payment_status: string
  payment_method: string
  total_sar: number
  created_at: string
}

export default function AdminDashboard() {
  const { user, loading } = useAuth()
  const [checking, setChecking] = useState(true)
  const [allowed, setAllowed] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function load() {
      if (loading) return

      if (!user || !supabase) {
        if (active) setChecking(false)
        return
      }

      setChecking(true)
      setError('')

      const result = await supabase.rpc('is_admin')

      if (!active) return

      if (result.error) {
        setError(result.error.message)
        setChecking(false)
        return
      }

      if (result.data !== true) {
        setAllowed(false)
        setChecking(false)
        return
      }

      setAllowed(true)

      const response = await supabase
        .from('orders')
        .select(
          'id,order_number,status,payment_status,payment_method,total_sar,created_at'
        )
        .order('created_at', { ascending: false })
        .limit(100)

      if (!active) return

      if (response.error) {
        setError(response.error.message)
      } else {
        setOrders((response.data ?? []) as Order[])
      }

      setChecking(false)
    }

    void load()

    return () => {
      active = false
    }
  }, [user, loading])

  if (loading || checking) {
    return <p className="py-32 text-center">Checking admin access...</p>
  }

  if (!user) return <Navigate to="/login" replace />

  if (!allowed) {
    return (
      <section className="py-32 text-center">
        <h1 className="text-3xl gold-text">Access denied</h1>
        <p className="mt-4">{error || 'Admin permission required.'}</p>
        <Link to="/" className="btn-line mt-6">BACK TO STORE</Link>
      </section>
    )
  }

  const pending = orders.filter(
    o => o.payment_status === 'awaiting_verification'
  ).length

  const paidRevenue = orders
    .filter(o => o.payment_status === 'paid')
    .reduce((sum, o) => sum + Number(o.total_sar), 0)

  return (
    <main className="mx-auto max-w-7xl px-5 py-16">
      <p className="text-sm tracking-widest text-gold">
        AUVDAHL MANAGEMENT
      </p>

      <h1 className="mt-3 text-4xl gold-text">
        Admin Dashboard
      </h1>

      <p className="mt-3 text-ivory/60">
        Welcome to your store management dashboard.
      </p>

      {error && (
        <p role="alert" className="mt-6 text-red-400">
          {error}
        </p>
      )}

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {[
          ['Recent orders', orders.length],
          ['Awaiting bank verification', pending],
          ['Paid order value (SAR)', paidRevenue.toFixed(2)]
        ].map(([label, value]) => (
          <div
            key={label}
            className="border border-gold/30 bg-luxe p-6"
          >
            <p className="text-sm text-ivory/60">{label}</p>
            <p className="mt-3 text-3xl text-gold">{value}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-14 text-2xl text-champagne">
        Latest Orders
      </h2>

      <p className="mt-2 text-xs text-ivory/50">
        Showing up to 100 recent orders. Figures above are based
        on these loaded orders, not all-time totals.
      </p>

      <div className="mt-6 overflow-x-auto border border-gold/20">
        <table className="w-full text-left text-sm">
          <thead className="bg-luxe text-gold">
            <tr>
              <th className="p-4">Order</th>
              <th className="p-4">Payment</th>
              <th className="p-4">Status</th>
              <th className="p-4">Total</th>
            </tr>
          </thead>

          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-t border-gold/20">
                <td className="p-4">{order.order_number}</td>
                <td className="p-4">{order.payment_status}</td>
                <td className="p-4">{order.status}</td>
                <td className="p-4 text-gold">
                  SAR {Number(order.total_sar).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {orders.length === 0 && !error && (
          <p className="p-6 text-center text-ivory/60">
            No orders yet.
          </p>
        )}
      </div>
    </main>
  )
}
