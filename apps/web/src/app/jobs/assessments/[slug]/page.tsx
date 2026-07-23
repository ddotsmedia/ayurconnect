import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { ChevronLeft, Clock, Target, Award } from 'lucide-react'
import { pageMetadata } from '../../../../lib/seo'
import { ASSESSMENTS, ASSESSMENT_SLUGS } from '../_data'
import { AssessmentClient } from './_client'

export const revalidate = 300 // Phase 4 (2026-07-23): reverted from force-dynamic per audit prompt

export function generateStaticParams() { return ASSESSMENT_SLUGS.map((slug) => ({ slug })) }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const a = ASSESSMENTS.find((x) => x.slug === slug)
  if (!a) return { title: 'Not found' }
  return pageMetadata({
    path: `/jobs/assessments/${slug}`,
    title: `${a.name} | AyurConnect Skill Assessment`,
    description: a.description,
    keywords: [a.specialization, 'ayurveda assessment', a.name],
  })
}

export default async function AssessmentDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const a = ASSESSMENTS.find((x) => x.slug === slug)
  if (!a) notFound()
  return (
    <>
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <Link href="/jobs/assessments" className="inline-flex items-center gap-1 text-xs text-white/80 hover:text-white mb-3"><ChevronLeft className="w-3.5 h-3.5" /> All assessments</Link>
          <h1 className="font-serif text-3xl md:text-4xl text-white leading-tight">{a.name}</h1>
          <p className="text-white/85 mt-3 text-sm">{a.specialization} · {a.difficulty}</p>
          <div className="mt-3 inline-flex items-center gap-3 text-xs text-white/80">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/10 border border-white/20 rounded-full"><Target className="w-3 h-3" /> {a.questions.length} questions</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/10 border border-white/20 rounded-full"><Clock className="w-3 h-3" /> {a.durationMin} min</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-300 text-amber-900 rounded-full font-bold"><Award className="w-3 h-3" /> Pass: {a.passingScore}%</span>
          </div>
        </div>
      </GradientHero>
      <section className="container mx-auto px-4 py-10 max-w-2xl">
        <AssessmentClient assessment={a} />
      </section>
    </>
  )
}
