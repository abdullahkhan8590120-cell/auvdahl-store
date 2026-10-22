import { describe, it, expect } from 'vitest'
import { orderTotal, paymentFee } from '../src/lib/pricing'
import { isSaudiMobile, validateAddress } from '../src/lib/validation'
describe('pricing', () => {
  it('adds SAR 20 for COD only', () => { expect(paymentFee('cod')).toBe(20); expect(paymentFee('paypal')).toBe(0); expect(orderTotal(199, 0, 'cod')).toBe(219); expect(orderTotal(199, 0, 'stc_transfer')).toBe(199) })
})
describe('validation', () => {
  it('accepts Saudi mobiles', () => { for (const n of ['0532903358','+966532903358','966 53 290 3358']) expect(isSaudiMobile(n)).toBe(true); expect(isSaudiMobile('0412345678')).toBe(false) })
  it('rejects incomplete addresses', () => { expect(Object.keys(validateAddress({ fullName:'', mobile:'', email:'', region:'', city:'', district:'', street:'', building:'' })).length).toBeGreaterThan(5) })
})
