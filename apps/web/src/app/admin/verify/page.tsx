'use client'

// Approval / verification queue — rebuilt for Phase 9.
//
// Improvements over the old toggle-only flow:
//   - Status tabs: pending / needs-info / flagged / approved / declined / all
//   - Rich submission context: owner user (email + account age), source / sourceUrl
//     provenance, CCIM/TCMC number, completeness score (0–10), queue age in days
//   - Action set: approve · decline (with reason modal) · request more info
//     (with message modal) · flag · add internal note · reset to pending
//   - Per-record moderation history (notes timeline) visible inline
//   - Aging indicator: red badge after 7 days waiting
//   - Sort: oldest pending first by default (FIFO fairness)

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ShieldCheck, ShieldOff, ShieldAlert, ExternalLink, Search, RefreshCw, Clock, MessageSquarePlus, MailQuestion, X, AlertTriangle, RotateCcw, User as UserIcon } from 'lucide-react'
import { adminApi } from '../../../lib/admin-api'

type Owner = { id: string; email: string; name: string | null; phone: string | null; createdAt: string; role: string }
type Reviewer = { id: string; name: string | null; email: string }
type Note = { at: string; byAdminId: string; byAdminName: string; kind: string; text: string | null }

type Doctor = {
  id: string; name: string; specialization: string; district: string; state: string | null; country: string | null
  qualification: string | null; experienceYears: number | null; contact: string | null
  tcmcNumber: string | null; source: string | null; sourceUrl: string | null; importedAt: string | null
  photoUrl: string | null; bio: string | null; profile: string | null; languages: string[]
  ccimVerified: boolean
  moderationStatus: 'pending' | 'approved' | 'declined' | 'needs-info' | 'flagged'
  moderationReason: string | null
  moderationNotes: Note[] | null
  lastReviewedAt: string | null
  ownedBy: Owner | null
  lastReviewedBy: Reviewer | null
  completeness: number
  createdAt: string
}
type Hospital = {
  id: string; name: string; type: string; district: string; state: string | null; country: string | null
  contact: string | null; address: string | null; profile: string | null
  ayushCertified: boolean; panchakarma: boolean; nabh: boolean
  classification: string | null; source: string | null; sourceUrl: string | null; importedAt: string | null
  ccimVerified: boolean
  moderationStatus: 'pending' | 'approved' | 'declined' | 'needs-info' | 'flagged'
  moderationReason: string | null
  moderationNotes: Note[] | null
  lastReviewedAt: string | null
  ownedBy: Owner | null
  lastReviewedBy: Reviewer | null
  completeness: number
  createdAt: string
}

type Status = 'pending' | 'needs-info' | 'flagged' | 'approved' | 'declined' | 'all'
type Resource = 'doctor' | 'hospital'

const STATUS_TABS: Array<{ id: Status; label: string; tone: string }> = [
  { id: 'pending',    label: 'Pending',    tone: 'bg-amber-100 text-amber-800' },
  { id: 'needs-info', label: 'Needs info', tone: 'bg-blue-100 text-blue-800' },
  { id: 'flagged',    label: 'Flagged',    tone: 'bg-red-100 text-red-800' },
  { id: 'approved',   label: 'Approved',   tone: 'bg-emerald-100 text-emerald-800' },
  { id: 'declined',   label: 'Declined',   tone: 'bg-gray-200 text-gray-700' },
  { id: 'all',        label: 'All',        tone: 'bg-gray-100 text-gray-600' },
]

function daysAgo(iso: string | null | undefined): number {
  if (!iso) return 0
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400_000)
}

type ModalState =
  | { kind: 'closed' }
  | { kind: 'decline' | 'request-info' | 'flag' | 'note'; resource: Resource; id: string; name: string }

