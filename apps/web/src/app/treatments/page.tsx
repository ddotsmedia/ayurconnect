import Link from 'next/link'
import { GradientHero } from '@ayurconnect/ui'
import { ChevronRight, Clock, IndianRupee } from 'lucide-react'
import { CONDITIONS } from './_data/conditions'
import { AYURVEDA_KEYWORDS } from '../../lib/seo'

export const metadata = {
  title: 'Specialised Ayurvedic Treatments — Kerala | AyurConnect',
  description: 'Evidence-informed Ayurvedic treatment guides for PCOS, arthritis, stress, diabetes, weight management, and chronic skin disease. Find a verified Kerala specialist.',
  alternates: { canonical: '/treatments' },
  keywords: [
    ...AYURVEDA_KEYWORDS.primary,
    ...AYURVEDA_KEYWORDS.conditions,
    ...AYURVEDA_KEYWORDS.treatments,
    ...AYURVEDA_KEYWORDS.signals,
  ],
}

const ORDER = ['pcos', 'arthritis', 'stress-anxiety', 'diabetes', 'weight-management', 'skin-care']

export default function TreatmentsIndex() {
  return (
    <>
      <GradientHero variant="green" size="lg">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-5">
            🌿 Condition-led care
          </span>
          <h1 className="font-serif text-4xl md:text-6xl text-white leading-tight">
            Specialised <span className="text-gold-400">Treatments</span>
          </h1>
          <p className="mt-5 text-lg text-white/80">
            Six condition-led Ayurvedic protocols, written by practising Kerala BAMS / MD doctors.
            Each page covers the classical view, the actual procedures, the medicines used, realistic
            timelines, and how to find a verified specialist.
          </p>
        </div>
      </GradientHero>

      <section className="container mx-auto px-4 py-14 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-6">
          {ORDER.map((slug) => {
            const c = CONDITIONS[slug]
            if (!c) return null
            return (
              <Link
                key={c.slug}
                href={`/treatments/${c.slug}`}
                className="group p-7 bg-white rounded-card border border-gray-100 shadow-card hover:shadow-cardLg transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="font-serif text-2xl text-kerala-700 group-hover:text-kerala-600">{c.name}</h2>
                    <p className="text-sm text-gold-600 italic mt-0.5">{c.sanskrit}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-kerala-600 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-gray-700 leading-relaxed text-sm">{c.tagline}</p>
                <div className="flex flex-wrap gap-3 mt-5 text-xs text-gray-600">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-kerala-50 rounded-full">
                    <Clock className="w-3 h-3" /> {c.durationWeeks.typical} wk
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 rounded-full">
                    <IndianRupee className="w-3 h-3" /> {c.estimatedCost.opd.split('(')[0].trim()}
                  </span>
                  {c.specializations.slice(0, 1).map((s) => (
                    <span key={s} className="px-2 py-1 bg-gray-50 rounded-full text-gray-700">{s}</span>
                  ))}
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="bg-cream py-14">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-2xl md:text-3xl text-kerala-700 mb-3">Don&apos;t see your condition?</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            These are the six conditions we&apos;ve written full landing pages for so far. AyurConnect
            doctors treat dozens more — fertility, migraine, IBS, asthma, post-stroke rehab,
            paediatric care, geriatric care. Browse the directory, filter by specialisation, and book
            an initial video consult.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/conditions" className="inline-flex items-center gap-2 px-5 py-2.5 bg-kerala-600 hover:bg-kerala-700 text-white rounded-md font-semibold">
              Conditions library <ChevronRight className="w-4 h-4" />
            </Link>
            <Link href="/doctors" className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-kerala-600 text-kerala-700 hover:bg-kerala-50 rounded-md font-semibold">
              Browse doctors
            </Link>
            <Link href="/triage" className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-kerala-600 text-kerala-700 hover:bg-kerala-50 rounded-md font-semibold">
              AI symptom check
            </Link>
            <Link href="/ayurbot" className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-kerala-600 text-kerala-700 hover:bg-kerala-50 rounded-md font-semibold">
              Ask AyurBot
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
