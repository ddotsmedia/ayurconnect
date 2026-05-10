import Link from 'next/link'
import type { Metadata } from 'next'
import { Search as SearchIcon, Stethoscope, Building2, Leaf, BookOpen } from 'lucide-react'
import { API_INTERNAL as API } from '../../lib/server-fetch'
import { clip } from '../../lib/seo'

type DoctorHit = { id: string; name: string; specialization: string; district: string; qualification: string | null; ccimVerified: boolean; photoUrl: string | null }
type HospitalHit = { id: string; name: string; type: string; district: string; classification: string | null; ayushCertified: boolean }
type HerbHit = { id: string; name: string; sanskrit: string | null; rasa: string | null; uses: string | null }
type ArticleHit = { id: string; title: string; category: string; createdAt: number | string }

type SearchResults = {
  query: string
  results: {
    doctors: DoctorHit[]
    hospitals: HospitalHit[]
    herbs: HerbHit[]
    articles: ArticleHit[]
  }
}

async function runSearch(q: string): Promise<SearchResults> {
  const empty = { query: q, results: { doctors: [], hospitals: [], herbs: [], articles: [] } }
  if (!q.trim()) return empty
  try {
    const res = await fetch(`${API}/search?q=${encodeURIComponent(q)}&limit=12`, { cache: 'no-store' })
    if (!res.ok) return empty
    return (await res.json()) as SearchResults
  } catch { return empty }
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }): Promise<Metadata> {
  const { q = '' } = await searchParams
  const title = q ? `Search: ${q.slice(0, 50)}` : 'Search AyurConnect'
  return {
    title,
    description: clip(`Search across CCIM-verified Kerala Ayurveda doctors, hospitals, ${q ? `for "${q}"` : '150+ herbs and articles'}.`),
    alternates: { canonical: `/search${q ? `?q=${encodeURIComponent(q)}` : ''}` },
    robots: { index: false, follow: true },
  }
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = '' } = await searchParams
  const data = await runSearch(q)
  const total = data.results.doctors.length + data.results.hospitals.length + data.results.herbs.length + data.results.articles.length

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <header className="text-center mb-8">
        <h1 className="font-serif text-3xl md:text-4xl text-kerala-700">Search AyurConnect</h1>
        <p className="text-sm text-muted mt-1">Doctors, hospitals, herbs, and articles — all in one place.</p>
      </header>

      <form action="/search" className="relative mb-8 max-w-2xl mx-auto">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          name="q"
          defaultValue={q}
          autoFocus
          placeholder="Try: panchakarma, ashwagandha, chronic fatigue, Trivandrum..."
          className="w-full pl-12 pr-32 py-4 text-base border-2 border-gray-200 rounded-card focus:outline-none focus:border-kerala-700 shadow-card"
        />
        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-kerala-700 text-white font-semibold rounded-md hover:bg-kerala-800 text-sm">
          Search
        </button>
      </form>

      {!q && (
        <div className="text-center text-muted text-sm">
          Type something above to search. Try a doctor&apos;s name, a herb (English/Sanskrit/Malayalam), a treatment, or a city.
        </div>
      )}

      {q && total === 0 && (
        <div className="text-center text-muted py-12">
          No results for <strong className="text-gray-900">&ldquo;{q}&rdquo;</strong>. Try a different spelling or a broader term.
        </div>
      )}

      {q && total > 0 && (
        <p className="text-sm text-muted mb-6">
          {total} result{total === 1 ? '' : 's'} for <strong className="text-gray-900">&ldquo;{q}&rdquo;</strong>
        </p>
      )}

      {data.results.doctors.length > 0 && (
        <Section title="Doctors" icon={Stethoscope} count={data.results.doctors.length}>
          {data.results.doctors.map((d) => (
            <Link key={d.id} href={`/doctors/${d.id}`} className="block bg-white border border-gray-100 rounded-card p-4 hover:shadow-card hover:border-kerala-200">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-kerala-700 text-white text-xs font-semibold flex items-center justify-center">
                  {d.name.replace(/^Dr\.?\s*/i, '').split(/\s+/).slice(0, 2).map((s) => s[0]?.toUpperCase()).join('')}
                </span>
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{d.name}</div>
                  <div className="text-xs text-gray-500 truncate">{d.specialization} · {d.district}{d.qualification ? ` · ${d.qualification}` : ''}</div>
                </div>
                {d.ccimVerified && <span className="ml-auto text-[10px] px-2 py-0.5 bg-kerala-50 text-kerala-700 rounded-full font-semibold">CCIM</span>}
              </div>
            </Link>
          ))}
        </Section>
      )}

      {data.results.hospitals.length > 0 && (
        <Section title="Hospitals & wellness centres" icon={Building2} count={data.results.hospitals.length}>
          {data.results.hospitals.map((h) => (
            <Link key={h.id} href={`/hospitals/${h.id}`} className="block bg-white border border-gray-100 rounded-card p-4 hover:shadow-card hover:border-kerala-200">
              <div className="font-semibold text-gray-900">{h.name}</div>
              <div className="text-xs text-gray-500 mt-0.5 capitalize">
                {h.type} · {h.district}
                {h.classification && <span className="ml-2 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px]">{h.classification}</span>}
              </div>
            </Link>
          ))}
        </Section>
      )}

      {data.results.herbs.length > 0 && (
        <Section title="Herbs" icon={Leaf} count={data.results.herbs.length}>
          {data.results.herbs.map((h) => (
            <Link key={h.id} href={`/herbs/${h.id}`} className="block bg-white border border-gray-100 rounded-card p-4 hover:shadow-card hover:border-kerala-200">
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-gray-900">{h.name}</span>
                {h.sanskrit && <span className="text-xs text-gray-500 italic">{h.sanskrit}</span>}
              </div>
              {h.uses && <div className="text-xs text-gray-600 mt-1 line-clamp-2">{h.uses}</div>}
            </Link>
          ))}
        </Section>
      )}

      {data.results.articles.length > 0 && (
        <Section title="Articles" icon={BookOpen} count={data.results.articles.length}>
          {data.results.articles.map((a) => (
            <Link key={a.id} href={`/articles/${a.id}`} className="block bg-white border border-gray-100 rounded-card p-4 hover:shadow-card hover:border-kerala-200">
              <div className="font-semibold text-gray-900">{a.title}</div>
              <div className="text-xs text-gray-500 mt-0.5">{a.category}</div>
            </Link>
          ))}
        </Section>
      )}
    </div>
  )
}

function Section({ title, icon: Icon, count, children }: { title: string; icon: typeof Stethoscope; count: number; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">
        <Icon className="w-4 h-4" /> {title} <span className="text-gray-400 font-normal">({count})</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{children}</div>
    </section>
  )
}
