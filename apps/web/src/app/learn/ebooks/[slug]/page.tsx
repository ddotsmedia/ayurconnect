import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { ChevronLeft, BookOpen, Download } from 'lucide-react'
import { pageMetadata } from '../../../../lib/seo'
import { EBOOKS, EBOOK_SLUGS } from '../_data'

export const dynamic = 'force-dynamic';

export function generateStaticParams() { return EBOOK_SLUGS.map((slug) => ({ slug })) }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const e = EBOOKS.find((x) => x.slug === slug)
  if (!e) return { title: 'Not found' }
  return pageMetadata({
    path: `/learn/ebooks/${slug}`,
    title: `${e.title} | AyurConnect E-Book`,
    description: e.description.slice(0, 160),
    keywords: e.tags,
  })
}

export default async function EbookDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const e = EBOOKS.find((x) => x.slug === slug)
  if (!e) notFound()
  const related = EBOOKS.filter((x) => x.category === e.category && x.slug !== e.slug).slice(0, 3)
  return (
    <>
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <Link href="/learn/ebooks" className="inline-flex items-center gap-1 text-xs text-white/80 hover:text-white mb-3"><ChevronLeft className="w-3.5 h-3.5" /> All e-books</Link>
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4"><BookOpen className="w-3 h-3" /> {e.pages} pages · FREE</span>
          <h1 className="font-serif text-3xl md:text-4xl text-white leading-tight">{e.title}</h1>
          <p className="text-white/85 mt-3 text-sm">by {e.author}</p>
        </div>
      </GradientHero>
      <section className="container mx-auto px-4 py-10 max-w-3xl space-y-5">
        <article className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
          <h2 className="font-serif text-lg text-ink">About this book</h2>
          <p className="text-sm text-gray-800 mt-2 whitespace-pre-line">{e.description}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <a href="#" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-kerala-700 hover:bg-kerala-800 text-white rounded font-semibold text-sm"><Download className="w-4 h-4" /> Download free PDF</a>
          </div>
          <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded p-2 mt-3">Note: We&apos;re finalising digital rights for some titles. Upload in progress — placeholder link for now. Library will be live across all titles by end of month.</p>
        </article>

        <article className="bg-cream border border-kerala-100 rounded-card p-4">
          <h3 className="font-serif text-base text-ink mb-2">Metadata</h3>
          <dl className="grid grid-cols-2 gap-2 text-xs">
            <div><dt className="text-gray-500">Pages</dt><dd className="text-gray-900">{e.pages}</dd></div>
            <div><dt className="text-gray-500">File size</dt><dd className="text-gray-900">{e.fileSize}</dd></div>
            <div><dt className="text-gray-500">Format</dt><dd className="text-gray-900 uppercase">{e.format}</dd></div>
            <div><dt className="text-gray-500">Language</dt><dd className="text-gray-900">{e.language}</dd></div>
          </dl>
        </article>

        {related.length > 0 && (
          <section>
            <h3 className="font-serif text-lg text-ink mb-3">More like this</h3>
            <ul className="space-y-1.5">
              {related.map((r) => <li key={r.slug}><Link href={`/learn/ebooks/${r.slug}`} className="text-sm text-kerala-700 hover:underline">→ {r.title}</Link></li>)}
            </ul>
          </section>
        )}
      </section>
    </>
  )
}
