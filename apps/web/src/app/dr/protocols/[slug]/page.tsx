'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, AlertTriangle } from 'lucide-react'

type Comment = { id: string; body: string; createdAt: string; author: { id: string; name: string | null } | null }
type Protocol = {
  id: string; slug: string; title: string; condition: string; doshas: string[]
  summary: string; rationale: string
  phasesJson: Array<{ phase: string; durationDays?: number; items: Array<{ kind: string; name: string; dose?: string; frequency?: string; anupana?: string; notes?: string }> }>
  contraindications: string | null; expectedDuration: string | null; expectedOutcome: string | null
  publishedAt: string | null; viewCount: number
  author: { id: string; name: string | null } | null
  comments: Comment[]
}

export default function ProtocolDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [p, setP] = useState<Protocol | null>(null)
  const [comment, setComment] = useState('')

  useEffect(() => {
    let cancelled = false
    fetch(`/api/dr/protocols/${slug}`, { credentials: 'include' })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (!cancelled && d) setP(d as Protocol) })
    return () => { cancelled = true }
  }, [slug])

  async function post(e: React.FormEvent) {
    e.preventDefault()
    if (!p || !comment.trim()) return
    const res = await fetch(`/api/dr/protocols/${p.slug}/comments`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ body: comment }),
      credentials: 'include',
    })
    if (res.ok) {
      const fresh = await fetch(`/api/dr/protocols/${p.slug}`, { credentials: 'include' })
      if (fresh.ok) setP(await fresh.json() as Protocol)
      setComment('')
    }
  }

  if (!p) return <p className="text-muted">Loading…</p>

  return (
    <div className="space-y-5 max-w-3xl">
      <Link href="/dr/protocols" className="inline-flex items-center gap-1 text-sm text-kerala-700 hover:underline"><ArrowLeft className="w-3.5 h-3.5" /> All protocols</Link>

      <article className="bg-white border border-gray-100 rounded-card p-6 shadow-card">
        <h1 className="font-serif text-2xl text-ink">{p.title}</h1>
        <p className="text-xs text-muted mt-1">
          {p.condition} · by Dr {p.author?.name ?? 'AyurConnect'}
          {p.expectedDuration && <> · {p.expectedDuration}</>}
          · {p.viewCount} views
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {p.doshas.map((d) => <span key={d} className="text-[10px] px-1.5 py-0.5 bg-kerala-50 text-kerala-700 rounded">{d}</span>)}
        </div>

        <Section title="Summary">{p.summary}</Section>
        <Section title="Clinical rationale">{p.rationale}</Section>

        <Section title="Phases">
          <div className="space-y-3">
            {p.phasesJson.map((ph, i) => (
              <div key={i} className="bg-gray-50 rounded p-3">
                <p className="font-semibold text-sm">{ph.phase}{ph.durationDays ? ` · ${ph.durationDays} days` : ''}</p>
                <ul className="mt-1 space-y-1">
                  {ph.items.map((it, j) => (
                    <li key={j} className="text-sm">
                      <span className="text-[10px] uppercase tracking-wider text-gray-400 mr-1">{it.kind}</span>
                      <strong>{it.name}</strong>
                      {it.dose && ` · ${it.dose}`}{it.frequency && ` · ${it.frequency}`}
                      {it.anupana && <span className="text-gray-500"> · with {it.anupana}</span>}
                      {it.notes && <em className="block text-xs text-gray-500 mt-0.5">{it.notes}</em>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        {p.contraindications && (
          <section className="mt-5 p-4 bg-amber-50 border border-amber-100 rounded">
            <h2 className="text-xs uppercase tracking-wider text-amber-800 font-semibold mb-1 inline-flex items-center gap-1.5"><AlertTriangle className="w-3 h-3" /> Contraindications</h2>
            <p className="text-sm text-amber-900">{p.contraindications}</p>
          </section>
        )}
        {p.expectedOutcome && <Section title="Expected outcome">{p.expectedOutcome}</Section>}
      </article>

      <section>
        <h2 className="font-serif text-lg text-ink mb-3">Discussion</h2>
        <div className="space-y-3">
          {p.comments.map((c) => (
            <article key={c.id} className="bg-white border border-gray-100 rounded-card p-4">
              <p className="text-xs text-muted mb-1">Dr {c.author?.name ?? 'AyurConnect'} · {new Date(c.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short' })}</p>
              <p className="text-sm text-gray-800 whitespace-pre-line">{c.body}</p>
            </article>
          ))}
        </div>
        <form onSubmit={post} className="mt-4 bg-white border border-gray-100 rounded-card p-4">
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder="Add a comment, alternative phase, or citation…" className="w-full border border-gray-200 rounded px-3 py-2 text-sm" />
          <div className="flex justify-end mt-2">
            <button type="submit" disabled={comment.trim().length < 10} className="px-4 py-1.5 bg-kerala-700 hover:bg-kerala-800 disabled:opacity-60 text-white rounded text-xs font-semibold">Post</button>
          </div>
        </form>
      </section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <h2 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">{title}</h2>
      <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{children}</div>
    </section>
  )
}
