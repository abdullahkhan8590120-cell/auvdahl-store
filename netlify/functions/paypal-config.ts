import { json } from '../lib/server'
import { ppConfig } from '../lib/paypal'
export const config = { path: '/api/paypal-config' }
export default async () => { const c = ppConfig(); return json({ enabled: c.enabled, currency: c.currency, rate: c.rate, sandbox: !c.live }) }
