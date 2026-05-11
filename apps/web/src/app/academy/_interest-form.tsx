'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { CountrySelect } from '../../components/country-select'
import { detectCountry } from '../../lib/detect-country'

export function CourseInterestForm({ courses }: { courses: Array<{ slug: string; title: string }> }) {
  const [form, setForm] = useState({
    name: '', email: '', country: 'IN',
    background: '',
    interested: [] as string[],
    message: '',
  })
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => { setForm((f) => ({ ...f, country: detectCountry() })) }, [])

  function toggle(slug: string) {
    setForm((f) => ({ ...f, interested: f.interested.includes(slug) ? f.interested.filter((s) => s !== slug) : [...f.interested, slug] }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (form.interested.length === 0) {
      setErr('Pick at least one course you\'re interested in')
      return
    }
    setBusy(true); setErr(null)
    try {
      const titles = form.interested.map((s) => courses.find((c) => c.slug === s)?.title ?? s)
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          kind: 'academy',
          name: form.name,
          email: form.email,
          country: form.country,
          subject: `Academy interest — ${titles.length} course${titles.length === 1 ? '' : 's'}`,
          message: form.message || `Interested in: ${titles.join(', ')}. Background: ${form.background || 'not specified'}.`,
          meta: { interested: form.interested, background: form.background },
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `request failed (${res.status})`)
      }
      setSent(true)
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e))
    } finally { setBusy(false) }
  }

  if (sent) {
    return (
      <div className="text-center bg-white rounded-card border border-kerala-100 shadow-card p-10">
        <CheckCircle2 className="w-16 h-16 text-kerala-600 mx-auto mb-4" />
        <h3 className="font-serif text-2xl text-kerala-700">Got it — you&apos;re on the list</h3>
        <p className="text-gray-700 mt-3">You&apos;ll hear from us 4 weeks before your first selected course launches.</p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-card border border-gray-100 shadow-card p-6 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Your name</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Email</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required autoComplete="email" className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Country</label>
          <CountrySelect value={form.country} onChange={(c) => setForm({ ...form, country: c })} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Your background</label>
          <select value={form.background} onChange={(e) => setForm({ ...form, background: e.target.value })} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white">
            <option value="">Select…</option>
            <option value="beginner">Curious beginner</option>
            <option value="patient">Ayurvedic patient</option>
            <option value="yoga-teacher">Yoga / wellness teacher</option>
            <option value="nurse">Nurse / allied health</option>
            <option value="doctor-allopathic">Allopathic doctor</option>
            <option value="doctor-bams">BAMS student / graduate</option>
            <option value="md-ayurveda">MD Ayurveda / Vaidya</option>
            <option value="business">Business / investor</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">Courses I&apos;m interested in (pick one or more)</label>
        <div className="grid sm:grid-cols-2 gap-2">
          {courses.map((c) => {
            const on = form.interested.includes(c.slug)
            return (
              <label key={c.slug} className={`flex items-start gap-2 p-3 rounded-md border-2 cursor-pointer transition-all ${on ? 'border-kerala-600 bg-kerala-50' : 'border-gray-200 hover:border-kerala-300'}`}>
                <input type="checkbox" checked={on} onChange={() => toggle(c.slug)} className="mt-1" />
                <span className="text-sm text-gray-800">{c.title}</span>
              </label>
            )
          })}
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">Anything specific you&apos;d like covered? (optional)</label>
        <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" placeholder="Topics, schedule preferences, language…" />
      </div>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <button type="submit" disabled={busy} className="w-full py-2.5 bg-kerala-600 hover:bg-kerala-700 disabled:opacity-50 text-white rounded-md font-semibold">
        {busy ? 'Sending…' : 'Notify me at launch'}
      </button>
    </form>
  )
}
