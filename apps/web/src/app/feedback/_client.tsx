'use client'

import { useState } from 'react'
import { Send, Loader2, CheckCircle2 } from 'lucide-react'

const CATEGORIES = [
  { v: 'feedback',        l: 'Feedback' },
  { v: 'suggestion',      l: 'Suggestion' },
  { v: 'bug_report',      l: 'Bug Report' },
  { v: 'feature_request', l: 'Feature Request' },
  { v: 'complaint',       l: 'Complaint' },
]

export function FeedbackForm({ prefillName, prefillEmail }: { prefillName: string; prefillEmail: string }) {
  const [form, setForm] = useState({
    name: prefillName, email: prefillEmail, phone: '',
    category: 'feedback', subject: '', message: '',
  })
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setErr(null)
    try {
      const r = await fetch('/api/feedback', {
        method: 'POST', credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...form,
          page: typeof window !== 'undefined' ? document.referrer || window.location.pathname : null,
        }),
      })
      if (!r.ok) {
        const j = await r.json().catch(() => ({})) as { error?: string }
        throw new Error(j.error ?? `HTTP ${r.status}`)
      }
      setDone(true)
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)) }
    finally { setBusy(false) }
  }

  if (done) return (
    <article className="bg-emerald-50 border border-emerald-200 rounded-card p-6 text-center shadow-card">
      <CheckCircle2 className="w-12 h-12 text-emerald-700 mx-auto" />
      <h2 className="font-serif text-2xl text-emerald-900 mt-3">Thank you!</h2>
      <p className="text-sm text-emerald-800 mt-2">Your feedback has been received. We read every message and use it to improve AyurConnect.</p>
      <button onClick={() => { setDone(false); setForm({ ...form, subject: '', message: '' }) }} className="mt-4 inline-flex items-center gap-1 px-4 py-2 border border-emerald-300 hover:bg-emerald-100 rounded text-xs text-emerald-800">Submit another</button>
    </article>
  )

  return (
    <form onSubmit={submit} className="bg-white border border-gray-100 rounded-card p-5 shadow-card space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <L l="Name *"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" /></L>
        <L l="Category">
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input">
            {CATEGORIES.map((c) => <option key={c.v} value={c.v}>{c.l}</option>)}
          </select>
        </L>
        <L l="Email (optional)"><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" /></L>
        <L l="Phone / WhatsApp (optional)"><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" placeholder="+91…" /></L>
      </div>
      <L l="Subject *"><input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="input" /></L>
      <L l="Message * (20+ chars)">
        <textarea required rows={6} minLength={20} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="input" placeholder="Tell us what's on your mind…" />
        <span className="block text-[10px] text-gray-500 mt-1">{form.message.length} / 20+ chars</span>
      </L>
      {err && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded p-2">{err}</p>}
      <button type="submit" disabled={busy || form.message.length < 20} className="w-full inline-flex justify-center items-center gap-1.5 px-4 py-2.5 bg-kerala-700 hover:bg-kerala-800 text-white rounded font-semibold disabled:opacity-50">
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        {busy ? 'Sending…' : 'Send feedback'}
      </button>
      <p className="text-[10px] text-gray-500 text-center">Limit: 3 submissions per hour. We don&apos;t share your info.</p>
      <style jsx global>{`.input{width:100%;border:1px solid #e5e7eb;border-radius:0.375rem;padding:0.5rem 0.75rem;font-size:14px;background:white}.input:focus{outline:none;box-shadow:0 0 0 1px #155228;border-color:#155228}`}</style>
    </form>
  )
}

function L({ l, children }: { l: string; children: React.ReactNode }) {
  return <label className="block"><span className="block text-xs font-medium text-gray-700 mb-1">{l}</span>{children}</label>
}
