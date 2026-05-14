'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BookmarkCheck, Bookmark, ExternalLink, Save, Loader2, BookOpen } from 'lucide-react'

type Paper = {
  id: string; title: string; authors: string[]; journal: string; year: number
  doi: string | null; pubmedId: string | null; abstract: string
  conditions: string[]; doshas: string[]; studyType: string | null
  sampleSize: number | null; url: string | null; pdfUrl: string | null
  bookmarked: boolean; annotation: string | null
}

export default function PaperDetail() {
  const { id } = useParams<{ id: string }>()
  const [paper, setPaper] = useState<Paper | null>(null)
  const [loading, setLoading] = useState(true)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/dr/research/${id}`, { credentials: 'include' })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (cancelled || !d) return
        setPaper(d as Paper)
        setNote((d as Paper).annotation ?? '')
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id])

  async function toggleBookmark() {
    if (!paper) return
    const res = await fetch(`/api/dr/research/${paper.id}/bookmark`, { method: 'POST', credentials: 'include' })
    if (res.ok) {
      const { bookmarked } = await res.json() as { bookmarked: boolean }
      setPaper({ ...paper, bookmarked })
    }
  }

  async function saveAnnotation() {
    if (!paper || !note.trim()) return
    setSaving(true)
    const res = await fetch(`/api/dr/research/${paper.id}/annotation`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ body: note }),
      credentials: 'include',
    })
    if (res.ok) setSavedAt(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }))
    setSaving(false)
  }

  if (loading) return <p className="text-muted">Loading…</p>
  if (!paper)  return <p className="text-muted">Paper not found.</p>

  return (
    <div className="space-y-5 max-w-3xl">
      <Link href="/dr/research" className="inline-flex items-center gap-1 text-sm text-kerala-700 hover:underline"><ArrowLeft className="w-3.5 h-3.5" /> All papers</Link>

      <article className="bg-white border border-gray-100 rounded-card p-6 shadow-card">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h1 className="font-serif text-2xl text-ink leading-snug">{paper.title}</h1>
          <button onClick={toggleBookmark} className="p-2 rounded hover:bg-gray-100" aria-label="Bookmark">
            {paper.bookmarked ? <BookmarkCheck className="w-5 h-5 text-kerala-700" /> : <Bookmark className="w-5 h-5 text-gray-400" />}
          </button>
        </div>
        <p className="text-sm text-muted">
          {paper.authors.join(', ')} · {paper.journal} · {paper.year}
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {paper.studyType  && <span className="px-2 py-0.5 bg-kerala-50 text-kerala-700 rounded uppercase tracking-wider font-semibold">{paper.studyType}</span>}
          {paper.sampleSize && <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded">n = {paper.sampleSize}</span>}
          {paper.doi        && <a href={`https://doi.org/${paper.doi}`} target="_blank" rel="noreferrer" className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded hover:underline inline-flex items-center gap-1">DOI <ExternalLink className="w-3 h-3" /></a>}
          {paper.url        && <a href={paper.url} target="_blank" rel="noreferrer" className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded hover:underline inline-flex items-center gap-1">Source <ExternalLink className="w-3 h-3" /></a>}
        </div>

        <h2 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mt-6 mb-2 inline-flex items-center gap-1.5"><BookOpen className="w-3 h-3" /> Abstract</h2>
        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{paper.abstract}</p>

        {paper.conditions.length > 0 && (
          <div className="mt-4">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Conditions</p>
            <div className="flex flex-wrap gap-1">
              {paper.conditions.map((c) => <span key={c} className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-800 rounded">{c}</span>)}
            </div>
          </div>
        )}
      </article>

      {/* Private annotation */}
      <section className="bg-white border border-gray-100 rounded-card p-5">
        <h2 className="font-serif text-lg text-ink mb-2">My private notes</h2>
        <p className="text-[11px] text-gray-500 mb-3">Only you can see this. Useful for clinical applicability notes — &ldquo;Tried protocol on 3 RA patients, 2 responded similarly&rdquo;, etc.</p>
        <textarea
          value={note} onChange={(e) => setNote(e.target.value)}
          rows={5}
          placeholder="Your clinical notes on this paper…"
          className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-kerala-700"
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[10px] text-gray-400">{savedAt ? `Saved at ${savedAt}` : ''}</span>
          <button onClick={saveAnnotation} disabled={saving || !note.trim()} className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-kerala-700 hover:bg-kerala-800 disabled:opacity-60 text-white rounded text-xs font-semibold">
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Save note
          </button>
        </div>
      </section>
    </div>
  )
}
