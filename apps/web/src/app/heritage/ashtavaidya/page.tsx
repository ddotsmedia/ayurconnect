import Link from 'next/link'
import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { ChevronRight } from 'lucide-react'
import { breadcrumbLd, ldGraph, articleLd, pageMetadata } from '../../../lib/seo'
import { ASHTAVAIDYAS } from '../_data'

export const metadata: Metadata = pageMetadata({
  title: 'The Ashtavaidya Families — Kerala\'s Eight Hereditary Physician Lineages',
  description:
    'The eight Ashtavaidya (അഷ്ടവൈദ്യർ) Namboodiri families of Kerala — Pulamanthole, Vaidyamadham, Thaikkattu, Elayidath Thaikkattu, Chirattamon, Kuttanchery, Ollur and Pazhangadu Mooss — their specialties, surviving institutions and historical significance.',
  path: '/heritage/ashtavaidya',
})

export default function AshtavaidyaPage() {
  const ld = ldGraph(
    breadcrumbLd([
      { name: 'Home', url: '/' },
      { name: 'Heritage', url: '/heritage' },
      { name: 'Ashtavaidya Families', url: '/heritage/ashtavaidya' },
    ]),
    articleLd({
      id: 'ashtavaidya',
      title: 'The Ashtavaidya Families of Kerala',
      content:
        'The eight hereditary Namboodiri physician families of Kerala, custodians of the Ashtanga Hridayam tradition.',
      type: 'MedicalScholarlyArticle',
      urlPath: '/heritage/ashtavaidya',
      language: 'ml',
    }),
  )

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <GradientHero variant="green">
        <nav className="text-sm text-white/70 mb-3">
          <Link href="/heritage" className="hover:text-white">Heritage</Link> <span className="mx-1">/</span> Ashtavaidya
        </nav>
        <p className="text-gold-200 font-medium mb-2">അഷ്ടവൈദ്യർ</p>
        <h1 className="font-serif text-3xl md:text-5xl font-bold mb-4">The Eight Ashtavaidya Families</h1>
        <p className="text-white/90 max-w-2xl text-lg">
          കേരളത്തിലെ എട്ട് പാരമ്പര്യ വൈദ്യകുടുംബങ്ങൾ. Eight Namboodiri Brahmin households held the
          hereditary custody of Ashtanga Ayurveda in Kerala, anchoring all practice in Vagbhata's
          Ashtanga Hridayam.
        </p>
      </GradientHero>

      <section className="container mx-auto px-4 py-14 space-y-6">
        {ASHTAVAIDYAS.map((f) => (
          <article key={f.slug} id={f.slug} className="rounded-2xl border border-kerala-100 bg-white p-6 shadow-card">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
              <h2 className="font-serif text-2xl text-kerala-800">{f.nameMl}</h2>
              <span className="text-gray-500">{f.nameEn}</span>
            </div>
            <p className="text-sm font-medium text-gold-700 mb-3">{f.specialty}</p>
            <p className="text-gray-700 mb-4">{f.significance}</p>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Surviving institutions</p>
              <ul className="list-disc list-inside text-gray-600 text-sm">
                {f.institutions.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}

        <div className="rounded-2xl bg-kerala-50 p-6 text-gray-700">
          <p className="text-sm">
            Sources: public-domain scholarship on Kerala's Ashtavaidya tradition and the Ashtanga
            Hridayam lineage. Family names are given in Malayalam (canonical) with English
            transliteration. This is heritage and cultural information, not medical advice.
          </p>
          <Link href="/heritage/classical-texts" className="inline-flex items-center gap-1 text-kerala-700 font-medium mt-3 hover:underline">
            Next: the classical texts <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </main>
  )
}
