import Link from 'next/link'
import { notFound } from 'next/navigation'
import { GradientHero } from '@ayurconnect/ui'
import { ChevronRight, User, MapPin, Clock, Briefcase, AlertCircle } from 'lucide-react'
import { CASE_STUDIES, CASE_STUDY_SLUGS } from '../_data/cases'

export function generateStaticParams() {
  return CASE_STUDY_SLUGS.map((slug) => ({ slug }))
}

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params) {
  const { slug } = await params
  const c = CASE_STUDIES.find((x) => x.slug === slug)
  if (!c) return { title: 'Case study not found' }
  return {
    title: `${c.title} | AyurConnect Case Study`,
    description: c.summary,
    alternates: { canonical: `/case-studies/${c.slug}` },
  }
}

const OUTCOME_COLOR: Record<string, string> = {
  remission:             'bg-emerald-50 text-emerald-700 border-emerald-200',
  'major-improvement':   'bg-blue-50 text-blue-700 border-blue-200',
  'partial-improvement': 'bg-amber-50 text-amber-700 border-amber-200',
}

export default async function CaseStudyPage({ params }: Params) {
  const { slug } = await params
  const c = CASE_STUDIES.find((x) => x.slug === slug)
  if (!c) notFound()

  return (
    <>
      <GradientHero variant="green" size="lg">
        <div className="max-w-3xl mx-auto">
          <Link href="/case-studies" className="text-sm text-white/70 hover:text-white inline-flex items-center gap-1 mb-4">
            <ChevronRight className="w-3 h-3 rotate-180" /> All case studies
          </Link>
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
            {c.condition}
          </span>
          <h1 className="font-serif text-3xl md:text-5xl text-white leading-tight">{c.title}</h1>
          <p className="mt-4 text-base md:text-lg text-white/85">{c.summary}</p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${OUTCOME_COLOR[c.outcome]}`}>
              {c.outcomeLabel}
            </span>
          </div>
        </div>
      </GradientHero>

      {/* Patient summary card */}
      <section className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 bg-white rounded-card border border-gray-100">
            <User className="w-4 h-4 text-kerala-700" />
            <div className="text-xs text-gray-500 mt-1">Patient</div>
            <div className="text-sm font-semibold">{c.patient.age}y {c.patient.gender}</div>
          </div>
          <div className="p-4 bg-white rounded-card border border-gray-100">
            <Briefcase className="w-4 h-4 text-kerala-700" />
            <div className="text-xs text-gray-500 mt-1">Occupation</div>
            <div className="text-sm font-semibold">{c.patient.occupation}</div>
          </div>
          <div className="p-4 bg-white rounded-card border border-gray-100">
            <MapPin className="w-4 h-4 text-kerala-700" />
            <div className="text-xs text-gray-500 mt-1">From</div>
            <div className="text-sm font-semibold">{c.patient.country}</div>
          </div>
          <div className="p-4 bg-white rounded-card border border-gray-100">
            <Clock className="w-4 h-4 text-kerala-700" />
            <div className="text-xs text-gray-500 mt-1">Duration</div>
            <div className="text-sm font-semibold">{c.durationMonths} months</div>
          </div>
        </div>
      </section>

      {/* Presentation */}
      <section className="container mx-auto px-4 py-8 max-w-3xl">
        <h2 className="font-serif text-2xl md:text-3xl text-kerala-700 mb-4">Presentation at baseline</h2>
        <p className="text-gray-700 leading-relaxed">{c.presentation}</p>
      </section>

      {/* Classical diagnosis */}
      <section className="bg-cream py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-serif text-2xl md:text-3xl text-kerala-700 mb-4">Classical diagnosis</h2>
          <div className="p-5 bg-white rounded-card border border-kerala-100">
            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              <div>
                <div className="text-xs uppercase tracking-wider text-gold-600 font-semibold">Dosha</div>
                <p className="text-sm text-gray-800 mt-1">{c.classicalDiagnosis.dosha}</p>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-gold-600 font-semibold">Dhatu involvement</div>
                <p className="text-sm text-gray-800 mt-1">{c.classicalDiagnosis.rasa}</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed italic pt-4 border-t border-kerala-100">{c.classicalDiagnosis.explanation}</p>
          </div>
        </div>
      </section>

      {/* Protocol timeline */}
      <section className="container mx-auto px-4 py-12 max-w-3xl">
        <h2 className="font-serif text-2xl md:text-3xl text-kerala-700 mb-6">Treatment protocol</h2>
        <div className="space-y-4">
          {c.protocol.map((p, i) => (
            <article key={i} className="p-5 bg-white rounded-card border border-gray-100 shadow-card flex gap-4">
              <div className="w-10 h-10 rounded-full bg-kerala-600 text-white font-serif text-lg flex items-center justify-center flex-shrink-0">{i + 1}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                  <h3 className="font-serif text-lg text-kerala-700">{p.phase}</h3>
                  <span className="text-xs text-gold-600 font-medium">{p.weeks}</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{p.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Outcome */}
      <section className="bg-kerala-50 py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-serif text-2xl md:text-3xl text-kerala-700 mb-4">Outcome</h2>
          <p className="text-gray-700 leading-relaxed">{c.outcomeDetail}</p>
        </div>
      </section>

      {/* Doctor notes */}
      <section className="container mx-auto px-4 py-12 max-w-3xl">
        <h2 className="font-serif text-2xl md:text-3xl text-kerala-700 mb-4">Doctor&apos;s notes</h2>
        <div className="p-5 bg-white rounded-card border border-gray-100 shadow-card">
          <p className="text-gray-700 leading-relaxed italic">{c.doctorNotes}</p>
        </div>
      </section>

      {/* Cross-links */}
      <section className="bg-cream py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-serif text-2xl text-kerala-700 mb-4">Want similar care?</h2>
          <div className="flex flex-wrap gap-3">
            {c.treatmentSlug && (
              <Link href={`/treatments/${c.treatmentSlug}`} className="inline-flex items-center gap-2 px-4 py-2 bg-kerala-600 hover:bg-kerala-700 text-white rounded-md text-sm font-semibold">
                Treatment guide <ChevronRight className="w-3 h-3" />
              </Link>
            )}
            <Link href="/doctors" className="inline-flex items-center gap-2 px-4 py-2 border-2 border-kerala-600 text-kerala-700 hover:bg-kerala-50 rounded-md text-sm font-semibold">
              Find a Vaidya
            </Link>
            <Link href="/cost-estimator" className="inline-flex items-center gap-2 px-4 py-2 border-2 border-kerala-600 text-kerala-700 hover:bg-kerala-50 rounded-md text-sm font-semibold">
              Cost estimator
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-2 px-4 py-2 border-2 border-kerala-600 text-kerala-700 hover:bg-kerala-50 rounded-md text-sm font-semibold">
              Speak to us
            </Link>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="p-5 rounded-card bg-amber-50 border border-amber-100 text-sm text-amber-900 leading-relaxed flex gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>
            <strong>Disclosure:</strong> This is a composite case study with details changed for
            privacy. Clinical particulars are verified by our clinical advisory board for plausibility
            and educational value. Individual outcomes depend on diagnosis accuracy, compliance,
            severity, and other factors — these results are illustrative, not guarantees.
          </p>
        </div>
      </section>
    </>
  )
}
