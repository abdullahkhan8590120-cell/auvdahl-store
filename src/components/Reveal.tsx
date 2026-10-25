import { useEffect, useRef, type ReactNode } from 'react'
// Fade-in on scroll. No dependency; reduced-motion users get the content immediately (CSS + here).
export default function Reveal({ children, className = '', as: Tag = 'div', delay = 0 }: { children: ReactNode; className?: string; as?: 'div' | 'section' | 'li' | 'article'; delay?: number }) {
  const ref = useRef<HTMLElement | null>(null)
  useEffect(() => {
    const el = ref.current; if (!el) return
    if (typeof IntersectionObserver === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { el.classList.add('is-in'); return }
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target) } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 })
    io.observe(el); return () => io.disconnect()
  }, [])
  return <Tag ref={ref as never} className={`reveal ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>{children}</Tag>
}
