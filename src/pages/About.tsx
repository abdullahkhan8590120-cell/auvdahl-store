import { Link } from 'react-router-dom'
import PageTitle from '../components/PageTitle'
import Reveal from '../components/Reveal'
import { products } from '../lib/products'
// Set to true (and replace the notice below with real text) once the owner supplies the founding story.
const STORY_PROVIDED = false
const set = (ext: 'avif' | 'webp') => [400, 640, 960, 1254].map(w => `/brand/auvdahl-emblem-${w}.${ext} ${w}w`).join(', ')
export default function About() {
  return (
    <article>
      <PageTitle text="Our Story — AUVDAHL" description="AUVDAHL, The Art of Scent: six eaux de parfum, 50 ml each." path="/about" noindex={!STORY_PROVIDED} />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 md:grid-cols-2 md:gap-16 md:px-8 md:py-24">
        <div>
          <h1 className="text-5xl text-champagne md:text-6xl">Our story</h1>
          <div className="mt-6 h-px w-24 bg-gold" />
          <div className="prose-lux mt-8 max-w-lg">
            <p>AUVDAHL is a collection of six eaux de parfum, each 50 ml: Solaris, Lyrana, Noctis, Ambrex, Vanzér and Zaffir.</p>
            <p>Each one belongs to its own scent family, from fresh citrus and floral to woody, amber, gourmand and Arabian oud, and each is presented in its own colour of glass.</p>
            <p>Every bottle carries the AUVDAHL monogram and the signature of Abdullah Khan. Our tagline is the way we think about it: the art of scent.</p>
          </div>
          {!STORY_PROVIDED && (
            <div role="note" className="mt-8 max-w-lg border border-dashed border-gold/50 bg-midnight p-4 text-sm text-taupe">
              <p className="font-medium text-champagne">Content required from AUVDAHL</p>
              <p className="mt-1">Your brand story in your own words: how AUVDAHL began, who creates the fragrances, and what you want customers to know. Only facts you confirm will be published.</p>
            </div>
          )}
          <Link to="/shop" className="btn-gold mt-10">DISCOVER THE COLLECTION</Link>
        </div>
        <Reveal>
          <picture>
            <source type="image/avif" srcSet={set('avif')} sizes="(min-width:768px) 46vw, 100vw" />
            <source type="image/webp" srcSet={set('webp')} sizes="(min-width:768px) 46vw, 100vw" />
            <img src="/brand/auvdahl-emblem-960.webp" srcSet={set('webp')} sizes="(min-width:768px) 46vw, 100vw" width={1254} height={1254} decoding="async" alt="The AUVDAHL monogram in gold on black marble, with the words The Art of Scent" className="aspect-square w-full border border-gold/20 object-contain" />
          </picture>
        </Reveal>
      </div>
      <section className="border-t border-gold/15 bg-midnight">
        <div className="mx-auto max-w-4xl px-5 py-16 md:px-8">
          <h2 className="text-center text-3xl text-champagne md:text-4xl">The six fragrances</h2>
          <ul className="mt-10 divide-y divide-gold/15 border-y border-gold/15">
            {products.map(p => <li key={p.slug}><Link to={`/product/${p.slug}`} className="flex items-baseline justify-between gap-4 py-4 transition-colors hover:text-champagne"><span className="font-serif text-2xl tracking-[.15em] text-champagne">{p.name}</span><span className="text-sm text-taupe">{p.family}</span></Link></li>)}
          </ul>
        </div>
      </section>
    </article>
  )
}
