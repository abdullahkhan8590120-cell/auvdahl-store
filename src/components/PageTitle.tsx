import { useEffect } from 'react'
import { applySeo, type SeoOptions } from '../lib/seo'
// Backwards compatible: <PageTitle text="..." /> still works; extra props add description, image, noindex, JSON-LD.
export default function PageTitle({ text, ...o }: { text: string } & Omit<SeoOptions, 'title'>) {
  const ld = o.jsonLd ? JSON.stringify(o.jsonLd) : ''
  useEffect(() => {
    applySeo({ ...o, title: text, jsonLd: ld ? JSON.parse(ld) : undefined })
    return () => applySeo({}) // cleanup runs before the next page's effect, so tags never leak between pages
  }, [text, o.description, o.path, o.image, o.noindex, ld]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}
