import { describe, it, expect } from 'vitest'
import { charge } from '../src/lib/paypalMath'
describe('PayPal conversion', () => {
  it('converts SAR at a configured rate, rounded to 2 decimals', () => { expect(charge(499, 3.75)).toBe('133.07'); expect(charge(199, 3.75)).toBe('53.07') })
  it('keeps SAR unchanged at rate 1', () => { expect(charge(219, 1)).toBe('219.00') })
})
