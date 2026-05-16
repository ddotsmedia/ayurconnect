import Link from 'next/link'
import { GradientHero } from '@ayurconnect/ui'
import { ChevronRight, Clock, User, MapPin, AlertCircle } from 'lucide-react'
import { CASE_STUDIES } from './_data/cases'

export const metadata = {
  title: 'Patient Case Studies — Real Treatment Outcomes | AyurConnect',
  description: 'Detailed clinical case studies — psoriasis remission, PCOS fertility, RA medication reduction, executive burnout, postpartum recovery. Real protocols, real timelines, real outcomes.',
  alternates: { canonical: '/case-studies' },
}

const OUTCOME_BADGE: Record<string, string> = {
  remission:             'bg-emerald-100 text-emerald-800 border-emerald-200',
  'major-improvement':   'bg-blue-100 text-blue-800 border-blue-200',
  'partial-improvement': 'bg-amber-100 text-amber-800 border-amber-200',
}

export default function CaseStudiesIndex() {
  return (
    <>
      <GradientHero variant="green" size="lg">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-5">
            📋 Case Studies
          </span>
          <h1 className="font-serif text-4xl md:text-6xl text-white leading-tight">
            Real <span className="text-gold-400">cases</span>, real outcomes
          </h1>
          <p className="mt-5 text-lg text-white/80">
            Detailed clinical narratives drawn from verified Kerala practitioners. Protocols,
            timelines, and outcomes — including what didn&apos;t work and why. Names and identifying
            details are changed for privacy.
          </p>
        </div>
      </GradientHero>

      <section className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-5">
          {CASE_STUDIES.map((c) => (
            <Link key={c.slug} href={`/case-studies/${c.slug}`} className="group p-6 bg-white rounded-card border border-gray-100 shadow-card hover:shadow-cardLg transition-all">
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded border ${OUTCOME_BADGE[c.outcome]}`}>
                  {c.outcomeLabel}
                </span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-kerala-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
              </div>
              <h2 className="font-serif text-xl text-kerala-700 leading-tight group-hover:text-kerala-600">{c.title}</h2>
              <p className="text-xs text-gold-600 italic mt-1">{c.condition}</p>
              <p className="text-sm text-gray-700 mt-3 leading-relaxed line-clamp-3">{c.summary}</p>
              <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-600 pt-3 border-t border-gray-100">
                <span className="inline-flex items-center gap-1"><User className="w-3 h-3" /> {c.patient.age}y {c.patient.gender}</span>
                <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {c.patient.country}</span>
                <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {c.durationMonths} months</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="p-5 rounded-card bg-amber-50 border border-amber-100 text-sm text-amber-900 leading-relaxed flex gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>
            <strong>About these cases:</strong> Composite narratives drawn from real clinical
            patterns observed at Kerala verified centres. Names, geographic specifics, and
            non-essential details are changed for patient privacy. Clinical particulars (protocols,
            timelines, dosages) are verified by the AyurConnect clinical advisory board.
            Individual outcomes vary; these are illustrative, not guarantees.
          </p>
        </div>
      </section>
    </>
  )
}
