import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { ArrowLeft, BookOpen } from 'lucide-react'
import { pageMetadata, ldGraph, breadcrumbLd, articleLd } from '../../../../lib/seo'
import { ARTICLES, ARTICLE_SLUGS } from '../_seed'

export const dynamic = 'force-dynamic';

export function generateStaticParams() { return ARTICLE_SLUGS.map((slug) => ({ slug })) }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const a = ARTICLES.find((x) => x.slug === slug)
  if (!a) return { title: 'Not found' }
  return pageMetadata({
    path: `/jobs/articles/${slug}`,
    title: `${a.title}`,
    description: a.excerpt,
    keywords: [a.category, 'ayurveda career', 'BAMS', 'ayurveda jobs'],
  })
}

function renderBody(md: string): React.ReactNode[] {
  const blocks = md.split(/\n\n+/)
  return blocks.map((b, i) => {
    if (b.startsWith('### ')) return <h3 key={i} className="font-serif text-lg text-kerala-700 mt-5">{b.replace(/^###\s*/, '')}</h3>
    if (b.startsWith('## ')) return <h2 key={i} className="font-serif text-2xl text-ink mt-6">{b.replace(/^##\s*/, '')}</h2>
    if (b.startsWith('- ')) return <ul key={i} className="list-disc list-inside text-gray-800 space-y-1 mt-2">{b.split('\n').filter((l) => l.startsWith('- ')).map((l, j) => <li key={j}>{l.slice(2)}</li>)}</ul>
    return <p key={i} className="text-gray-800 mt-3 leading-relaxed whitespace-pre-line">{b}</p>
  })
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const a = ARTICLES.find((x) => x.slug === slug)
  if (!a) notFound()
  const ld = ldGraph(
    articleLd({ id: slug, title: a.title, content: a.excerpt, category: a.category, createdAt: '2026-06-16', authorName: 'AyurConnect Editorial', urlPath: `/jobs/articles/${slug}` }),
    breadcrumbLd([
      { name: 'Home', url: '/' },
      { name: 'Jobs', url: '/jobs' },
      { name: 'Articles', url: '/jobs/articles' },
      { name: a.title, url: `/jobs/articles/${slug}` },
    ]),
  )
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <Link href="/jobs/articles" className="inline-flex items-center gap-1 text-xs text-white/80 hover:text-white mb-3"><ArrowLeft className="w-3.5 h-3.5" /> All articles</Link>
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4"><BookOpen className="w-3 h-3" /> {a.category} · {a.readTime}</span>
          <h1 className="font-serif text-3xl md:text-4xl text-white leading-tight">{a.title}</h1>
        </div>
      </GradientHero>
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        {renderBody(a.body)}
        {a.related.length > 0 && (
          <section className="mt-10 border-t border-gray-100 pt-6">
            <h3 className="font-serif text-lg text-ink mb-3">Related</h3>
            <ul className="space-y-2">
              {a.related.map((r) => <li key={r.href}><Link href={r.href} className="text-sm text-kerala-700 hover:underline">→ {r.label}</Link></li>)}
            </ul>
          </section>
        )}
      </article>
    </>
  )
}
