import Link from 'next/link'
import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { Target, Sparkles, Clock, BookOpen, ArrowRight } from 'lucide-react'
import { pageMetadata } from '../../../lib/seo'
import { SUBJECTS, YEAR_LABEL } from '../_subjects'
import { MCQS } from './_data'

export const metadata: Metadata = pageMetadata({
  path: '/learn/mcq',
  title: 'AIAPGET MCQ Practice — Free Unlimited Questions',
  description: `${MCQS.length}+ AIAPGET-style multiple choice questions across all BAMS subjects. Practice mode, mock test, immediate explanations. Free.`,
  keywords: ['AIAPGET MCQ', 'BAMS MCQ', 'ayurveda mcq practice', 'AIAPGET preparation', 'PG entrance ayurveda'],
})

export default function McqHubPage() {
  // Group MCQs by subject
  const bySubject = new Map<string, number>()
  for (const m of MCQS) bySubject.set(m.subjectSlug, (bySubject.get(m.subjectSlug) ?? 0) + 1)

  return (
    <>
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4"><Target className="w-3 h-3" /> {MCQS.length} MCQs · Always free</span>
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">AIAPGET MCQ Practice</h1>
          <p className="text-white/85 mt-3">Practice mode · Mock test · Subject-wise · Immediate feedback with explanations.</p>
        </div>
      </GradientHero>

      <section className="container mx-auto px-4 py-10 max-w-5xl space-y-6">
        {/* Mode cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Link href="/learn/mcq/practice" className="bg-white border border-kerala-100 rounded-card p-5 shadow-card hover:shadow-cardLg block">
            <Sparkles className="w-7 h-7 text-amber-500" />
            <h2 className="font-serif text-lg text-ink mt-2">Quick Practice</h2>
            <p className="text-xs text-gray-700 mt-1">10 random MCQs with immediate feedback.</p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs text-kerala-700">Start practice <ArrowRight className="w-3 h-3" /></span>
          </Link>
          <Link href="/learn/mcq/practice?mode=subject" className="bg-white border border-kerala-100 rounded-card p-5 shadow-card hover:shadow-cardLg block">
            <BookOpen className="w-7 h-7 text-kerala-700" />
            <h2 className="font-serif text-lg text-ink mt-2">Subject-wise</h2>
            <p className="text-xs text-gray-700 mt-1">Choose a subject and practice its MCQs.</p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs text-kerala-700">Pick subject <ArrowRight className="w-3 h-3" /></span>
          </Link>
          <Link href="/learn/mcq/mock-test" className="bg-white border border-kerala-100 rounded-card p-5 shadow-card hover:shadow-cardLg block">
            <Clock className="w-7 h-7 text-rose-600" />
            <h2 className="font-serif text-lg text-ink mt-2">Mock Test</h2>
            <p className="text-xs text-gray-700 mt-1">Full {MCQS.length}-question test · timed · score at end.</p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs text-kerala-700">Start test <ArrowRight className="w-3 h-3" /></span>
          </Link>
        </div>

        {/* Subject grid */}
        <section>
          <h2 className="font-serif text-xl text-ink mb-3">Practice by subject</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {SUBJECTS.filter((s) => bySubject.has(s.slug)).map((s) => (
              <Link key={s.slug} href={`/learn/mcq/practice?subject=${s.slug}`} className="bg-white border border-gray-100 rounded-card p-3 shadow-card hover:shadow-cardLg flex items-center justify-between">
                <div>
                  <p className="font-semibold text-ink text-sm">{s.name}</p>
                  <p className="text-[10px] text-gray-500">{YEAR_LABEL[s.year]}</p>
                </div>
                <span className="text-xs px-2 py-0.5 bg-kerala-50 text-kerala-800 border border-kerala-200 rounded-full">{bySubject.get(s.slug) ?? 0} Qs</span>
              </Link>
            ))}
          </div>
        </section>
      </section>
    </>
  )
}
