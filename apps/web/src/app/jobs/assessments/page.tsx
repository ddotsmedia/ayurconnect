import Link from 'next/link'
import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { Award, Clock, Target } from 'lucide-react'
import { pageMetadata } from '../../../lib/seo'
import { ASSESSMENTS } from './_data'

export const metadata: Metadata = pageMetadata({
  path: '/jobs/assessments',
  title: 'Ayurveda Skill Assessments — Free Certification',
  description: 'Free skill assessments for Ayurveda doctors. Panchakarma, Kayachikitsa, Dravyaguna, Clinical Reasoning, DHA prep. Earn shareable certificates.',
  keywords: ['ayurveda skill assessment', 'BAMS certification', 'panchakarma test', 'DHA exam practice'],
})

const DIFF: Record<string, string> = { beginner: 'bg-emerald-50 text-emerald-800', intermediate: 'bg-amber-50 text-amber-800', advanced: 'bg-rose-50 text-rose-800' }

export default function AssessmentsListPage() {
  return (
    <>
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4"><Award className="w-3 h-3" /> Free · Certificate on passing</span>
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">Skill Assessments — Prove Your Expertise</h1>
          <p className="text-white/85 mt-3">5 timed assessments · pass for a shareable AyurConnect Certificate · differentiates you to employers</p>
        </div>
      </GradientHero>
      <section className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ASSESSMENTS.map((a) => (
            <Link key={a.slug} href={`/jobs/assessments/${a.slug}`} className="bg-white border border-gray-100 rounded-card p-5 shadow-card hover:shadow-cardLg block">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-[10px] px-1.5 py-0.5 bg-kerala-50 text-kerala-800 border border-kerala-200 rounded">{a.specialization}</span>
                <span className={'text-[10px] px-1.5 py-0.5 rounded ' + (DIFF[a.difficulty] ?? '')}>{a.difficulty}</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-amber-300 text-amber-900 rounded font-bold">FREE</span>
              </div>
              <h2 className="font-serif text-lg text-ink inline-flex items-start gap-2"><Target className="w-5 h-5 text-kerala-700 mt-0.5 flex-shrink-0" /> {a.name}</h2>
              <p className="text-xs text-gray-700 mt-2 line-clamp-3">{a.description}</p>
              <div className="mt-3 flex items-center gap-3 text-[11px] text-gray-600">
                <span>{a.questions.length} questions</span>
                <span className="inline-flex items-center gap-0.5"><Clock className="w-3 h-3" /> {a.durationMin} min</span>
                <span>Pass: {a.passingScore}%</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
