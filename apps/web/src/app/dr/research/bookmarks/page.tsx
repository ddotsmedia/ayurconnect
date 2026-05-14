'use client'

// User's bookmarked research papers. Backed by GET /api/dr/research/bookmarks.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bookmark, BookmarkCheck, ChevronLeft, ExternalLink, Loader2 } from 'lucide-react'

type Paper = {
  id: string; title: string; authors: string[]; journal: string; year: number
  doi: string | null; abstract: string; conditions: string[]; studyType: string | null
  sampleSize: number | null; url: string | null
}
type BookmarkRow = { id: string; createdAt: string; paper: Paper }

export default function BookmarksPage() {
  const [items, setItems] = useState<BookmarkRow[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/dr/research/bookmarks', { credentials: 'include' })
    if (res.ok) {
      const d = await res.json() as { bookmarks: BookmarkRow[] }
      setItems(d.bookmarks)
    }
    setLoading(false)
  }
  useEffect(() => { void load() }, [])

  async function unbookmark(paperId: string) {
    const res = await fetch(`/api/dr/research/${paperId}/bookmark`, { method: 'POST', credentials: 'include' })
    if (res.ok) setItems((cur) => cur.filter((r) => r.paper.id !== paperId))
  }

  return (
    <div className="space-y-6">
      <Link href="/dr/research" className="text-xs text-kerala-700 hover:underline inline-flex items-center gap-1">
        <ChevronLeft className="w-3 h-3" /> Back to research library
      </Link>

      <header>
        <h1 className="font-serif text-3xl text-kerala-700 inline-flex items-center gap-2">
          <BookmarkCheck className="w-7 h-7" /> My bookmarks
        </h1>
        <p className="text-sm text-muted mt-1">{items.length} bookmarked paper{items.length === 1 ? '' : 's'}.</p>
      </header>

      {loading ? (
        <div className="text-center py-12 text-gray-500 inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-card border border-gray-100 p-10 text-center">
          <Bookmark className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-700">No bookmarks yet.</p>
          <p className="text-xs text-gray-500 mt-1">
            Tap the bookmark icon on any paper in the <Link href="/dr/research" className="text-kerala-700 hover:underline">research library</Link> to save it here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((r) => {
            const p = r.paper
            return (
              <article key={r.id} className="bg-white border border-gray-100 rounded-card p-4 shadow-card">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <Link href={`/dr/research/${p.id}`} className="font-serif text-lg text-ink hover:text-kerala-700 flex-1">{p.title}</Link>
                  <button onClick={() => unbookmark(p.id)} className="p-1.5 rounded hover:bg-gray-100" aria-label="Remove bookmark">
                    <BookmarkCheck className="w-4 h-4 text-kerala-700" />
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
                  <span className="text-[10px] text-gray-400 ml-auto">Saved {new Date(r.createdAt).toLocaleDateString()}</span>
                  {p.url && <a href={p.url} target="_blank" rel="noreferrer" className="text-xs text-kerala-700 hover:underline inline-flex items-center gap-0.5">Open <ExternalLink className="w-3 h-3" /></a>}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
