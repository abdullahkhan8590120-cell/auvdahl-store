import { Link } from 'react-router-dom'
import type { Product } from '../types'
import { sar } from '../lib/products'
export default function ProductCard({ p }: { p: Product }) {
  return (
    <Link to={`/product/${p.slug}`} className="group block border border-gold/20 bg-luxe transition-colors duration-500 hover:border-gold/70">
      <div className="aspect-[4/5] overflow-hidden bg-[#0c0b0a]">
        <img src={p.image} alt={`AUVDAHL ${p.name} 50 ml perfume bottle`} loading="lazy" className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-105" />
      </div>
      <div className="p-5 text-center">
        <h3 className="text-2xl tracking-[.25em] text-champagne">{p.name}</h3>
        <p className="mt-1 text-xs text-ivory/60">{p.family} · {p.sizeMl} ml</p>
        <p className="mt-3 text-sm text-gold">{sar(p.priceSar)}</p>
      </div>
    </Link>
  )
}
