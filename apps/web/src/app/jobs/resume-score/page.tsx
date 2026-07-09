import { GradientHero } from '@ayurconnect/ui'
import { Sparkles } from 'lucide-react'
import { pageMetadata } from '../../../lib/seo'
import { ScoreClient } from './_client'

export const metadata = pageMetadata({
  path: '/jobs/resume-score',
  title: 'AI Resume Score — Free Ayurveda Doctor Resume Analyzer',
  description: 'Paste your resume. Get an AI score (0-100), section-by-section feedback, ATS compatibility check. Free and instant.',
  keywords: ['ayurveda resume scoring', 'BAMS resume checker', 'ATS resume analyzer', 'free resume score'],
})

export default function ResumeScorePage() {
  return (
    <>
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4"><Sparkles className="w-3 h-3" /> Free · AI-powered · Instant</span>
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">Score Your Resume</h1>
          <p className="text-white/85 mt-3">Paste your resume text. AI scores it (0-100), gives section feedback, ATS compatibility, and improvement points.</p>
        </div>
      </GradientHero>
      <section className="container mx-auto px-4 py-10 max-w-3xl">
        <ScoreClient />
      </section>
    </>
  )
}
