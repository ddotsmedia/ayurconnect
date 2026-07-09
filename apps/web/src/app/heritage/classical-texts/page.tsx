import Link from 'next/link'
import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { ChevronRight } from 'lucide-react'
import { breadcrumbLd, ldGraph, articleLd, pageMetadata } from '../../../lib/seo'
import { CLASSICAL_TEXTS } from '../_data'

export const metadata: Metadata = pageMetadata({
  title: 'The Classical Texts of Kerala Ayurveda — Ashtanga Hridayam, Charaka, Sushruta',
  description:
    'The foundational texts of Kerala Ayurveda: Ashtanga Hridayam (അഷ്ടാംഗഹൃദയം), Charaka Samhita, Sushruta Samhita, Sahasrayogam and Chikitsamanjari — author, era, and significance of each.',
  path: '/heritage/classical-texts',
})

export default function ClassicalTextsPage() {
  const ld = ldGraph(
    breadcrumbLd([
      { name: 'Home', url: '/' },
      { name: 'Heritage', url: '/heritage' },
      { name: 'Classical Texts', url: '/heritage/classical-texts' },
    ]),
    articleLd({
      id: 'classical-texts',
      title: 'The Classical Texts of Kerala Ayurveda',
      content: 'Ashtanga Hridayam, Charaka Samhita, Sushruta Samhita, Sahasrayogam and Chikitsamanjari.',
      type: 'MedicalScholarlyArticle',
      urlPath: '/heritage/classical-texts',
      language: 'ml',
    }),
  )

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <GradientHero variant="green">
        <nav className="text-sm text-white/70 mb-3">
          <Link href="/heritage" className="hover:text-white">Heritage</Link> <span className="mx-1">/</span> Classical Texts
        </nav>
        <p className="text-gold-200 font-medium mb-2">ക്ലാസിക്കൽ ഗ്രന്ഥങ്ങൾ</p>
        <h1 className="font-serif text-3xl md:text-5xl font-bold mb-4">The Classical Texts</h1>
        <p className="text-white/90 max-w-2xl text-lg">
          കേരള ആയുർവേദത്തിന്റെ അടിസ്ഥാന ഗ്രന്ഥങ്ങൾ. The canon on which Kerala Ayurveda stands —
          from Vagbhata's Ashtanga Hridayam to the Kerala formularies Sahasrayogam and Chikitsamanjari.
        </p>
      </GradientHero>

      <section className="container mx-auto px-4 py-14 space-y-6">
        {CLASSICAL_TEXTS.map((t) => (
          <article key={t.slug} id={t.slug} className="rounded-2xl border border-kerala-100 bg-white p-6 shadow-card">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
              <h2 className="font-serif text-2xl text-kerala-800">{t.titleMl}</h2>
              <span className="font-serif text-lg text-gold-700">{t.titleSa}</span>
              <span className="text-gray-500">{t.titleEn}</span>
            </div>
            <p className="text-sm text-gray-500 mb-3">{t.author} · {t.era}</p>
            <p className="text-gray-700 mb-4">{t.significance}</p>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Key contributions</p>
              <ul className="list-disc list-inside text-gray-600 text-sm">
                {t.contributions.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
        <div className="rounded-2xl bg-kerala-50 p-6 text-gray-700">
          <p className="text-sm">
            Titles are given in Malayalam (canonical), Sanskrit (Devanagari), and English. Content
            drawn from public-domain editions. Heritage information, not medical advice.
          </p>
          <Link href="/heritage/history" className="inline-flex items-center gap-1 text-kerala-700 font-medium mt-3 hover:underline">
            Next: the history <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </main>
  )
}
