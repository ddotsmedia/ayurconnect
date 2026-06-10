import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { ChevronRight, ArrowLeft, BookOpen } from 'lucide-react'
import { API_INTERNAL as API } from '../../../../lib/server-fetch'
import { breadcrumbLd, ldGraph, pageMetadata } from '../../../../lib/seo'

type Cat     = { id: string; slug: string; name: string; nameMl: string | null; description: string | null; icon: string | null; color: string | null; articleCount: number }
type Article = { id: string; title: string; titleMl?: string | null; content: string; language: string; createdAt: string; readTimeMinutes?: number | null; viewCount?: number; categoryRef?: { slug: string; name: string; color: string | null } | null }

async function fetchCategory(slug: string): Promise<Cat | null> {
  try {
    const r = await fetch(`${API}/article-categories/${encodeURIComponent(slug)}`, { next: { revalidate: 600 } })
    if (!r.ok) return null
    const j = await r.json() as { item: Cat }
    return j.item
  } catch { return null }
}

async function fetchArticles(slug: string): Promise<Article[]> {
  try {
    const r = await fetch(`${API}/knowledge?categorySlug=${encodeURIComponent(slug)}&limit=60`, { next: { revalidate: 300 } }).catch(() => null)
    if (r && r.ok) {
      const j = await r.json() as { articles?: Article[]; items?: Article[] }
      return j.articles ?? j.items ?? []
    }
  } catch { /* fall through */ }
  // Fallback: legacy /articles list filtered by string category
  try {
    const r = await fetch(`${API}/articles?category=${encodeURIComponent(slug)}&limit=60`, { next: { revalidate: 300 } })
    if (!r.ok) return []
    const j = await r.json() as { articles?: Article[] }
    return j.articles ?? []
  } catch { return [] }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const c = await fetchCategory(slug)
  if (!c) return { title: 'Not found', robots: { index: false, follow: false } }
  return pageMetadata({
    path:        `/articles/category/${slug}`,
    title:       `${c.name} — Ayurveda Articles | AyurConnect`,
    description: (c.description ?? `Curated Ayurveda articles in the ${c.name} category — Kerala-tradition guidance, classical references, doctor-reviewed.`).slice(0, 160),
    keywords:    ['ayurveda articles', c.name.toLowerCase(), c.nameMl ?? '', 'kerala ayurveda'].filter(Boolean) as string[],
  })
}

export default async function CategoryArticlesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const c = await fetchCategory(slug)
  if (!c) notFound()
  const arts = await fetchArticles(slug)
  const ld = ldGraph(
    breadcrumbLd([
      { name: 'Home',     url: '/' },
      { name: 'Articles', url: '/articles' },
      { name: c.name,     url: `/articles/category/${c.slug}` },
    ]),
    {
      '@context': 'https://schema.org',
      '@type':    'ItemList',
      itemListElement: arts.slice(0, 20).map((a, i) => ({ '@type': 'ListItem', position: i + 1, url: `https://ayurconnect.com/articles/${a.id}`, name: a.title })),
    },
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <Link href="/articles" className="inline-flex items-center gap-1 text-sm text-white/80 hover:text-white mb-3">
            <ArrowLeft className="w-3.5 h-3.5" /> All articles
          </Link>
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
            <BookOpen className="w-3 h-3" /> {arts.length} article{arts.length === 1 ? '' : 's'}
          </span>
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">{c.name}</h1>
          {c.nameMl && <p className="font-serif text-lg text-white/85 mt-1">{c.nameMl}</p>}
          {c.description && <p className="text-white/85 mt-4 max-w-2xl mx-auto">{c.description}</p>}
        </div>
      </GradientHero>

      <section className="container mx-auto px-4 py-10 max-w-4xl">
        {arts.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-card p-10 text-center shadow-card">
            <p className="text-gray-700">No articles in this category yet.</p>
            <p className="text-xs text-gray-500 mt-1">Check back soon — editorial publishes weekly.</p>
            <Link href="/articles" className="mt-4 inline-flex items-center gap-1 text-sm text-kerala-700 hover:underline">Browse all articles <ChevronRight className="w-4 h-4" /></Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {arts.map((a) => (
              <li key={a.id}>
                <Link href={`/articles/${a.id}`} className="block bg-white border border-gray-100 rounded-card p-5 shadow-card hover:shadow-cardLg transition-shadow">
                  {a.language === 'ml' && <span className="inline-block text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-amber-50 text-amber-800 rounded mb-2">മലയാളം</span>}
                  <h3 className="font-serif text-lg text-ink">{a.title}</h3>
                  {a.titleMl && a.language !== 'ml' && <p className="font-serif text-sm text-gray-500 mt-0.5">{a.titleMl}</p>}
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(a.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {a.readTimeMinutes ? ` · ${a.readTimeMinutes} min read` : ''}
                    {a.viewCount ? ` · ${a.viewCount} views` : ''}
                  </p>
                  <p className="text-sm text-gray-700 mt-2 line-clamp-2">{a.content.slice(0, 240)}…</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
