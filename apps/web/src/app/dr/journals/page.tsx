'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Library, Bell, BellOff, ExternalLink } from 'lucide-react'

type Journal = {
  id: string; slug: string; title: string; shortName: string | null
  issn: string | null; publisher: string | null; scope: string | null
  url: string | null; latestIssueUrl: string | null; latestIssueAt: string | null
  openAccess: boolean; impactFactor: number | null
  subscribed: boolean
}

export default function DrJournalsPage() {
  const [items, setItems] = useState<Journal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch('/api/dr/journals', { credentials: 'include' })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (!cancelled && d) setItems(d.journals) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  async function toggle(slug: string) {
    const res = await fetch(`/api/dr/journals/${slug}/subscribe`, { method: 'POST', credentials: 'include' })
    if (res.ok) {
      const { subscribed } = await res.json() as { subscribed: boolean }
      setItems((cur) => cur.map((j) => j.slug === slug ? { ...j, subscribed } : j))
    }
  }

  if (loading) return <p className="text-muted">Loading…</p>

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl text-kerala-700 inline-flex items-center gap-2"><Library className="w-7 h-7" /> Journals</h1>
        <p className="text-sm text-muted mt-1">Major Ayurveda + integrative-medicine journals. Subscribe for new-issue notifications.</p>
      </header>

      {items.length === 0 ? (
        <div className="bg-white rounded-card border border-gray-100 p-10 text-center">
          <Library className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-700">No journals listed yet.</p>
          <p className="text-xs text-gray-500 mt-1">Admin curates the journal list — check back soon, or suggest a journal via the contact form.</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((j) => (
          <article key={j.id} className="bg-white border border-gray-100 rounded-card p-4 shadow-card">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0">
                <Link href={`/dr/journals/${j.slug}`} className="font-serif text-base text-ink leading-snug hover:text-kerala-700 hover:underline block">
                  {j.shortName ? <><strong>{j.shortName}</strong> · </> : ''}{j.title}
                </Link>
                <p className="text-[10px] text-muted mt-0.5">{j.publisher}{j.issn ? ` · ISSN ${j.issn}` : ''}{j.impactFactor ? ` · IF ${j.impactFactor}` : ''}{j.openAccess ? ' · Open access' : ''}</p>
              </div>
              <button onClick={() => toggle(j.slug)} className="p-1.5 rounded hover:bg-gray-100" aria-label={j.subscribed ? 'Unsubscribe' : 'Subscribe'}>
                {j.subscribed ? <Bell className="w-4 h-4 text-kerala-700 fill-kerala-700" /> : <BellOff className="w-4 h-4 text-gray-400" />}
              </button>
            </div>
            {j.scope && <p className="text-xs text-gray-700 line-clamp-2">{j.scope}</p>}
            <div className="mt-2 flex items-center gap-2 text-[11px]">
              {j.url && <a href={j.url} target="_blank" rel="noreferrer" className="text-kerala-700 hover:underline inline-flex items-center gap-0.5">Homepage <ExternalLink className="w-3 h-3" /></a>}
              {j.latestIssueUrl && <a href={j.latestIssueUrl} target="_blank" rel="noreferrer" className="text-kerala-700 hover:underline inline-flex items-center gap-0.5">Latest issue <ExternalLink className="w-3 h-3" /></a>}
            </div>
          </article>
        ))}
      </div>
      )}
    </div>
  )
}
