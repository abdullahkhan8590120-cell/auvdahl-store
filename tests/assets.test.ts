import { describe, it, expect } from 'vitest'
import { products } from '../src/lib/products'
// Vite resolves these globs to the files that actually exist, so this fails if an image variant is missing.
const found = new Set(Object.keys(import.meta.glob('../public/products/*.{webp,avif}')).map(k => k.split('/').pop()))
describe('product photography', () => {
  it('has every responsive variant for all six products, in WebP and AVIF', () => {
    for (const p of products) for (const w of [400, 640, 960, 1254]) for (const ext of ['webp', 'avif']) expect(found.has(`${p.slug}-${w}.${ext}`), `${p.slug}-${w}.${ext}`).toBe(true)
  })
  it('has an ingredient detail image per product', () => { for (const p of products) expect(found.has(`${p.slug}-detail-380.webp`)).toBe(true) })
})
describe('catalogue names and notes', () => {
  it('keeps the sixth perfume named ZAFFIR (never ZAFEIR)', () => { expect(products[5].name).toBe('ZAFFIR'); expect(JSON.stringify(products)).not.toMatch(/ZAFEIR/i) })
  it('uses Peony as the LYRANA top note', () => { expect(products.find(p => p.slug === 'lyrana')!.top).toEqual(['Peony', 'Lychee', 'Bergamot']) })
})
