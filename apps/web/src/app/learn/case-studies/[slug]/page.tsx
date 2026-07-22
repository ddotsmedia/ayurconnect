import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { ChevronLeft } from 'lucide-react'
import { pageMetadata, breadcrumbLd, ldGraph } from '../../../../lib/seo'
import { CASES, CASE_SLUGS } from '../_data'
import { ProgressiveClient } from './_client'

export const dynamic = 'force-dynamic';

export function generateStaticParams() { return CASE_SLUGS.map((slug) => ({ slug })) }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const c = CASES.find((x) => x.slug === slug)
  if (!c) return { title: 'Not found' }
  return pageMetadata({
    path: `/learn/case-studies/${slug}`,
    title: `${c.title} | Ayurveda Case Study`,
    description: c.chiefComplaint.slice(0, 160),
    keywords: [...c.tags, 'ayurveda case'],
  })
}

export default async function CaseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const c = CASES.find((x) => x.slug === slug)
  if (!c) notFound()
  const related = CASES.filter((x) => x.specialization === c.specialization && x.slug !== c.slug).slice(0, 3)
  const ld = ldGraph(
    { '@context': 'https://schema.org', '@type': 'LearningResource', name: c.title, learningResourceType: 'CaseStudy', isAccessibleForFree: true },
    breadcrumbLd([
      { name: 'Home', url: '/' }, { name: 'Learn', url: '/learn' },
      { name: 'Case Studies', url: '/learn/case-studies' },
      { name: c.title, url: `/learn/case-studies/${slug}` },
    ]),
  )
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <Link href="/learn/case-studies" className="inline-flex items-center gap-1 text-xs text-white/80 hover:text-white mb-3"><ChevronLeft className="w-3.5 h-3.5" /> All cases</Link>
          <h1 className="font-serif text-3xl md:text-4xl text-white leading-tight">{c.title}</h1>
          <p className="text-white/85 mt-3 text-sm">{c.specialization} · {c.patientAge}y {c.patientGender} · {c.difficulty}</p>
        </div>
      </GradientHero>
      <section className="container mx-auto px-4 py-10 max-w-3xl">
        <ProgressiveClient caseStudy={c} />
        {related.length > 0 && (
          <section className="mt-10 border-t border-gray-100 pt-5">
            <h3 className="font-serif text-lg text-ink mb-3">Related cases</h3>
            <ul className="space-y-1.5">
              {related.map((r) => <li key={r.slug}><Link href={`/learn/case-studies/${r.slug}`} className="text-sm text-kerala-700 hover:underline">→ {r.title}</Link></li>)}
            </ul>
          </section>
        )}
      </section>
    </>
  )
}
