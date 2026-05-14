import Link from 'next/link'
import { GradientHero } from '@ayurconnect/ui'
import { MessageCircleQuestion, ChevronRight, Stethoscope, Search } from 'lucide-react'
import { API_INTERNAL as API } from '../../lib/server-fetch'

type Question = {
  id: string
  slug: string | null
  title: string
  body: string
  category: string
  authorName: string | null
  age: number | null
  gender: string | null
  viewCount: number
  createdAt: string
  answerCount: number
}

type CategoryFacet = { id: string; count: number }
type ListResp = { questions: Question[]; pagination: { total: number; pages: number; page: number } }

const CATEGORY_LABEL: Record<string, string> = {
  panchakarma:    'Panchakarma',
  'womens-health': "Women's health",
  stress:         'Stress & sleep',
  diabetes:       'Diabetes',
  skin:           'Skin & hair',
  pediatric:      'Pediatric',
  joint:          'Joint pain',
  digestion:      'Digestion',
  sleep:          'Sleep',
  general:        'General',
}

async function fetchQuestions(params: Record<string, string>): Promise<ListResp> {
  const qs = new URLSearchParams(params)
  if (!qs.has('limit')) qs.set('limit', '20')
  try {
    const res = await fetch(`${API}/qa?${qs.toString()}`, { next: { revalidate: 300 } })
    if (!res.ok) return { questions: [], pagination: { total: 0, pages: 0, page: 1 } }
    return (await res.json()) as ListResp
  } catch { return { questions: [], pagination: { total: 0, pages: 0, page: 1 } } }
}

async function fetchCategories(): Promise<CategoryFacet[]> {
  try {
    const res = await fetch(`${API}/qa/categories`, { next: { revalidate: 600 } })
    if (!res.ok) return []
    return (await res.json()) as CategoryFacet[]
  } catch { return [] }
}

export const metadata = {
  title: 'Ayurveda Q&A — Free Answers from CCIM Verified Doctors | AyurConnect',
  description: 'Ask any Ayurveda question — answered free by CCIM-verified Kerala doctors. Browse thousands of patient questions on PCOS, diabetes, joint pain, skin, stress, and more.',
  alternates: { canonical: '/qa' },
}

function previewOf(text: string, max = 200): string {
  const t = text.replace(/\s+/g, ' ').trim()
  return t.length > max ? t.slice(0, max).trimEnd() + '…' : t
}

export default async function QAIndexPage({ searchParams }: { searchParams: Promise<{ category?: string; q?: string; page?: string }> }) {
  const sp = await searchParams
  const [list, cats] = await Promise.all([fetchQuestions(sp), fetchCategories()])

  return (
    <>
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
            <MessageCircleQuestion className="w-3 h-3" /> Free Q&A library
          </span>
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">Ayurveda Q&A — answered by CCIM doctors</h1>
          <p className="mt-4 text-white/80">
            Thousands of patient questions answered free. Browse by topic or ask your own — approved questions are published anonymously.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/qa/ask" className="inline-flex items-center gap-2 px-6 py-3 bg-gold-500 hover:bg-gold-600 text-white rounded-md font-semibold">
              Ask a question <ChevronRight className="w-4 h-4" />
            </Link>
            <Link href="/doctors?online=true" className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white/40 text-white hover:bg-white/10 rounded-md font-semibold">
              <Stethoscope className="w-4 h-4" /> Book a consultation
            </Link>
          </div>
        </div>
      </GradientHero>

      <div className="container mx-auto px-4 py-10 max-w-6xl">
        {/* Category pills */}
        <nav aria-label="Filter by category" className="mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            <Link href="/qa" className={
              'shrink-0 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm border whitespace-nowrap ' +
              (!sp.category ? 'bg-kerala-700 text-white border-kerala-700' : 'bg-white text-gray-700 border-gray-200 hover:border-kerala-200 hover:bg-kerala-50')
            }>All</Link>
            {cats.map((c) => {
              const active = sp.category === c.id
              return (
                <Link key={c.id} href={`/qa?category=${c.id}`} className={
                  'shrink-0 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm border whitespace-nowrap ' +
                  (active ? 'bg-kerala-700 text-white border-kerala-700' : 'bg-white text-gray-700 border-gray-200 hover:border-kerala-200 hover:bg-kerala-50')
                }>
                  {CATEGORY_LABEL[c.id] ?? c.id}
                  <span className={'text-xs ' + (active ? 'text-white/80' : 'text-gray-400')}>{c.count}</span>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Search form (GET so URL captures the query) */}
        <form className="mb-5 flex gap-2" action="/qa">
          {sp.category && <input type="hidden" name="category" value={sp.category} />}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              name="q"
              defaultValue={sp.q ?? ''}
              placeholder="Search questions — e.g. 'PCOS diet', 'shirodhara cost'"
              className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-kerala-700"
            />
          </div>
          <button type="submit" className="px-5 py-2.5 bg-kerala-700 text-white rounded-md text-sm font-semibold hover:bg-kerala-800">Search</button>
        </form>

        <p className="text-sm text-muted mb-5">
          <strong className="text-ink">{list.pagination.total}</strong> question{list.pagination.total === 1 ? '' : 's'}
          {sp.category ? ` in ${CATEGORY_LABEL[sp.category] ?? sp.category}` : ''}
        </p>

        {list.questions.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-100 rounded-card">
            <MessageCircleQuestion className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900">No questions yet in this category.</h3>
            <p className="text-muted mt-1">Be the first to ask — <Link href="/qa/ask" className="text-kerala-700 underline">post your question</Link>.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {list.questions.map((q) => (
              <Link
                key={q.id}
                href={`/qa/${q.slug ?? q.id}`}
                className="block bg-white border border-gray-100 rounded-card p-5 shadow-card hover:shadow-cardLg transition-shadow"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-kerala-50 text-kerala-700 font-medium">
                    {CATEGORY_LABEL[q.category] ?? q.category}
                  </span>
                  <span className="text-[10px] text-gray-400">{q.viewCount} views · {q.answerCount} answer{q.answerCount === 1 ? '' : 's'}</span>
                </div>
                <h2 className="font-serif text-lg text-ink leading-snug group-hover:text-kerala-700">{q.title}</h2>
                <p className="text-sm text-gray-700 mt-2 leading-relaxed line-clamp-2">{previewOf(q.body)}</p>
                <div className="text-xs text-gray-400 mt-3">
                  Asked by {q.authorName ?? 'Anonymous'}{q.age ? `, ${q.age}` : ''} · {new Date(q.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-10 p-6 rounded-card bg-kerala-50 border border-kerala-100 text-center">
          <h3 className="font-serif text-xl text-kerala-800">Have your own question?</h3>
          <p className="text-sm text-kerala-900/80 mt-2 max-w-xl mx-auto">
            Free to ask. CCIM-verified doctors review submissions and publish answers within 48 hours. Your name stays anonymous.
          </p>
          <Link href="/qa/ask" className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-kerala-700 hover:bg-kerala-800 text-white rounded-md text-sm font-semibold">
            Ask a question <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </>
  )
}
