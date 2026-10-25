import { Link } from 'react-router-dom'
import PageTitle from '../components/PageTitle'
export default function ComingSoon() {
  return <section className="mx-auto max-w-xl px-6 py-40 text-center"><PageTitle text="Page not found — AUVDAHL" noindex /><h1 className="text-4xl text-champagne">Page not found</h1><p className="mt-4 text-ivory/70">The page you are looking for does not exist.</p><Link to="/" className="btn-line mt-8">BACK TO HOME</Link></section>
}
