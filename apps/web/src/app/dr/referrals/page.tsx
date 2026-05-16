'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Share2, Inbox, Send, Loader2, Check, X, AlertCircle, CheckCircle2 } from 'lucide-react'

type DoctorLite = { id: string; name: string; specialization: string; district: string }
type CaseLite   = { id: string; title: string }
type Referral = {
  id: string; status: 'pending' | 'accepted' | 'declined' | 'completed'; urgency: 'routine' | 'soon' | 'urgent'
  patientName: string; patientEmail: string | null; patientAge: number | null
  specialty: string | null; condition: string | null; reason: string
  responseNote: string | null
  createdAt: string; respondedAt: string | null; completedAt: string | null
  fromDoctor: DoctorLite | null; toDoctor: DoctorLite | null; case: CaseLite | null
}
type Inbox = { referrals: Referral[]; pendingCount: number; doctorId: string }

const URGENCY_TONE: Record<Referral['urgency'], string> = {
  routine: 'bg-gray-100 text-gray-700',
  soon:    'bg-amber-100 text-amber-800',
  urgent:  'bg-rose-100 text-rose-800',
}
const STATUS_TONE: Record<Referral['status'], string> = {
  pending:   'bg-amber-50 text-amber-800',
  accepted:  'bg-emerald-50 text-emerald-700',
  declined:  'bg-gray-100 text-gray-600',
  completed: 'bg-kerala-50 text-kerala-700',
}

