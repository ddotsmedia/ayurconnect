'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Heart, Send, ShieldCheck } from 'lucide-react'

type Comment = { id: string; body: string; createdAt: string; author: { id: string; name: string | null; ownedDoctor: { ccimVerified: boolean } | null } | null }
type Case = {
  id: string; title: string
  chiefComplaint: string; presentingHistory: string
  prakriti: string | null; vikriti: string | null
  ashtavidhaJson: Record<string, string> | null
  ayurvedicDiagnosis: string; modernDiagnosis: string | null
  protocolJson: Array<{ phase: string; items: string[] }>
  outcomeAtFollowUp: string | null; outcomeDetail: string | null; durationMonths: number | null
  doctorNotes: string | null
  specialty: string; condition: string; tags: string[]
  publishedAt: string | null; viewCount: number
  author: { id: string; name: string | null; ownedDoctor: { specialization: string; ccimVerified: boolean } | null } | null
  comments: Comment[]
  _count: { upvotes: number }
}

export default function CaseDetail() {
  const { id } = useParams<{ id: string }>()
  const [c, setC] = useState<Case | null>(null)
  const [comment, setComment] = useState('')
  const [posting, setPosting] = useState(false)
  const [upvoted, setUpvoted] = useState(false)
  const [upvoteCount, setUpvoteCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/dr/cases/${id}`, { credentials: 'include' })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (cancelled || !d) return
        setC(d as Case)
        setUpvoteCount((d as Case)._count.upvotes)
      })
    return () => { cancelled = true }
  }, [id])

  async function toggleUpvote() {
    if (!c) return
    const res = await fetch(`/api/dr/cases/${c.id}/upvote`, { method: 'POST', credentials: 'include' })
    if (res.ok) {
      const { upvoted: u } = await res.json() as { upvoted: boolean }
      setUpvoted(u)
      setUpvoteCount((n) => u ? n + 1 : Math.max(0, n - 1))
    }
  }

  async function postComment(e: React.FormEvent) {
    e.preventDefault()
    if (!c || !comment.trim()) return
    setPosting(true)
    const res = await fetch(`/api/dr/cases/${c.id}/comments`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ body: comment }),
      credentials: 'include',
    })
    if (res.ok) {
      const fresh = await fetch(`/api/dr/cases/${c.id}`, { credentials: 'include' })
      if (fresh.ok) setC(await fresh.json() as Case)
      setComment('')
    }
    setPosting(false)
  }

  if (!c) return <p className="text-muted">Loading…</p>

  return (
    <div className="space-y-5 max-w-3xl">
      <Link href="/dr/cases" className="inline-flex items-center gap-1 text-sm text-kerala-700 hover:underline"><ArrowLeft className="w-3.5 h-3.5" /> All cases</Link>

      <article className="bg-white border border-gray-100 rounded-card p-6 shadow-card">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h1 className="font-serif text-2xl text-ink leading-snug">{c.title}</h1>
          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-kerala-50 text-kerala-700 rounded-full whitespace-nowrap">{c.specialty.replace('-', ' ')}</span>
        </div>
        <p className="text-xs text-muted">
          Dr {c.author?.name ?? 'AyurConnect'}{c.author?.ownedDoctor?.ccimVerified && <ShieldCheck className="w-3 h-3 inline text-kerala-700 ml-1" />}
          {c.publishedAt && <> · {new Date(c.publishedAt).toLocaleDateString()}</>}
          · {c.viewCount} views
        </p>

        <Section title="Chief complaint">{c.chiefComplaint}</Section>
        <Section title="Presenting history">{c.presentingHistory}</Section>
        {(c.prakriti || c.vikriti) && (
          <Section title="Prakriti / Vikriti">
            {c.prakriti && <span><strong>Prakriti:</strong> {c.prakriti}</span>}
            {c.vikriti && <span className="ml-3"><strong>Vikriti:</strong> {c.vikriti}</span>}
          </Section>
        )}
        {c.ashtavidhaJson && Object.keys(c.ashtavidhaJson).length > 0 && (
          <Section title="Ashtavidha Pariksha">
            <ul className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(c.ashtavidhaJson).map(([k, v]) => <li key={k}><strong className="text-gray-500">{k}:</strong> {v}</li>)}
            </ul>
          </Section>
        )}
        <Section title="Ayurvedic diagnosis">{c.ayurvedicDiagnosis}</Section>
        {c.modernDiagnosis && <Section title="Modern diagnosis">{c.modernDiagnosis}</Section>}
        <Section title="Treatment protocol">
          <div className="space-y-3">
            {c.protocolJson.map((ph, i) => (
              <div key={i} className="bg-gray-50 rounded p-3">
                <p className="font-semibold text-sm text-ink">{ph.phase}</p>
                <ul className="mt-1 space-y-0.5 text-sm">
                  {ph.items.map((it, j) => <li key={j} className="text-gray-700">• {it}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </Section>
        {c.outcomeAtFollowUp && (
          <Section title="Outcome">
            <p className="font-semibold text-emerald-700">{c.outcomeAtFollowUp.replace('-', ' ')}</p>
            {c.outcomeDetail && <p className="text-sm mt-1">{c.outcomeDetail}</p>}
            {c.durationMonths && <p className="text-xs text-muted mt-1">Duration: {c.durationMonths} months</p>}
          </Section>
        )}
        {c.doctorNotes && <Section title="Doctor's reflections">{c.doctorNotes}</Section>}

        <footer className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-3">
          <button onClick={toggleUpvote} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-sm ${upvoted ? 'bg-rose-100 text-rose-800' : 'bg-gray-100 text-gray-700'}`}>
            <Heart className={`w-4 h-4 ${upvoted ? 'fill-rose-600 text-rose-600' : ''}`} /> {upvoteCount}
          </button>
          <span className="text-xs text-muted">{c.comments.length} comment{c.comments.length === 1 ? '' : 's'}</span>
        </footer>
      </article>

      {/* Comments */}
      <section>
        <h2 className="font-serif text-lg text-ink mb-3">Peer discussion</h2>
        <div className="space-y-3">
          {c.comments.map((cm) => (
            <article key={cm.id} className="bg-white border border-gray-100 rounded-card p-4">
              <p className="text-xs text-muted mb-1">
                Dr {cm.author?.name ?? 'AyurConnect'}{cm.author?.ownedDoctor?.ccimVerified && <ShieldCheck className="w-3 h-3 inline text-kerala-700 ml-1" />}
                · {new Date(cm.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-sm text-gray-800 whitespace-pre-line">{cm.body}</p>
            </article>
          ))}
        </div>

        <form onSubmit={postComment} className="mt-4 bg-white border border-gray-100 rounded-card p-4 space-y-2">
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder="Add a clinical comment, alternative protocol idea, or citation…" className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" />
          <div className="flex justify-end">
            <button type="submit" disabled={posting || comment.trim().length < 10} className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-kerala-700 hover:bg-kerala-800 disabled:opacity-60 text-white rounded text-xs font-semibold">
              <Send className="w-3 h-3" /> Post comment
            </button>
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
      <div className="text-sm text-gray-800 leading-relaxed">{children}</div>
    </section>
  )
}
