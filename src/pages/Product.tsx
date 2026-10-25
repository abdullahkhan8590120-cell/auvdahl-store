import PageTitle from '../components/PageTitle'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { products, sar } from '../lib/products'
import { useCart } from '../context/CartContext'
import { useAvailability, stockLabel, type Stock } from '../lib/availability'
import { SITE_URL } from '../lib/seo'
import { whatsappUrl } from '../lib/whatsapp'
import ProductCard from '../components/ProductCard'
import ProductImage from '../components/ProductImage'
import Reveal from '../components/Reveal'

const SCHEMA_AVAIL: Partial<Record<Stock, string>> = { in: 'InStock', low: 'LimitedAvailability', out: 'OutOfStock' }
const dot: Record<Stock, string> = { in: 'bg-emerald-400', low: 'bg-amber-400', out: 'bg-red-400', unknown: 'bg-taupe' }

export default function Product() {
  const { slug } = useParams(); const nav = useNavigate(); const cart = useCart(); const { stock } = useAvailability()
  const p = products.find(x => x.slug === slug)
  const [qty, setQty] = useState(1); const [added, setAdded] = useState(false)
  if (!p) return <section className="py-40 text-center"><PageTitle text="Perfume not found — AUVDAHL" noindex /><h1 className="text-3xl text-champagne">Perfume not found</h1><Link to="/shop" className="btn-line mt-8">BACK TO THE COLLECTION</Link></section>
  const s = stock(p.slug); const out = s === 'out'
  const add = () => { cart.add(p.slug, qty); setAdded(true); setTimeout(() => setAdded(false), 2000) }
  const clamp = (n: number) => setQty(Math.max(1, Math.min(10, n)))
  // Only genuinely distinct photos belong here. There is one approved photo per fragrance today, so no thumbnails are drawn.
  const images = [p.slug]
  const notes: [string, string[]][] = [['Top notes', p.top], ['Heart notes', p.heart], ['Base notes', p.base]]
  const ld = { '@context': 'https://schema.org', '@type': 'Product', name: `AUVDAHL ${p.name} Eau de Parfum 50 ml`, brand: { '@type': 'Brand', name: 'AUVDAHL' }, description: p.description, image: `${SITE_URL}/products/${p.slug}-1254.webp`,
    offers: { '@type': 'Offer', price: String(p.priceSar), priceCurrency: 'SAR', url: `${SITE_URL}/product/${p.slug}`, ...(SCHEMA_AVAIL[s] ? { availability: `https://schema.org/${SCHEMA_AVAIL[s]}` } : {}) } }
  return (
    <section className="mx-auto max-w-page px-5 pb-32 pt-10 md:px-8 md:py-20">
      <PageTitle text={`${p.name} — ${p.family} Eau de Parfum | AUVDAHL`} description={`${p.name} by AUVDAHL: ${p.description} 50 ml, ${sar(p.priceSar)}.`} path={`/product/${p.slug}`} image={`${SITE_URL}/products/${p.slug}-1254.webp`} jsonLd={ld} />
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-taupe"><Link to="/shop" className="hover:text-champagne">Collection</Link> <span aria-hidden>/</span> <span className="text-ivory/80">{p.name}</span></nav>
      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="border border-gold/15 bg-midnight">
            <ProductImage slug={images[0]} name={p.name} sizes="(min-width:1408px) 700px, (min-width:1024px) 52vw, 100vw" eager />
          </div>
          {images.length > 1 && <ul className="mt-3 flex gap-3">{images.map(i => <li key={i}><ProductImage slug={i} name={p.name} sizes="96px" className="w-24" /></li>)}</ul>}
        </div>
        <div>
          <h1 className="text-5xl tracking-[.18em] text-champagne md:text-6xl">{p.name}</h1>
          <p className="mt-3 text-taupe">{p.family} · Eau de parfum · {p.sizeMl} ml</p>
          <p className="mt-5 text-3xl text-gold">{sar(p.priceSar)}</p>
          <div className="hairline mt-6" />
          <p className="mt-6 max-w-xl leading-relaxed text-ivory/85">{p.description}</p>
          <dl className="mt-8 grid gap-5 sm:grid-cols-3">
            {notes.map(([t, n]) => <div key={t} className="border-t border-gold/30 pt-3"><dt className="text-sm text-gold">{t}</dt><dd className="mt-1 text-ivory/85">{n.join(', ')}</dd></div>)}
          </dl>
          <p className="mt-8 flex items-center gap-2 text-sm text-ivory/85" aria-live="polite"><span aria-hidden className={`h-2 w-2 rounded-full ${dot[s]}`} />{stockLabel(s)}</p>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <div className="flex items-center border border-gold/40" role="group" aria-label="Quantity">
              <button type="button" onClick={() => clamp(qty - 1)} disabled={qty <= 1} aria-label="Decrease quantity" className="h-12 w-12 text-xl text-champagne disabled:opacity-30">−</button>
              <span className="w-10 text-center tabular-nums" aria-live="polite">{qty}</span>
              <button type="button" onClick={() => clamp(qty + 1)} disabled={qty >= 10} aria-label="Increase quantity" className="h-12 w-12 text-xl text-champagne disabled:opacity-30">+</button>
            </div>
            <button type="button" className="btn-gold min-w-[12rem] flex-1 sm:flex-none" disabled={out} onClick={add}>{out ? 'SOLD OUT' : added ? 'ADDED TO CART' : 'ADD TO CART'}</button>
            <button type="button" className="btn-line" disabled={out} onClick={() => { cart.add(p.slug, qty); nav('/checkout') }}>BUY NOW</button>
          </div>
          <div className="mt-10 space-y-2 border-t border-gold/20 pt-6 text-sm text-ivory/75">
            <p>Delivery within Saudi Arabia. Shipping cost is confirmed with your order. Cash on Delivery adds SAR 20.</p>
            <p><Link to="/shipping" className="text-gold underline underline-offset-4 hover:text-champagne">Shipping information</Link> · <Link to="/returns" className="text-gold underline underline-offset-4 hover:text-champagne">Returns</Link></p>
            <p><a href={whatsappUrl(`Hello AUVDAHL, I have a question about ${p.name}.`)} target="_blank" rel="noopener noreferrer" className="inline-block py-1 text-champagne underline underline-offset-4">Ask about this fragrance on WhatsApp</a></p>
          </div>
        </div>
      </div>
      <Reveal>
        <h2 className="mt-24 text-center text-3xl text-champagne md:text-4xl">You may also like</h2>
        <div className="hairline mx-auto mt-6 w-48" />
      </Reveal>
      <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-8">{products.filter(x => x.slug !== p.slug).slice(0, 3).map(x => <ProductCard key={x.slug} p={x} />)}</div>

      {/* Mobile purchase bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-4 border-t border-gold/25 bg-obsidian/95 px-4 py-3 backdrop-blur md:hidden" style={{ paddingBottom: 'calc(.75rem + env(safe-area-inset-bottom, 0px))' }}>
        <div className="min-w-0"><p className="truncate font-serif text-lg tracking-[.15em] text-champagne">{p.name}</p><p className="text-sm text-gold">{sar(p.priceSar)}</p></div>
        <button type="button" className="btn-gold ml-auto flex-1 !px-4" disabled={out} onClick={add}>{out ? 'SOLD OUT' : added ? 'ADDED' : 'ADD TO CART'}</button>
      </div>
    </section>
  )
}