export default function ReferralsPage() {
  const [direction, setDirection] = useState<'received' | 'sent'>('received')
  const [data, setData] = useState<Inbox | null>(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [showCompose, setShowCompose] = useState(false)

  async function load() {
    setLoading(true); setErr(null)
    try {
      const res = await fetch(`/api/dr/referrals?direction=${direction}`, { credentials: 'include' })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? `HTTP ${res.status}`)
      setData(await res.json() as Inbox)
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)) } finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [direction])

  async function respond(id: string, status: 'accepted' | 'declined', note: string) {
    const res = await fetch(`/api/dr/referrals/${id}/respond`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status, responseNote: note || null }),
      credentials: 'include',
    })
    if (res.ok) void load()
    else alert((await res.json().catch(() => ({}))).error ?? `HTTP ${res.status}`)
  }

  async function complete(id: string) {
    const res = await fetch(`/api/dr/referrals/${id}/complete`, { method: 'PATCH', credentials: 'include' })
    if (res.ok) void load()
    else alert((await res.json().catch(() => ({}))).error ?? `HTTP ${res.status}`)
  }

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-3xl text-kerala-700 inline-flex items-center gap-2"><Share2 className="w-7 h-7" /> Referrals</h1>
          <p className="text-sm text-muted mt-1 max-w-2xl">
            Refer patients to colleagues whose specialty is a better fit. Recipients get notified; both sides track the case through to completion.
          </p>
        </div>
        <button
          onClick={() => setShowCompose((s) => !s)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-kerala-700 hover:bg-kerala-800 text-white rounded-md text-sm font-semibold"
        >
          <Send className="w-4 h-4" /> {showCompose ? 'Cancel' : 'Refer a patient'}
        </button>
      </header>

      {showCompose && (
        <ComposeForm
          onSent={() => { setShowCompose(false); setDirection('sent'); void load() }}
          onCancel={() => setShowCompose(false)}
        />
      )}

      {/* Direction toggle */}
      <div className="inline-flex bg-gray-100 rounded-md p-1 text-sm">
        <button
          onClick={() => setDirection('received')}
          className={'px-4 py-1.5 rounded ' + (direction === 'received' ? 'bg-white shadow-sm font-semibold' : 'text-gray-600')}
        >
          <Inbox className="w-4 h-4 inline -mt-0.5 mr-1.5" /> Inbox
          {data && data.pendingCount > 0 && direction === 'received' && (
            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">{data.pendingCount}</span>
          )}
        </button>
        <button
          onClick={() => setDirection('sent')}
          className={'px-4 py-1.5 rounded ' + (direction === 'sent' ? 'bg-white shadow-sm font-semibold' : 'text-gray-600')}
        >
          <Send className="w-4 h-4 inline -mt-0.5 mr-1.5" /> Sent
        </button>
      </div>

      {err && (
        <div className="p-3 rounded bg-red-50 border border-red-100 text-sm text-red-800 inline-flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {err}
        </div>
      )}

      {loading && <p className="text-muted"><Loader2 className="w-4 h-4 inline animate-spin mr-1.5" /> Loading…</p>}

      {!loading && data && data.referrals.length === 0 && (
        <div className="bg-white border border-gray-100 rounded-card p-10 text-center">
          <Inbox className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-700">{direction === 'received' ? 'No referrals received yet.' : 'You haven\'t referred any patients yet.'}</p>
        </div>
      )}

      {!loading && data && data.referrals.length > 0 && (
        <ul className="space-y-3">
          {data.referrals.map((r) => (
            <ReferralCard
              key={r.id}
              referral={r}
              isRecipient={direction === 'received'}
              onRespond={respond}
              onComplete={complete}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

// ─── Referral card ───────────────────────────────────────────────────────
function ReferralCard({ referral: r, isRecipient, onRespond, onComplete }: {
  referral: Referral; isRecipient: boolean
  onRespond: (id: string, status: 'accepted' | 'declined', note: string) => Promise<void>
  onComplete: (id: string) => Promise<void>
}) {
  const [noteOpen, setNoteOpen] = useState(false)
  const [note, setNote] = useState('')
  const other = isRecipient ? r.fromDoctor : r.toDoctor
  return (
    <article className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
      <header className="flex items-start justify-between gap-3 flex-wrap mb-2">
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={'text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ' + STATUS_TONE[r.status]}>{r.status}</span>
            <span className={'text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ' + URGENCY_TONE[r.urgency]}>{r.urgency}</span>
            {r.specialty && <span className="text-[10px] px-2 py-0.5 bg-kerala-50 text-kerala-700 rounded">{r.specialty}</span>}
          </div>
          <h3 className="font-serif text-lg text-ink mt-2">{r.patientName}{r.patientAge ? `, ${r.patientAge}y` : ''}</h3>
          {r.condition && <p className="text-sm text-gray-700 mt-0.5">{r.condition}</p>}
        </div>
        <p className="text-xs text-muted text-right">
          {isRecipient ? 'From' : 'To'} <strong>Dr {other?.name ?? '—'}</strong>
          {other && <span className="block text-[11px] text-gray-500">{other.specialization} · {other.district}</span>}
          <span className="block text-[10px] text-gray-400 mt-1">{new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
        </p>
      </header>

      <p className="text-sm text-gray-800 mt-2 whitespace-pre-line leading-relaxed">{r.reason}</p>

      {r.case && (
        <p className="text-xs text-muted mt-2">
          Linked case: <Link href={`/dr/cases/${r.case.id}`} className="text-kerala-700 hover:underline">{r.case.title}</Link>
        </p>
      )}

      {r.responseNote && (
        <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-700">
          <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Response note</div>
          {r.responseNote}
        </div>
      )}

      {/* Action row */}
      {isRecipient && r.status === 'pending' && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          {!noteOpen ? (
            <div className="flex gap-2">
              <button onClick={() => void onRespond(r.id, 'accepted', '')} className="inline-flex items-center gap-1 px-4 py-2 bg-kerala-700 hover:bg-kerala-800 text-white rounded text-xs font-semibold">
                <Check className="w-3.5 h-3.5" /> Accept
              </button>
              <button onClick={() => setNoteOpen(true)} className="inline-flex items-center gap-1 px-4 py-2 border border-gray-200 hover:border-rose-300 text-gray-700 rounded text-xs font-semibold">
                <X className="w-3.5 h-3.5" /> Decline with note
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="Optional note to the referring doctor…"
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
              />
              <div className="flex gap-2">
                <button onClick={() => { void onRespond(r.id, 'declined', note); setNoteOpen(false); setNote('') }} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold">
                  Send decline
                </button>
                <button onClick={() => { setNoteOpen(false); setNote('') }} className="px-4 py-2 border border-gray-200 text-gray-700 rounded text-xs">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {isRecipient && r.status === 'accepted' && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button onClick={() => void onComplete(r.id)} className="inline-flex items-center gap-1 px-4 py-2 bg-kerala-700 hover:bg-kerala-800 text-white rounded text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" /> Mark consultation completed
          </button>
        </div>
      )}
    </article>
  )
}

// ─── Compose form ────────────────────────────────────────────────────────
type DoctorSearchHit = { id: string; name: string; specialization: string; district: string; ccimVerified: boolean }

function ComposeForm({ onSent, onCancel }: { onSent: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    toDoctorId: '', patientName: '', patientEmail: '', patientAge: '',
    specialty: '', condition: '', reason: '', urgency: 'routine' as 'routine' | 'soon' | 'urgent',
  })
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<DoctorSearchHit[]>([])
  const [selected, setSelected] = useState<DoctorSearchHit | null>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  // Live doctor search.
  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/doctors?q=${encodeURIComponent(query)}&verified=true&limit=8`, { credentials: 'include' })
        if (res.ok) {
          const data = await res.json() as { doctors: DoctorSearchHit[] }
          setResults(data.doctors ?? [])
        }
      } catch { /* swallow */ }
    }, 250)
    return () => clearTimeout(t)
  }, [query])

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr(null)
    try {
      const res = await fetch('/api/dr/referrals', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          toDoctorId:   form.toDoctorId,
          patientName:  form.patientName.trim(),
          patientEmail: form.patientEmail.trim() || null,
          patientAge:   form.patientAge ? Number(form.patientAge) : null,
          specialty:    form.specialty.trim() || null,
          condition:    form.condition.trim() || null,
          reason:       form.reason.trim(),
          urgency:      form.urgency,
        }),
        credentials: 'include',
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? `HTTP ${res.status}`)
      onSent()
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)) } finally { setBusy(false) }
  }

  return (
    <form onSubmit={submit} className="bg-white border border-gray-100 rounded-card p-5 shadow-card space-y-3">
      <h2 className="font-serif text-lg text-ink">Refer a patient</h2>

      {/* Recipient picker */}
      <div>
        <label className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1 block">Refer to</label>
        {selected ? (
          <div className="flex items-center justify-between gap-2 p-2.5 bg-kerala-50 border border-kerala-100 rounded">
            <div className="text-sm">
              <strong>Dr {selected.name}</strong>
              <span className="text-xs text-gray-600 ml-2">{selected.specialization} · {selected.district}</span>
            </div>
            <button type="button" onClick={() => { setSelected(null); setForm((f) => ({ ...f, toDoctorId: '' })); setQuery('') }} className="text-xs text-rose-600 hover:underline">Change</button>
          </div>
        ) : (
          <div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search doctors by name, specialization, or district…"
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
              required={!selected}
            />
            {results.length > 0 && (
              <ul className="mt-1 border border-gray-200 rounded bg-white shadow-sm max-h-64 overflow-y-auto">
                {results.map((d) => (
                  <li key={d.id}>
                    <button
                      type="button"
                      onClick={() => { setSelected(d); setForm((f) => ({ ...f, toDoctorId: d.id })); setResults([]) }}
                      className="w-full text-left px-3 py-2 hover:bg-kerala-50 text-sm"
                    >
                      <strong>Dr {d.name}</strong>
                      <span className="text-xs text-gray-500 block">{d.specialization} · {d.district}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input required value={form.patientName} onChange={(e) => setForm({ ...form, patientName: e.target.value })} placeholder="Patient name *" className="border border-gray-200 rounded px-3 py-2 text-sm md:col-span-2" />
        <input value={form.patientAge} onChange={(e) => setForm({ ...form, patientAge: e.target.value })} placeholder="Age" type="number" min={0} max={130} className="border border-gray-200 rounded px-3 py-2 text-sm" />
      </div>
      <input value={form.patientEmail} onChange={(e) => setForm({ ...form, patientEmail: e.target.value })} placeholder="Patient email (optional — for direct contact)" type="email" className="w-full border border-gray-200 rounded px-3 py-2 text-sm" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} placeholder="Specialty needed (e.g. panchakarma)" className="border border-gray-200 rounded px-3 py-2 text-sm" />
        <input value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} placeholder="Primary condition (one line)" className="border border-gray-200 rounded px-3 py-2 text-sm" />
      </div>

      <textarea
        required
        rows={4}
        value={form.reason}
        onChange={(e) => setForm({ ...form, reason: e.target.value })}
        placeholder="Reason for referral — clinical context, what you've tried, what you'd like the colleague to evaluate. Min 10 chars."
        className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
      />

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <select value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value as typeof form.urgency })} className="border border-gray-200 rounded px-3 py-2 text-sm">
          <option value="routine">Routine</option>
          <option value="soon">Soon (within a week)</option>
          <option value="urgent">Urgent</option>
        </select>
        <div className="flex gap-2 ml-auto">
          <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-200 text-gray-700 rounded text-xs">Cancel</button>
          <button type="submit" disabled={busy || !form.toDoctorId || form.reason.trim().length < 10} className="inline-flex items-center gap-1 px-5 py-2 bg-kerala-700 hover:bg-kerala-800 disabled:opacity-60 text-white rounded text-xs font-semibold">
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />} Send referral
          </button>
        </div>
      </div>

      {err && (
        <div className="p-3 rounded bg-red-50 border border-red-100 text-sm text-red-800">{err}</div>
      )}
    </form>
  )
}
