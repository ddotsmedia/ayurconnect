'use client'

import { useState } from 'react'
import { X, CheckCircle2, MessageCircle, Calendar as CalIcon, Loader2 } from 'lucide-react'
import type { AyurEvent } from '../../lib/types/platform'

function buildIcs(e: AyurEvent): string {
  const dt = (date: string, time: string) => (date.replace(/-/g, '') + 'T' + time.replace(':', '') + '00')
  const esc = (s: string) => s.replace(/[\\;,\n]/g, (c) => c === '\n' ? '\\n' : '\\' + c)
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//AyurConnect//EN',
    'BEGIN:VEVENT',
    `UID:${e.id}@ayurconnect.com`,
    `DTSTART:${dt(e.startDate, e.startTime)}`,
    `DTEND:${dt(e.endDate, e.endTime)}`,
    `SUMMARY:${esc(e.title)}`,
    `DESCRIPTION:${esc(e.description)}`,
    `LOCATION:${esc(e.online ? 'Online' : `${e.venue}, ${e.city}`)}`,
    `URL:https://ayurconnect.com/events/${e.slug}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n')
}

export function EventRegistration({ event, open, onClose }: { event: AyurEvent; open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', org: '' })
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) return
    setBusy(true)
    try {
      const k = 'ayur_event_registrations'
      const prev = JSON.parse(localStorage.getItem(k) ?? '[]') as Array<Record<string, unknown>>
      prev.push({ eventId: event.id, eventSlug: event.slug, ...form, registeredAt: new Date().toISOString(), paid: !event.isFree })
      localStorage.setItem(k, JSON.stringify(prev))
    } catch { /* ignore */ }
    setBusy(false); setDone(true)
  }

  function downloadIcs() {
    const blob = new Blob([buildIcs(event)], { type: 'text/calendar' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob); a.download = `${event.slug}.ics`
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(a.href)
  }

  const wa = `https://wa.me/971509379212?text=${encodeURIComponent(`Registration for ${event.title} (${event.startDate})`)}`
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-card max-w-md w-full p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg text-ink">{done ? 'Registration confirmed' : `Register: ${event.title}`}</h2>
          <button onClick={onClose} aria-label="close"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        {done ? (
          <div className="text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-700 mx-auto" />
            {!event.isFree && <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded p-2">Paid event — payment is collected at the event venue. Save the .ics file and bring confirmation.</p>}
            <p className="text-sm text-gray-700">You&apos;re registered for <strong>{event.title}</strong>.</p>
            <div className="flex flex-col gap-2">
              <button onClick={downloadIcs} className="inline-flex justify-center items-center gap-1.5 px-4 py-2 bg-kerala-700 hover:bg-kerala-800 text-white rounded text-sm font-semibold">
                <CalIcon className="w-4 h-4" /> Add to calendar (.ics)
              </button>
              <a href={wa} target="_blank" rel="noreferrer" className="inline-flex justify-center items-center gap-1.5 px-4 py-2 bg-[#25d366] hover:opacity-90 text-white rounded text-sm font-semibold">
                <MessageCircle className="w-4 h-4" /> WhatsApp confirmation
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <input required value={form.name}  onChange={(e) => setForm({ ...form, name: e.target.value })}  placeholder="Full name *"      className="w-full px-3 py-2 border border-gray-200 rounded text-sm" />
            <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email *"          className="w-full px-3 py-2 border border-gray-200 rounded text-sm" />
            <input          value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone / WhatsApp" className="w-full px-3 py-2 border border-gray-200 rounded text-sm" />
            <input          value={form.org}   onChange={(e) => setForm({ ...form, org: e.target.value })}   placeholder="Organization (optional)" className="w-full px-3 py-2 border border-gray-200 rounded text-sm" />
            {!event.isFree && <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded p-2"><strong>{event.currency} {event.price.toLocaleString()}</strong> — payment collected at venue or via separate link.</p>}
            <button type="submit" disabled={busy} className="w-full inline-flex justify-center items-center gap-1.5 px-4 py-2 bg-kerala-700 hover:bg-kerala-800 text-white rounded text-sm font-semibold">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : event.isFree ? 'Confirm registration' : 'Continue to payment'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
