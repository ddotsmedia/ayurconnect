'use client'

import { useState } from 'react'
import { MessageCircle, Phone, Mail, CheckCircle2, Loader2 } from 'lucide-react'
import { WhatsAppMessagePicker } from '../whatsapp-message-picker'

// Central AyurConnect WhatsApp — lead-capture flow. The picker still shows
// doctor-context templates; only the destination number is central.
const WA_PHONE = '971509379212'

export function BookingCard({ doctorId, doctorName, specialization }: { doctorId: string; doctorName: string; specialization: string }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', concern: '' })
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setErr(null)
    try {
      const r = await fetch('/api/leads', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          kind: 'doctor_callback',
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: 'callback@request.local',
          message: `Callback request for ${doctorName} (${specialization}).\nConcern: ${form.concern}`.slice(0, 4000),
        }),
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      setDone(true)
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)) } finally { setBusy(false) }
  }

  const entityLabel = `${doctorName.replace(/^Dr\.?\s*/, 'Dr. ')} (${specialization})`

  return (
    <>
      {/* Desktop sticky card */}
      <div className="bg-white border border-gray-100 rounded-card shadow-cardLg p-5 lg:sticky lg:top-24 self-start">
        <h2 className="font-serif text-xl text-ink">Consult {doctorName.replace(/^Dr\.?\s*/, 'Dr. ')}</h2>
        <WhatsAppMessagePicker phone={WA_PHONE} context="doctor" entityName={entityLabel} className="block mt-4">
          <button type="button" className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-md text-sm">
            <MessageCircle className="w-4 h-4" /> Book via WhatsApp
          </button>
        </WhatsAppMessagePicker>
        <button onClick={() => setOpen(!open)} className="mt-2 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-kerala-700 text-kerala-700 hover:bg-kerala-50 font-semibold rounded-md text-sm">
          <Phone className="w-4 h-4" /> Request Callback
        </button>

        {open && !done && (
          <form onSubmit={submit} className="mt-3 space-y-2 text-sm">
            <input required value={form.name}    onChange={(e) => setForm({ ...form, name: e.target.value })}    placeholder="Your name *"      className="w-full border border-gray-200 rounded px-3 py-2" />
            <input required value={form.phone}   onChange={(e) => setForm({ ...form, phone: e.target.value })}   placeholder="Phone / WhatsApp *" className="w-full border border-gray-200 rounded px-3 py-2" />
            <textarea     value={form.concern}   onChange={(e) => setForm({ ...form, concern: e.target.value })} rows={2} placeholder="Brief health concern" className="w-full border border-gray-200 rounded px-3 py-2" />
            {err && <p className="text-xs text-red-600">{err}</p>}
            <button type="submit" disabled={busy} className="w-full inline-flex justify-center items-center gap-1.5 px-4 py-2 bg-kerala-700 text-white rounded text-sm font-semibold disabled:opacity-50">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />} {busy ? 'Sending…' : 'Request callback'}
            </button>
          </form>
        )}
        {done && (
          <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded p-3 text-xs text-emerald-900 inline-flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> <span>Callback requested. Our team will contact you within 24 hours.</span>
          </div>
        )}
      </div>

      {/* Mobile fixed bottom bar */}
      <WhatsAppMessagePicker
        phone={WA_PHONE}
        context="doctor"
        entityName={entityLabel}
        className="fixed bottom-16 left-0 right-0 z-40 lg:hidden block"
      >
        <button type="button" className="w-full bg-gold-500 hover:bg-gold-600 text-white font-semibold flex items-center justify-center gap-2 py-3.5 shadow-cardLg">
          <MessageCircle className="w-5 h-5" /> Book {doctorName.split(' ').slice(0, 2).join(' ')} on WhatsApp
        </button>
      </WhatsAppMessagePicker>

      {/* keep doctorId stable in DOM for analytics */}
      <span data-doctor-id={doctorId} className="hidden" />
    </>
  )
}
