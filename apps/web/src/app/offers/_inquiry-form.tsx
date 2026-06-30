'use client'

import { useState } from 'react'
import { MessageCircle } from 'lucide-react'

export function InquiryForm({ hospitalId, postTitle, hospitalName }: { hospitalId: string; postTitle: string; hospitalName: string }) {
  const [form, setForm]   = useState({ name: '', phone: '', email: '', message: `I'm interested in: ${postTitle}` })
  const [busy, setBusy]   = useState(false)
  const [done, setDone]   = useState(false)
  const [err, setErr]     = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(''); setBusy(true)
    const r = await fetch(`/api/hospitals-public/${hospitalId}/inquiry`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ patientName: form.name, phone: form.phone, email: form.email || `${form.phone}@inquiry.local`, message: form.message, source: 'website' }),
    })
    if (!r.ok) { setErr((await r.json().catch(() => ({}))).error ?? 'Failed to send. Please try WhatsApp.'); setBusy(false); return }
    setDone(true); setBusy(false)
  }

  const waUrl = `https://wa.me/971509379212?text=${encodeURIComponent(`Hi AyurConnect, I'm interested in "${postTitle}" at ${hospitalName}. Please share details.`)}`

  if (done) return <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded p-3">Thanks — the hospital will contact you on the phone number provided.</p>

  return (
    <form onSubmit={submit} className="space-y-2">
      <input required placeholder="Your name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm" />
      <input required placeholder="Phone (with country code) *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm" />
      <input placeholder="Email (optional)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm" />
      <textarea rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full border border-gray-200 rounded p-2 text-sm" />
      {err && <p className="text-xs text-rose-700">{err}</p>}
      <div className="flex flex-wrap gap-2">
        <button disabled={busy} className="px-4 py-1.5 bg-kerala-700 hover:bg-kerala-800 text-white text-sm font-semibold rounded disabled:opacity-50">{busy ? 'Sending…' : 'Send inquiry'}</button>
        <a href={waUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-4 py-1.5 bg-[#25D366] text-white text-sm font-semibold rounded"><MessageCircle className="w-4 h-4" /> WhatsApp</a>
      </div>
    </form>
  )
}
