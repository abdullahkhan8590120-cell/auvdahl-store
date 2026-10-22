import { describe, it, expect } from 'vitest'
import { products } from '../src/lib/products'
describe('catalogue', () => {
  it('has exactly six 50 ml products with specified prices', () => {
    expect(products.map(p => [p.name, p.priceSar, p.sizeMl])).toEqual([['SOLARIS',199,50],['LYRANA',249,50],['NOCTIS',299,50],['AMBREX',349,50],['VANZÉR',279,50],['ZAFFIR',499,50]])
  })
})
