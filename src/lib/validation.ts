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
