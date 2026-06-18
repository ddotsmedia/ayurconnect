import Link from 'next/link'
import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { GraduationCap, Clock, Play } from 'lucide-react'
import { pageMetadata } from '../../../lib/seo'
import { WORKSHOPS } from './_data'

export const metadata: Metadata = pageMetadata({
  path: '/learn/workshops',
  title: 'Ayurveda Workshops & Webinars — Free | AyurConnect',
  description: 'Free recorded + upcoming Ayurveda workshops on Panchakarma, Nadi Pariksha, DHA prep, career, formulation identification.',
  keywords: ['ayurveda workshops', 'ayurveda webinar', 'BAMS workshop', 'panchakarma training'],
})

export default function WorkshopsListPage() {
  return (
    <>
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">Workshops & Webinars</h1>
          <p className="text-white/85 mt-3">{WORKSHOPS.length} free workshops · always available</p>
        </div>
      </GradientHero>
      <section className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {WORKSHOPS.map((w) => (
            <Link key={w.slug} href={`/learn/workshops/${w.slug}`} className="bg-white border border-gray-100 rounded-card p-4 shadow-card hover:shadow-cardLg block">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-[10px] px-1.5 py-0.5 bg-kerala-50 text-kerala-800 border border-kerala-200 rounded">{w.type.replace(/_/g, ' ')}</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-amber-300 text-amber-900 rounded font-bold">FREE</span>
                <span className="text-[10px] text-gray-500 inline-flex items-center gap-0.5"><Clock className="w-3 h-3" /> {w.duration} min</span>
              </div>
              <h2 className="font-serif text-base text-ink inline-flex items-start gap-2"><GraduationCap className="w-4 h-4 text-kerala-700 mt-1 flex-shrink-0" /> {w.title}</h2>
              <p className="text-xs text-gray-600 mt-1">by {w.instructor}</p>
              <p className="text-xs text-gray-700 mt-2 line-clamp-3">{w.description}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs text-kerala-700"><Play className="w-3 h-3" /> Watch recording</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
