'use client'

import { useState } from 'react'
import { Send, CheckCircle2, Loader2 } from 'lucide-react'

export function HospitalInquiryForm({ hospitalId, hospitalName }: { hospitalId: string; hospitalName: string }) {
  const [form, setForm] = useState({ patientName: '', email: '', phone: '', whatsapp: '', country: '', treatmentInterest: '', preferredDates: '', message: '' })
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [err,  setErr]  = useState<string | null>(null)

  function set<K extends keyof typeof form>(k: K, v: string) { setForm((f) => ({ ...f, [k]: v })) }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setErr(null)
    try {
      const res = await fetch(`/api/hospitals-public/${hospitalId}/inquiry`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...form, source: 'website' }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error ?? `HTTP ${res.status}`)
      }
      setDone(true)
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)) }
    finally { setBusy(false) }
  }

  if (done) return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-card p-5 text-center">
      <CheckCircle2 className="w-10 h-10 text-emerald-700 mx-auto" />
      <h3 className="font-serif text-lg text-emerald-900 mt-2">Inquiry sent</h3>
      <p className="text-sm text-emerald-800 mt-1">{hospitalName} will respond via email or WhatsApp soon.</p>
    </div>
  )

  return (
    <form onSubmit={submit} className="bg-white border border-kerala-100 rounded-card p-4 space-y-2 shadow-card">
      <h3 className="font-serif text-lg text-ink">Inquire about treatment</h3>
      <p className="text-xs text-gray-600">Hospital responds via email or WhatsApp.</p>
      <div className="grid grid-cols-2 gap-2">
        <Input required value={form.patientName} onChange={(v) => set('patientName', v)} placeholder="Your name *" />
        <Input required type="email" value={form.email} onChange={(v) => set('email', v)} placeholder="Email *" />
        <Input value={form.phone} onChange={(v) => set('phone', v)} placeholder="Phone" />
        <Input value={form.whatsapp} onChange={(v) => set('whatsapp', v)} placeholder="WhatsApp" />
        <Input value={form.country} onChange={(v) => set('country', v.toUpperCase())} placeholder="Country (ISO-2)" maxLength={2} />
        <Input value={form.preferredDates} onChange={(v) => set('preferredDates', v)} placeholder="Preferred dates" />
      </div>
      <Input value={form.treatmentInterest} onChange={(v) => set('treatmentInterest', v)} placeholder="Treatment interest (e.g. Panchakarma, Pizhichil)" />
      <textarea required value={form.message} onChange={(e) => set('message', e.target.value)} rows={3} placeholder="Your message *" className="w-full border border-gray-200 rounded px-3 py-2 text-sm" />
      {err && <p className="text-xs text-red-600">{err}</p>}
      <button type="submit" disabled={busy} className="w-full inline-flex justify-center items-center gap-1.5 px-4 py-2 bg-kerala-700 hover:bg-kerala-800 text-white rounded text-sm font-semibold disabled:opacity-50">
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        {busy ? 'Sending…' : 'Send inquiry'}
      </button>
    </form>
  )
}

function Input(props: { value: string; onChange: (v: string) => void; placeholder: string; required?: boolean; type?: string; maxLength?: number }) {
  return <input type={props.type ?? 'text'} required={props.required} value={props.value} onChange={(e) => props.onChange(e.target.value)} placeholder={props.placeholder} maxLength={props.maxLength} className="border border-gray-200 rounded px-3 py-2 text-sm" />
}
