import Link from 'next/link'
import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { BookOpen } from 'lucide-react'
import { pageMetadata } from '../../../lib/seo'
import { ARTICLES } from './_seed'

export const metadata: Metadata = pageMetadata({
  path: '/jobs/articles',
  title: 'Ayurveda Career Articles | AyurConnect Jobs',
  description: 'Career guides for Ayurveda doctors — BAMS options, GCC licensing, salaries, resumes, interview tips, locum work, telemedicine.',
  keywords: ['ayurveda career articles', 'BAMS career guide', 'ayurveda salary', 'DHA licensing'],
})

export default function ArticlesPage() {
  return (
    <>
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">Career Articles</h1>
          <p className="text-white/85 mt-3">10 in-depth guides on Ayurveda careers, licensing, salaries, and job-search tactics.</p>
        </div>
      </GradientHero>
      <section className="container mx-auto px-4 py-10 max-w-4xl">
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ARTICLES.map((a) => (
            <li key={a.slug} className="bg-white border border-gray-100 rounded-card p-4 shadow-card hover:shadow-cardLg">
              <Link href={`/jobs/articles/${a.slug}`} className="font-serif text-lg text-ink hover:text-kerala-700 inline-flex items-start gap-2"><BookOpen className="w-4 h-4 text-kerala-700 mt-1 flex-shrink-0" /> {a.title}</Link>
              <p className="text-xs text-gray-600 mt-1">{a.category} · {a.readTime}</p>
              <p className="text-sm text-gray-700 mt-2 line-clamp-3">{a.excerpt}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
