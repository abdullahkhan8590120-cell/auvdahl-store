import PageTitle from '../components/PageTitle'
import Reveal from '../components/Reveal'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { products } from '../lib/products'
export default function Shop() {
  const [sp, setSp] = useSearchParams()
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<'default'|'asc'|'desc'>('default')
  const searchRef = useRef<HTMLInputElement>(null)
  const family = sp.get('family') ?? 'All'
  const families = ['All', ...new Set(products.map(p => p.family))]
  useEffect(() => { if (sp.get('search')) searchRef.current?.focus() }, [sp])
  const list = useMemo(() => {
    let l = products.filter(p => (family==='All' || p.family===family) && p.name.toLowerCase().includes(q.trim().toLowerCase()))
    if (sort!=='default') l = [...l].sort((a,b) => sort==='asc' ? a.priceSar-b.priceSar : b.priceSar-a.priceSar)
    return l
  }, [family,q,sort])
  return (
    <section className="mx-auto max-w-page px-5 py-16 md:px-8 md:py-24">
      <PageTitle text="The Collection — AUVDAHL" description="Six AUVDAHL eaux de parfum, 50 ml each: Solaris, Lyrana, Noctis, Ambrex, Vanzér and Zaffir." path="/shop" />
      <div className="text-center">
        <h1 className="text-5xl text-champagne md:text-6xl">The Collection</h1>
        <div className="hairline mx-auto mt-6 w-48" />
      </div>
      <div className="mt-12 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Fragrance family">
          {families.map(f => <button key={f} type="button" onClick={() => setSp(f==='All'?{}:{family:f})} aria-pressed={family===f} className={`min-h-[44px] border px-4 text-[13px] tracking-[.14em] transition-colors ${family===f?'border-gold bg-gold/15 text-champagne':'border-gold/30 text-ivory/75 hover:border-gold/60'}`}>{f}</button>)}
        </div>
        <div className="flex gap-3">
          <input ref={searchRef} value={q} onChange={e=>setQ(e.target.value)} placeholder="Search" aria-label="Search perfumes" className="field min-h-[44px] w-full sm:w-44" />
          <select value={sort} onChange={e=>setSort(e.target.value as typeof sort)} aria-label="Sort by price" className="field min-h-[44px] w-auto">
            <option value="default">Featured</option><option value="asc">Price: low to high</option><option value="desc">Price: high to low</option>
          </select>
        </div>
      </div>
      {list.length ? <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-8 md:gap-y-16">{list.map(p => <Reveal key={p.slug}><ProductCard p={p} /></Reveal>)}</div>
        : <p className="mt-16 text-center text-ivory/70">No perfumes match. Clear the search or choose All.</p>}
    </section>
  )
}
