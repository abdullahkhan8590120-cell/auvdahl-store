export const isSaudiMobile = (v: string) => /^(?:\+?966|0)?5\d{8}$/.test(v.replace(/[\s-]/g, ''))
export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
export interface AddressInput { fullName:string; mobile:string; email:string; region:string; city:string; district:string; street:string; building:string; unit?:string; postalCode?:string; additionalNumber?:string; notes?:string }
export function validateAddress(a: AddressInput): Record<string,string> {
  const e: Record<string,string> = {}
  if (a.fullName.trim().length < 3) e.fullName = 'Enter your full name.'
  if (!isSaudiMobile(a.mobile)) e.mobile = 'Enter a Saudi mobile number, e.g. 05XXXXXXXX.'
  if (!isEmail(a.email)) e.email = 'Enter a valid email address.'
  for (const k of ['region','city','district','street','building'] as const) if (!a[k].trim()) e[k] = 'Required.'
  if (a.postalCode && !/^\d{5}$/.test(a.postalCode)) e.postalCode = 'Postal code is 5 digits.'
  if (a.additionalNumber && !/^\d{4}$/.test(a.additionalNumber)) e.additionalNumber = 'Additional number is 4 digits.'
  return e
}

// STC / bank transfer details entered by the admin. Saudi IBAN = "SA" + 22 characters (24 in total) with a valid mod-97 checksum.
export interface BankDetails { bank_name: string; account_holder: string; iban: string; account_number: string; currency: string }
export const normalizeIban = (v: string) => v.replace(/\s+/g, '').toUpperCase()
export function isValidSaudiIban(raw: string): boolean {
  const v = normalizeIban(raw)
  if (!/^SA\d{2}[0-9A-Z]{20}$/.test(v)) return false
  const n = (v.slice(4) + v.slice(0, 4)).split('').map(c => parseInt(c, 36)).join('')
  let r = 0; for (const d of n) r = (r * 10 + Number(d)) % 97   // chunk-safe mod 97
  return r === 1
}
export function validateBank(b: BankDetails): Record<string, string> {
  const e: Record<string, string> = {}
  if (b.bank_name.trim().length < 2 || b.bank_name.length > 80) e.bank_name = 'Enter the bank name.'
  if (b.account_holder.trim().length < 3 || b.account_holder.length > 80) e.account_holder = 'Enter the account holder name.'
  if (!isValidSaudiIban(b.iban)) e.iban = 'Enter a valid Saudi IBAN: SA followed by 22 characters (24 in total).'
  if (b.account_number && !/^[0-9]{6,20}$/.test(b.account_number.replace(/\s+/g, ''))) e.account_number = 'Account number should be 6 to 20 digits.'
  return e
}
