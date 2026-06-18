import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { ChevronLeft, Clock, Play, Tag } from 'lucide-react'
import { pageMetadata } from '../../../../lib/seo'
import { WORKSHOPS, WORKSHOP_SLUGS } from '../_data'

export function generateStaticParams() { return WORKSHOP_SLUGS.map((slug) => ({ slug })) }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const w = WORKSHOPS.find((x) => x.slug === slug)
  if (!w) return { title: 'Not found' }
  return pageMetadata({
    path: `/learn/workshops/${slug}`,
    title: `${w.title} | AyurConnect Workshop`,
    description: w.description.slice(0, 160),
    keywords: w.tags,
  })
}

export default async function WorkshopDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const w = WORKSHOPS.find((x) => x.slug === slug)
  if (!w) notFound()
  return (
    <>
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <Link href="/learn/workshops" className="inline-flex items-center gap-1 text-xs text-white/80 hover:text-white mb-3"><ChevronLeft className="w-3.5 h-3.5" /> All workshops</Link>
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4"><Clock className="w-3 h-3" /> {w.duration} min · FREE</span>
          <h1 className="font-serif text-3xl md:text-4xl text-white leading-tight">{w.title}</h1>
          <p className="text-white/85 mt-3 text-sm">by {w.instructor}</p>
        </div>
      </GradientHero>
      <section className="container mx-auto px-4 py-10 max-w-3xl space-y-5">
        <article className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
          <h2 className="font-serif text-lg text-ink">About the workshop</h2>
          <p className="text-sm text-gray-800 mt-2 whitespace-pre-line">{w.description}</p>
          <a href={w.recordingUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-1.5 px-5 py-2.5 bg-kerala-700 hover:bg-kerala-800 text-white rounded font-semibold text-sm"><Play className="w-4 h-4" /> Watch recording</a>
          <p className="text-[11px] text-gray-500 mt-2">Recording will open in a new tab. Upload pending — placeholder for now.</p>
        </article>
        <article className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
          <h2 className="font-serif text-lg text-ink">About the instructor</h2>
          <p className="text-sm text-gray-800 mt-2">{w.instructorBio}</p>
        </article>
        {w.tags.length > 0 && (
          <article className="bg-cream border border-kerala-100 rounded-card p-4">
            <p className="text-xs text-gray-600 mb-1 inline-flex items-center gap-1"><Tag className="w-3 h-3" /> Tags</p>
            <div className="flex flex-wrap gap-1.5">{w.tags.map((t) => <span key={t} className="text-[10px] px-2 py-0.5 bg-white border border-kerala-200 text-kerala-800 rounded-full">{t}</span>)}</div>
          </article>
        )}
      </section>
    </>
  )
}
