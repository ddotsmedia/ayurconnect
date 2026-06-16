import Link from 'next/link'
import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { ShieldCheck, Globe2 } from 'lucide-react'
import { pageMetadata } from '../../../lib/seo'
import { GUIDES } from './_data'

export const metadata: Metadata = pageMetadata({
  path: '/jobs/licensing',
  title: 'International Licensing Guides for Ayurveda Doctors | AyurConnect',
  description: 'Step-by-step licensing guides for Ayurveda doctors moving abroad: DHA, DOH, MOH, QCHP, SCFHS, UK, Germany, Australia. Eligibility, exams, fees, timelines.',
  keywords: ['DHA ayurveda license', 'DOH ayurveda', 'QCHP ayurveda', 'SCFHS ayurveda', 'ayurveda doctor abroad licensing'],
})

export default function LicensingHubPage() {
  return (
    <>
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4"><Globe2 className="w-3 h-3" /> 10 jurisdictions covered</span>
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">International Licensing Guides for Ayurveda Doctors</h1>
          <p className="text-white/85 mt-3 max-w-2xl mx-auto">Step-by-step processes, document checklists, exam details, and realistic timelines for practising abroad.</p>
        </div>
      </GradientHero>
      <section className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {GUIDES.map((g) => (
            <Link key={g.slug} href={`/jobs/licensing/${g.slug}`} className="bg-white border border-gray-100 rounded-card p-4 shadow-card hover:shadow-cardLg">
              <ShieldCheck className="w-6 h-6 text-kerala-700" />
              <h2 className="font-serif text-lg text-ink mt-2">{g.jurisdiction}</h2>
              <p className="text-xs text-gray-700 mt-1 line-clamp-3">{g.description}</p>
              <p className="text-[11px] text-amber-700 mt-2">⏱ {g.processingTime} · {g.estimatedCost}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
