import PageTitle from '../components/PageTitle'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { products, sar } from '../lib/products'
export default function Cart() {
  const c = useCart()
  const items = Object.entries(c.lines).map(([s, q]) => ({ p: products.find(p => p.slug === s)!, q }))
  if (!items.length) return <section className="py-40 text-center"><h1 className="text-4xl gold-text">Your cart is empty</h1><Link to="/shop" className="btn-gold mt-8">BROWSE THE COLLECTION</Link></section>
  return (
    <section className="mx-auto max-w-4xl px-5 py-16">
      <PageTitle text="Cart — AUVDAHL" />
      <h1 className="text-4xl gold-text">Your cart</h1>
      <ul className="mt-8 divide-y divide-gold/20 border-y border-gold/20">
        {items.map(({ p, q }) => (
          <li key={p.slug} className="flex items-center gap-4 py-4">
            <img src={p.image} alt={`${p.name} 50 ml`} width={72} height={90} className="h-24 w-20 bg-[#0c0b0a] object-contain" />
            <div className="flex-1"><Link to={`/product/${p.slug}`} className="text-xl tracking-[.15em] text-champagne">{p.name}</Link><p className="text-sm text-ivory/60">{sar(p.priceSar)} · 50 ml</p></div>
            <input type="number" min={1} max={10} value={q} aria-label={`Quantity for ${p.name}`} onChange={e => c.setQty(p.slug, Number(e.target.value) || 1)} className="w-16 border border-gold/30 bg-luxe px-2 py-2" />
            <button onClick={() => c.remove(p.slug)} className="text-sm text-ivory/60 underline" aria-label={`Remove ${p.name}`}>Remove</button>
          </li>))}
      </ul>
      <p className="mt-6 text-right text-xl">Subtotal <span className="text-gold">{sar(c.subtotal)}</span></p>
      <p className="mt-1 text-right text-xs text-ivory/50">Shipping and payment fees are shown at checkout.</p>
      <div className="mt-8 text-right"><Link to="/checkout" className="btn-gold">CHECKOUT</Link></div>
    </section>
  )
}
