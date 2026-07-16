import type { Metadata } from 'next'
import { HelpCircle } from 'lucide-react'
import { GradientHero } from '@ayurconnect/ui'
import { InterviewGenerator } from './_client'
import { breadcrumbLd, ldGraph } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Ayurveda Interview Questions & Answers',
  description: 'AI-generated Ayurveda interview questions with model answers — Kayachikitsa, Panchakarma, Prasuti, Rasashastra. Fresher to Senior level. Cite Charaka & Sushruta. Free.',
  alternates: { canonical: '/jobs/interview-questions' },
  keywords: ['ayurveda interview questions', 'BAMS interview', 'MD ayurveda interview', 'panchakarma interview questions', 'kayachikitsa interview'],
  openGraph: { title: 'Ayurveda Interview Questions & Answers (AI)', description: 'Generate 10 questions with model answers by specialization + level.', url: '/jobs/interview-questions', type: 'website' },
  other: { robots: 'max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
}

export default function InterviewQuestionsPage() {
  const jsonLd = ldGraph(
    breadcrumbLd([
      { name: 'Home',                 url: 'https://ayurconnect.com' },
      { name: 'Jobs',                 url: 'https://ayurconnect.com/jobs' },
      { name: 'Interview Questions',  url: 'https://ayurconnect.com/jobs/interview-questions' },
    ]),
    { '@type': 'WebPage', name: 'Ayurveda Interview Questions & Answers', url: 'https://ayurconnect.com/jobs/interview-questions' },
  )
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
            <HelpCircle className="w-3 h-3" /> AI-generated · Free
          </span>
          <h1 className="font-serif text-3xl md:text-5xl text-white leading-tight">Ayurveda Interview Questions</h1>
          <p className="text-white/85 mt-3 text-sm md:text-base">Pick a specialization + level. Get 10 questions with model answers — clinical, practical, philosophy, behavioral.</p>
        </div>
      </GradientHero>

      <section className="container mx-auto px-4 py-8 max-w-4xl">
        <InterviewGenerator />
      </section>
    </>
  )
}
