'use client'

import { useEffect, useState } from 'react'
import { Calendar, Clock, Plus, Trash2, X, Loader2 } from 'lucide-react'

type Slot = {
  id: string
  startsAt: string
  endsAt: string
  status: 'open' | 'booked' | 'cancelled'
  type: 'video' | 'in-person' | 'either'
  notes: string | null
}

const STATUS_TONE: Record<Slot['status'], string> = {
  open:      'bg-kerala-50 text-kerala-700 border-kerala-200',
  booked:    'bg-amber-50 text-amber-800 border-amber-200',
  cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })
}

export default function SlotsPage() {
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)

  async function load() {
    setLoading(true); setErr(null)
    try {
      const res = await fetch('/api/me/doctor/slots', { credentials: 'include' })
      if (!res.ok) {
        if (res.status === 403) { setErr('You need a verified doctor profile to manage slots.'); return }
        throw new Error(`HTTP ${res.status}`)
      }
      const data = (await res.json()) as Slot[]
      setSlots(data)
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  async function deleteSlot(id: string, status: Slot['status']) {
    if (status === 'booked') {
      if (!confirm('This slot is booked. Cancelling will mark it cancelled but leave the appointment in place. Continue?')) return
      try {
        await fetch(`/api/me/doctor/slots/${id}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ status: 'cancelled' }),
        })
        await load()
      } catch (e) { alert(String(e)) }
    } else {
      if (!confirm('Delete this slot?')) return
      try {
        await fetch(`/api/me/doctor/slots/${id}`, { method: 'DELETE', credentials: 'include' })
        await load()
      } catch (e) { alert(String(e)) }
    }
  }

  // Group by date
  const byDate = slots.reduce<Record<string, Slot[]>>((acc, s) => {
    const k = fmtDate(s.startsAt)
    ;(acc[k] ??= []).push(s)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-serif text-3xl text-kerala-700">My availability</h1>
          <p className="text-sm text-muted mt-1">Add bookable time slots — patients see them on your profile and pick one when booking.</p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-kerala-700 text-white font-semibold rounded-md hover:bg-kerala-800 text-sm"
        >
          <Plus className="w-4 h-4" /> Add slots
        </button>
      </header>

      {err && <div className="p-3 rounded bg-amber-50 border border-amber-200 text-sm text-amber-900">{err}</div>}

      {adding && <AddSlotsModal onClose={() => { setAdding(false); load() }} />}

      {loading && slots.length === 0 && <p className="text-sm text-muted">Loading…</p>}
      {!loading && slots.length === 0 && (
        <div className="bg-white rounded-card border border-gray-100 shadow-card p-8 text-center">
          <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h2 className="font-semibold text-gray-900">No slots yet</h2>
          <p className="text-sm text-muted mt-1 max-w-md mx-auto">Click <strong>Add slots</strong> to define a recurring weekly schedule or one-off availability windows.</p>
        </div>
      )}

      {Object.entries(byDate).map(([date, list]) => (
        <section key={date} className="bg-white rounded-card border border-gray-100 shadow-card p-5">
          <h3 className="font-semibold text-gray-900 mb-3">{date}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {list.map((s) => (
              <div key={s.id} className={`px-3 py-2 rounded-md border text-xs flex items-start justify-between ${STATUS_TONE[s.status]}`}>
                <div className="min-w-0">
                  <div className="font-semibold flex items-center gap-1"><Clock className="w-3 h-3" /> {fmtTime(s.startsAt)}</div>
                  <div className="opacity-75">{s.status} · {s.type}</div>
                </div>
                <button onClick={() => deleteSlot(s.id, s.status)} className="opacity-50 hover:opacity-100 ml-2">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

// ─── Add-slots modal — generate a week of slots, configurable ─────────────
function AddSlotsModal({ onClose }: { onClose: () => void }) {
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [days, setDays] = useState(7)
  const [startHour, setStartHour] = useState(10)
  const [endHour, setEndHour] = useState(13)
  const [duration, setDuration] = useState(30)
  const [type, setType] = useState<'video' | 'in-person' | 'either'>('either')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const preview: Date[] = []
  const start = new Date(startDate + 'T00:00:00')
  for (let d = 0; d < days; d++) {
    for (let h = startHour; h < endHour; h++) {
      for (let m = 0; m < 60; m += duration) {
        const dt = new Date(start)
        dt.setDate(dt.getDate() + d)
        dt.setHours(h, m, 0, 0)
        if (dt > new Date()) preview.push(dt)
      }
    }
  }

  async function submit() {
    setBusy(true); setErr(null)
    try {
      const res = await fetch('/api/me/doctor/slots', {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          slots: preview.map((dt) => ({ startsAt: dt.toISOString(), durationMinutes: duration, type })),
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error ?? `HTTP ${res.status}`)
      }
      onClose()
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)) } finally { setBusy(false) }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-card shadow-cardLg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-2xl text-kerala-700">Add slots</h2>
          <button onClick={onClose} aria-label="Close"><X className="w-5 h-5 text-gray-500" /></button>
        </div>

        <div className="space-y-4 text-sm">
          <label className="block">
            <span className="block text-xs font-medium text-gray-700 mb-1.5">Start date</span>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-gray-700 mb-1.5">Number of days</span>
            <input type="number" min={1} max={31} value={days} onChange={(e) => setDays(Number(e.target.value) || 1)} className="w-full border rounded-md px-3 py-2 text-sm" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-xs font-medium text-gray-700 mb-1.5">Start hour</span>
              <input type="number" min={0} max={23} value={startHour} onChange={(e) => setStartHour(Number(e.target.value) || 0)} className="w-full border rounded-md px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="block text-xs font-medium text-gray-700 mb-1.5">End hour</span>
              <input type="number" min={1} max={23} value={endHour} onChange={(e) => setEndHour(Number(e.target.value) || 1)} className="w-full border rounded-md px-3 py-2 text-sm" />
            </label>
          </div>
          <label className="block">
            <span className="block text-xs font-medium text-gray-700 mb-1.5">Slot length</span>
            <select value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full border rounded-md px-3 py-2 text-sm bg-white">
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
            </select>
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-gray-700 mb-1.5">Consultation type</span>
            <select value={type} onChange={(e) => setType(e.target.value as 'video' | 'in-person' | 'either')} className="w-full border rounded-md px-3 py-2 text-sm bg-white">
              <option value="either">Either (video or in-person)</option>
              <option value="video">Video only</option>
              <option value="in-person">In-person only</option>
            </select>
          </label>

          <div className="bg-kerala-50 border border-kerala-200 rounded-md p-3 text-xs">
            Will create <strong>{preview.length}</strong> slots between{' '}
            {preview[0] ? fmtDate(preview[0].toISOString()) + ' ' + fmtTime(preview[0].toISOString()) : '—'} and{' '}
            {preview[preview.length - 1] ? fmtDate(preview[preview.length - 1].toISOString()) + ' ' + fmtTime(preview[preview.length - 1].toISOString()) : '—'}.
          </div>

          {err && <p className="text-sm text-red-600">{err}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50">Cancel</button>
            <button onClick={submit} disabled={busy || preview.length === 0} className="inline-flex items-center gap-1.5 px-4 py-2 bg-kerala-700 text-white font-semibold rounded-md hover:bg-kerala-800 disabled:opacity-50 text-sm">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create {preview.length} slots
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
