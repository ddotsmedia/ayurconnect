import Link from 'next/link'
import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { BookOpen, ChevronRight } from 'lucide-react'
import { breadcrumbLd, ldGraph, faqLd, pageMetadata } from '../../../lib/seo'
import { AskTheClassicsForm } from './_form'
import { ANSWERED_QA } from './_answered'

export const metadata: Metadata = pageMetadata({
  title: 'Ask the Classics — Grounded Answers from the Ayurvedic Samhitas',
  description:
    'Ask questions and get answers grounded strictly in the classical Ayurvedic texts — Charaka Samhita, Ashtanga Hridayam, Sushruta Samhita, Sahasrayogam and Chikitsamanjari — with inline verse citations. Educational; consult a doctor for personal advice.',
  path: '/learn/ask-the-classics',
})

export default function AskTheClassicsPage() {
  const ld = ldGraph(
    breadcrumbLd([
      { name: 'Home', url: '/' },
      { name: 'Learn', url: '/learn/ask-the-classics' },
      { name: 'Ask the Classics', url: '/learn/ask-the-classics' },
    ]),
    faqLd(ANSWERED_QA.map((qa) => ({ q: qa.question, a: qa.answer }))),
  )

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <GradientHero variant="green">
        <p className="text-gold-200 font-medium mb-2 flex items-center gap-2">
          <BookOpen className="w-4 h-4" /> ക്ലാസിക്കുകളോട് ചോദിക്കുക
        </p>
        <h1 className="font-serif text-3xl md:text-5xl font-bold mb-4">Ask the Classics</h1>
        <p className="text-white/90 max-w-2xl text-lg">
          Pose a question and receive an answer drawn strictly from the classical Samhitas — Charaka,
          Vagbhata's Ashtanga Hridayam, Sushruta, and the Kerala formularies — with the source verses
          cited. If the texts don't cover your question, it will say so rather than guess.
        </p>
      </GradientHero>

      <section className="container mx-auto px-4 py-12 max-w-3xl">
        <AskTheClassicsForm />

        <div className="mt-14">
          <h2 className="font-serif text-2xl text-kerala-800 mb-4">Answered from the classics</h2>
          <p className="text-gray-600 mb-5 text-sm">
            Curated reference answers, each grounded in cited verses.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {ANSWERED_QA.map((qa) => (
              <Link
                key={qa.slug}
                href={`/learn/ask-the-classics/${qa.slug}`}
                className="group rounded-xl border border-kerala-100 bg-white p-4 shadow-card hover:shadow-cardLg transition-shadow"
              >
                <p className="font-medium text-gray-900 flex items-start gap-1">
                  {qa.question}
                  <ChevronRight className="w-4 h-4 mt-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </p>
              </Link>
            ))}
          </div>
        </div>

        <p className="mt-10 rounded-2xl bg-kerala-50 p-5 text-sm text-gray-600">
          Disclaimer: answers are educational summaries grounded in public-domain classical texts.
          They are not a diagnosis or prescription. Consult a verified Ayurveda doctor for personal advice.
        </p>
      </section>
    </main>
  )
}