export default function VerifyQueuePage() {
  const [resource, setResource] = useState<Resource>('doctor')
  const [status, setStatus]     = useState<Status>('pending')
  const [doctors, setDoctors]   = useState<Doctor[]>([])
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [counts, setCounts]     = useState<{ doctors: { pending: number; needsInfo: number; flagged: number; total: number }; hospitals: { pending: number; needsInfo: number; flagged: number; total: number } } | null>(null)
  const [q, setQ]               = useState('')
  const [loading, setLoading]   = useState(false)
  const [err, setErr]           = useState<string | null>(null)
  const [busyId, setBusyId]     = useState<string | null>(null)
  const [modal, setModal]       = useState<ModalState>({ kind: 'closed' })
  const [modalText, setModalText] = useState('')

  async function load() {
    setLoading(true); setErr(null)
    try {
      if (resource === 'doctor') {
        const params = new URLSearchParams({ status, ...(q ? { q } : {}) })
        const data = await adminApi.get<{ doctors: Doctor[] }>(`/doctors/_admin/queue?${params}`)
        setDoctors(data.doctors ?? [])
      } else {
        const params = new URLSearchParams({ status, ...(q ? { q } : {}) })
        const data = await adminApi.get<{ hospitals: Hospital[] }>(`/hospitals/_admin/queue?${params}`)
        setHospitals(data.hospitals ?? [])
      }
      const c = await adminApi.get<typeof counts>('/hospitals/_admin/queue-counts').catch(() => null)
      if (c) setCounts(c)
    } catch (e) { setErr(String(e)) } finally { setLoading(false) }
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load() }, [resource, status])

  async function act(rec: Resource, id: string, action: 'approve' | 'decline' | 'request-info' | 'flag' | 'note' | 'reset', payload?: { reason?: string; note?: string }) {
    setBusyId(id); setErr(null)
    try {
      await adminApi.post(`/${rec}s/${id}/${action}`, payload ?? {})
      await load()
      setModal({ kind: 'closed' }); setModalText('')
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e))
    } finally { setBusyId(null) }
  }

  function openModal(kind: 'decline' | 'request-info' | 'flag' | 'note', rec: Resource, id: string, name: string) {
    setModalText(''); setModal({ kind, resource: rec, id, name })
  }
  function submitModal() {
    if (modal.kind === 'closed') return
    const text = modalText.trim()
    if (!text) return
    const payload = modal.kind === 'note' ? { note: text } : { reason: text }
    void act(modal.resource, modal.id, modal.kind, payload)
  }

  const queueCount = useMemo(() => resource === 'doctor' ? doctors.length : hospitals.length, [resource, doctors, hospitals])

  return (
    <div className="space-y-5">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Approval Queue</h1>
          <p className="text-sm text-gray-500 mt-1">
            Cross-check against CCIM / AYUSH / Kerala Tourism registers, then approve, decline (with reason), or ask for more info.
            Owner users are auto-promoted to DOCTOR / HOSPITAL on approval. Declines notify the owner with your reason.
          </p>
        </div>
        <button onClick={load} disabled={loading} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-md bg-white hover:bg-gray-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </header>

      {/* Queue counts strip */}
      {counts && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Doctors pending',    value: counts.doctors.pending,    tone: 'bg-amber-50 text-amber-800 border-amber-200' },
            { label: 'Doctors needs-info', value: counts.doctors.needsInfo,  tone: 'bg-blue-50 text-blue-800 border-blue-200' },
            { label: 'Hospitals pending',  value: counts.hospitals.pending,  tone: 'bg-amber-50 text-amber-800 border-amber-200' },
            { label: 'Hospitals needs-info', value: counts.hospitals.needsInfo, tone: 'bg-blue-50 text-blue-800 border-blue-200' },
          ].map((s) => (
            <div key={s.label} className={`p-3 rounded-md border ${s.tone}`}>
              <div className="font-serif text-2xl">{s.value}</div>
              <div className="text-xs">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Resource tabs */}
      <div className="flex items-center gap-1 border-b">
        {(['doctor', 'hospital'] as const).map((r) => (
          <button key={r} onClick={() => setResource(r)}
            className={resource === r
              ? 'px-4 py-2 text-sm font-semibold text-kerala-800 border-b-2 border-kerala-700'
              : 'px-4 py-2 text-sm text-gray-600 hover:text-gray-900'}>
            {r === 'doctor' ? 'Doctors' : 'Hospitals'}
          </button>
        ))}
      </div>

      {/* Status pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {STATUS_TABS.map((t) => (
          <button key={t.id} onClick={() => setStatus(t.id)}
            className={status === t.id
              ? `px-3 py-1 text-xs font-semibold rounded-full ${t.tone} ring-2 ring-kerala-300`
              : `px-3 py-1 text-xs rounded-full ${t.tone} hover:ring-1 hover:ring-gray-300`}>
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); load() }} className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={resource === 'doctor' ? 'Name, specialization, TCMC #, district…' : 'Name, type, district…'}
          className="w-full pl-9 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-kerala-700" />
      </form>

      {err && <div className="p-3 rounded bg-red-50 border border-red-100 text-red-800 text-sm">{err}</div>}

      <p className="text-sm text-gray-500">{queueCount} record{queueCount === 1 ? '' : 's'}</p>

      {/* List */}
      {resource === 'doctor' ? (
        <DoctorList doctors={doctors} loading={loading} busyId={busyId} onAct={(action, d) => {
          if (action === 'approve' || action === 'reset') void act('doctor', d.id, action)
          else openModal(action, 'doctor', d.id, d.name)
        }} />
      ) : (
        <HospitalList hospitals={hospitals} loading={loading} busyId={busyId} onAct={(action, h) => {
          if (action === 'approve' || action === 'reset') void act('hospital', h.id, action)
          else openModal(action, 'hospital', h.id, h.name)
        }} />
      )}

      {/* Modal */}
      {modal.kind !== 'closed' && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-cardXl">
            <div className="flex items-start justify-between mb-3">
              <h2 className="font-serif text-xl text-ink">
                {modal.kind === 'decline'      && `Decline ${modal.resource}`}
                {modal.kind === 'request-info' && `Ask for more info`}
                {modal.kind === 'flag'         && `Flag for second review`}
                {modal.kind === 'note'         && `Add internal note`}
              </h2>
              <button onClick={() => setModal({ kind: 'closed' })} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-3 truncate">For: {modal.name}</p>
            <label className="block mb-3">
              <span className="text-xs font-medium text-gray-700 mb-1 block">
                {modal.kind === 'decline'      && 'Reason for declining (sent to the doctor/hospital owner)'}
                {modal.kind === 'request-info' && 'What information do you need? (sent to the owner)'}
                {modal.kind === 'flag'         && 'Why is this flagged? (internal — for second reviewer)'}
                {modal.kind === 'note'         && 'Internal note (visible only to admins)'}
              </span>
              <textarea
                rows={4}
                value={modalText}
                onChange={(e) => setModalText(e.target.value)}
                placeholder={
                  modal.kind === 'decline'      ? 'e.g. CCIM number not found on the public register. Please update and re-submit.' :
                  modal.kind === 'request-info' ? 'e.g. Please add your CCIM registration number and upload your BAMS degree.' :
                  modal.kind === 'flag'         ? 'e.g. Address mismatch with claimed clinic — needs second review.' :
                                                  'e.g. Spoke to doctor on phone, CCIM number confirmed verbally — awaiting written proof.'
                }
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-kerala-700"
              />
            </label>
            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <button onClick={() => setModal({ kind: 'closed' })} className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded">Cancel</button>
              <button onClick={submitModal} disabled={!modalText.trim() || busyId !== null} className={
                'px-4 py-1.5 text-sm font-semibold text-white rounded disabled:opacity-50 ' +
                (modal.kind === 'decline' ? 'bg-red-600 hover:bg-red-700' :
                 modal.kind === 'flag'    ? 'bg-amber-600 hover:bg-amber-700' :
                                            'bg-kerala-700 hover:bg-kerala-800')
              }>
                {modal.kind === 'decline'      && 'Decline + notify owner'}
                {modal.kind === 'request-info' && 'Request info + notify owner'}
                {modal.kind === 'flag'         && 'Flag for second review'}
                {modal.kind === 'note'         && 'Save note'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── DOCTOR LIST ────────────────────────────────────────────────────────
type DoctorAction = 'approve' | 'decline' | 'request-info' | 'flag' | 'note' | 'reset'
function DoctorList({ doctors, loading, busyId, onAct }: { doctors: Doctor[]; loading: boolean; busyId: string | null; onAct: (a: DoctorAction, d: Doctor) => void }) {
  if (loading && doctors.length === 0) return <p className="text-sm text-gray-500">Loading…</p>
  if (!loading && doctors.length === 0) return <p className="text-sm text-gray-500">Queue clear. 🎉</p>
  return (
    <div className="space-y-3">
      {doctors.map((d) => {
        const ccimSearch = `https://www.google.com/search?q=${encodeURIComponent(`${d.name} ${d.qualification ?? ''} ${d.tcmcNumber ?? ''} CCIM ${d.district}`)}`
        const wait = daysAgo(d.createdAt)
        const aged = wait > 7 && d.moderationStatus === 'pending'
        const reviewedDays = daysAgo(d.lastReviewedAt)
        return (
          <article key={d.id} className={`bg-white border rounded-md shadow-card ${aged ? 'border-red-200 ring-1 ring-red-100' : 'border-gray-100'}`}>
            {/* Header row */}
            <header className="p-4 flex items-start gap-4 flex-wrap border-b border-gray-100">
              <div className="flex-1 min-w-[280px]">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="font-semibold text-gray-900">{d.name}</div>
                  <StatusBadge status={d.moderationStatus} />
                  {aged && <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-red-100 text-red-800 rounded-full font-semibold"><Clock className="w-3 h-3" /> waiting {wait}d</span>}
                </div>
                <div className="text-sm text-gray-700 mt-1">
                  {d.specialization} · {d.district}{d.state && d.state !== d.district ? `, ${d.state}` : ''}{d.country && d.country !== 'IN' ? ` · ${d.country}` : ''}
                  {d.experienceYears != null && <> · {d.experienceYears} yrs</>}
                </div>
                <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-2">
                  {d.qualification
                    ? <span>{d.qualification}</span>
                    : <em className="text-amber-700">no qualification on record</em>}
                  {d.tcmcNumber && <span>· TCMC <span className="font-mono">{d.tcmcNumber}</span></span>}
                  {d.contact && <span>· {d.contact}</span>}
                  {d.languages && d.languages.length > 0 && <span>· {d.languages.join(', ')}</span>}
                </div>
              </div>
              <div className="text-right text-xs space-y-1">
                <CompletenessBadge score={d.completeness} />
                <div className="text-gray-400">Added {wait}d ago</div>
                {d.lastReviewedAt && d.lastReviewedBy && (
                  <div className="text-gray-400">Last reviewed {reviewedDays}d ago by {d.lastReviewedBy.name ?? d.lastReviewedBy.email}</div>
                )}
              </div>
            </header>

            {/* Provenance + owner */}
            <div className="px-4 py-3 grid grid-cols-1 md:grid-cols-2 gap-3 border-b border-gray-100 text-xs">
              <div>
                <p className="uppercase tracking-wider text-[10px] text-gray-400 font-semibold mb-1">Source</p>
                <p className="text-gray-700">
                  {d.source === 'self-register' ? <span className="text-kerala-700 font-semibold">Self-registered</span> :
                   d.source ? <span>Imported from <strong>{d.source}</strong></span> :
                   <em className="text-gray-400">unknown</em>}
                  {d.sourceUrl && <> · <a href={d.sourceUrl} target="_blank" rel="noreferrer" className="text-kerala-700 hover:underline inline-flex items-center gap-0.5">source link <ExternalLink className="w-3 h-3" /></a></>}
                  {d.importedAt && <> · imported {new Date(d.importedAt).toLocaleDateString()}</>}
                </p>
              </div>
              <div>
                <p className="uppercase tracking-wider text-[10px] text-gray-400 font-semibold mb-1">Owner user</p>
                {d.ownedBy ? (
                  <p className="text-gray-700 inline-flex items-center gap-1.5">
                    <UserIcon className="w-3 h-3 text-gray-400" />
                    {d.ownedBy.email}
                    <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-700">{d.ownedBy.role}</span>
                    <span className="text-gray-400">· account {daysAgo(d.ownedBy.createdAt)}d old</span>
                  </p>
                ) : <em className="text-gray-400">no linked user — admin-imported</em>}
              </div>
            </div>

            {/* Current reason */}
            {d.moderationReason && (
              <div className="px-4 py-2 bg-amber-50 border-b border-amber-100 text-xs text-amber-900">
                <strong>Current reason:</strong> {d.moderationReason}
              </div>
            )}

            {/* Notes timeline */}
            {d.moderationNotes && d.moderationNotes.length > 0 && (
              <details className="px-4 py-2 border-b border-gray-100 text-xs">
                <summary className="cursor-pointer text-gray-600 font-semibold">Notes ({d.moderationNotes.length})</summary>
                <ul className="mt-2 space-y-1.5">
                  {d.moderationNotes.slice().reverse().map((n, i) => (
                    <li key={i} className="border-l-2 border-gray-200 pl-3">
                      <div className="text-[10px] text-gray-400">
                        <span className="font-semibold text-gray-600">{n.byAdminName}</span> · {n.kind} · {new Date(n.at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                      {n.text && <p className="text-gray-700 mt-0.5">{n.text}</p>}
                    </li>
                  ))}
                </ul>
              </details>
            )}

            {/* Actions */}
            <footer className="px-4 py-3 flex items-center gap-2 flex-wrap justify-end">
              <a href={ccimSearch} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs border rounded text-gray-700 hover:bg-gray-50">
                <ExternalLink className="w-3 h-3" /> Search CCIM
              </a>
              <Link href={`/doctors/${d.id}`} target="_blank" className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs border rounded text-gray-700 hover:bg-gray-50">
                Public profile
              </Link>
              <button onClick={() => onAct('note', d)} disabled={busyId === d.id} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs border rounded text-gray-700 hover:bg-gray-50">
                <MessageSquarePlus className="w-3 h-3" /> Note
              </button>
              {d.moderationStatus !== 'approved' && (
                <button onClick={() => onAct('approve', d)} disabled={busyId === d.id} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded bg-kerala-700 text-white hover:bg-kerala-800 disabled:opacity-50">
                  <ShieldCheck className="w-3.5 h-3.5" /> Approve
                </button>
              )}
              {d.moderationStatus !== 'needs-info' && d.moderationStatus !== 'approved' && (
                <button onClick={() => onAct('request-info', d)} disabled={busyId === d.id} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded border border-blue-600 text-blue-700 hover:bg-blue-50 disabled:opacity-50">
                  <MailQuestion className="w-3.5 h-3.5" /> Request info
                </button>
              )}
              {d.moderationStatus !== 'flagged' && d.moderationStatus !== 'approved' && (
                <button onClick={() => onAct('flag', d)} disabled={busyId === d.id} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded border border-amber-600 text-amber-700 hover:bg-amber-50 disabled:opacity-50">
                  <AlertTriangle className="w-3.5 h-3.5" /> Flag
                </button>
              )}
              {d.moderationStatus !== 'declined' && (
                <button onClick={() => onAct('decline', d)} disabled={busyId === d.id} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">
                  <ShieldOff className="w-3.5 h-3.5" /> Decline
                </button>
              )}
              {(d.moderationStatus === 'declined' || d.moderationStatus === 'flagged') && (
                <button onClick={() => onAct('reset', d)} disabled={busyId === d.id} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs border rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50">
                  <RotateCcw className="w-3 h-3" /> Reset to pending
                </button>
              )}
            </footer>
          </article>
        )
      })}
    </div>
  )
}

// ─── HOSPITAL LIST ──────────────────────────────────────────────────────
type HospitalAction = 'approve' | 'decline' | 'request-info' | 'flag' | 'note' | 'reset'
function HospitalList({ hospitals, loading, busyId, onAct }: { hospitals: Hospital[]; loading: boolean; busyId: string | null; onAct: (a: HospitalAction, h: Hospital) => void }) {
  if (loading && hospitals.length === 0) return <p className="text-sm text-gray-500">Loading…</p>
  if (!loading && hospitals.length === 0) return <p className="text-sm text-gray-500">Queue clear. 🎉</p>
  return (
    <div className="space-y-3">
      {hospitals.map((h) => {
        const ayushSearch = `https://www.google.com/search?q=${encodeURIComponent(`${h.name} AYUSH certified ${h.district}`)}`
        const wait = daysAgo(h.createdAt)
        const aged = wait > 7 && h.moderationStatus === 'pending'
        return (
          <article key={h.id} className={`bg-white border rounded-md shadow-card ${aged ? 'border-red-200 ring-1 ring-red-100' : 'border-gray-100'}`}>
            <header className="p-4 flex items-start gap-4 flex-wrap border-b border-gray-100">
              <div className="flex-1 min-w-[280px]">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="font-semibold text-gray-900">{h.name}</div>
                  <StatusBadge status={h.moderationStatus} />
                  {aged && <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-red-100 text-red-800 rounded-full font-semibold"><Clock className="w-3 h-3" /> waiting {wait}d</span>}
                </div>
                <div className="text-sm text-gray-700 mt-1">
                  {h.type} · {h.district}{h.state && h.state !== h.district ? `, ${h.state}` : ''}{h.country && h.country !== 'IN' ? ` · ${h.country}` : ''}
                </div>
                <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-2">
                  {h.ayushCertified && <span className="px-1.5 py-0.5 bg-green-50 text-green-700 rounded">AYUSH</span>}
                  {h.panchakarma && <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded">Panchakarma</span>}
                  {h.nabh && <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded">NABH</span>}
                  {h.classification && <span className="px-1.5 py-0.5 bg-amber-50 text-amber-800 rounded">{h.classification}</span>}
                  {h.contact && <span>· {h.contact}</span>}
                </div>
              </div>
              <div className="text-right text-xs space-y-1">
                <CompletenessBadge score={h.completeness} />
                <div className="text-gray-400">Added {wait}d ago</div>
              </div>
            </header>

            <div className="px-4 py-3 grid grid-cols-1 md:grid-cols-2 gap-3 border-b border-gray-100 text-xs">
              <div>
                <p className="uppercase tracking-wider text-[10px] text-gray-400 font-semibold mb-1">Source</p>
                <p className="text-gray-700">
                  {h.source === 'self-register' ? <span className="text-kerala-700 font-semibold">Self-registered</span> :
                   h.source ? <span>Imported from <strong>{h.source}</strong></span> :
                   <em className="text-gray-400">unknown</em>}
                  {h.sourceUrl && <> · <a href={h.sourceUrl} target="_blank" rel="noreferrer" className="text-kerala-700 hover:underline inline-flex items-center gap-0.5">source link <ExternalLink className="w-3 h-3" /></a></>}
                </p>
              </div>
              <div>
                <p className="uppercase tracking-wider text-[10px] text-gray-400 font-semibold mb-1">Owner user</p>
                {h.ownedBy ? (
                  <p className="text-gray-700 inline-flex items-center gap-1.5">
                    <UserIcon className="w-3 h-3 text-gray-400" />
                    {h.ownedBy.email}
                    <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-700">{h.ownedBy.role}</span>
                    <span className="text-gray-400">· account {daysAgo(h.ownedBy.createdAt)}d old</span>
                  </p>
                ) : <em className="text-gray-400">no linked user — admin-imported</em>}
              </div>
            </div>

            {h.moderationReason && (
              <div className="px-4 py-2 bg-amber-50 border-b border-amber-100 text-xs text-amber-900">
                <strong>Current reason:</strong> {h.moderationReason}
              </div>
            )}

            {h.moderationNotes && h.moderationNotes.length > 0 && (
              <details className="px-4 py-2 border-b border-gray-100 text-xs">
                <summary className="cursor-pointer text-gray-600 font-semibold">Notes ({h.moderationNotes.length})</summary>
                <ul className="mt-2 space-y-1.5">
                  {h.moderationNotes.slice().reverse().map((n, i) => (
                    <li key={i} className="border-l-2 border-gray-200 pl-3">
                      <div className="text-[10px] text-gray-400">
                        <span className="font-semibold text-gray-600">{n.byAdminName}</span> · {n.kind} · {new Date(n.at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                      {n.text && <p className="text-gray-700 mt-0.5">{n.text}</p>}
                    </li>
                  ))}
                </ul>
              </details>
            )}

            <footer className="px-4 py-3 flex items-center gap-2 flex-wrap justify-end">
              <a href={ayushSearch} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs border rounded text-gray-700 hover:bg-gray-50">
                <ExternalLink className="w-3 h-3" /> Search AYUSH
              </a>
              <Link href={`/hospitals/${h.id}`} target="_blank" className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs border rounded text-gray-700 hover:bg-gray-50">
                Public profile
              </Link>
              <button onClick={() => onAct('note', h)} disabled={busyId === h.id} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs border rounded text-gray-700 hover:bg-gray-50">
                <MessageSquarePlus className="w-3 h-3" /> Note
              </button>
              {h.moderationStatus !== 'approved' && (
                <button onClick={() => onAct('approve', h)} disabled={busyId === h.id} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded bg-kerala-700 text-white hover:bg-kerala-800 disabled:opacity-50">
                  <ShieldCheck className="w-3.5 h-3.5" /> Approve
                </button>
              )}
              {h.moderationStatus !== 'needs-info' && h.moderationStatus !== 'approved' && (
                <button onClick={() => onAct('request-info', h)} disabled={busyId === h.id} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded border border-blue-600 text-blue-700 hover:bg-blue-50 disabled:opacity-50">
                  <MailQuestion className="w-3.5 h-3.5" /> Request info
                </button>
              )}
              {h.moderationStatus !== 'flagged' && h.moderationStatus !== 'approved' && (
                <button onClick={() => onAct('flag', h)} disabled={busyId === h.id} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded border border-amber-600 text-amber-700 hover:bg-amber-50 disabled:opacity-50">
                  <AlertTriangle className="w-3.5 h-3.5" /> Flag
                </button>
              )}
              {h.moderationStatus !== 'declined' && (
                <button onClick={() => onAct('decline', h)} disabled={busyId === h.id} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">
                  <ShieldOff className="w-3.5 h-3.5" /> Decline
                </button>
              )}
              {(h.moderationStatus === 'declined' || h.moderationStatus === 'flagged') && (
                <button onClick={() => onAct('reset', h)} disabled={busyId === h.id} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs border rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50">
                  <RotateCcw className="w-3 h-3" /> Reset to pending
                </button>
              )}
            </footer>
          </article>
        )
      })}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending:      'bg-amber-100 text-amber-800',
    approved:     'bg-emerald-100 text-emerald-800',
    declined:     'bg-red-100 text-red-800',
    'needs-info': 'bg-blue-100 text-blue-800',
    flagged:      'bg-rose-100 text-rose-800',
  }
  const label = status === 'needs-info' ? 'NEEDS INFO' : status.toUpperCase()
  return <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>{label}</span>
}

function CompletenessBadge({ score }: { score: number }) {
  const tone = score >= 7 ? 'text-emerald-700' : score >= 4 ? 'text-amber-700' : 'text-red-700'
  return (
    <div className={`text-xs ${tone} font-semibold inline-flex items-center gap-1`}>
      <ShieldAlert className="w-3 h-3" />
      Profile {score}/10
    </div>
  )
}
