'use client'

import { useState } from 'react'
import { ThumbsUp, MessageSquare, Plus, X } from 'lucide-react'

type Thread = { id: string; title: string; content: string; category: string; subjectSlug: string | null; upvoteCount: number; replyCount: number; createdAt: string; author?: { name: string | null } | null }

const SUBJECTS = ['', 'padartha-vigyana', 'dravyaguna', 'rasashastra', 'kayachikitsa', 'panchakarma', 'shalya', 'shalakya', 'prasuti', 'kaumarbhritya', 'manasika']
const CATS = ['doubt', 'discussion', 'resource', 'tip'] as const

const CAT_COLOR: Record<string, string> = {
  doubt:      'bg-amber-50 text-amber-800 border-amber-200',
  discussion: 'bg-kerala-50 text-kerala-800 border-kerala-200',
  resource:   'bg-blue-50 text-blue-800 border-blue-200',
  tip:        'bg-emerald-50 text-emerald-800 border-emerald-200',
}

export function CommunityClient({ initial }: { initial: Thread[] }) {
  const [items, setItems] = useState(initial)
  const [subject, setSubject] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: '', subjectSlug: '', category: 'discussion', content: '' })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const visible = items.filter((t) => !subject || t.subjectSlug === subject)

  async function refresh() {
    const r = await fetch('/api/study-community/threads?limit=30')
    if (r.ok) setItems((await r.json()).items)
  }
  async function upvote(id: string) {
    setItems((arr) => arr.map((t) => t.id === id ? { ...t, upvoteCount: t.upvoteCount + 1 } : t))
    await fetch(`/api/study-community/threads/${id}/upvote`, { method: 'POST', credentials: 'include' }).catch(() => {})
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(''); setBusy(true)
    const r = await fetch('/api/study-community/threads', {
      method: 'POST', credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...form, subjectSlug: form.subjectSlug || null }),
    })
    if (!r.ok) {
      const j = await r.json().catch(() => ({}))
      setErr(j.error ?? 'Sign in required to post.')
      setBusy(false); return
    }
    setForm({ title: '', subjectSlug: '', category: 'discussion', content: '' })
    setOpen(false); setBusy(false)
    await refresh()
  }

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <select value={subject} onChange={(e) => setSubject(e.target.value)} className="text-xs border border-gray-200 rounded px-2 py-1.5">
          {SUBJECTS.map((s) => <option key={s} value={s}>{s ? s.replace(/-/g, ' ') : 'All subjects'}</option>)}
        </select>
        <button onClick={() => setOpen(!open)} className="inline-flex items-center gap-1 px-3 py-1.5 bg-kerala-700 text-white text-xs font-semibold rounded ml-auto">
          {open ? <><X className="w-3.5 h-3.5" /> Cancel</> : <><Plus className="w-3.5 h-3.5" /> Ask a Question</>}
        </button>
      </div>

      {open && (
        <form onSubmit={submit} className="bg-white border border-kerala-200 rounded-card p-4 space-y-2 mb-5">
          <input required placeholder="Title — be specific *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm" />
          <div className="flex gap-2">
            <select value={form.subjectSlug} onChange={(e) => setForm({ ...form, subjectSlug: e.target.value })} className="flex-1 border border-gray-200 rounded px-2 py-1.5 text-sm">
              {SUBJECTS.map((s) => <option key={s} value={s}>{s ? s.replace(/-/g, ' ') : 'No subject'}</option>)}
            </select>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="border border-gray-200 rounded px-2 py-1.5 text-sm">
              {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <textarea required rows={4} placeholder="Content (10+ chars) *" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="w-full border border-gray-200 rounded p-2 text-sm" />
          {err && <p className="text-xs text-rose-700">{err}</p>}
          <button disabled={busy} className="px-4 py-1.5 bg-kerala-700 text-white text-sm font-semibold rounded disabled:opacity-50">{busy ? 'Posting…' : 'Post'}</button>
        </form>
      )}

      <ul className="space-y-2">
        {visible.length === 0 && <li className="text-sm text-gray-500 bg-white border border-gray-100 rounded-card p-6 text-center">No threads yet — start the first one.</li>}
        {visible.map((t) => (
          <li key={t.id} className="bg-white border border-gray-100 rounded-card p-4">
            <div className="flex items-start gap-3">
              <button onClick={() => upvote(t.id)} className="flex flex-col items-center justify-center w-12 text-xs text-gray-600 hover:text-kerala-700">
                <ThumbsUp className="w-4 h-4" /><span>{t.upvoteCount}</span>
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] px-1.5 py-0.5 border rounded ${CAT_COLOR[t.category] ?? CAT_COLOR.discussion}`}>{t.category}</span>
                  {t.subjectSlug && <span className="text-[10px] uppercase tracking-wider text-gray-500">{t.subjectSlug.replace(/-/g, ' ')}</span>}
                </div>
                <h3 className="font-semibold text-ink mt-1">{t.title}</h3>
                <p className="text-sm text-gray-700 mt-1 line-clamp-3 whitespace-pre-line">{t.content}</p>
                <p className="text-[11px] text-gray-500 mt-2">
                  by {t.author?.name ?? 'Anonymous'} · {new Date(t.createdAt).toLocaleDateString()} · <MessageSquare className="w-3 h-3 inline" /> {t.replyCount} replies
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
