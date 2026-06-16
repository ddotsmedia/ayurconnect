import Link from 'next/link'
import { GradientHero } from '@ayurconnect/ui'
import { Sparkles, ArrowRight } from 'lucide-react'
import { pageMetadata } from '../../../lib/seo'
import { AdvisorClient } from './_client'

export const metadata = pageMetadata({
  path: '/jobs/career-advisor',
  title: 'AI Career Advisor for Ayurveda Doctors | AyurConnect',
  description: 'AI career guidance for BAMS graduates and Ayurveda professionals. Salary info, licensing pathways, interview prep, specialty selection.',
  keywords: ['ayurveda career advisor', 'BAMS career guidance', 'ayurveda doctor career', 'AYUSH career'],
})

export default function CareerAdvisorPage() {
  return (
    <>
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4"><Sparkles className="w-3 h-3" /> Free AI guidance</span>
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">AI Career Advisor</h1>
          <p className="text-white/85 mt-3">Ask about salary, licensing, interview prep, specialization choices, locum vs full-time, or anything else about your Ayurveda career.</p>
        </div>
      </GradientHero>
      <section className="container mx-auto px-4 py-10 max-w-3xl">
        <AdvisorClient />
        <p className="text-xs text-gray-500 mt-6 text-center">
          For deeper career planning, also try <Link href="/ayurbot" className="text-kerala-700 hover:underline">AyurBot AI</Link>.
        </p>
      </section>
    </>
  )
}
