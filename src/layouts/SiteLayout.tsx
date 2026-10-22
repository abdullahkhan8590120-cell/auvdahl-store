import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { whatsappUrl } from '../lib/whatsapp'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import emblem from '../assets/auvdahl-emblem.webp'
const links = [['Shop','/shop'],['About','/about'],['Contact','/contact']] as const
export default function SiteLayout() {
  const [open, setOpen] = useState(false)
  const { count } = useCart()
  const { user, isAdmin, profileError, refreshProfile } = useAuth()
  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-bronze/30 text-center text-xs tracking-[.2em] py-2 text-champagne">SIX SIGNATURE FRAGRANCES · 50 ML EACH</div>
      <header className="sticky top-0 z-40 bg-obsidian/90 backdrop-blur border-b border-gold/20">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-5 h-16">
          <Link to="/" className="flex items-center gap-3" aria-label="AUVDAHL home">
            <img src={emblem} alt="AUVDAHL logo" width={40} height={40} className="h-10 w-10 rounded-full object-cover ring-1 ring-gold/50" />
            <span className="font-serif text-2xl tracking-[.3em] gold-text">AUVDAHL</span>
          </Link>
          <nav className="hidden md:flex gap-10 text-sm tracking-[.15em]" aria-label="Main">
            {links.map(([t,h]) => <NavLink key={h} to={h} className="text-ivory/80 hover:text-champagne transition-colors">{t}</NavLink>)}
          </nav>
          {isAdmin && <NavLink to="/admin" className="hidden md:inline text-sm tracking-[.15em] text-champagne">ADMIN</NavLink>}
          <Link to={user ? '/account' : '/login'} className="text-sm tracking-[.15em] text-ivory/80">{user ? 'ACCOUNT' : 'SIGN IN'}</Link>
          <Link to="/cart" className="text-sm tracking-[.15em] text-champagne" aria-label={`Cart, ${count} items`}>CART ({count})</Link>
          <button className="md:hidden text-champagne p-2" aria-expanded={open} aria-label="Menu" onClick={() => setOpen(!open)}>{open ? '✕' : '☰'}</button>
        </div>
        {open && <nav className="md:hidden border-t border-gold/20 px-5 py-4 flex flex-col gap-4" aria-label="Mobile">
          {links.map(([t,h]) => <Link key={h} to={h} onClick={() => setOpen(false)} className="text-ivory/90 tracking-[.15em]">{t}</Link>)}
          {isAdmin && <Link to="/admin" onClick={() => setOpen(false)} className="text-champagne tracking-[.15em]">ADMIN DASHBOARD</Link>}
        </nav>}
      </header>
      {user && profileError && <div role="alert" className="bg-red-950/60 border-b border-red-400/30 px-5 py-2 text-center text-xs text-red-200">{profileError} <button onClick={refreshProfile} className="underline ml-2">Retry</button></div>}
      <main className="flex-1"><Outlet /></main>
      <footer className="border-t border-gold/20 mt-24 py-12 text-center">
        <img src={emblem} alt="AUVDAHL — The Art of Scent" width={112} height={112} loading="lazy" className="mx-auto h-28 w-28 rounded-full object-cover ring-1 ring-gold/40" />
        <p className="mt-6 font-serif text-lg tracking-[.35em] text-champagne">THE ART OF SCENT</p>
        <p className="mt-6 text-xs text-ivory/50">© {new Date().getFullYear()} AUVDAHL. All rights reserved.</p>
      </footer>
      <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" aria-label="Chat with AUVDAHL on WhatsApp"
         className="fixed bottom-5 right-5 z-50 bg-gold-metal text-obsidian px-5 py-3 text-xs font-semibold tracking-[.15em] shadow-lg shadow-black/60">WHATSAPP</a>
    </div>
  )
}
