export const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') || 'https://auvdahl-store.netlify.app'
export const DEFAULT_TITLE = 'AUVDAHL — The Art of Scent | Luxury Perfumes Saudi Arabia'
export const DEFAULT_DESC = 'AUVDAHL, The Art of Scent. Six eaux de parfum, 50 ml each: Solaris, Lyrana, Noctis, Ambrex, Vanzér and Zaffir.'
export const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`
const PRIVATE = /^\/(cart|checkout|account|orders?|login|register|forgot-password|reset-password|admin)(\/|$)/
export interface SeoOptions { title?: string; description?: string; path?: string; image?: string; noindex?: boolean; jsonLd?: object }
function meta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el) }
  el.setAttribute('content', content)
}
export function applySeo(o: SeoOptions = {}) {
  const path = o.path ?? window.location.pathname
  const title = o.title ?? DEFAULT_TITLE, desc = o.description ?? DEFAULT_DESC, image = o.image ?? DEFAULT_IMAGE
  const url = `${SITE_URL}${path === '/' ? '/' : path.replace(/\/$/, '')}`
  document.title = title
  meta('name', 'description', desc)
  meta('name', 'robots', o.noindex || PRIVATE.test(path) ? 'noindex, nofollow' : 'index, follow')
  meta('property', 'og:title', title); meta('property', 'og:description', desc); meta('property', 'og:url', url); meta('property', 'og:image', image)
  meta('name', 'twitter:title', title); meta('name', 'twitter:description', desc); meta('name', 'twitter:image', image)
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link) }
  link.href = url
  document.getElementById('ld-json')?.remove()
  if (o.jsonLd) { const s = document.createElement('script'); s.id = 'ld-json'; s.type = 'application/ld+json'; s.textContent = JSON.stringify(o.jsonLd); document.head.appendChild(s) }
}
