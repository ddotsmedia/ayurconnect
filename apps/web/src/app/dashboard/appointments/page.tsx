'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Calendar, Clock, MapPin, Video, X } from 'lucide-react'

type Appt = {
  id: string
  dateTime: string
  type: string
  status: string
  notes: string | null
  chiefComplaint: string | null
  fee: number | null
  paymentStatus: string | null
  doctor: { id: string; name: string; specialization: string; district: string } | null
  user:   { id: string; name: string | null; email: string }
}

const STATUS_TONE: Record<string, string> = {
  scheduled: 'bg-blue-50 text-blue-800 border-blue-100',
  confirmed: 'bg-kerala-50 text-kerala-800 border-kerala-100',
  completed: 'bg-gray-50 text-gray-700 border-gray-200',
  cancelled: 'bg-red-50 text-red-800 border-red-100',
  'no-show':  'bg-amber-50 text-amber-800 border-amber-100',
}

export default function AppointmentsPage() {
  const [items, setItems] = useState<Appt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming')

  async function load() {
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/appointments', { credentials: 'include' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setItems((await res.json()) as Appt[])
    } catch (e) { setError(String(e)) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  async function cancel(id: string) {
    if (!confirm('Cancel this appointment?')) return
    try {
      const res = await fetch(`/api/appointments/${id}/cancel`, { method: 'PATCH', credentials: 'include' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await load()
    } catch (e) { alert(String(e)) }
  }

  const now = Date.now()
  const filtered = items.filter((a) => {
    if (tab === 'cancelled') return a.status === 'cancelled'
    const isPast = new Date(a.dateTime).getTime() < now
    if (tab === 'upcoming') return !isPast && a.status !== 'cancelled'
    return isPast && a.status !== 'cancelled'
  })

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl text-kerala-700">Appointments</h1>
        <p className="text-muted mt-1">Your video and in-person consultations.</p>
      </header>

      <div className="flex gap-1 bg-gray-100 p-0.5 rounded w-fit">
        {(['upcoming', 'past', 'cancelled'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={
              tab === t
                ? 'px-4 py-1.5 bg-white shadow text-sm font-medium rounded'
                : 'px-4 py-1.5 text-sm text-gray-600 hover:text-gray-800 rounded'
            }
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {error && <div className="p-3 rounded bg-red-50 text-red-800 text-sm">{error}</div>}

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-100 rounded-card">
          <Calendar className="mx-auto h-10 w-10 text-gray-300 mb-3" />
          <p className="text-muted">No {tab} appointments.</p>
          {tab === 'upcoming' && (
            <Link href="/doctors" className="inline-block mt-3 px-4 py-2 bg-kerala-600 text-white rounded-md text-sm font-semibold hover:bg-kerala-700">
              Book a consultation →
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => {
            const dt = new Date(a.dateTime)
            const isVideo = a.type.includes('video')
            return (
              <article key={a.id} className="bg-white rounded-card border border-gray-100 shadow-card p-5">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div className="flex-1 min-w-0">
                    <Link href={a.doctor ? `/doctors/${a.doctor.id}` : '#'} className="font-semibold text-ink hover:text-kerala-700">
                      {a.doctor?.name ?? 'Doctor'}
                    </Link>
                    <p className="text-xs text-muted">{a.doctor?.specialization}{a.doctor?.district ? ` · ${a.doctor.district}` : ''}</p>
                    <div className="mt-2 flex items-center gap-3 text-sm text-gray-700 flex-wrap">
                      <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-gray-400" /> {dt.toLocaleString()}</span>
                      <span className="flex items-center gap-1.5">
                        {isVideo ? <Video className="w-3.5 h-3.5 text-gray-400" /> : <MapPin className="w-3.5 h-3.5 text-gray-400" />}
                        {a.type.replace(/-/g, ' ')}
                      </span>
                      <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${STATUS_TONE[a.status] ?? 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                        {a.status}
                      </span>
                      {a.fee != null && (
                        <span className="text-xs text-gray-600">₹{a.fee} · {a.paymentStatus ?? 'pending'}</span>
                      )}
                    </div>
                    {a.chiefComplaint && (
                      <p className="text-xs text-gray-600 mt-2 line-clamp-2"><strong>Chief complaint:</strong> {a.chiefComplaint}</p>
                    )}
                  </div>
                  {tab === 'upcoming' && (
                    <button onClick={() => cancel(a.id)} className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-800">
                      <X className="w-3 h-3" /> Cancel
                    </button>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
