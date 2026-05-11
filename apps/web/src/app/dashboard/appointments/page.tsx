'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Calendar, Clock, MapPin, Video, X, Check, CalendarClock, MessageSquare, Star } from 'lucide-react'

type Appt = {
  id: string
  dateTime: string
  type: string
  status: string
  notes: string | null
  chiefComplaint: string | null
  duration: string | null
  proposedAt: string | null
  declineReason: string | null
  doctor: { id: string; name: string; specialization: string; district: string; photoUrl: string | null } | null
  user:   { id: string; name: string | null; email: string }
}

type Me = {
  user: {
    id: string
    role: string
    doctorId: string | null
  } | null
}

const STATUS_TONE: Record<string, string> = {
  scheduled:             'bg-blue-50 text-blue-800 border-blue-100',
  confirmed:             'bg-kerala-50 text-kerala-800 border-kerala-100',
  'reschedule-proposed': 'bg-amber-50 text-amber-800 border-amber-100',
  completed:             'bg-gray-50 text-gray-700 border-gray-200',
  cancelled:             'bg-red-50 text-red-800 border-red-100',
  declined:              'bg-red-50 text-red-800 border-red-100',
  'no-show':             'bg-amber-50 text-amber-800 border-amber-100',
}

export default function AppointmentsPage() {
  const [items, setItems] = useState<Appt[]>([])
  const [me, setMe] = useState<Me | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming')
  // doctor-only proposal modal state
  const [proposalFor, setProposalFor] = useState<Appt | null>(null)
  const [proposalDate, setProposalDate] = useState('')
  const [proposalTime, setProposalTime] = useState('10:00')
  const [proposalNote, setProposalNote] = useState('')
  const [declineFor, setDeclineFor] = useState<Appt | null>(null)
  const [declineReason, setDeclineReason] = useState('')
  // review prompt (patient)
  const [reviewFor, setReviewFor] = useState<Appt | null>(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewBusy, setReviewBusy] = useState(false)

  const isDoctor = me?.user?.role === 'DOCTOR' && Boolean(me.user.doctorId)

  async function load() {
    setLoading(true); setError(null)
    try {
      const [appts, meResp] = await Promise.all([
        fetch('/api/appointments', { credentials: 'include' }),
        fetch('/api/me', { credentials: 'include' }),
      ])
      if (!appts.ok) throw new Error(`appts ${appts.status}`)
      setItems((await appts.json()) as Appt[])
      if (meResp.ok) setMe((await meResp.json()) as Me)
    } catch (e) { setError(String(e)) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  async function patchAppt(id: string, path: string, body?: unknown) {
    const res = await fetch(`/api/appointments/${id}/${path}`, {
      method: 'PATCH', credentials: 'include',
      headers: body ? { 'content-type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
    })
    if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j.error || `HTTP ${res.status}`) }
    return res.json()
  }

  async function cancel(id: string) {
    if (!confirm('Cancel this appointment?')) return
    try { await patchAppt(id, 'cancel'); await load() } catch (e) { alert(String(e)) }
  }
  async function accept(id: string) {
    try { await patchAppt(id, 'accept'); await load() } catch (e) { alert(String(e)) }
  }
  async function decline() {
    if (!declineFor) return
    try {
      await patchAppt(declineFor.id, 'decline', { reason: declineReason || null })
      setDeclineFor(null); setDeclineReason('')
      await load()
    } catch (e) { alert(String(e)) }
  }
  async function proposeNewTime() {
    if (!proposalFor || !proposalDate) return
    try {
      const proposedAt = new Date(`${proposalDate}T${proposalTime}:00`).toISOString()
      await patchAppt(proposalFor.id, 'propose-new-time', { proposedAt, note: proposalNote || null })
      setProposalFor(null); setProposalDate(''); setProposalNote('')
      await load()
    } catch (e) { alert(String(e)) }
  }
  async function markComplete(id: string) {
    if (!confirm('Mark as completed?')) return
    try { await patchAppt(id, 'complete'); await load() } catch (e) { alert(String(e)) }
  }
  async function submitReview() {
    if (!reviewFor?.doctor) return
    setReviewBusy(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST', credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ doctorId: reviewFor.doctor.id, rating: reviewRating, comment: reviewComment || undefined }),
      })
      if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j.error || `HTTP ${res.status}`) }
      setReviewFor(null); setReviewComment(''); setReviewRating(5)
      alert('Thank you — your review has been posted.')
    } catch (e) { alert(String(e)) } finally { setReviewBusy(false) }
  }

  const now = Date.now()
  const filtered = useMemo(() => items.filter((a) => {
    const isPast = new Date(a.dateTime).getTime() < now
    const isDead = a.status === 'cancelled' || a.status === 'declined'
    if (tab === 'cancelled') return isDead
    if (tab === 'upcoming')  return !isPast && !isDead
    return isPast && !isDead
  }), [items, tab, now])

  const counts = useMemo(() => {
    const upcoming = items.filter((a) => new Date(a.dateTime).getTime() >= now && a.status !== 'cancelled' && a.status !== 'declined').length
    const pending  = items.filter((a) => a.status === 'scheduled' && new Date(a.dateTime).getTime() >= now).length
    return { upcoming, pending }
  }, [items, now])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl text-kerala-700">
          {isDoctor ? 'Patient bookings' : 'Appointments'}
        </h1>
        <p className="text-muted mt-1">
          {isDoctor
            ? `Incoming consultation requests + confirmed visits. ${counts.pending} pending action.`
            : 'Your video and in-person consultations.'}
        </p>
      </header>

      <div className="flex gap-1 bg-gray-100 p-0.5 rounded w-fit">
        {(['upcoming', 'past', 'cancelled'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={
              tab === t
                ? 'px-4 py-1.5 bg-white shadow text-sm font-medium rounded capitalize'
                : 'px-4 py-1.5 text-sm text-gray-600 hover:text-gray-800 rounded capitalize'
            }
          >
            {t}{t === 'upcoming' && counts.upcoming > 0 ? ` (${counts.upcoming})` : ''}
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
          {tab === 'upcoming' && !isDoctor && (
            <Link href="/doctors" className="inline-block mt-3 px-4 py-2 bg-kerala-600 text-white rounded-md text-sm font-semibold hover:bg-kerala-700">
              Book a consultation →
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => {
            const dt = new Date(a.dateTime)
            const isPast = dt.getTime() < now
            const isVideo = a.type.includes('video')
            const isPending = a.status === 'scheduled'
            const isProposed = a.status === 'reschedule-proposed'
            const isConfirmed = a.status === 'confirmed'
            const isCompleted = a.status === 'completed'
            const videoUrl = a.notes?.match(/Video room: (https?:\/\/\S+)/)?.[1]
            return (
              <article key={a.id} className="bg-white rounded-card border border-gray-100 shadow-card p-5">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div className="flex-1 min-w-0">
                    {isDoctor ? (
                      <div>
                        <div className="font-semibold text-ink">{a.user.name ?? a.user.email}</div>
                        <p className="text-xs text-muted">{a.user.email}</p>
                      </div>
                    ) : (
                      <>
                        <Link href={a.doctor ? `/doctors/${a.doctor.id}` : '#'} className="font-semibold text-ink hover:text-kerala-700">
                          {a.doctor?.name ?? 'Doctor'}
                        </Link>
                        <p className="text-xs text-muted">{a.doctor?.specialization}{a.doctor?.district ? ` · ${a.doctor.district}` : ''}</p>
                      </>
                    )}
                    <div className="mt-2 flex items-center gap-3 text-sm text-gray-700 flex-wrap">
                      <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-gray-400" /> {dt.toLocaleString()}</span>
                      <span className="flex items-center gap-1.5">
                        {isVideo ? <Video className="w-3.5 h-3.5 text-gray-400" /> : <MapPin className="w-3.5 h-3.5 text-gray-400" />}
                        {a.type.replace(/-/g, ' ')}
                      </span>
                      <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${STATUS_TONE[a.status] ?? 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                        {a.status}
                      </span>
                    </div>
                    {a.chiefComplaint && (
                      <p className="text-xs text-gray-600 mt-2"><strong>Chief complaint:</strong> {a.chiefComplaint}</p>
                    )}
                    {isProposed && a.proposedAt && (
                      <div className="mt-2 p-3 rounded bg-amber-50 border border-amber-100 text-xs text-amber-900">
                        <strong>New time proposed:</strong> {new Date(a.proposedAt).toLocaleString()}
                        {a.declineReason && <div className="mt-1">Note: {a.declineReason}</div>}
                        {!isDoctor && (
                          <p className="mt-2 text-amber-700">Accept by re-booking at the new time, or contact the doctor.</p>
                        )}
                      </div>
                    )}
                    {a.status === 'declined' && a.declineReason && (
                      <p className="mt-2 text-xs text-red-700"><strong>Decline reason:</strong> {a.declineReason}</p>
                    )}
                    {isVideo && (isConfirmed || isPending) && !isPast && (
                      <Link href={`/consult/${a.id}`} className="mt-3 inline-flex items-center gap-1 text-xs text-kerala-700 hover:underline font-semibold">
                        <Video className="w-3 h-3" /> Open consultation room →
                      </Link>
                    )}
                    {isPast && (isConfirmed || isCompleted) && (
                      <Link href={`/consult/${a.id}`} className="mt-3 inline-flex items-center gap-1 text-xs text-kerala-700 hover:underline">
                        <Video className="w-3 h-3" /> View consultation summary →
                      </Link>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col gap-1.5 items-end shrink-0">
                    {isDoctor && isPending && !isPast && (
                      <>
                        <button onClick={() => accept(a.id)} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 bg-kerala-600 text-white rounded hover:bg-kerala-700">
                          <Check className="w-3 h-3" /> Accept
                        </button>
                        <button onClick={() => { setProposalFor(a); setProposalDate(dt.toISOString().slice(0, 10)) }} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 border border-amber-300 text-amber-800 rounded hover:bg-amber-50">
                          <CalendarClock className="w-3 h-3" /> Propose new time
                        </button>
                        <button onClick={() => setDeclineFor(a)} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 border border-red-300 text-red-700 rounded hover:bg-red-50">
                          <X className="w-3 h-3" /> Decline
                        </button>
                      </>
                    )}
                    {isDoctor && (isConfirmed || (isPast && isPending)) && !isCompleted && (
                      <button onClick={() => markComplete(a.id)} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 bg-kerala-600 text-white rounded hover:bg-kerala-700">
                        <Check className="w-3 h-3" /> Mark completed
                      </button>
                    )}
                    {!isDoctor && (isPending || isConfirmed) && !isPast && (
                      <button onClick={() => cancel(a.id)} className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-800">
                        <X className="w-3 h-3" /> Cancel
                      </button>
                    )}
                    {!isDoctor && isPast && a.doctor && (isConfirmed || isCompleted) && (
                      <button onClick={() => setReviewFor(a)} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 border border-gold-400 text-gold-700 rounded hover:bg-gold-50">
                        <Star className="w-3 h-3" /> Leave review
                      </button>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {/* DOCTOR: Propose-new-time modal */}
      {proposalFor && (
        <Modal onClose={() => setProposalFor(null)} title={`Propose new time for ${proposalFor.user.name ?? proposalFor.user.email}`}>
          <p className="text-xs text-muted mb-3">Original: {new Date(proposalFor.dateTime).toLocaleString()}</p>
          <label className="block text-xs font-medium text-gray-700 mb-1">New date</label>
          <input type="date" value={proposalDate} onChange={(e) => setProposalDate(e.target.value)} className="w-full border rounded px-3 py-2 text-sm mb-3" />
          <label className="block text-xs font-medium text-gray-700 mb-1">Time</label>
          <input type="time" value={proposalTime} onChange={(e) => setProposalTime(e.target.value)} className="w-full border rounded px-3 py-2 text-sm mb-3" />
          <label className="block text-xs font-medium text-gray-700 mb-1">Note (optional)</label>
          <textarea rows={2} value={proposalNote} onChange={(e) => setProposalNote(e.target.value)} placeholder="e.g. I'm at a conference that day…" className="w-full border rounded px-3 py-2 text-sm mb-3" />
          <div className="flex gap-2 pt-2">
            <button onClick={() => setProposalFor(null)} className="flex-1 px-4 py-2 border rounded text-sm">Cancel</button>
            <button onClick={proposeNewTime} disabled={!proposalDate} className="flex-1 px-4 py-2 bg-amber-600 text-white rounded text-sm disabled:opacity-50">Send to patient</button>
          </div>
        </Modal>
      )}

      {/* DOCTOR: Decline modal */}
      {declineFor && (
        <Modal onClose={() => setDeclineFor(null)} title={`Decline booking from ${declineFor.user.name ?? declineFor.user.email}`}>
          <p className="text-sm text-muted mb-3">The patient will be notified. Adding a reason helps them book a more suitable slot or doctor.</p>
          <label className="block text-xs font-medium text-gray-700 mb-1">Reason (optional, visible to patient)</label>
          <textarea rows={3} value={declineReason} onChange={(e) => setDeclineReason(e.target.value)} placeholder="e.g. I don't take new patients this month. Please try Dr. X or rebook in June." className="w-full border rounded px-3 py-2 text-sm mb-3" />
          <div className="flex gap-2 pt-2">
            <button onClick={() => { setDeclineFor(null); setDeclineReason('') }} className="flex-1 px-4 py-2 border rounded text-sm">Back</button>
            <button onClick={decline} className="flex-1 px-4 py-2 bg-red-600 text-white rounded text-sm">Decline booking</button>
          </div>
        </Modal>
      )}

      {/* PATIENT: Review modal */}
      {reviewFor && reviewFor.doctor && (
        <Modal onClose={() => setReviewFor(null)} title={`How was your consultation with ${reviewFor.doctor.name}?`}>
          <div className="flex items-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setReviewRating(n)} aria-label={`${n} stars`} className="p-1">
                <Star className={`w-7 h-7 ${n <= reviewRating ? 'fill-gold-400 text-gold-400' : 'text-gray-300'}`} />
              </button>
            ))}
            <span className="text-sm text-muted ml-2">{reviewRating}/5</span>
          </div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Comment (optional)</label>
          <textarea rows={4} value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="Honest feedback helps other patients. Examples: bedside manner, how thorough the diagnosis was, results so far…" className="w-full border rounded px-3 py-2 text-sm mb-3" maxLength={2000} />
          <p className="text-[11px] text-muted mb-3 flex gap-1.5"><MessageSquare className="w-3 h-3 mt-0.5" /> AI moderation checks reviews before publishing — abusive or medical-fraud comments are blocked.</p>
          <div className="flex gap-2 pt-2">
            <button onClick={() => setReviewFor(null)} className="flex-1 px-4 py-2 border rounded text-sm">Cancel</button>
            <button onClick={submitReview} disabled={reviewBusy} className="flex-1 px-4 py-2 bg-kerala-600 text-white rounded text-sm disabled:opacity-50">
              {reviewBusy ? 'Posting…' : 'Post review'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-card shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <header className="p-4 border-b flex items-start justify-between gap-3">
          <h2 className="font-serif text-lg text-kerala-700">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
        </header>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
