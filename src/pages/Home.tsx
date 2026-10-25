import { Link } from 'react-router-dom'
import PageTitle from '../components/PageTitle'
import ProductCard from '../components/ProductCard'
import ProductImage from '../components/ProductImage'
import Reveal from '../components/Reveal'
import Confidence from '../components/Confidence'
import { products, sar } from '../lib/products'
import { SITE_URL } from '../lib/seo'
import { whatsapp } from '../content/siteContent'

const list = (a: string[]) => a.length < 3 ? a.join(' and ') : `${a.slice(0, -1).join(', ')} and ${a[a.length - 1]}`
const brandSet = (ext: 'avif' | 'webp') => [400, 640, 960, 1254].map(w => `/brand/auvdahl-emblem-${w}.${ext} ${w}w`).join(', ')
const hero = products.find(p => p.flagship) ?? products[products.length - 1]
const cheapest = Math.min(...products.map(p => p.priceSar))

export default function Home() {
  return (
    <>
      <PageTitle text="AUVDAHL — The Art of Scent | Luxury Perfumes Saudi Arabia"
        jsonLd={{ '@context': 'https://schema.org', '@type': 'Organization', name: 'AUVDAHL', url: SITE_URL, slogan: 'The Art of Scent' }} />

      {/* Hero: text on obsidian, photograph shown whole (square, uncropped, never stretched beyond its native 1254 px) */}
      <section className="relative isolate overflow-hidden border-b border-gold/15" aria-label="Introduction">
        <div className="mx-auto grid max-w-[1500px] items-center md:min-h-[min(80vh,780px)] md:grid-cols-[.85fr_1.15fr]">
          <div className="relative z-10 order-2 px-6 pb-16 pt-6 text-center md:order-1 md:py-20 md:pl-10 md:pr-0 md:text-left lg:pl-16">
            <h1 className="hero-in text-[clamp(2.5rem,6.2vw,5.25rem)] font-medium tracking-[.1em] text-ivory">THE ART OF SCENT</h1>
            <div className="hero-in-2 mx-auto mt-7 h-px w-32 bg-gold md:mx-0" />
            <p className="hero-in-2 mt-7 font-serif text-xl italic text-ivory/85 md:text-2xl">Six expressions. One unmistakable signature.</p>
            <div className="hero-in-3 mt-10 flex flex-col items-center gap-5 md:items-start">
              <Link to="/shop" className="btn-gold w-full max-w-xs sm:w-auto">DISCOVER THE COLLECTION</Link>
              <p className="text-sm text-taupe">Eau de parfum · 50 ml · from {sar(cheapest)}</p>
            </div>
          </div>
          <div className="relative order-1 md:order-2">
            <ProductImage slug={hero.slug} name={hero.name} sizes="(min-width:1500px) 760px, (min-width:768px) 56vw, 100vw" eager className="hero-img" />
            <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/4 bg-gradient-to-r from-obsidian to-transparent md:block" />
            <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-obsidian to-transparent md:hidden" />
          </div>
        </div>
      </section>

      <section id="collection" aria-labelledby="sig-h" className="mx-auto max-w-page px-5 py-20 md:px-8 md:py-28">
        <Reveal className="text-center">
          <h2 id="sig-h" className="text-4xl text-champagne md:text-5xl">Signature Fragrances</h2>
          <div className="hairline mx-auto mt-6 w-48" />
          <p className="mx-auto mt-5 max-w-md text-ivory/70">Six eaux de parfum, 50 ml each.</p>
        </Reveal>
        <div className="mt-14 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-8 md:gap-y-16">
          {products.map((p, i) => <Reveal key={p.slug} delay={(i % 3) * 80}><ProductCard p={p} /></Reveal>)}
        </div>
      </section>

      <section aria-labelledby="story-h" className="border-y border-gold/15 bg-midnight">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 md:grid-cols-2 md:gap-16 md:px-8 md:py-28">
          <Reveal>
            <div className="relative mx-auto max-w-[560px]">
              <div aria-hidden className="absolute -inset-3 hidden border border-gold/25 md:block" />
              <picture>
                <source type="image/avif" srcSet={brandSet('avif')} sizes="(min-width:768px) 46vw, 100vw" />
                <source type="image/webp" srcSet={brandSet('webp')} sizes="(min-width:768px) 46vw, 100vw" />
                <img src="/brand/auvdahl-emblem-960.webp" srcSet={brandSet('webp')} sizes="(min-width:768px) 46vw, 100vw" width={1254} height={1254} loading="lazy" decoding="async"
                  alt="The AUVDAHL monogram in gold on black marble, with the words The Art of Scent" className="relative aspect-square w-full object-contain" />
              </picture>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <h2 id="story-h" className="text-4xl text-champagne md:text-5xl">The art of scent</h2>
            <div className="mt-6 h-px w-24 bg-gold" />
            <div className="prose-lux mt-8 max-w-lg">
              <p>AUVDAHL is a collection of six eaux de parfum, each 50 ml, each in its own colour of glass: black, emerald, smoke, amber, cream and midnight blue.</p>
              <p>Every bottle carries the AUVDAHL monogram and the signature of Abdullah Khan.</p>
              <p>Each fragrance is described openly in three layers, top, heart and base, so you know what you are choosing before you order.</p>
            </div>
            <Link to="/about" className="btn-line mt-10">OUR STORY</Link>
          </Reveal>
        </div>
      </section>

      <section aria-labelledby="disc-h" className="mx-auto max-w-page px-5 py-20 md:px-8 md:py-28">
        <Reveal className="text-center">
          <h2 id="disc-h" className="text-4xl text-champagne md:text-5xl">Find your fragrance family</h2>
          <div className="hairline mx-auto mt-6 w-48" />
          <p className="mx-auto mt-5 max-w-lg text-ivory/70">Citrus, floral, woody, amber, gourmand and oud. Choose the family that speaks to you.</p>
        </Reveal>
        <ul className="mt-14 grid gap-5 md:grid-cols-2 md:gap-6">
          {products.map((p, i) => (
            <Reveal as="li" key={p.slug} delay={(i % 2) * 80}>
              <Link to={`/product/${p.slug}`} className="group flex items-center gap-5 border border-gold/15 bg-midnight p-4 transition-colors duration-500 hover:border-gold/60 sm:gap-7 sm:p-5">
                <picture className="shrink-0 overflow-hidden">
                  <source type="image/avif" srcSet={`/products/${p.slug}-detail-380.avif 380w`} sizes="160px" />
                  <img src={`/products/${p.slug}-detail-380.webp`} width={380} height={380} loading="lazy" decoding="async" alt="" className="aspect-square w-28 object-cover transition-transform duration-700 md:group-hover:scale-105 sm:w-40" />
                </picture>
                <div>
                  <h3 className="font-serif text-2xl text-champagne sm:text-3xl">{p.family}</h3>
                  <p className="mt-2 text-sm text-ivory/75">{p.name} opens with {list(p.top.map(n => n.toLowerCase()))}.</p>
                  <p className="mt-3 text-sm text-gold underline underline-offset-4 group-hover:text-champagne">Discover {p.name}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </ul>
      </section>

      <div className="border-t border-gold/15"><Confidence /></div>

      <section className="border-t border-gold/15 py-20 text-center">
        <Reveal>
          <h2 className="text-3xl text-champagne md:text-4xl">Need help choosing?</h2>
          <p className="mt-3 text-ivory/70">Message us on WhatsApp.</p>
          <a href={whatsapp()} target="_blank" rel="noopener noreferrer" className="btn-gold mt-8">CHAT ON WHATSAPP</a>
        </Reveal>
      </section>
    </>
  )
}
