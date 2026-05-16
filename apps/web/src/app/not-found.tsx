import Link from 'next/link'
import { Search, Stethoscope, Building2, BookOpen, Sprout, ArrowLeft } from 'lucide-react'

// Custom 404. Returns the correct HTTP status automatically (Next.js handles
// this) and gives Google a useful soft-landing of internal links so crawlers
// can re-discover the site if they hit a broken inbound link.

export const metadata = {
  title: 'Page not found — AyurConnect',
  description: 'The page you’re looking for doesn’t exist. Browse our verified Ayurveda doctors, classical conditions library, or Panchakarma centres instead.',
  robots: { index: false, follow: true },
}

const QUICK_LINKS = [
  { href: '/doctors',      icon: Stethoscope,  title: 'Browse doctors',           desc: '500+ verified Ayurveda doctors across Kerala + UAE.' },
  { href: '/conditions',   icon: BookOpen,     title: 'Conditions library',       desc: '8 in-depth Ayurvedic treatment guides — PCOS, arthritis, diabetes, more.' },
  { href: '/hospitals',    icon: Building2,    title: 'Hospitals & Panchakarma',  desc: 'Classical Panchakarma centres across the 14 Kerala districts.' },
  { href: '/herbs',        icon: Sprout,       title: 'Herb database',            desc: '150+ medicinal herbs with classical Sanskrit citations.' },
]

export default function NotFound() {
  return (
    <main className="min-h-[70vh] bg-cream flex items-center">
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <header className="text-center mb-10">
          <p className="text-[10px] uppercase tracking-wider text-kerala-700 font-semibold mb-3">404 · Not found</p>
          <h1 className="font-serif text-4xl md:text-5xl text-ink mb-3">
            We couldn&apos;t find that page
          </h1>
          <p className="text-sm text-gray-700 max-w-xl mx-auto leading-relaxed">
            The link may be old, mistyped, or the page may have moved. Try one of the popular
            destinations below — or use search to find a specific doctor, condition, or herb.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
          {QUICK_LINKS.map((q) => (
            <Link
              key={q.href}
              href={q.href}
              className="block bg-white border border-gray-100 rounded-card p-5 shadow-card hover:shadow-cardLg transition-shadow group"
            >
              <q.icon className="w-5 h-5 text-kerala-700 mb-2" />
              <h2 className="font-serif text-lg text-ink group-hover:text-kerala-700">{q.title}</h2>
              <p className="text-xs text-muted mt-1 leading-relaxed">{q.desc}</p>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-kerala-700 hover:bg-kerala-800 text-white rounded text-sm font-semibold"
          >
            <Search className="w-4 h-4" /> Search the site
          </Link>
          <p className="mt-4">
            <Link href="/" className="text-xs text-kerala-700 hover:underline inline-flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Back to home
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
