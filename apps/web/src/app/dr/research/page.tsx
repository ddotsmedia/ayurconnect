'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BookOpen, Bookmark, BookmarkCheck, Search, ExternalLink, Loader2 } from 'lucide-react'

type Paper = {
  id: string; title: string; authors: string[]; journal: string; year: number
  doi: string | null; abstract: string; conditions: string[]; doshas: string[]
  studyType: string | null; sampleSize: number | null; url: string | null
  bookmarked: boolean
}
type Facets = { journals: Array<{ name: string; count: number }>; conditions: Array<{ id: string; count: number }>; studyTypes: string[] }

export default function DrResearchPage() {
  const [papers, setPapers] = useState<Paper[]>([])
  const [facets, setFacets] = useState<Facets | null>(null)
  const [q, setQ]           = useState('')
  const [condition, setCondition] = useState('')
  const [studyType, setStudyType] = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (condition) params.set('condition', condition)
    if (studyType) params.set('studyType', studyType)
    params.set('limit', '40')
    const [pRes, fRes] = await Promise.all([
      fetch(`/api/dr/research?${params}`, { credentials: 'include' }),
      facets ? Promise.resolve(null) : fetch('/api/dr/research/facets', { credentials: 'include' }),
    ])
    if (pRes.ok) {
      const d = await pRes.json() as { papers: Paper[] }
      setPapers(d.papers)
    }
    if (fRes && fRes.ok) {
      const f = await fRes.json() as Facets
      setFacets(f)
    }
    setLoading(false)
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load() }, [condition, studyType])

  async function toggleBookmark(id: string) {
    const res = await fetch(`/api/dr/research/${id}/bookmark`, { method: 'POST', credentials: 'include' })
    if (res.ok) {
      const { bookmarked } = await res.json() as { bookmarked: boolean }
      setPapers((cur) => cur.map((p) => p.id === id ? { ...p, bookmarked } : p))
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl text-kerala-700 inline-flex items-center gap-2"><BookOpen className="w-7 h-7" /> Research papers</h1>
        <p className="text-sm text-muted mt-1">Curated Ayurveda research library. Bookmark to save; click a paper for full abstract + private notes.</p>
      </header>

      <form onSubmit={(e) => { e.preventDefault(); void load() }} className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title, abstract, author…" className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-kerala-700" />
        </div>
        <button type="submit" className="px-4 py-2.5 bg-kerala-700 text-white rounded-md text-sm hover:bg-kerala-800">Search</button>
      </form>

      <div className="flex gap-2 flex-wrap">
        <select value={studyType} onChange={(e) => setStudyType(e.target.value)} className="border border-gray-200 rounded-md px-3 py-1.5 text-xs bg-white">
          <option value="">All study types</option>
          {facets?.studyTypes.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={condition} onChange={(e) => setCondition(e.target.value)} className="border border-gray-200 rounded-md px-3 py-1.5 text-xs bg-white">
          <option value="">All conditions</option>
          {facets?.conditions.map((c) => <option key={c.id} value={c.id}>{c.id} ({c.count})</option>)}
        </select>
        <Link href="/dr/research/bookmarks" className="px-3 py-1.5 text-xs border border-gray-200 rounded-md bg-white hover:border-kerala-300 inline-flex items-center gap-1.5">
          <Bookmark className="w-3 h-3" /> My bookmarks
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500 inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>
      ) : papers.length === 0 ? (
        <p className="text-sm text-muted">No papers match.</p>
      ) : (
        <div className="space-y-3">
          {papers.map((p) => (
            <article key={p.id} className="bg-white border border-gray-100 rounded-card p-4 shadow-card">
              <div className="flex items-start justify-between gap-3 mb-2">
                <Link href={`/dr/research/${p.id}`} className="font-serif text-lg text-ink hover:text-kerala-700 flex-1">{p.title}</Link>
                <button onClick={() => toggleBookmark(p.id)} className="p-1.5 rounded hover:bg-gray-100" aria-label="Bookmark">
                  {p.bookmarked ? <BookmarkCheck className="w-4 h-4 text-kerala-700" /> : <Bookmark className="w-4 h-4 text-gray-400" />}
                </button>
              </div>
              <p className="text-xs text-muted">
                {p.authors.slice(0, 3).join(', ')}{p.authors.length > 3 ? ' et al.' : ''} · {p.journal} · {p.year}
                {p.studyType && <> · <span className="px-1.5 py-0.5 bg-kerala-50 text-kerala-700 rounded text-[10px] uppercase tracking-wider">{p.studyType}</span></>}
                {p.sampleSize && <> · n={p.sampleSize}</>}
              </p>
              <p className="text-sm text-gray-700 mt-2 line-clamp-3 leading-relaxed">{p.abstract}</p>
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                {p.conditions.slice(0, 4).map((c) => <span key={c} className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-800 rounded">{c}</span>)}
                {p.url && <a href={p.url} target="_blank" rel="noreferrer" className="text-xs text-kerala-700 hover:underline inline-flex items-center gap-0.5 ml-auto">Open <ExternalLink className="w-3 h-3" /></a>}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
