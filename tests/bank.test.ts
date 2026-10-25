import { describe, it, expect } from 'vitest'
import { isValidSaudiIban, validateBank, normalizeIban } from '../src/lib/validation'
// Build a structurally valid Saudi IBAN (SA + 22 chars, correct mod-97 check digits) without using any real account.
const make = (bban: string) => { const n = (bban + 'SA00').split('').map(c => parseInt(c, 36)).join(''); let r = 0; for (const d of n) r = (r * 10 + Number(d)) % 97; return 'SA' + String(98 - r).padStart(2, '0') + bban }
const GOOD = make('80' + '0'.repeat(10) + '1234567' + '0')
describe('Saudi IBAN validation', () => {
  it('accepts a valid IBAN, with or without spaces and in lower case', () => {
    expect(GOOD).toHaveLength(24)
    expect(isValidSaudiIban(GOOD)).toBe(true)
    expect(isValidSaudiIban(GOOD.replace(/(.{4})/g, '$1 ').toLowerCase())).toBe(true)
    expect(normalizeIban(' sa12 3456 ')).toBe('SA123456')
  })
  it('rejects wrong length, wrong country and a bad checksum', () => {
    expect(isValidSaudiIban(GOOD.slice(0, 23))).toBe(false)
    expect(isValidSaudiIban('AE' + GOOD.slice(2))).toBe(false)
    expect(isValidSaudiIban(GOOD.slice(0, 2) + (GOOD[2] === '9' ? '0' : String(Number(GOOD[2]) + 1)) + GOOD.slice(3))).toBe(false)
    expect(isValidSaudiIban('')).toBe(false)
  })
})
describe('bank details form', () => {
  const ok = { bank_name: 'Example Bank', account_holder: 'Example Holder', iban: GOOD, account_number: '', currency: 'SAR' }
  it('passes with valid details and an optional account number', () => { expect(validateBank(ok)).toEqual({}) })
  it('reports every bad field', () => { expect(Object.keys(validateBank({ bank_name: '', account_holder: '', iban: 'x', account_number: '12', currency: 'SAR' })).sort()).toEqual(['account_holder', 'account_number', 'bank_name', 'iban']) })
})
