import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Product } from '../types'
import { sar } from '../lib/products'
import { useCart } from '../context/CartContext'
import { useAvailability } from '../lib/availability'
import ProductImage from './ProductImage'
const SIZES = '(min-width:1408px) 430px, (min-width:768px) 30vw, 46vw'
export default function ProductCard({ p }: { p: Product }) {
  const cart = useCart(); const { stock } = useAvailability(); const s = stock(p.slug); const [added, setAdded] = useState(false)
  const add = () => { cart.add(p.slug, 1); setAdded(true); setTimeout(() => setAdded(false), 1800) }
  return (
    <article className="group flex flex-col">
      <Link to={`/product/${p.slug}`} aria-label={`${p.name}, ${p.family}, ${sar(p.priceSar)}`} className="block overflow-hidden border border-gold/15 bg-midnight transition-colors duration-500 hover:border-gold/60">
        <div className="overflow-hidden"><ProductImage slug={p.slug} name={p.name} sizes={SIZES} className="transition-transform duration-700 ease-out md:group-hover:scale-[1.03]" /></div>
      </Link>
      <div className="flex flex-1 flex-col items-center pt-5 text-center">
        <h3 className="text-xl tracking-[.2em] text-champagne md:text-2xl"><Link to={`/product/${p.slug}`}>{p.name}</Link></h3>
        <p className="mt-1 text-sm text-taupe">{p.family} · {p.sizeMl} ml</p>
        <p className="mt-2 text-gold">{sar(p.priceSar)}</p>
        {(s === 'low' || s === 'out') && <p className="mt-1 text-xs text-taupe">{s === 'low' ? 'Low stock' : 'Sold out'}</p>}
        <button type="button" onClick={add} disabled={s === 'out'} className="btn-line mt-4 w-full max-w-[16rem] !px-4" aria-live="polite">
          {s === 'out' ? 'SOLD OUT' : added ? 'ADDED TO CART' : 'ADD TO CART'}
        </button>
      </div>
    </article>
  )
}
