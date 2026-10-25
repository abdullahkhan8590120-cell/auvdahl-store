import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Reveal from './Reveal'
import { whatsapp } from '../content/siteContent'
// Only facts the checkout actually implements. PayPal is listed only if the server reports it as enabled.
export default function Confidence() {
  const [paypal, setPaypal] = useState(false)
  useEffect(() => { fetch('/api/paypal-config').then(r => r.json()).then((j: { enabled?: boolean }) => setPaypal(Boolean(j.enabled))).catch(() => setPaypal(false)) }, [])
  const items: { h: string; t: string; to?: string; link?: string; ext?: boolean }[] = [
    { h: 'Cash on delivery', t: 'Pay when your order arrives. A fee of SAR 20 applies.' },
    { h: 'STC bank transfer', t: 'Transfer the amount and upload your receipt. Your order is marked paid once the payment is verified.' },
    ...(paypal ? [{ h: 'PayPal', t: 'Pay with PayPal. The amount that will be charged is shown before you pay.' }] : []),
    { h: 'Delivery in Saudi Arabia', t: 'Shipping cost is confirmed with your order.', to: '/shipping', link: 'Shipping information' },
    { h: 'Help from our team', t: 'Ask about any fragrance on WhatsApp.', to: whatsapp(), link: 'Chat on WhatsApp', ext: true },
  ]
  return (
    <section aria-labelledby="confidence-h" className="mx-auto max-w-page px-5 py-20 md:px-8 md:py-24">
      <Reveal><h2 id="confidence-h" className="text-center text-3xl text-champagne md:text-4xl">Ordering with AUVDAHL</h2><div className="hairline mx-auto mt-6 w-48" /></Reveal>
      <ul className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(210px,1fr))]">
        {items.map((i, k) => (
          <Reveal as="li" key={i.h} delay={k * 70} className="border-t border-gold/30 pt-5">
            <h3 className="font-serif text-xl text-champagne">{i.h}</h3>
            <p className="mt-2 text-sm text-ivory/75">{i.t}</p>
            {i.to && (i.ext
              ? <a href={i.to} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block py-1 text-sm text-gold underline underline-offset-4 hover:text-champagne">{i.link}</a>
              : <Link to={i.to} className="mt-3 inline-block py-1 text-sm text-gold underline underline-offset-4 hover:text-champagne">{i.link}</Link>)}
          </Reveal>
        ))}
      </ul>
    </section>
  )
}
