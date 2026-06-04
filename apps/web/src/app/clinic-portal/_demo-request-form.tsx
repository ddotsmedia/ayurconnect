'use client'

import { useState } from 'react'
import { Loader2, Send, CheckCircle2, AlertCircle } from 'lucide-react'

export function DemoRequestForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', clinic: '', staffCount: '1-5', note: '' })
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [err, setErr]   = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr(null)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          kind: 'clinic_portal_demo',
          name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(),
          note: `Clinic: ${form.clinic.trim()} · Staff: ${form.staffCount} · ${form.note.trim()}`.slice(0, 1000),
        }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? `HTTP ${res.status}`)
      setDone(true)
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)) } finally { setBusy(false) }
  }

  const ic = 'w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-kerala-700'

  if (done) {
    return (
      <div className="bg-emerald-50 border border-emerald-100 rounded-card p-6 text-center">
        <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
        <h3 className="font-serif text-lg text-ink">Demo request received</h3>
        <p className="text-sm text-gray-700 mt-1">We&apos;ll email you within 1 business day to schedule the walkthrough.</p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="bg-white border border-gray-100 rounded-card p-6 shadow-card space-y-3">
      {err && (
        <div className="p-3 rounded bg-red-50 border border-red-100 text-sm text-red-800 inline-flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5" /> {err}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input className={ic} placeholder="Your name *"        required value={form.name}   onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className={ic} placeholder="Email *"             required type="email" value={form.email}  onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className={ic} placeholder="WhatsApp / phone *" required value={form.phone}  onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input className={ic} placeholder="Clinic / hospital name *" required value={form.clinic} onChange={(e) => setForm({ ...form, clinic: e.target.value })} />
      </div>
      <div>
        <label className="block text-[11px] uppercase tracking-wider text-gray-500 font-semibold mb-1">Staff size</label>
        <select className={ic} value={form.staffCount} onChange={(e) => setForm({ ...form, staffCount: e.target.value })}>
          <option value="1-5">1–5 staff (solo / small)</option>
          <option value="6-20">6–20 staff (mid clinic)</option>
          <option value="21-100">21–100 staff (hospital)</option>
          <option value="100+">100+ staff (multi-branch)</option>
        </select>
      </div>
      <textarea
        className={ic + ' min-h-[80px]'}
        rows={3}
        maxLength={500}
        placeholder="What's your biggest workflow pain right now? (optional)"
        value={form.note}
        onChange={(e) => setForm({ ...form, note: e.target.value })}
      />
      <button type="submit" disabled={busy} className="w-full inline-flex justify-center items-center gap-1 px-5 py-2.5 bg-kerala-700 hover:bg-kerala-800 disabled:opacity-60 text-white rounded text-sm font-semibold">
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Request demo
      </button>
    </form>
  )
}
