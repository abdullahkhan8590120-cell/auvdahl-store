import { admin } from '../lib/server'
export const config = { schedule: '@hourly' }
export default async () => { await admin().rpc('expire_unpaid_orders') }
