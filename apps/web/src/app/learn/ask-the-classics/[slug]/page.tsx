import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { GradientHero } from '@ayurconnect/ui'
import { BookOpen, ChevronRight } from 'lucide-react'
import { breadcrumbLd, ldGraph, clip, pageMetadata, SITE_URL } from '../../../../lib/seo'
import { ANSWERED_QA } from '../_answered'

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return ANSWERED_QA.map((qa) => ({ slug: qa.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const qa = ANSWERED_QA.find((q) => q.slug === slug)
  if (!qa) return { title: 'Not found' }
  return pageMetadata({
    title: `${qa.question} — Ask the Classics`,
    description: clip(qa.answer, 158),
    path: `/learn/ask-the-classics/${qa.slug}`,
    type: 'article',
  })
}

export default async function AnsweredPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const qa = ANSWERED_QA.find((q) => q.slug === slug)
  if (!qa) notFound()

  // QAPage structured data — the canonical schema for a single answered question.
  const qaLd = {
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    mainEntity: {
      '@type': 'Question',
      name: qa.question,
      text: qa.question,
      answerCount: 1,
      acceptedAnswer: {
        '@type': 'Answer',
        text: qa.answer,
        url: `${SITE_URL}/learn/ask-the-classics/${qa.slug}`,
      },
    },
  }
  const ld = ldGraph(
    breadcrumbLd([
      { name: 'Home', url: '/' },
      { name: 'Ask the Classics', url: '/learn/ask-the-classics' },
      { name: qa.question, url: `/learn/ask-the-classics/${qa.slug}` },
    ]),
    qaLd,
  )

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <GradientHero variant="green" size="md">
        <nav className="text-sm text-white/70 mb-3">
          <Link href="/learn/ask-the-classics" className="hover:text-white">Ask the Classics</Link>
        </nav>
        <h1 className="font-serif text-2xl md:text-4xl font-bold max-w-3xl">{qa.question}</h1>
      </GradientHero>

      <section className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="prose prose-sm max-w-none text-gray-800 lede whitespace-pre-wrap">{qa.answer}</div>

        <div className="mt-8">
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-2 flex items-center gap-1">
            <BookOpen className="w-3 h-3" /> Sources
          </p>
          <ul className="space-y-1">
            {qa.citations.map((c, i) => (
              <li key={i} className="text-gray-700">
                <span className="font-semibold text-kerala-800">{c.source}</span> — {c.ref}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/learn/ask-the-classics" className="text-kerala-700 font-medium hover:underline inline-flex items-center gap-1">
            Ask your own question <ChevronRight className="w-4 h-4" />
          </Link>
          <Link href="/heritage/classical-texts" className="text-kerala-700 font-medium hover:underline inline-flex items-center gap-1">
            About these texts <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <p className="mt-8 rounded-2xl bg-kerala-50 p-5 text-sm text-gray-600">
          Based on classical texts; consult a doctor for personal advice. This is an educational
          reference grounded in public-domain Ayurvedic scripture, not a diagnosis or prescription.
        </p>
      </section>
    </main>
  )
}
