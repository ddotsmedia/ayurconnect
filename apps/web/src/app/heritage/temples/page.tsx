import Link from 'next/link'
import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { MapPin } from 'lucide-react'
import { breadcrumbLd, ldGraph, articleLd, pageMetadata } from '../../../lib/seo'
import { DHANVANTARI_TEMPLES } from '../_data'

export const metadata: Metadata = pageMetadata({
  title: 'Dhanvantari Temples of Kerala — Healing Shrines of Ayurveda',
  description:
    'The Dhanvantari (ധന്വന്തരി) temples of Kerala — Thottuva, Nelluvai, Prayikkara and Mararikulam — shrines to the deity of Ayurveda where devotees pray for health and recovery.',
  path: '/heritage/temples',
})

export default function TemplesPage() {
  const ld = ldGraph(
    breadcrumbLd([
      { name: 'Home', url: '/' },
      { name: 'Heritage', url: '/heritage' },
      { name: 'Dhanvantari Temples', url: '/heritage/temples' },
    ]),
    articleLd({
      id: 'temples',
      title: 'Dhanvantari Temples of Kerala',
      content: 'The healing shrines of Kerala dedicated to Dhanvantari, deity of Ayurveda.',
      type: 'Article',
      urlPath: '/heritage/temples',
      language: 'ml',
    }),
  )

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <GradientHero variant="green">
        <nav className="text-sm text-white/70 mb-3">
          <Link href="/heritage" className="hover:text-white">Heritage</Link> <span className="mx-1">/</span> Temples
        </nav>
        <p className="text-gold-200 font-medium mb-2">ധന്വന്തരി ക്ഷേത്രങ്ങൾ</p>
        <h1 className="font-serif text-3xl md:text-5xl font-bold mb-4">Dhanvantari Temples of Kerala</h1>
        <p className="text-white/90 max-w-2xl text-lg">
          ആയുർവേദത്തിന്റെ ദേവനായ ധന്വന്തരിയുടെ ക്ഷേത്രങ്ങൾ. The temple culture surrounding Kerala
          healing — shrines to Dhanvantari, who arose from the churning of the cosmic ocean bearing
          the nectar of immortality.
        </p>
      </GradientHero>

      <section className="container mx-auto px-4 py-14 grid gap-6 md:grid-cols-2">
        {DHANVANTARI_TEMPLES.map((t) => (
          <article key={t.name} className="rounded-2xl border border-kerala-100 bg-white p-6 shadow-card">
            <h2 className="font-serif text-2xl text-kerala-800">{t.nameMl}</h2>
            <p className="text-gray-600">{t.name}</p>
            <p className="text-sm text-gold-700 flex items-center gap-1 mt-1 mb-3">
              <MapPin className="w-4 h-4" /> {t.location}
            </p>
            <p className="text-gray-700">{t.note}</p>
          </article>
        ))}
      </section>
      <div className="container mx-auto px-4 pb-14">
        <div className="rounded-2xl bg-kerala-50 p-6 text-gray-700 text-sm">
          Cultural and heritage information compiled from public-domain sources. Temple visits are a
          matter of devotion and tradition, not a substitute for medical care.
        </div>
      </div>
    </main>
  )
}
