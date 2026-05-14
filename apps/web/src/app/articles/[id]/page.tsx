import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowLeft, BookOpen, Calendar, ScrollText, FlaskConical, Leaf } from 'lucide-react'
import { API_INTERNAL as API } from '../../../lib/server-fetch'
import { articleLd, breadcrumbLd, ldGraph, clip, SITE_URL } from '../../../lib/seo'

type Article = {
  id: string
  title: string
  content: string
  category: string
  source: string | null
  language: string
  createdAt: string
  updatedAt: string
}

const CATEGORY_LABEL: Record<string, string> = {
  'classical-text':  'Classical Text',
  research:          'Research',
  'seasonal-health': 'Seasonal Health',
  lifestyle:         'Lifestyle',
}

const CATEGORY_ICON: Record<string, typeof BookOpen> = {
  'classical-text':  ScrollText,
  research:          FlaskConical,
  'seasonal-health': Calendar,
  lifestyle:         Leaf,
}

async function fetchArticle(id: string): Promise<Article | null> {
  try {
    const res = await fetch(`${API}/articles/${id}`, { cache: 'no-store' })
    if (!res.ok) return null
    return (await res.json()) as Article
  } catch { return null }
}

async function fetchRelated(currentId: string, category: string): Promise<Article[]> {
  try {
    const res = await fetch(`${API}/articles?category=${encodeURIComponent(category)}&limit=8`, { next: { revalidate: 600 } })
    if (!res.ok) return []
    const data = await res.json() as { articles?: Article[] }
    const items = data.articles ?? []
    return items.filter((a) => a.id !== currentId).slice(0, 4)
  } catch { return [] }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const a = await fetchArticle(id)
  if (!a) return { title: 'Article not found' }

  const title = a.title
  const description = clip(a.content, 200)
  return {
    title: `${title} | AyurConnect`,
    description,
    alternates: { canonical: `/articles/${a.id}` },
    openGraph: {
      title, description,
      url: `${SITE_URL}/articles/${a.id}`,
      type: 'article',
      images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

// Render plain-text article content as a series of paragraphs. Authors paste
// content into the admin form; we don't accept Markdown/HTML yet, so this is
// intentionally simple: split on blank lines, keep line breaks within blocks.
function renderContent(content: string) {
  const blocks = content.split(/\n\s*\n+/).map((b) => b.trim()).filter(Boolean)
  return blocks.map((b, i) => (
    <p key={i} className="leading-relaxed whitespace-pre-line">{b}</p>
  ))
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const article = await fetchArticle(id)
  if (!article) notFound()

  const related = await fetchRelated(article.id, article.category)

  const Icon = CATEGORY_ICON[article.category] ?? BookOpen
  const categoryLabel = CATEGORY_LABEL[article.category] ?? article.category

  const jsonLd = ldGraph(
    articleLd({
      id: article.id,
      title: article.title,
      content: article.content,
      category: article.category,
      language: article.language,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      authorName: article.source ?? null,
      urlPath: `/articles/${article.id}`,
    }),
    breadcrumbLd([
      { name: 'Home', url: '/' },
      { name: 'Articles', url: '/articles' },
      { name: article.title, url: `/articles/${article.id}` },
    ]),
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="bg-kerala-50 border-b border-kerala-100">
        <div className="container mx-auto px-4 py-3 text-sm">
          <Link href="/articles" className="inline-flex items-center gap-1.5 text-kerala-700 hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" /> All articles
          </Link>
        </div>
      </div>

      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="mb-5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-kerala-50 text-kerala-700 border border-kerala-100">
            <Icon className="w-3 h-3" /> {categoryLabel}
          </span>
          {article.language !== 'en' && (
            <span className="ml-2 text-[10px] uppercase tracking-wider text-gray-400 font-mono">{article.language}</span>
          )}
        </div>

        <h1 className="font-serif text-3xl md:text-5xl text-ink leading-tight mb-4">{article.title}</h1>

        {article.source && (
          <p className="text-sm text-gray-500 italic mb-6">Source: {article.source}</p>
        )}

        <div className="prose prose-kerala max-w-none text-gray-800 space-y-4 text-[15px]">
          {renderContent(article.content)}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 text-xs text-gray-400">
          Published {new Date(article.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </article>

      {related.length > 0 && (
        <section className="bg-gray-50 border-t border-gray-100 py-10">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="font-serif text-2xl text-ink mb-5">More in {categoryLabel}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map((a) => (
                <Link
                  key={a.id}
                  href={`/articles/${a.id}`}
                  className="bg-white rounded-card border border-gray-100 shadow-card hover:shadow-cardLg transition-shadow p-4"
                >
                  <h3 className="font-serif text-base text-ink leading-snug line-clamp-2 hover:text-kerala-700 transition-colors">{a.title}</h3>
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">{clip(a.content, 100)}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
