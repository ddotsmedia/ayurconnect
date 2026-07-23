import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowLeft, Clock, Calendar, Eye, ExternalLink, MessageCircle, Copy } from 'lucide-react'
import { breadcrumbLd, ldGraph, pageMetadata } from '../../../lib/seo'
import { NEWS_ARTICLES, NEWS_SLUGS, getNewsArticle } from '../../../lib/data/news-seed'
import { NewsCard } from '../../../components/news/NewsCard'
import { CopyShare } from './_share'

export const revalidate = 300 // Phase 4 (2026-07-23): reverted from force-dynamic per audit prompt

export function generateStaticParams() { return NEWS_SLUGS.map((slug) => ({ slug })) }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const a = getNewsArticle(slug)
  if (!a) return { title: 'Not found', robots: { index: false, follow: false } }
  return pageMetadata({
    path:        `/news/${slug}`,
    title:       `${a.title} | AyurConnect News`,
    description: a.excerpt.slice(0, 160),
    keywords:    a.tags,
  })
}

const CAT_COLOR: Record<string, string> = {
  Industry: 'bg-blue-100 text-blue-800', Research: 'bg-violet-100 text-violet-800',
  Government: 'bg-amber-100 text-amber-800', Community: 'bg-emerald-100 text-emerald-800',
  International: 'bg-rose-100 text-rose-800',
}

function renderContent(c: string): React.ReactNode {
  return c.split('\n').map((line, i) => {
    if (line.startsWith('## '))   return <h2 key={i} className="font-serif text-2xl text-ink mt-8 mb-3">{line.slice(3)}</h2>
    if (line.startsWith('- '))    return <li key={i} className="ml-5 list-disc text-gray-700 leading-relaxed">{line.slice(2)}</li>
    if (line.trim() === '')       return null
    return <p key={i} className="text-gray-700 leading-relaxed mt-3">{line}</p>
  })
}

export default async function NewsDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const a = getNewsArticle(slug)
  if (!a) notFound()
  const related = NEWS_ARTICLES.filter((x) => x.id !== a.id && x.category === a.category).slice(0, 3)
  const url = `https://ayurconnect.com/news/${a.slug}`
  const ld = ldGraph(
    {
      '@context': 'https://schema.org', '@type': 'NewsArticle',
      headline: a.title, datePublished: a.publishedAt, dateModified: a.updatedAt,
      author: { '@type': 'Person', name: a.author }, publisher: { '@type': 'Organization', name: 'AyurConnect' },
      mainEntityOfPage: url, description: a.excerpt,
      articleSection: a.category, keywords: a.tags.join(', '),
    },
    breadcrumbLd([
      { name: 'Home', url: '/' }, { name: 'News', url: '/news' },
      { name: a.category, url: `/news?category=${a.category}` }, { name: a.title, url: `/news/${slug}` },
    ]),
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-100 z-50">
        <div id="reading-progress" className="h-full bg-kerala-700 transition-all" style={{ width: '0%' }} />
      </div>

      <div className="aspect-[3/1] bg-gradient-to-br from-kerala-700 via-kerala-600 to-amber-600 flex items-center justify-center p-6" aria-label={a.imageAlt}>
        <h1 className="text-white font-serif text-3xl md:text-5xl text-center leading-tight max-w-4xl">{a.title}</h1>
      </div>

      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <Link href="/news" className="inline-flex items-center gap-1 text-sm text-kerala-700 hover:underline mb-4">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to news
        </Link>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {a.breaking && <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-red-600 text-white rounded font-semibold">Breaking</span>}
          <span className={'text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-semibold ' + (CAT_COLOR[a.category] ?? 'bg-gray-100 text-gray-700')}>{a.category}</span>
        </div>
        <p className="text-lg text-gray-700 leading-relaxed">{a.excerpt}</p>
        <div className="mt-5 flex items-center gap-3 text-xs text-gray-500 flex-wrap border-y border-gray-100 py-3">
          <span className="font-semibold text-ink">{a.author}</span>
          <span className="text-gray-400">·</span>
          <span>{a.authorRole}</span>
          <span className="text-gray-400">·</span>
          <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(a.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {a.readTime} min</span>
          <span className="inline-flex items-center gap-1"><Eye className="w-3 h-3" /> {a.views.toLocaleString()}</span>
        </div>

        <div className="mt-6 prose prose-kerala max-w-none">{renderContent(a.content)}</div>

        <div className="mt-8 flex flex-wrap gap-1.5">
          {a.tags.map((t) => (
            <Link key={t} href={`/news?tag=${encodeURIComponent(t)}`} className="px-2 py-0.5 bg-gray-100 hover:bg-kerala-50 text-xs text-gray-700 hover:text-kerala-700 rounded">#{t}</Link>
          ))}
        </div>

        {a.source && (
          <p className="mt-6 text-xs text-gray-600">
            <strong>Source:</strong> {a.source}
            {a.sourceUrl && <> · <a href={a.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-kerala-700 hover:underline">link <ExternalLink className="w-3 h-3" /></a></>}
          </p>
        )}

        <CopyShare title={a.title} url={url} />
      </article>

      {related.length > 0 && (
        <section className="bg-cream py-10">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="font-serif text-2xl text-ink mb-5">Related in {a.category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {related.map((r) => <NewsCard key={r.id} article={r} />)}
            </div>
          </div>
        </section>
      )}

      <script
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: `
          (function(){function u(){var d=document.documentElement,h=d.scrollHeight-d.clientHeight,p=h>0?(d.scrollTop/h)*100:0;var b=document.getElementById('reading-progress');if(b)b.style.width=p+'%';}window.addEventListener('scroll',u,{passive:true});u();})();
        `}}
      />
    </>
  )
}
