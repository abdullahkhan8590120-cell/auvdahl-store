// ============================================================================
// CONTENT THE OWNER MUST SUPPLY. Nothing here is invented.
// Leave a value as null / [] and the site hides it (or shows a visible
// "content required" notice on policy pages, which are also marked noindex).
// ============================================================================
import { whatsappUrl } from '../lib/whatsapp'

export const contact = {
  email: null as string | null,                 // e.g. 'hello@auvdahl.com'
  whatsappLabel: '+966 53 290 3358',            // matches VITE_WHATSAPP_NUMBER default; change if you change the env var
  hours: null as string | null,                 // e.g. 'Sun–Thu, 10:00–18:00'
  address: null as string | null,
}
export const socials: { label: string; url: string }[] = [
  // { label: 'Instagram', url: 'https://instagram.com/…' },
]
export const whatsapp = whatsappUrl

export interface PolicySection { heading: string; body?: string[]; needed?: string }
export interface PolicyDoc { title: string; path: string; description: string; intro?: string; sections: PolicySection[] }

export const policies: Record<'shipping' | 'returns' | 'privacy' | 'terms', PolicyDoc> = {
  shipping: {
    title: 'Shipping information', path: '/shipping', description: 'Delivery and payment information for AUVDAHL orders.',
    intro: 'What we can state today, based on how our checkout works.',
    sections: [
      { heading: 'Where we deliver', body: ['Checkout currently accepts delivery addresses in Saudi Arabia.'] },
      { heading: 'Shipping cost', body: ['Shipping cost is confirmed with your order.'] },
      { heading: 'Cash on delivery', body: ['A fee of SAR 20 applies to Cash on Delivery orders.'] },
      { heading: 'Delivery time', needed: 'Estimated delivery time per region (e.g. “2–4 working days in Riyadh”).' },
      { heading: 'Carrier and tracking', needed: 'Which courier you use and whether customers receive a tracking number.' },
      { heading: 'Order processing', needed: 'How long it takes to prepare an order before it ships, and any cut-off times.' },
    ],
  },
  returns: {
    title: 'Returns', path: '/returns', description: 'AUVDAHL returns and refunds.',
    sections: [
      { heading: 'Return window', needed: 'Number of days after delivery in which a return is accepted.' },
      { heading: 'Condition of items', needed: 'Whether opened or used fragrances can be returned (sealed/unopened rules).' },
      { heading: 'Damaged or incorrect items', needed: 'What the customer should do and how quickly (e.g. photos within X days).' },
      { heading: 'Refunds', needed: 'Refund method for each payment type (Cash on Delivery, STC bank transfer, PayPal) and timing.' },
      { heading: 'Return shipping', needed: 'Who pays return shipping.' },
    ],
  },
  privacy: {
    title: 'Privacy policy', path: '/privacy', description: 'How AUVDAHL handles personal information.',
    sections: [
      { heading: 'Full privacy policy', needed: 'Your approved privacy policy text. It should cover the data the store handles (account details, delivery addresses, orders, uploaded payment receipts), the services that process it, how long you keep it, customer rights, and a contact for privacy requests. Have it reviewed by a qualified professional for Saudi Arabia (PDPL).' },
    ],
  },
  terms: {
    title: 'Terms and conditions', path: '/terms', description: 'Terms of sale for AUVDAHL.',
    intro: 'Prices on this website are shown in Saudi riyals (SAR).',
    sections: [
      { heading: 'Full terms of sale', needed: 'Your approved terms: business name and registration details, whether prices include VAT, order acceptance and cancellation, payment terms, liability, and governing law. Have them reviewed by a qualified professional.' },
    ],
  },
}
