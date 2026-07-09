import Link from 'next/link'
import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { ChevronRight } from 'lucide-react'
import { breadcrumbLd, ldGraph, articleLd, pageMetadata } from '../../../lib/seo'
import { HISTORY_TIMELINE } from '../_data'

export const metadata: Metadata = pageMetadata({
  title: 'History of Ayurveda in Kerala — From Dhanvantari to Modern AYUSH',
  description:
    'A timeline of Ayurveda in Kerala: Dhanvantari and the divine origin, the classical Samhitas, Vagbhata\'s Ashtanga Hridayam, the Ashtavaidya establishment, colonial-era revival, and the modern AYUSH/CCIM system.',
  path: '/heritage/history',
})

export default function HistoryPage() {
  const ld = ldGraph(
    breadcrumbLd([
      { name: 'Home', url: '/' },
      { name: 'Heritage', url: '/heritage' },
      { name: 'History', url: '/heritage/history' },
    ]),
    articleLd({
      id: 'history',
      title: 'History of Ayurveda in Kerala',
      content: 'From Dhanvantari and the classical Samhitas to the Ashtavaidyas and modern AYUSH.',
      type: 'Article',
      urlPath: '/heritage/history',
      language: 'ml',
    }),
  )

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <GradientHero variant="green">
        <nav className="text-sm text-white/70 mb-3">
          <Link href="/heritage" className="hover:text-white">Heritage</Link> <span className="mx-1">/</span> History
        </nav>
        <p className="text-gold-200 font-medium mb-2">ചരിത്രം</p>
        <h1 className="font-serif text-3xl md:text-5xl font-bold mb-4">History of Ayurveda in Kerala</h1>
        <p className="text-white/90 max-w-2xl text-lg">
          ധന്വന്തരി മുതൽ ആധുനിക ആയുഷ് വരെ. From mythic origins to the modern regulatory system —
          how Kerala became the global reference point for authentic Ayurveda.
        </p>
      </GradientHero>

      <section className="container mx-auto px-4 py-14">
        <ol className="relative border-l-2 border-kerala-200 ml-3 space-y-10">
          {HISTORY_TIMELINE.map((e, i) => (
            <li key={i} className="ml-6">
              <span className="absolute -left-[11px] mt-1 w-5 h-5 rounded-full bg-kerala-600 border-4 border-white" />
              <p className="text-sm font-medium text-gold-700">{e.era}</p>
              {e.titleMl && <p className="font-serif text-lg text-kerala-700">{e.titleMl}</p>}
              <h2 className="font-semibold text-xl text-gray-900 mb-1">{e.title}</h2>
              <p className="text-gray-700 max-w-2xl">{e.body}</p>
            </li>
          ))}
        </ol>
        <div className="rounded-2xl bg-kerala-50 p-6 text-gray-700 mt-12">
          <p className="text-sm">Heritage and historical information compiled from public-domain scholarship. Not medical advice.</p>
          <Link href="/heritage/temples" className="inline-flex items-center gap-1 text-kerala-700 font-medium mt-3 hover:underline">
            Next: the Dhanvantari temples <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </main>
  )
}
