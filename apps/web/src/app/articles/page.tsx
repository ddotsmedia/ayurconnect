import Link from 'next/link'
import { GradientHero } from '@ayurconnect/ui'
import { BookOpen, ScrollText, FlaskConical, Leaf, Calendar } from 'lucide-react'
import { API_INTERNAL as API } from '../../lib/server-fetch'

type Article = {
  id: string
  title: string
  content: string
  category: string
  source: string | null
  language: string
  createdAt: string
}

type Category = { id: string; name: string; description: string }

const CATEGORY_TONE: Record<string, { bg: string; chip: string; icon: typeof BookOpen }> = {
  'classical-text':   { bg: 'bg-amber-50',   chip: 'bg-amber-600 text-white',   icon: ScrollText },
  research:           { bg: 'bg-blue-50',    chip: 'bg-blue-600 text-white',    icon: FlaskConical },
  'seasonal-health':  { bg: 'bg-emerald-50', chip: 'bg-emerald-600 text-white', icon: Calendar },
  lifestyle:          { bg: 'bg-kerala-50',  chip: 'bg-kerala-700 text-white',  icon: Leaf },
}

type SP = { category?: string; language?: string; search?: string }

async function fetchArticles(params: SP): Promise<Article[]> {
  try {
    const qs = new URLSearchParams()
    if (params.category) qs.set('category', params.category)
    if (params.language) qs.set('language', params.language)
    if (params.search)   qs.set('search',   params.search)
    qs.set('limit', '60')
    const res = await fetch(`${API}/articles?${qs.toString()}`, { next: { revalidate: 600 } })
    if (!res.ok) return []
    const data = await res.json() as { articles: Article[] }
    return data.articles ?? []
  } catch { return [] }
}

async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API}/articles/categories`, { next: { revalidate: 86400 } })
    if (!res.ok) return []
    return (await res.json()) as Category[]
  } catch { return [] }
}

export const metadata = {
  title: 'Ayurveda Articles — Classical Texts, Research, Seasonal Health | AyurConnect',
  description: 'Curated Ayurveda reading: Charaka Samhita and Ashtanga Hridayam excerpts, PubMed research, seasonal regimens (Ritucharya), and lifestyle guidance from verified practitioners.',
  alternates: { canonical: '/articles' },
}

function previewOf(content: string, max = 220): string {
  const clean = content.replace(/\s+/g, ' ').trim()
  return clean.length > max ? clean.slice(0, max).trimEnd() + '…' : clean
}

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams
  const [articles, categories] = await Promise.all([fetchArticles(sp), fetchCategories()])

  return (
    <>
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
            <BookOpen className="w-3 h-3" /> Knowledge library
          </span>
          <h1 className="text-3xl md:text-5xl text-white">Articles & Classical Texts</h1>
          <p className="text-white/70 mt-3">
            Curated Ayurveda reading — Charaka Samhita and Ashtanga Hridayam excerpts,
            modern research, seasonal regimens, and lifestyle guidance.
          </p>
        </div>
      </GradientHero>

      <div className="container mx-auto px-4 py-10">
        {/* Category filter strip */}
        <nav aria-label="Filter by category" className="mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            <Link
              href="/articles"
              className={
                'shrink-0 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm border transition-colors whitespace-nowrap ' +
                (!sp.category
                  ? 'bg-kerala-700 text-white border-kerala-700 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-kerala-200 hover:bg-kerala-50')
              }
            >
              <BookOpen className="w-3.5 h-3.5" />
              All articles
            </Link>
            {categories.map((c) => {
              const tone = CATEGORY_TONE[c.id]
              const Icon = tone?.icon ?? BookOpen
              const active = sp.category === c.id
              return (
                <Link
                  key={c.id}
                  href={`/articles?category=${c.id}`}
                  title={c.description}
                  className={
                    'shrink-0 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm border transition-colors whitespace-nowrap ' +
                    (active
                      ? 'bg-kerala-700 text-white border-kerala-700 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-kerala-200 hover:bg-kerala-50')
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  {c.name}
                </Link>
              )
            })}
          </div>
        </nav>

        <p className="text-sm text-muted mb-5">
          <strong className="text-ink">{articles.length}</strong> article{articles.length === 1 ? '' : 's'}
          {sp.category ? ` in ${categories.find((c) => c.id === sp.category)?.name ?? sp.category}` : ''}
        </p>

        {articles.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-100 rounded-card">
            <div className="text-5xl mb-3">📜</div>
            <h3 className="text-lg font-semibold text-gray-900">No articles yet in this category.</h3>
            <p className="text-muted mt-1">
              Try <Link href="/articles" className="text-kerala-700 underline">all articles</Link>{' '}
              or browse the <Link href="/knowledge" className="text-kerala-700 underline">knowledge hub</Link>.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {articles.map((a) => {
              const tone = CATEGORY_TONE[a.category]
              const Icon = tone?.icon ?? BookOpen
              return (
                <Link
                  key={a.id}
                  href={`/articles/${a.id}`}
                  className="group bg-white rounded-card border border-gray-100 shadow-card hover:shadow-cardLg transition-shadow p-5 flex flex-col"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${tone?.chip ?? 'bg-gray-200 text-gray-800'}`}>
                      <Icon className="w-3 h-3" /> {a.category.replace(/-/g, ' ')}
                    </span>
                    {a.language !== 'en' && (
                      <span className="text-[10px] uppercase tracking-wider text-gray-400 font-mono">{a.language}</span>
                    )}
                  </div>
                  <h2 className="font-serif text-lg text-ink leading-snug mb-2 group-hover:text-kerala-700 transition-colors line-clamp-2">{a.title}</h2>
                  <p className="text-sm text-gray-600 line-clamp-3 flex-1">{previewOf(a.content)}</p>
                  {a.source && (
                    <p className="text-xs text-gray-400 italic mt-3 pt-3 border-t border-gray-100">— {a.source}</p>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
