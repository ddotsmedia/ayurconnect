'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { CountrySelect } from '../../components/country-select'
import { PhoneInput } from '../../components/phone-input'
import { detectCountry } from '../../lib/detect-country'

const VENDOR_TYPES = [
  { value: 'pharmacy',     label: 'GMP-certified Ayurvedic pharmacy' },
  { value: 'cultivator',   label: 'Herb cultivator / farmer' },
  { value: 'oil-maker',    label: 'Medicated oil / ghee maker' },
  { value: 'tool-maker',   label: 'Wellness tools / utensils' },
  { value: 'book',         label: 'Books / classical text publisher' },
  { value: 'other',        label: 'Other' },
]

export function VendorInquiryForm() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', country: 'IN',
    company: '', vendorType: 'pharmacy',
    certifications: '', productCount: '',
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
          kind: 'marketplace_vendor',
          name: form.name,
          email: form.email,
          phone: form.phone || null,
          country: form.country,
          subject: `${VENDOR_TYPES.find((t) => t.value === form.vendorType)?.label} — ${form.company}`,
          message: form.message,
          meta: {
            company:        form.company,
            vendorType:     form.vendorType,
            certifications: form.certifications,
            productCount:   form.productCount,
          },
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
        <h3 className="font-serif text-2xl text-kerala-700">Inquiry received</h3>
        <p className="text-gray-700 mt-3">Our vendor partnerships team will reach out within 3–5 business days.</p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-card border border-gray-100 shadow-card p-6 space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">Vendor type</label>
        <select value={form.vendorType} onChange={(e) => setForm({ ...form, vendorType: e.target.value })} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white">
          {VENDOR_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Your name</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Company / brand</label>
          <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Email</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required autoComplete="email" className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Country</label>
          <CountrySelect value={form.country} onChange={(c) => setForm({ ...form, country: c })} />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Phone / WhatsApp</label>
          <PhoneInput value={form.phone} onChange={(e164) => setForm({ ...form, phone: e164 })} defaultCountry={form.country} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Certifications</label>
          <input value={form.certifications} onChange={(e) => setForm({ ...form, certifications: e.target.value })} placeholder="GMP, AYUSH Premium, ISO…" className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Product count</label>
          <input value={form.productCount} onChange={(e) => setForm({ ...form, productCount: e.target.value })} placeholder="e.g. 50 SKUs" className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">Tell us about your products</label>
        <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required rows={4} minLength={30} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" placeholder="Categories, hero products, manufacturing setup, shipping geographies…" />
      </div>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <button type="submit" disabled={busy} className="w-full py-2.5 bg-kerala-600 hover:bg-kerala-700 disabled:opacity-50 text-white rounded-md font-semibold">
        {busy ? 'Sending…' : 'Submit vendor inquiry'}
      </button>
    </form>
  )
}
