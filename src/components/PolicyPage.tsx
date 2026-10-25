import { Link } from 'react-router-dom'
import PageTitle from './PageTitle'
import type { PolicyDoc } from '../content/siteContent'
export default function PolicyPage({ doc }: { doc: PolicyDoc }) {
  const incomplete = doc.sections.some(s => !s.body)
  return (
    <article className="mx-auto max-w-3xl px-5 py-16 md:py-24">
      <PageTitle text={`${doc.title} — AUVDAHL`} description={doc.description} path={doc.path} noindex={incomplete} />
      <h1 className="text-4xl text-champagne md:text-5xl">{doc.title}</h1>
      <div className="hairline mt-6" />
      {doc.intro && <p className="mt-8 text-ivory/80">{doc.intro}</p>}
      <div className="mt-10 space-y-10">
        {doc.sections.map(s => (
          <section key={s.heading}>
            <h2 className="text-2xl text-champagne">{s.heading}</h2>
            {s.body ? <div className="prose-lux mt-3">{s.body.map(p => <p key={p}>{p}</p>)}</div> : (
              <div role="note" className="mt-3 border border-dashed border-gold/50 bg-midnight p-4 text-sm text-taupe">
                <p className="font-medium text-champagne">Content required from AUVDAHL</p>
                <p className="mt-1">{s.needed}</p>
              </div>
            )}
          </section>
        ))}
      </div>
      <p className="mt-14 text-sm text-taupe">Questions? <Link to="/contact" className="text-champagne underline underline-offset-4">Contact us</Link>.</p>
    </article>
  )
}
