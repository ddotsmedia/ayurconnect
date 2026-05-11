'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { CountrySelect } from '../../components/country-select'
import { PhoneInput } from '../../components/phone-input'
import { detectCountry } from '../../lib/detect-country'

export function WaitlistForm({ productSlug, productName }: { productSlug: string; productName: string }) {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', country: 'IN',
    organisation: '', role: '',
    scale: '',
    message: '',
  })
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => { setForm((f) => ({ ...f, country: detectCountry() })) }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setErr(null)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          kind: 'product_waitlist',
          name: form.name,
          email: form.email,
          phone: form.phone || null,
          country: form.country,
          subject: `${productName} waitlist — ${form.organisation}`,
          message: form.message,
          meta: { product: productSlug, organisation: form.organisation, role: form.role, scale: form.scale },
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
        <h3 className="font-serif text-2xl text-kerala-700">You&apos;re on the {productName} waitlist</h3>
        <p className="text-gray-700 mt-3">Our team will reach out when pilot access opens. No spam in the meantime.</p>
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
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Work email</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required autoComplete="email" className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Organisation</label>
          <input value={form.organisation} onChange={(e) => setForm({ ...form, organisation: e.target.value })} required className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" placeholder="Hospital / company name" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Your role</label>
          <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" placeholder="Director / CTO / etc." />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Scale</label>
          <select value={form.scale} onChange={(e) => setForm({ ...form, scale: e.target.value })} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white">
            <option value="">Select…</option>
            <option value="single-clinic">Single clinic</option>
            <option value="small-chain">2–5 centres</option>
            <option value="medium-chain">6–20 centres</option>
            <option value="large-chain">20+ centres</option>
            <option value="govt">Govt institution</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Country</label>
          <CountrySelect value={form.country} onChange={(c) => setForm({ ...form, country: c })} />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Phone / WhatsApp</label>
          <PhoneInput value={form.phone} onChange={(e164) => setForm({ ...form, phone: e164 })} defaultCountry={form.country} />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">Tell us your context (optional)</label>
        <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" placeholder="Current pain points, timeline, must-have features…" />
      </div>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <button type="submit" disabled={busy} className="w-full py-2.5 bg-kerala-600 hover:bg-kerala-700 disabled:opacity-50 text-white rounded-md font-semibold">
        {busy ? 'Sending…' : `Join the ${productName} waitlist`}
      </button>
    </form>
  )
}
