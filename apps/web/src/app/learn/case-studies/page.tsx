import Link from 'next/link'
import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { Heart, User } from 'lucide-react'
import { pageMetadata } from '../../../lib/seo'
import { CASES } from './_data'

export const metadata: Metadata = pageMetadata({
  path: '/learn/case-studies',
  title: 'Ayurveda Clinical Case Studies — Free',
  description: 'Real Ayurveda clinical cases with progressive disclosure. Kayachikitsa, Panchakarma, Prasuti, Shalya. Learn from senior physician case discussions.',
  keywords: ['ayurveda case study', 'BAMS clinical cases', 'kayachikitsa cases', 'panchakarma case'],
})

const DIFF: Record<string, string> = { beginner: 'bg-emerald-50 text-emerald-800', intermediate: 'bg-amber-50 text-amber-800', advanced: 'bg-rose-50 text-rose-800' }

export default function CasesListPage() {
  return (
    <>
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">Clinical Case Studies</h1>
          <p className="text-white/85 mt-3">{CASES.length} real cases · progressive disclosure · diagnose along with the doctor</p>
        </div>
      </GradientHero>
      <section className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CASES.map((c) => (
            <Link key={c.slug} href={`/learn/case-studies/${c.slug}`} className="bg-white border border-gray-100 rounded-card p-4 shadow-card hover:shadow-cardLg block">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-[10px] px-1.5 py-0.5 bg-kerala-50 text-kerala-800 border border-kerala-200 rounded">{c.specialization}</span>
                <span className={'text-[10px] px-1.5 py-0.5 rounded ' + (DIFF[c.difficulty] ?? '')}>{c.difficulty}</span>
                <span className="text-[10px] text-gray-500 inline-flex items-center gap-0.5"><User className="w-3 h-3" /> {c.patientAge}y {c.patientGender[0]}</span>
              </div>
              <h2 className="font-serif text-base text-ink inline-flex items-start gap-2"><Heart className="w-4 h-4 text-rose-500 mt-1 flex-shrink-0" /> {c.title}</h2>
              <p className="text-xs text-gray-700 mt-2 line-clamp-3">{c.chiefComplaint}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
