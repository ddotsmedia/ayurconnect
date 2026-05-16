import Link from 'next/link'
import { GradientHero } from '@ayurconnect/ui'
import { ChevronRight, Stethoscope } from 'lucide-react'
import { CONDITIONS } from './_data/conditions'
import { breadcrumbLd, AYURVEDA_KEYWORDS } from '@/lib/seo'

export const metadata = {
  title: 'Ayurvedic Treatment by Condition — Kerala + UAE',
  description: 'Browse Ayurvedic treatment approaches for PCOS, arthritis, diabetes, migraine, IBS, anxiety, psoriasis, back pain. Classical understanding + verified Kerala doctors. Online consultation across UAE and globally.',
  alternates: { canonical: '/conditions' },
  keywords: Array.from(new Set([
    ...AYURVEDA_KEYWORDS.conditions,
    ...AYURVEDA_KEYWORDS.primary,
    ...AYURVEDA_KEYWORDS.signals,
    'ayurvedic treatment by condition', 'ayurvedic disease management',
    'ayurveda for chronic conditions', 'natural treatment for chronic illness',
    'herbal treatment for stress and anxiety', 'ayurvedic doctor for digestive issues',
    'best ayurvedic specialists for PCOS', 'ayurvedic doctor for back pain online',
    'AyurConnect', 'AyurConnect Ayurveda',
  ])),
}

const CATEGORIES: Record<string, string> = {
  metabolic:       'Metabolic',
  gyn:             'Women\'s health',
  musculoskeletal: 'Joints & spine',
  gi:              'Digestion',
  mental:          'Mind & sleep',
  skin:            'Skin',
  respiratory:     'Respiratory',
}

export default function ConditionsIndex() {
  const grouped = CONDITIONS.reduce<Record<string, typeof CONDITIONS>>((acc, c) => {
    (acc[c.category] ??= []).push(c)
    return acc
  }, {})

  const ld = breadcrumbLd([
    { name: 'Home',       url: '/' },
    { name: 'Conditions', url: '/conditions' },
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-5">
            Conditions
          </span>
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">
            Ayurvedic treatment <span className="text-gold-400">by condition</span>
          </h1>
          <p className="mt-5 text-lg text-white/80">
            Each page covers the classical Ayurvedic understanding, key formulations, lifestyle protocols, and matched verified specialists. No quack promises.
          </p>
        </div>
      </GradientHero>

      <section className="container mx-auto px-4 py-10 max-w-5xl">
        {Object.entries(grouped).map(([cat, items]) => (
          <div key={cat} className="mb-10">
            <h2 className="font-serif text-xl text-ink mb-4">{CATEGORIES[cat] ?? cat}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {items.map((c) => (
                <Link key={c.slug} href={`/conditions/${c.slug}`} className="block bg-white border border-gray-100 rounded-card p-5 shadow-card hover:shadow-cardLg transition-shadow group">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-serif text-lg text-ink group-hover:text-kerala-700">{c.title}</h3>
                      {c.sanskrit && <p className="text-xs text-kerala-700 mt-0.5">{c.sanskrit}</p>}
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-kerala-700 flex-shrink-0 mt-1" />
                  </div>
                  <p className="text-sm text-gray-700 mt-2 leading-relaxed line-clamp-2">{c.ogSummary}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {c.doshasInvolved.map((d) => (
                      <span key={d} className="text-[10px] px-1.5 py-0.5 bg-kerala-50 text-kerala-700 rounded capitalize">{d}</span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="bg-cream py-12">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <Stethoscope className="w-10 h-10 text-kerala-700 mx-auto mb-3" />
          <h2 className="font-serif text-2xl text-ink mb-2">Not sure where to start?</h2>
          <p className="text-sm text-gray-700 leading-relaxed mb-5">
            Take our doctor-match assessment — a few questions about your symptoms and we&apos;ll match you with a verified specialist whose practice focuses on your condition.
          </p>
          <Link href="/doctor-match" className="inline-flex items-center gap-2 px-5 py-2.5 bg-kerala-700 hover:bg-kerala-800 text-white rounded text-sm font-semibold">
            Start matching <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  )
}
