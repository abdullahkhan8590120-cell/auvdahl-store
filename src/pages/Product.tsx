import PageTitle from '../components/PageTitle'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { products, sar } from '../lib/products'
import { useCart } from '../context/CartContext'
import { whatsappUrl } from '../lib/whatsapp'
import ProductCard from '../components/ProductCard'
export default function Product() {
  const { slug } = useParams(); const nav = useNavigate(); const cart = useCart()
  const p = products.find(x => x.slug === slug)
  const [qty, setQty] = useState(1); const [zoom, setZoom] = useState(false); const [added, setAdded] = useState(false)
  if (!p) return <section className="py-40 text-center"><h1 className="text-3xl text-champagne">Perfume not found</h1><Link to="/shop" className="btn-line mt-8">BACK TO SHOP</Link></section>
  const add = () => { cart.add(p.slug, qty); setAdded(true); setTimeout(() => setAdded(false), 2000) }
  const row = (t: string, n: string[]) => <div><dt className="text-xs tracking-[.2em] text-gold">{t}</dt><dd className="mt-1 text-ivory/85">{n.join(', ')}</dd></div>
  return (
    <section className="mx-auto max-w-6xl px-5 py-16">
      <PageTitle text={`${p.name} — AUVDAHL`} />
      <div className="grid gap-12 md:grid-cols-2">
        <button onClick={() => setZoom(z => !z)} aria-label={zoom ? 'Zoom out' : 'Zoom in'} className="overflow-hidden border border-gold/20 bg-[#0c0b0a]">
          <img src={p.image} alt={`AUVDAHL ${p.name} 50 ml perfume bottle`} className={`w-full object-contain transition-transform duration-500 ${zoom ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'}`} />
        </button>
        <div>
          <h1 className="text-5xl tracking-[.2em] text-champagne">{p.name}</h1>
          <p className="mt-2 text-ivory/60">{p.family} · {p.sizeMl} ml</p>
          <p className="mt-4 text-2xl text-gold">{sar(p.priceSar)}</p>
          <p className="mt-6 leading-relaxed text-ivory/80">{p.description}</p>
          <dl className="mt-8 grid gap-4">{row('TOP NOTES',p.top)}{row('HEART NOTES',p.heart)}{row('BASE NOTES',p.base)}</dl>
          <p className="mt-6 text-sm text-ivory/60">Availability is confirmed at checkout. Delivery estimate available after confirmation.</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm">Qty
              <input type="number" min={1} max={10} value={qty} onChange={e => setQty(Math.max(1, Math.min(10, Number(e.target.value) || 1)))} className="w-16 border border-gold/30 bg-luxe px-2 py-2" />
            </label>
            <button className="btn-line" onClick={add}>{added ? 'ADDED' : 'ADD TO CART'}</button>
            <button className="btn-gold" onClick={() => { cart.add(p.slug, qty); nav('/checkout') }}>BUY NOW</button>
          </div>
          <a href={whatsappUrl(`Hello AUVDAHL, I have a question about ${p.name}.`)} target="_blank" rel="noopener noreferrer" className="mt-6 inline-block text-sm text-champagne underline">Ask about this perfume on WhatsApp</a>
        </div>
      </div>
      <h2 className="mt-24 text-center text-3xl gold-text">You may also like</h2>
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">{products.filter(x => x.slug !== p.slug).slice(0, 3).map(x => <ProductCard key={x.slug} p={x} />)}</div>
    </section>
  )
}
