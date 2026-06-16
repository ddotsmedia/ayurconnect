import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { CheckCircle2, ChevronLeft, Clock, IndianRupee, FileText, Sparkles } from 'lucide-react'
import { pageMetadata } from '../../../../lib/seo'
import { GUIDES, GUIDE_SLUGS } from '../_data'

export function generateStaticParams() { return GUIDE_SLUGS.map((slug) => ({ slug })) }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const g = GUIDES.find((x) => x.slug === slug)
  if (!g) return { title: 'Not found' }
  return pageMetadata({
    path: `/jobs/licensing/${slug}`,
    title: `${g.title} | AyurConnect`,
    description: g.description.slice(0, 160),
    keywords: [g.jurisdiction, 'ayurveda license', 'BAMS abroad', g.jurisdiction.toLowerCase()],
  })
}

export default async function LicensingDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const g = GUIDES.find((x) => x.slug === slug)
  if (!g) notFound()
  return (
    <>
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <Link href="/jobs/licensing" className="inline-flex items-center gap-1 text-xs text-white/80 hover:text-white mb-3"><ChevronLeft className="w-3.5 h-3.5" /> All jurisdictions</Link>
          <h1 className="font-serif text-3xl md:text-4xl text-white leading-tight">{g.title}</h1>
          <p className="text-white/85 mt-3 max-w-2xl mx-auto">{g.description}</p>
          <div className="mt-4 inline-flex flex-wrap items-center gap-3 text-xs text-white/80">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/10 border border-white/20 rounded-full"><Clock className="w-3 h-3" /> {g.processingTime}</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/10 border border-white/20 rounded-full"><IndianRupee className="w-3 h-3" /> {g.estimatedCost}</span>
          </div>
        </div>
      </GradientHero>

      <section className="container mx-auto px-4 py-10 max-w-3xl space-y-6">
        <Box title="Eligibility">
          <ul className="space-y-1.5">{g.eligibilityCriteria.map((c) => <Li key={c}>{c}</Li>)}</ul>
        </Box>
        <Box title="Document checklist">
          <ul className="space-y-1.5">{g.documentChecklist.map((d) => <Li key={d}><FileText className="w-3.5 h-3.5 text-kerala-700 mt-0.5 flex-shrink-0" /> {d}</Li>)}</ul>
        </Box>
        {g.examDetails && (
          <Box title="Exam">
            <p className="text-sm text-gray-800">{g.examDetails}</p>
          </Box>
        )}
        <Box title="Step-by-step process">
          <ol className="space-y-2 list-decimal list-inside text-sm text-gray-800">
            {g.steps.map((s, i) => <li key={i}><strong className="text-kerala-700">{i + 1}.</strong> {s}</li>)}
          </ol>
        </Box>
        {g.tips.length > 0 && (
          <Box title="Tips">
            <ul className="space-y-1.5">{g.tips.map((t) => <Li key={t}><Sparkles className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" /> {t}</Li>)}</ul>
          </Box>
        )}

        <section className="bg-gradient-to-br from-kerala-50 via-white to-amber-50 border border-kerala-100 rounded-card p-5 text-center shadow-card">
          <h2 className="font-serif text-xl text-ink">Track your licensing progress</h2>
          <p className="text-xs text-gray-700 mt-1">Stage-by-stage tracker — documents collected → submitted → exam → license issued.</p>
          <Link href="/jobs/profile/licensing" className="mt-3 inline-block px-4 py-2 bg-kerala-700 hover:bg-kerala-800 text-white rounded text-sm font-semibold">Open license tracker →</Link>
        </section>
      </section>
    </>
  )
}

function Box({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
      <h2 className="font-serif text-lg text-ink">{title}</h2>
      <div className="mt-2">{children}</div>
    </article>
  )
}
function Li({ children }: { children: React.ReactNode }) {
  return <li className="flex items-start gap-2 text-sm text-gray-800"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 mt-0.5 flex-shrink-0" /> <span>{children}</span></li>
}
