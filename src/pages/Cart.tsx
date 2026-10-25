import PageTitle from '../components/PageTitle'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { products, sar } from '../lib/products'
import ProductImage from '../components/ProductImage'
export default function Cart() {
  const c = useCart()
  const items = Object.entries(c.lines).map(([s, q]) => ({ p: products.find(p => p.slug === s)!, q }))
  if (!items.length) return <section className="py-40 text-center"><PageTitle text="Cart — AUVDAHL" /><h1 className="text-4xl text-champagne">Your cart is empty</h1><Link to="/shop" className="btn-gold mt-8">BROWSE THE COLLECTION</Link></section>
  return (
    <section className="mx-auto max-w-4xl px-5 py-16 md:py-20">
      <PageTitle text="Cart — AUVDAHL" />
      <h1 className="text-4xl text-champagne md:text-5xl">Your cart</h1>
      <div className="hairline mt-6" />
      <ul className="mt-8 divide-y divide-gold/20 border-b border-gold/20">
        {items.map(({ p, q }) => (
          <li key={p.slug} className="flex flex-wrap items-center gap-4 py-5 sm:flex-nowrap">
            <Link to={`/product/${p.slug}`} className="w-24 shrink-0 border border-gold/20 bg-midnight sm:w-28" aria-label={`View ${p.name}`}><ProductImage slug={p.slug} name={p.name} sizes="112px" /></Link>
            <div className="min-w-0 flex-1"><Link to={`/product/${p.slug}`} className="text-xl tracking-[.15em] text-champagne">{p.name}</Link><p className="text-sm text-ivory/70">{sar(p.priceSar)} · 50 ml</p></div>
            <input type="number" min={1} max={10} value={q} aria-label={`Quantity for ${p.name}`} onChange={e => c.setQty(p.slug, Number(e.target.value) || 1)} className="field min-h-[44px] w-20" />
            <button onClick={() => c.remove(p.slug)} className="min-h-[44px] px-2 text-sm text-ivory/70 underline underline-offset-4 hover:text-champagne" aria-label={`Remove ${p.name}`}>Remove</button>
          </li>))}
      </ul>
      <p className="mt-6 text-right text-xl">Subtotal <span className="text-gold">{sar(c.subtotal)}</span></p>
      <p className="mt-1 text-right text-xs text-ivory/60">Shipping and payment fees are shown at checkout.</p>
      <div className="mt-8 text-right"><Link to="/checkout" className="btn-gold w-full sm:w-auto">CHECKOUT</Link></div>
    </section>
  )
}
