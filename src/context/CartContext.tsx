import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { products } from '../lib/products'
type Lines = Record<string, number>
interface Cart { lines: Lines; count: number; subtotal: number; add:(slug:string,q?:number)=>void; setQty:(slug:string,q:number)=>void; remove:(slug:string)=>void; clear:()=>void }
const Ctx = createContext<Cart | null>(null)
const KEY = 'auvdahl-cart'
const MAX_QTY = 10
function load(): Lines { try { const r = JSON.parse(localStorage.getItem(KEY) ?? '{}') as Lines; return Object.fromEntries(Object.entries(r).filter(([s,q]) => products.some(p => p.slug===s) && Number.isInteger(q) && q>0)) } catch { return {} } }
export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<Lines>(load)
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(lines)) } catch { /* storage unavailable */ } }, [lines])
  const value = useMemo<Cart>(() => ({
    lines,
    count: Object.values(lines).reduce((a,b)=>a+b,0),
    subtotal: Object.entries(lines).reduce((s,[slug,q]) => s + (products.find(p=>p.slug===slug)?.priceSar ?? 0)*q, 0),
    add: (slug,q=1) => setLines(l => ({...l,[slug]:Math.min(MAX_QTY,(l[slug]??0)+q)})),
    setQty: (slug,q) => setLines(l => { const n={...l}; if(q<=0) delete n[slug]; else n[slug]=Math.min(MAX_QTY,q); return n }),
    remove: slug => setLines(l => { const n={...l}; delete n[slug]; return n }),
    clear: () => setLines({}),
  }), [lines])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
export function useCart() { const c = useContext(Ctx); if (!c) throw new Error('useCart outside CartProvider'); return c }
