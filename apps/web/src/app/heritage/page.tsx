import Link from 'next/link'
import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { Users, BookOpen, Scroll, Landmark, ChevronRight } from 'lucide-react'
import { breadcrumbLd, ldGraph, articleLd, pageMetadata } from '../../lib/seo'
import { ASHTAVAIDYAS, CLASSICAL_TEXTS } from './_data'

export const metadata: Metadata = pageMetadata({
  title: 'The Living Tradition of Kerala Ayurveda — Heritage & Culture | AyurConnect',
  description:
    'Kerala Ayurveda heritage: the eight Ashtavaidya physician families (അഷ്ടവൈദ്യർ), the classical texts (Ashtanga Hridayam, Charaka & Sushruta Samhita, Sahasrayogam), the history from Dhanvantari to modern AYUSH, and the Dhanvantari temples of Kerala.',
  path: '/heritage',
})

const PILLARS = [
  { href: '/heritage/ashtavaidya', icon: Users, titleMl: 'അഷ്ടവൈദ്യർ', title: 'The Ashtavaidya Families', desc: 'The eight hereditary Namboodiri physician families who kept the Ashtanga Hridayam tradition alive.' },
  { href: '/heritage/classical-texts', icon: BookOpen, titleMl: 'ക്ലാസിക്കൽ ഗ്രന്ഥങ്ങൾ', title: 'The Classical Texts', desc: 'Ashtanga Hridayam, Charaka & Sushruta Samhita, Sahasrayogam, Chikitsamanjari.' },
  { href: '/heritage/history', icon: Scroll, titleMl: 'ചരിത്രം', title: 'History of Kerala Ayurveda', desc: 'From Dhanvantari and the great Samhitas to the colonial revival and modern AYUSH.' },
  { href: '/heritage/temples', icon: Landmark, titleMl: 'ധന്വന്തരി ക്ഷേത്രങ്ങൾ', title: 'Dhanvantari Temples', desc: 'The healing shrines of Kerala dedicated to Dhanvantari, deity of Ayurveda.' },
]

export default function HeritageHubPage() {
  const ld = ldGraph(
    breadcrumbLd([
      { name: 'Home', url: '/' },
      { name: 'Heritage', url: '/heritage' },
    ]),
    articleLd({
      id: 'heritage-hub',
      title: 'The Living Tradition of Kerala Ayurveda',
      content:
        'Kerala Ayurveda is a living tradition preserved by the Ashtavaidya families, rooted in the Ashtanga Hridayam, and expressed through classical texts, history and temple culture.',
      type: 'Article',
      urlPath: '/heritage',
      language: 'ml',
    }),
  )

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <GradientHero variant="green">
        <p className="text-gold-200 font-medium mb-3">കേരളത്തിന്റെ ജീവിക്കുന്ന പാരമ്പര്യം</p>
        <h1 className="font-serif text-3xl md:text-5xl font-bold mb-4 max-w-3xl">
          The Living Tradition of Kerala Ayurveda
        </h1>
        <p className="text-white/90 max-w-2xl text-lg">
          ആയുർവേദത്തിന്റെ വേരുകൾ കേരളത്തിലാണ്. A heritage no competitor can fake — the
          hereditary Ashtavaidya families, the classical Sanskrit and Malayalam texts, a
          history reaching back to Dhanvantari, and the temple culture that still surrounds
          Kerala healing.
        </p>
      </GradientHero>

      <section className="container mx-auto px-4 py-14">
        <div className="grid gap-6 md:grid-cols-2">
          {PILLARS.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className="group rounded-2xl border border-kerala-100 bg-white p-6 shadow-card hover:shadow-cardLg transition-shadow"
            >
              <div className="flex items-start gap-4">
                <span className="rounded-xl bg-kerala-50 p-3 text-kerala-700">
                  <p.icon className="w-6 h-6" />
                </span>
                <div>
                  <p className="font-serif text-lg text-kerala-700">{p.titleMl}</p>
                  <h2 className="font-semibold text-xl text-gray-900 flex items-center gap-1">
                    {p.title}
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h2>
                  <p className="text-gray-600 mt-1">{p.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl bg-kerala-50 p-6">
            <h2 className="font-serif text-2xl text-kerala-800 mb-3">അഷ്ടവൈദ്യർ · The Eight Families</h2>
            <ul className="space-y-1 text-gray-700">
              {ASHTAVAIDYAS.map((f) => (
                <li key={f.slug} className="flex justify-between gap-3">
                  <span className="font-serif text-kerala-700">{f.nameMl}</span>
                  <span className="text-sm text-gray-500">{f.nameEn}</span>
                </li>
              ))}
            </ul>
            <Link href="/heritage/ashtavaidya" className="inline-flex items-center gap-1 text-kerala-700 font-medium mt-4 hover:underline">
              Read about each family <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="rounded-2xl bg-gold-50 p-6">
            <h2 className="font-serif text-2xl text-kerala-800 mb-3">The Classical Canon</h2>
            <ul className="space-y-2 text-gray-700">
              {CLASSICAL_TEXTS.map((t) => (
                <li key={t.slug}>
                  <span className="font-serif text-kerala-700">{t.titleMl}</span>{' '}
                  <span className="text-sm text-gray-500">— {t.titleEn}, {t.era}</span>
                </li>
              ))}
            </ul>
            <Link href="/heritage/classical-texts" className="inline-flex items-center gap-1 text-kerala-700 font-medium mt-4 hover:underline">
              Explore the texts <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
