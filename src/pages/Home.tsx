
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { products, sar } from '../lib/products'
import { whatsappUrl } from '../lib/whatsapp'
import emblem from '../assets/auvdahl-emblem.webp'

const collection = '/images/auvdahl-collection.png'

export default function Home() {
  const zaffir = products.find(p => p.flagship)!
  const families = [...new Set(products.map(p => p.family))]

  return (
    <>
      <section className="relative isolate overflow-hidden">
        <img
          src={emblem}
          alt=""
          fetchPriority="high"
          className="absolute inset-0 -z-10 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-obsidian via-obsidian/20 to-transparent" />
        <div className="mx-auto flex min-h-[88vh] max-w-3xl flex-col items-center justify-end px-6 pb-14 text-center hero-in">
          <h1 className="sr-only">AUVDAHL — The Art of Scent</h1>
          <p className="max-w-md text-lg text-ivory/90">
            Discover a world where every fragrance tells a story.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link to="/shop" className="btn-gold">
              EXPLORE THE COLLECTION
            </Link>
            <Link to="/about" className="btn-line">
              DISCOVER AUVDAHL
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24">
        <h2 className="text-center text-4xl gold-text">The Collection</h2>
        <p className="mx-auto mt-3 max-w-lg text-center text-ivory/60">
          Six fragrances, each 50 ml.
        </p>
        <div className="mt-12 grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-3">
          {products.map(p => <ProductCard key={p.slug} p={p} />)}
        </div>
      </section>

      <section className="bg-luxe border-y border-gold/20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-20 md:grid-cols-2">
          <img
            src={zaffir.image}
            alt="AUVDAHL ZAFFIR 50 ml Arabian oud perfume"
            loading="lazy"
            className="mx-auto w-64 md:w-80"
          />
          <div>
            <h2 className="text-4xl text-champagne">ZAFFIR</h2>
            <p className="mt-1 text-gold">
              {zaffir.family} · {sar(zaffir.priceSar)}
            </p>
            <p className="mt-5 max-w-md text-ivory/80 leading-relaxed">
              {zaffir.description}
            </p>
            <p className="mt-4 text-sm text-ivory/60">
              Saffron, nutmeg and bergamot open; rose, oud and patchouli follow;
              leather accord, amber and musk remain.
            </p>
            <Link to={`/product/${zaffir.slug}`} className="btn-gold mt-8">
              VIEW ZAFFIR
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-24 text-center">
        <h2 className="text-4xl gold-text">Find your family</h2>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {families.map(f => (
            <Link
              key={f}
              to={`/shop?family=${encodeURIComponent(f)}`}
              className="btn-line !px-6 !py-2.5"
            >
              {f}
            </Link>
          ))}
        </div>
        <img
          src={collection}
          alt="The six AUVDAHL fragrances: Solaris, Lyrana, Noctis, Ambrex, Vanzér and Zaffir, 50 ml each"
          loading="lazy"
          className="mx-auto mt-16 w-full max-w-4xl border border-gold/20"
        />
      </section>

      <section className="border-t border-gold/20 py-20 text-center">
        <h2 className="text-3xl text-champagne">Need help choosing?</h2>
        <p className="mt-3 text-ivory/60">Message us on WhatsApp.</p>
        <a
          href={whatsappUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-gold mt-8"
        >
          CHAT ON WHATSAPP
        </a>
      </section>
    </>
  )
}
