import PageTitle from '../components/PageTitle'
import { contact, whatsapp } from '../content/siteContent'
export default function Contact() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-16 md:py-24">
      <PageTitle text="Contact — AUVDAHL" description="Contact AUVDAHL on WhatsApp." path="/contact" />
      <h1 className="text-5xl text-champagne md:text-6xl">Contact</h1>
      <div className="hairline mt-6" />
      <p className="mt-8 max-w-xl text-ivory/80">Questions about a fragrance or an order? Message us on WhatsApp.</p>
      <dl className="mt-10 space-y-8">
        <div className="border-t border-gold/30 pt-5">
          <dt className="font-serif text-2xl text-champagne">WhatsApp</dt>
          <dd className="mt-2 text-ivory/80">{contact.whatsappLabel}</dd>
          <dd><a href={whatsapp()} target="_blank" rel="noopener noreferrer" className="btn-gold mt-5">CHAT ON WHATSAPP</a></dd>
        </div>
        {contact.email
          ? <div className="border-t border-gold/30 pt-5"><dt className="font-serif text-2xl text-champagne">Email</dt><dd className="mt-2"><a className="text-gold underline underline-offset-4" href={`mailto:${contact.email}`}>{contact.email}</a></dd></div>
          : <div role="note" className="border border-dashed border-gold/50 bg-midnight p-4 text-sm text-taupe"><p className="font-medium text-champagne">Content required from AUVDAHL</p><p className="mt-1">A customer-service email address (set it in src/content/siteContent.ts). Opening hours and a business address can be added the same way if you want them shown.</p></div>}
        {contact.hours && <div className="border-t border-gold/30 pt-5"><dt className="font-serif text-2xl text-champagne">Hours</dt><dd className="mt-2 text-ivory/80">{contact.hours}</dd></div>}
        {contact.address && <div className="border-t border-gold/30 pt-5"><dt className="font-serif text-2xl text-champagne">Address</dt><dd className="mt-2 text-ivory/80">{contact.address}</dd></div>}
      </dl>
    </section>
  )
}
