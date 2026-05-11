import Link from 'next/link'
import { GradientHero } from '@ayurconnect/ui'
import { GraduationCap, ChevronRight, Clock, Award, Users, AlertCircle } from 'lucide-react'
import { COURSES } from './_data/courses'
import { CourseInterestForm } from './_interest-form'

export const metadata = {
  title: 'AyurConnect Academy — Online Ayurveda Courses',
  description: 'Self-paced and cohort-based courses from foundations to specialised Panchakarma masterclasses. Express interest now — courses launching through 2026.',
  alternates: { canonical: '/academy' },
}

const LEVEL_BADGE: Record<string, string> = {
  introduction:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  intermediate:  'bg-blue-50 text-blue-700 border-blue-200',
  professional:  'bg-purple-50 text-purple-700 border-purple-200',
  specialised:   'bg-amber-50 text-amber-700 border-amber-200',
}

const FORMAT_LABEL: Record<string, string> = {
  'self-paced': 'Self-paced',
  cohort:       'Cohort-based',
  live:         'Live + Practical',
}

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  planned:           { label: 'Planned',           color: 'bg-gray-100 text-gray-700' },
  'in-development':  { label: 'In development',    color: 'bg-amber-100 text-amber-800' },
  pilot:             { label: 'Pilot cohort open', color: 'bg-kerala-100 text-kerala-800' },
}

export default function AcademyPage() {
  return (
    <>
      <GradientHero variant="green" size="lg">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-5">
            <GraduationCap className="w-3 h-3" /> AyurConnect Academy
          </span>
          <h1 className="font-serif text-4xl md:text-6xl text-white leading-tight">
            Learn Ayurveda <span className="text-gold-400">properly</span>
          </h1>
          <p className="mt-5 text-lg text-white/80">
            From foundations to Panchakarma masterclasses — built with senior Kerala BAMS / MD
            practitioners. Honest, classical, no health-influencer fluff.
          </p>
        </div>
      </GradientHero>

      <section className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="p-4 rounded-card bg-blue-50 border border-blue-200 text-sm text-blue-900 flex gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>
            <strong>Pre-launch:</strong> these courses are in active development. Express interest in
            any course below and we&apos;ll notify you 4 weeks before launch with early-bird pricing and
            cohort dates. The Kerala Panchakarma Masterclass has a pilot cohort opening now.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-5">
          {COURSES.map((c) => {
            const status = STATUS_BADGE[c.status]
            return (
              <article key={c.slug} className="p-6 bg-white rounded-card border border-gray-100 shadow-card flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h2 className="font-serif text-xl text-kerala-700 leading-tight">{c.title}</h2>
                  <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${status.color}`}>
                    {status.label}
                  </span>
                </div>
                <p className="text-sm text-gray-600 italic mb-3">{c.tagline}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${LEVEL_BADGE[c.level]} capitalize`}>{c.level}</span>
                  <span className="text-xs inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-50 border border-gray-100 text-gray-700">
                    <Clock className="w-3 h-3" /> {c.durationWeeks} weeks
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-50 border border-gray-100 text-gray-700">{FORMAT_LABEL[c.format]}</span>
                </div>

                <details className="mt-2 mb-3 text-sm">
                  <summary className="cursor-pointer text-kerala-700 font-semibold">Course modules ({c.modules.length})</summary>
                  <ul className="mt-2 space-y-1 text-gray-700">
                    {c.modules.map((m, i) => (
                      <li key={i} className="flex gap-2"><span className="text-gold-600">{i + 1}.</span> {m}</li>
                    ))}
                  </ul>
                </details>

                <div className="text-xs text-gray-600 mt-1">
                  <strong>Audience:</strong> {c.audience.join(' · ')}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  <strong>Prerequisite:</strong> {c.prerequisite}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-500">Early-bird</div>
                    <div className="font-semibold text-kerala-700">{c.priceRange}</div>
                  </div>
                  <Link href={`#interest-${c.slug}`} className="inline-flex items-center gap-1 px-3 py-1.5 bg-gold-500 hover:bg-gold-600 text-white rounded text-xs font-semibold">
                    Express interest <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section id="interest" className="bg-cream py-14">
        <div className="container mx-auto px-4 max-w-2xl">
          <header className="text-center mb-8">
            <Award className="w-10 h-10 text-gold-500 mx-auto mb-3" />
            <h2 className="font-serif text-2xl md:text-3xl text-kerala-700">Get notified when courses launch</h2>
            <p className="text-gray-700 mt-2">
              Tell us which courses you&apos;re interested in. Early-bird pricing for the first cohort.
            </p>
          </header>
          <CourseInterestForm courses={COURSES.map((c) => ({ slug: c.slug, title: c.title }))} />
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 max-w-3xl">
        <h2 className="font-serif text-2xl text-kerala-700 mb-4 text-center">Want to teach with us?</h2>
        <p className="text-gray-700 text-center mb-6">
          We&apos;re recruiting senior BAMS / MD practitioners with 15+ years of clinical experience to
          author and deliver these courses. Partnership terms include royalty + bursaries for under-served students.
        </p>
        <div className="text-center">
          <Link href="/partnership" className="inline-flex items-center gap-2 px-5 py-2.5 bg-kerala-600 hover:bg-kerala-700 text-white rounded-md font-semibold">
            <Users className="w-4 h-4" /> Instructor partnership <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  )
}
