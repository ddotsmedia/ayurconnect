import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { ChevronLeft } from 'lucide-react'
import { pageMetadata, breadcrumbLd, ldGraph } from '../../../../lib/seo'
import { SUBJECTS, YEAR_LABEL } from '../../_subjects'
import { PAPERS, PAPER_SLUGS } from '../_data'
import { QuestionsClient } from './_client'

export const dynamic = 'force-dynamic';

export function generateStaticParams() { return PAPER_SLUGS.map((slug) => ({ slug })) }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const p = PAPERS.find((x) => x.slug === slug)
  if (!p) return { title: 'Not found' }
  return pageMetadata({
    path: `/learn/question-papers/${slug}`,
    title: `${p.title} | BAMS Question Paper`,
    description: `${p.university}, ${p.examMonth ?? ''} ${p.examYear} BAMS question paper${p.isSolved ? ' with solutions' : ''}.`,
    keywords: ['BAMS question paper', p.subjectSlug, p.university, String(p.examYear)],
  })
}

export default async function PaperDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const p = PAPERS.find((x) => x.slug === slug)
  if (!p) notFound()
  const subj = SUBJECTS.find((s) => s.slug === p.subjectSlug)
  const totalMarks = p.questions.reduce((a, q) => a + q.marks, 0)
  const ld = ldGraph(
    { '@context': 'https://schema.org', '@type': 'LearningResource', name: p.title, learningResourceType: 'ExamPaper', educationalLevel: YEAR_LABEL[p.year], isAccessibleForFree: true },
    breadcrumbLd([
      { name: 'Home', url: '/' }, { name: 'Learn', url: '/learn' },
      { name: 'Question Papers', url: '/learn/question-papers' },
      { name: p.title, url: `/learn/question-papers/${slug}` },
    ]),
  )
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <Link href="/learn/question-papers" className="inline-flex items-center gap-1 text-xs text-white/80 hover:text-white mb-3"><ChevronLeft className="w-3.5 h-3.5" /> All papers</Link>
          <h1 className="font-serif text-3xl md:text-4xl text-white leading-tight">{p.title}</h1>
          <p className="text-white/85 mt-3 text-sm">{subj?.name} · {p.university} · {p.examMonth ?? ''} {p.examYear} · Total: {totalMarks} marks</p>
        </div>
      </GradientHero>
      <section className="container mx-auto px-4 py-10 max-w-3xl">
        <QuestionsClient questions={p.questions} hasSolutions={p.isSolved} />
      </section>
    </>
  )
}
