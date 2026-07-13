import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight, BookOpen } from 'lucide-react'
import { GradientHero } from '@ayurconnect/ui'
import { CATEGORIES, MEDICINES } from './_data'
import { GlobalSearch } from './_client'
import { breadcrumbLd, ldGraph } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Ayurvedic Medicines — 135+ Classical Formulations Reference',
  description: 'Complete reference of 135+ classical Ayurvedic medicines — Kashayam, Arishtam, Churnam, Tailam, Ghritam, Lehyam, Guggulu, Bhasmam. Names in English & Malayalam.',
  alternates: { canonical: '/learn/medicines' },
  keywords: ['ayurvedic medicines', 'kashayam list', 'arishtam list', 'ayurveda formulations', 'kerala ayurveda medicines', 'malayalam ayurvedic medicine names', 'AFI', 'Sahasrayogam'],
  openGraph: {
    title: 'Ayurvedic Medicines — 135+ Classical Formulations Reference',
    description: 'Kashayam · Arishtam · Churnam · Tailam · Ghritam · Lehyam · Guggulu · Bhasmam — with Malayalam names, ingredients, dosage, contraindications.',
    url: '/learn/medicines',
    type: 'website',
  },
  other: { robots: 'max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
}

export default function MedicinesHubPage() {
  const countByCategory: Record<string, number> = {}
  for (const m of MEDICINES) countByCategory[m.category] = (countByCategory[m.category] ?? 0) + 1

  const jsonLd = ldGraph(
    breadcrumbLd([
      { name: 'Home',      url: 'https://ayurconnect.com' },
      { name: 'Learn',     url: 'https://ayurconnect.com/learn' },
      { name: 'Medicines', url: 'https://ayurconnect.com/learn/medicines' },
    ]),
    {
      '@type': 'CollectionPage',
      name: 'Classical Ayurvedic Medicines',
      description: `${MEDICINES.length} classical Ayurvedic formulations across 10 categories.`,
      inLanguage: ['en', 'ml'],
      url: 'https://ayurconnect.com/learn/medicines',
    },
    {
      '@type': 'ItemList',
      name: 'Medicine Categories',
      numberOfItems: CATEGORIES.length,
      itemListElement: CATEGORIES.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: c.name,
        url: `https://ayurconnect.com/learn/medicines/${c.slug}`,
      })),
    },
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <GradientHero variant="green" size="lg">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[10px] uppercase tracking-wider text-white/80 font-semibold mb-3">Reference · Malayalam + English</p>
          <h1 className="font-serif text-3xl md:text-5xl text-white leading-tight">Classical Ayurvedic Medicines</h1>
          <p className="mt-2 font-serif text-lg text-gold-200" lang="ml">ആയുർവേദ ഔഷധങ്ങൾ — സമ്പൂർണ്ണ വിവരണം</p>
          <p className="mt-4 text-white/85 max-w-2xl mx-auto text-sm md:text-base">
            {MEDICINES.length}+ classical formulations from Sahasrayogam, Ashtanga Hridaya, Bhaishajya Ratnavali, and Kerala Ayurveda tradition — with ingredients, dosage, anupana, contraindications.
          </p>
          <p className="mt-3 text-white/70 text-xs">
            <strong>{MEDICINES.length} medicines</strong> · <strong>{CATEGORIES.length} categories</strong> · Malayalam + English + Sanskrit names
          </p>
        </div>
      </GradientHero>

      {/* Search */}
      <section className="container mx-auto px-4 -mt-6 max-w-4xl relative z-10">
        <GlobalSearch all={MEDICINES} categories={CATEGORIES} />
      </section>

      <nav className="text-xs text-gray-600 container mx-auto px-4 mt-6 max-w-6xl">
        <Link href="/" className="hover:text-kerala-700">Home</Link>
        <span className="mx-1">›</span>
        <Link href="/learn" className="hover:text-kerala-700">Learn</Link>
        <span className="mx-1">›</span>
        <span className="text-gray-800">Medicines</span>
      </nav>

      {/* Categories */}
      <section className="container mx-auto px-4 py-10 max-w-6xl">
        <h2 className="font-serif text-2xl text-ink mb-5">Browse by category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/learn/medicines/${c.slug}`}
              className="group bg-white rounded-card border border-gray-100 p-5 shadow-card hover:shadow-cardLg hover:border-kerala-300 flex items-start gap-4"
            >
              <span className="text-4xl flex-shrink-0" aria-hidden>{c.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="font-serif text-xl text-kerala-800 leading-tight">{c.name}</p>
                <p className="text-sm text-gray-500 mt-0.5" lang="ml">{c.nameMl}</p>
                <p className="text-sm text-gray-700 mt-2 leading-relaxed line-clamp-2">{c.description}</p>
                <p className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-kerala-700">
                  {countByCategory[c.slug] ?? 0} medicines <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* About references */}
      <section className="bg-cream border-y border-gray-100">
        <div className="container mx-auto px-4 py-10 max-w-4xl">
          <BookOpen className="w-8 h-8 text-kerala-700 mx-auto" />
          <h2 className="text-center font-serif text-2xl text-ink mt-3">About this library</h2>
          <p className="text-center text-sm text-gray-700 mt-3 max-w-3xl mx-auto leading-relaxed">
            Every medicine is drawn from established classical texts — <strong>Sahasrayogam</strong>, <strong>Ashtanga Hridaya</strong>, <strong>Charaka Samhita</strong>, <strong>Sushruta Samhita</strong>, <strong>Bhaishajya Ratnavali</strong>, <strong>Sharangdhara Samhita</strong>, and the <strong>Ayurvedic Formulary of India (AFI)</strong>. Dosage, anupana, and contraindications reflect standard clinical practice. This library is for educational reference only — for treatment, consult a qualified BAMS or MD Ayurveda practitioner.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 justify-center">
            <Link href="/doctors" className="px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-white rounded font-semibold text-sm">Find a Doctor</Link>
            <Link href="/learn" className="px-5 py-2.5 border-2 border-kerala-700 text-kerala-700 rounded font-semibold text-sm hover:bg-kerala-50">More learning resources</Link>
          </div>
        </div>
      </section>
    </>
  )
}
