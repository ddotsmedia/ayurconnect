'use client'

import { useState } from 'react'
import { Loader2, Send, CheckCircle2, AlertCircle } from 'lucide-react'
import { HEAL_COUNTRIES } from './_countries'

const TREATMENTS = [
  'Panchakarma (full course)', 'Pizhichil', 'Njavarakizhi (Shashtika Shali Pinda Sweda)',
  'Sirodhara', 'Karkidaka Chikitsa (monsoon rejuvenation)', 'Rejuvenation / Rasayana',
  'Marma + Kalari therapy', 'Specific condition treatment',
  'Not sure — please advise',
]

export function EnquiryForm({ defaultCountry }: { defaultCountry?: string } = {}) {
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    country: defaultCountry ?? '',
    treatmentInterest: '',
    preferredDates: '',
    message: '',
  })
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [err,  setErr]  = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.country || !form.treatmentInterest) {
      setErr('Please fill name, email, country and treatment interest.'); return
    }
    setBusy(true); setErr(null)
    try {
      const note = [
        `Country: ${form.country}`,
        `Treatment: ${form.treatmentInterest}`,
        form.preferredDates ? `Preferred dates: ${form.preferredDates}` : null,
        form.phone           ? `Phone: ${form.phone}` : null,
        form.message         ? `Message: ${form.message}` : null,
      ].filter(Boolean).join('\n')

      const r = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          kind:  'heal_in_kerala_enquiry',
          name:  form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          message: note.slice(0, 4000),
        }),
      })
      if (!r.ok) {
        const j = await r.json().catch(() => ({})) as { error?: string }
        if (r.status === 429) throw new Error('Too many submissions — please try again in an hour.')
        throw new Error(j.error ?? `HTTP ${r.status}`)
      }
      setDone(true)
    } catch (e2) { setErr(e2 instanceof Error ? e2.message : String(e2)) } finally { setBusy(false) }
  }

  if (done) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-card p-6 text-center">
        <CheckCircle2 className="w-10 h-10 text-emerald-700 mx-auto mb-3" />
        <h3 className="font-serif text-lg text-emerald-900">Thank you</h3>
        <p className="text-sm text-emerald-900 mt-1">Our medical tourism team will contact you within 24 hours to discuss your treatment plan.</p>
      </div>
    )
  }

  const ic = 'w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-kerala-700'

  return (
    <form onSubmit={submit} className="bg-white border border-gray-100 rounded-card p-6 shadow-card space-y-3">
      <h3 className="font-serif text-xl text-ink">Plan my treatment</h3>
      <p className="text-sm text-muted">Tell us about your treatment goals and we&apos;ll match you with a verified Kerala specialist.</p>

      {err && (
        <div className="p-3 rounded bg-red-50 border border-red-100 text-sm text-red-800 inline-flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5" /> {err}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input  className={ic} required placeholder="Full name *"               value={form.name}              onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input  className={ic} required type="email" placeholder="Email *"      value={form.email}             onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input  className={ic}          placeholder="WhatsApp / phone (opt.)"   value={form.phone}             onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <select className={ic} required value={form.country}                                                  onChange={(e) => setForm({ ...form, country: e.target.value })}>
          <option value="">Country *</option>
          {HEAL_COUNTRIES.map((c) => <option key={c.slug} value={c.name}>{c.flag} {c.name}</option>)}
          <option value="other">Other</option>
        </select>
        <select className={ic + ' md:col-span-2'} required value={form.treatmentInterest}                     onChange={(e) => setForm({ ...form, treatmentInterest: e.target.value })}>
          <option value="">Treatment interest *</option>
          {TREATMENTS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <input  className={ic + ' md:col-span-2'} placeholder="Preferred dates (e.g. 'Nov 15 – Dec 5')"      value={form.preferredDates} onChange={(e) => setForm({ ...form, preferredDates: e.target.value })} />
      </div>
      <textarea
        className={ic + ' min-h-[80px]'}
        rows={3} maxLength={1000}
        placeholder="Anything else? (current conditions, dietary requirements, accessibility…)"
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
      />
      <button type="submit" disabled={busy} className="w-full inline-flex justify-center items-center gap-1.5 px-5 py-2.5 bg-kerala-700 hover:bg-kerala-800 disabled:opacity-60 text-white rounded text-sm font-semibold">
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Plan my treatment
      </button>
      <p className="text-[10px] text-gray-500 text-center">By submitting you consent to AyurConnect contacting you about Kerala Ayurveda treatment options. We don&apos;t share your details with third parties.</p>
    </form>
  )
}
