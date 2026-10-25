import { useEffect, useLayoutEffect, useState, type ReactNode } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { products } from '../lib/products'
import { contact, socials, whatsapp } from '../content/siteContent'

const links = [['Home', '/'], ['Collection', '/shop'], ['Our Story', '/about'], ['Contact', '/contact']] as const
const info = [['Shipping', '/shipping'], ['Returns', '/returns'], ['Privacy', '/privacy'], ['Terms', '/terms']] as const
const icon = 'h-[22px] w-[22px]'
const Svg = ({ children }: { children: ReactNode }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" className={icon} aria-hidden="true">{children}</svg>
const iconBtn = 'relative inline-flex h-11 w-11 items-center justify-center text-ivory/85 transition-colors hover:text-champagne'

export default function SiteLayout() {
  const [open, setOpen] = useState(false)
  const { count } = useCart()
  const { user, isAdmin, profileError, refreshProfile } = useAuth()
  const { pathname } = useLocation()
  useLayoutEffect(() => { window.scrollTo(0, 0) }, [pathname])
  useEffect(() => { setOpen(false) }, [pathname])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', esc); return () => { window.removeEventListener('keydown', esc); document.body.style.overflow = '' }
  }, [open])
  const onProduct = pathname.startsWith('/product/')
  const navCls = ({ isActive }: { isActive: boolean }) => `relative py-2 text-[13px] tracking-[.22em] transition-colors hover:text-champagne ${isActive ? 'text-champagne' : 'text-ivory/80'}`
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:bg-gold focus:px-4 focus:py-2 focus:text-obsidian">Skip to content</a>
      <header className="sticky top-0 z-40 border-b border-gold/20 bg-obsidian/90 backdrop-blur-md" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="mx-auto grid h-16 max-w-page grid-cols-[1fr_auto] items-center gap-4 px-4 md:h-[76px] md:grid-cols-[1fr_auto_1fr] md:px-8">
          <Link to="/" className="justify-self-start font-serif text-[1.65rem] font-medium tracking-[.34em] text-champagne md:text-3xl" aria-label="AUVDAHL home">AUVDAHL</Link>
          <nav className="hidden items-center gap-10 md:flex" aria-label="Main">
            {links.map(([t, h]) => <NavLink key={h} to={h} end={h === '/'} className={navCls}>{t}</NavLink>)}
          </nav>
          <div className="flex items-center justify-self-end">
            {isAdmin && <NavLink to="/admin" className="mr-3 hidden text-[13px] tracking-[.2em] text-champagne md:inline">ADMIN</NavLink>}
            <Link to="/shop?search=1" className={iconBtn} aria-label="Search the collection"><Svg><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></Svg></Link>
            <Link to={user ? '/account' : '/login'} className={`${iconBtn} hidden sm:inline-flex`} aria-label={user ? 'Your account' : 'Sign in'}><Svg><circle cx="12" cy="8.5" r="3.7" /><path d="M4.5 20c.9-3.6 3.9-5.5 7.5-5.5s6.6 1.9 7.5 5.5" /></Svg></Link>
            <Link to="/cart" className={iconBtn} aria-label={`Cart, ${count} ${count === 1 ? 'item' : 'items'}`}>
              <Svg><path d="M5 8h14l-1.1 12H6.1L5 8Z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></Svg>
              {count > 0 && <span key={count} className="bump absolute right-0.5 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gold px-1 text-[11px] font-medium leading-none text-obsidian">{count}</span>}
            </Link>
            <button type="button" className={`${iconBtn} md:hidden`} aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(o => !o)}>
              <Svg>{open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 8h16M4 16h16" />}</Svg>
            </button>
          </div>
        </div>
      </header>
      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="fixed inset-x-0 bottom-0 top-16 z-30 overflow-y-auto bg-obsidian px-6 pb-10 pt-6 md:hidden" style={{ marginTop: 'env(safe-area-inset-top, 0px)' }}>
          <ul>
            {links.map(([t, h]) => <li key={h} className="border-b border-gold/15"><NavLink to={h} end={h === '/'} className={({ isActive }) => `block py-4 font-serif text-3xl tracking-[.08em] ${isActive ? 'text-champagne' : 'text-ivory'}`}>{t}</NavLink></li>)}
          </ul>
          <div className="mt-8 flex flex-col gap-3 text-sm tracking-[.15em]">
            <Link to={user ? '/account' : '/login'} className="btn-line">{user ? 'YOUR ACCOUNT' : 'SIGN IN'}</Link>
            {user && <Link to="/orders" className="py-2 text-center text-ivory/80">MY ORDERS</Link>}
            {isAdmin && <Link to="/admin" className="py-2 text-center text-champagne">ADMIN DASHBOARD</Link>}
          </div>
        </nav>
      )}
      {user && profileError && <div role="alert" className="border-b border-red-400/30 bg-red-950/60 px-5 py-2 text-center text-xs text-red-200">{profileError} <button onClick={refreshProfile} className="ml-2 underline">Retry</button></div>}
      <main id="main" className="flex-1"><Outlet /></main>

      <footer className="mt-24 border-t border-gold/20 bg-midnight">
        <div className="mx-auto grid max-w-page gap-12 px-5 py-16 md:grid-cols-[1.4fr_1fr_1fr_1.2fr] md:px-8">
          <div>
            <p className="font-serif text-3xl tracking-[.34em] text-champagne">AUVDAHL</p>
            <p className="mt-3 font-serif text-lg italic text-taupe">The art of scent</p>
            <p className="mt-5 max-w-xs text-sm text-ivory/70">Six eaux de parfum, 50 ml each.</p>
          </div>
          <nav aria-label="Footer: shop"><h2 className="text-sm tracking-[.22em] text-gold">Collection</h2>
            <ul className="mt-4 space-y-2 text-sm text-ivory/80">{products.map(p => <li key={p.slug}><Link className="inline-block py-1 hover:text-champagne" to={`/product/${p.slug}`}>{p.name}</Link></li>)}</ul></nav>
          <nav aria-label="Footer: information"><h2 className="text-sm tracking-[.22em] text-gold">Information</h2>
            <ul className="mt-4 space-y-2 text-sm text-ivory/80">
              <li><Link className="inline-block py-1 hover:text-champagne" to="/about">Our Story</Link></li>
              <li><Link className="inline-block py-1 hover:text-champagne" to="/contact">Contact</Link></li>
              {info.map(([t, h]) => <li key={h}><Link className="inline-block py-1 hover:text-champagne" to={h}>{t}</Link></li>)}
            </ul></nav>
          <div><h2 className="text-sm tracking-[.22em] text-gold">Contact</h2>
            <ul className="mt-4 space-y-2 text-sm text-ivory/80">
              <li><a className="inline-block py-1 hover:text-champagne" href={whatsapp()} target="_blank" rel="noopener noreferrer">WhatsApp {contact.whatsappLabel}</a></li>
              {contact.email && <li><a className="inline-block py-1 hover:text-champagne" href={`mailto:${contact.email}`}>{contact.email}</a></li>}
              {socials.map(s => <li key={s.url}><a className="inline-block py-1 hover:text-champagne" href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a></li>)}
            </ul></div>
        </div>
        <div className="border-t border-gold/15 py-6 text-center text-xs text-taupe">© {new Date().getFullYear()} AUVDAHL. All rights reserved.</div>
      </footer>
      <a href={whatsapp()} target="_blank" rel="noopener noreferrer" aria-label="Chat with AUVDAHL on WhatsApp"
         className={`fixed bottom-4 right-4 z-30 h-12 w-12 items-center justify-center bg-gold text-obsidian shadow-lg shadow-black/60 transition-colors hover:bg-champagne md:h-11 md:w-auto md:px-5 ${onProduct ? 'hidden md:inline-flex' : 'inline-flex'}`} style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" className="h-6 w-6 md:hidden" aria-hidden="true"><path d="M4 5.5h16v10.5H9.5L5.5 19.5V16H4V5.5Z" /></svg>
        <span className="hidden text-xs font-medium tracking-[.18em] md:inline">WHATSAPP</span>
      </a>
    </div>
  )
}
