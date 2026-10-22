import PageTitle from '../components/PageTitle'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { products } from '../lib/products'
export default function Shop() {
  const [sp, setSp] = useSearchParams()
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<'default'|'asc'|'desc'>('default')
  const family = sp.get('family') ?? 'All'
  const families = ['All', ...new Set(products.map(p => p.family))]
  const list = useMemo(() => {
    let l = products.filter(p => (family==='All' || p.family===family) && p.name.toLowerCase().includes(q.trim().toLowerCase()))
    if (sort!=='default') l = [...l].sort((a,b) => sort==='asc' ? a.priceSar-b.priceSar : b.priceSar-a.priceSar)
    return l
  }, [family,q,sort])
  return (
    <section className="mx-auto max-w-7xl px-5 py-16">
      <PageTitle text="Shop — AUVDAHL" />
      <h1 className="text-center text-5xl gold-text">The Collection</h1>
      <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Fragrance family">
          {families.map(f => <button key={f} onClick={() => setSp(f==='All'?{}:{family:f})} aria-pressed={family===f} className={`border px-4 py-2 text-xs tracking-[.15em] ${family===f?'border-gold bg-gold/15 text-champagne':'border-gold/30 text-ivory/70'}`}>{f}</button>)}
        </div>
        <div className="flex gap-3">
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search" aria-label="Search perfumes" className="w-40 border border-gold/30 bg-luxe px-3 py-2 text-sm" />
          <select value={sort} onChange={e=>setSort(e.target.value as typeof sort)} aria-label="Sort by price" className="border border-gold/30 bg-luxe px-3 py-2 text-sm">
            <option value="default">Featured</option><option value="asc">Price: low to high</option><option value="desc">Price: high to low</option>
          </select>
        </div>
      </div>
      {list.length ? <div className="mt-10 grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-3">{list.map(p => <ProductCard key={p.slug} p={p} />)}</div>
        : <p className="mt-16 text-center text-ivory/60">No perfumes match. Clear the search or choose All.</p>}
    </section>
  )
}
