'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, CheckCircle2 } from 'lucide-react'

export function SecondOpinionForm() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', age: '', country: '',
    currentDiagnosis: '', currentMedications: '', concernType: 'panchakarma-planning',
    details: '',
  })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          kind: 'second_opinion',
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          country: form.country || undefined,
          subject: form.concernType,
          message: form.details || 'Second opinion request',
          meta: {
            age: form.age,
            currentDiagnosis: form.currentDiagnosis,
            currentMedications: form.currentMedications,
            concernType: form.concernType,
          },
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(data.error ?? `HTTP ${res.status}`)
      }
      setDone(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally { setLoading(false) }
  }

  if (done) {
    return (
      <div className="text-center py-12 bg-white border border-gray-100 rounded-card shadow-card">
        <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
        <h2 className="font-serif text-2xl text-emerald-900">Second-opinion request received</h2>
        <p className="text-sm text-emerald-800 mt-2 max-w-lg mx-auto">
          A senior CCIM specialist will review your case and email a written second opinion within 72 hours
          to <strong>{form.email}</strong>. We&apos;ll also offer an optional video consultation to discuss the findings.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-kerala-700 hover:bg-kerala-800 text-white text-sm rounded-md">Back to home</Link>
          <Link href="/qa" className="inline-flex items-center gap-2 px-5 py-2.5 border border-kerala-600 text-kerala-700 text-sm rounded-md">Browse Q&A</Link>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="bg-white border border-gray-100 rounded-card shadow-card p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-sm font-medium text-gray-700 mb-1 block">Your name *</span>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700 mb-1 block">Email *</span>
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700 mb-1 block">Phone <span className="text-gray-400 text-xs">(optional)</span></span>
          <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" placeholder="+91 …" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700 mb-1 block">Age</span>
          <input type="number" min="1" max="120" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700 mb-1 block">Country (ISO-2)</span>
          <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value.toUpperCase().slice(0, 2) })} placeholder="IN / AE / US…" className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm uppercase" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700 mb-1 block">What kind of opinion do you need?</span>
          <select value={form.concernType} onChange={(e) => setForm({ ...form, concernType: e.target.value })} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white">
            <option value="panchakarma-planning">Before starting Panchakarma</option>
            <option value="treatment-not-working">My current treatment isn&apos;t working</option>
            <option value="mineral-preparation-safety">Confirming Rasashastra safety</option>
            <option value="allopathic-conflict">Allopathic + Ayurvedic conflict check</option>
            <option value="surgery-alternative">Ayurvedic surgery alternative</option>
            <option value="pediatric">Pediatric care decision</option>
            <option value="other">Other</option>
          </select>
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-gray-700 mb-1 block">Current diagnosis / treatment summary *</span>
        <textarea required rows={3} value={form.currentDiagnosis} onChange={(e) => setForm({ ...form, currentDiagnosis: e.target.value })}
          placeholder="e.g. Diagnosed with RA 2 years ago. Currently on Yogaraj Guggulu + Methotrexate. Plan suggests adding Vamana." className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-gray-700 mb-1 block">Current medications (Ayurvedic + allopathic)</span>
        <textarea rows={2} value={form.currentMedications} onChange={(e) => setForm({ ...form, currentMedications: e.target.value })}
          placeholder="List doses and frequency." className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-gray-700 mb-1 block">Specific questions for the reviewing doctor</span>
        <textarea rows={4} value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })}
          placeholder="What you want the second-opinion doctor to address." className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" />
      </label>

      <p className="text-[11px] text-gray-500">
        Reports / images: after submitting, we&apos;ll email you a secure upload link to share imaging, blood work, or doctor letters.
      </p>

      {error && <div className="p-3 rounded bg-red-50 border border-red-100 text-red-800 text-sm" role="alert">{error}</div>}

      <button
        type="submit" disabled={loading || !form.name || !form.email || !form.currentDiagnosis}
        className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-kerala-700 hover:bg-kerala-800 disabled:opacity-60 text-white text-sm font-semibold rounded-md"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        Request second opinion
      </button>
    </form>
  )
}
