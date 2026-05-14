'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Library, Bell, BellOff, ExternalLink, BookOpen } from 'lucide-react'

type SampleArticle = { title: string; doi?: string; url?: string; year?: number }
type Journal = {
  id: string; slug: string; title: string; shortName: string | null
  issn: string | null; publisher: string | null
  scope: string | null; url: string | null
  latestIssueUrl: string | null; latestIssueAt: string | null
  sampleArticles: SampleArticle[] | null
  language: string
  openAccess: boolean
  impactFactor: number | null
  subscribed: boolean
}

export default function JournalDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [j, setJ] = useState<Journal | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/dr/journals/${slug}`, { credentials: 'include' })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (!cancelled && d) setJ(d as Journal) })
    return () => { cancelled = true }
  }, [slug])

  async function toggle() {
    if (!j || busy) return
    setBusy(true)
    try {
      const res = await fetch(`/api/dr/journals/${j.slug}/subscribe`, { method: 'POST', credentials: 'include' })
      if (res.ok) {
        const { subscribed } = await res.json() as { subscribed: boolean }
        setJ({ ...j, subscribed })
      }
    } finally {
      setBusy(false)
    }
  }

  if (!j) return <p className="text-muted">Loading…</p>

  const samples = Array.isArray(j.sampleArticles) ? j.sampleArticles : []

  return (
    <div className="space-y-5 max-w-3xl">
      <Link href="/dr/journals" className="inline-flex items-center gap-1 text-sm text-kerala-700 hover:underline">
        <ArrowLeft className="w-3.5 h-3.5" /> All journals
      </Link>

      <article className="bg-white border border-gray-100 rounded-card p-6 shadow-card">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-wider text-kerala-700">
              <Library className="w-3.5 h-3.5" /> Journal
            </div>
            <h1 className="font-serif text-2xl text-ink mt-1.5">
              {j.shortName && <span className="text-kerala-700">{j.shortName} · </span>}{j.title}
            </h1>
            <p className="text-xs text-muted mt-1">
              {j.publisher && <>{j.publisher}</>}
              {j.issn && <> · ISSN {j.issn}</>}
              {j.language && j.language !== 'en' && <> · {j.language}</>}
            </p>
          </div>
          <button
            onClick={toggle}
            disabled={busy}
            className={'text-sm px-4 py-2 rounded font-semibold inline-flex items-center gap-1.5 disabled:opacity-60 ' + (j.subscribed ? 'bg-kerala-700 text-white' : 'border border-gray-200 hover:border-kerala-300')}
          >
            {j.subscribed ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            {j.subscribed ? 'Subscribed' : 'Subscribe'}
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-1.5">
          {j.openAccess && <span className="text-[11px] px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded">Open access</span>}
          {j.impactFactor && <span className="text-[11px] px-2 py-0.5 bg-amber-50 text-amber-800 rounded">Impact factor {j.impactFactor.toFixed(2)}</span>}
        </div>

        {j.scope && (
          <section className="mt-6">
            <h2 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">Scope</h2>
            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{j.scope}</p>
          </section>
        )}

        <section className="mt-6 pt-5 border-t border-gray-100 flex items-center gap-3 flex-wrap text-sm">
          {j.url && (
            <a href={j.url} target="_blank" rel="noreferrer" className="text-kerala-700 hover:underline inline-flex items-center gap-1">
              Journal homepage <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          {j.latestIssueUrl && (
            <a href={j.latestIssueUrl} target="_blank" rel="noreferrer" className="text-kerala-700 hover:underline inline-flex items-center gap-1">
              Latest issue
              {j.latestIssueAt && <span className="text-xs text-gray-500"> ({new Date(j.latestIssueAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })})</span>}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </section>
      </article>

      {samples.length > 0 && (
        <section>
          <h2 className="font-serif text-lg text-ink mb-3 inline-flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-kerala-700" /> Sample articles
          </h2>
          <div className="space-y-2">
            {samples.map((a, i) => (
              <article key={a.doi ?? i} className="bg-white border border-gray-100 rounded-card p-4">
                <h3 className="font-serif text-base text-ink leading-snug">{a.title}</h3>
                <p className="text-xs text-muted mt-1">
                  {a.year && <>{a.year}</>}
                  {a.doi && <> · DOI <code className="text-[11px] px-1 py-0.5 bg-gray-100 rounded">{a.doi}</code></>}
                </p>
                {a.url && (
                  <a href={a.url} target="_blank" rel="noreferrer" className="text-xs text-kerala-700 hover:underline inline-flex items-center gap-0.5 mt-2">
                    Read <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      <p className="text-xs text-muted text-center">
        Subscribe to get a notification when {j.shortName ?? 'this journal'} publishes a new issue. Admin updates issue links periodically.
      </p>
    </div>
  )
}
