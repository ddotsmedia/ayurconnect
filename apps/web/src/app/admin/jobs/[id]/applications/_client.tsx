'use client'

import { useState } from 'react'
import { CheckSquare, Square, MessageCircle, Mail, FileText } from 'lucide-react'

export type ApplicationRow = {
  id:              string
  appliedAt:       string
  status:          string
  statusUpdatedAt: string | null
  matchScore:      number | null
  rejectionReason: string | null
  notes:           string | null
  updatedBy:       string | null
  candidate: {
    id:               string
    fullName:         string
    email:            string | null
    phone:            string | null
    currentLocation:  string | null
    totalExperience:  number | null
    highestQualification: string | null
    specializations:  string[]
    resumeUrl:        string | null
  }
}

const STATUSES = ['applied', 'viewed', 'shortlisted', 'interview_scheduled', 'offered', 'hired', 'rejected', 'withdrawn'] as const

const STATUS_TONE: Record<string, string> = {
  applied:              'bg-amber-50 text-amber-800',
  viewed:               'bg-blue-50 text-blue-800',
  shortlisted:          'bg-emerald-50 text-emerald-800',
  interview_scheduled:  'bg-purple-50 text-purple-800',
  offered:              'bg-cyan-50 text-cyan-800',
  hired:                'bg-kerala-50 text-kerala-700',
  rejected:             'bg-red-50 text-red-800',
  withdrawn:            'bg-gray-50 text-gray-600',
}

export function ApplicationsAdminClient({ jobId, initial }: { jobId: string; initial: ApplicationRow[] }) {
  const [rows, setRows]         = useState<ApplicationRow[]>(initial)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkStatus, setBulkStatus] = useState<string>('shortlisted')
  const [busy, setBusy]         = useState(false)

  function toggle(id: string) {
    setSelected((cur) => { const next = new Set(cur); next.has(id) ? next.delete(id) : next.add(id); return next })
  }
  function toggleAll() {
    setSelected((cur) => cur.size === rows.length ? new Set() : new Set(rows.map((r) => r.id)))
  }

  async function patchOne(id: string, status: string) {
    setBusy(true)
    try {
      const r = await fetch(`/api/jobs-portal/admin/applications/${id}`, {
        method: 'PATCH', credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body:   JSON.stringify({ status }),
      })
      if (r.ok) setRows((cur) => cur.map((row) => row.id === id ? { ...row, status } : row))
    } finally {
      setBusy(false)
    }
  }

  async function bulkPatch() {
    if (!selected.size) return
    setBusy(true)
    try {
      const r = await fetch('/api/jobs-portal/admin/applications/bulk', {
        method: 'PATCH', credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body:   JSON.stringify({ ids: [...selected], status: bulkStatus }),
      })
      if (r.ok) {
        setRows((cur) => cur.map((row) => selected.has(row.id) ? { ...row, status: bulkStatus } : row))
        setSelected(new Set())
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-6">
      {/* Bulk action bar */}
      <div className="bg-white border border-gray-100 rounded-card p-3 mb-3 flex flex-wrap items-center gap-2">
        <button type="button" onClick={toggleAll} className="text-xs text-gray-600 hover:text-kerala-700 inline-flex items-center gap-1">
          {selected.size === rows.length && rows.length > 0 ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
          Select all
        </button>
        <span className="text-[11px] text-gray-500">{selected.size} selected</span>
        <div className="ml-auto flex items-center gap-2">
          <label className="text-xs text-gray-500">Bulk status →</label>
          <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)} className="text-xs border border-gray-200 rounded px-2 py-1 bg-white">
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
          <button
            type="button"
            onClick={bulkPatch}
            disabled={busy || selected.size === 0}
            className="px-3 py-1.5 bg-kerala-700 hover:bg-kerala-800 disabled:opacity-40 text-white text-xs font-semibold rounded"
          >
            Apply to {selected.size || '…'}
          </button>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-gray-500 italic py-8 text-center">No applications yet for this job.</p>
      ) : (
        <div className="overflow-x-auto bg-white border border-gray-100 rounded-card">
          <table className="w-full text-xs">
            <thead className="bg-cream/60 text-left text-gray-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3 w-8"></th>
                <th className="p-3">Candidate</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Applied</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((r) => {
                const waDigits = (r.candidate.phone ?? '').replace(/\D/g, '')
                return (
                  <tr key={r.id} className={selected.has(r.id) ? 'bg-kerala-50/40' : 'hover:bg-cream/40'}>
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selected.has(r.id)}
                        onChange={() => toggle(r.id)}
                        aria-label="Select"
                        className="w-4 h-4 text-kerala-700 rounded"
                      />
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-ink">{r.candidate.fullName}</div>
                      <div className="text-[11px] text-gray-500">
                        {[r.candidate.highestQualification, r.candidate.totalExperience ? `${r.candidate.totalExperience}y` : null, r.candidate.currentLocation].filter(Boolean).join(' · ')}
                      </div>
                    </td>
                    <td className="p-3 space-y-0.5">
                      {r.candidate.email && (
                        <div className="text-[11px]"><a href={`mailto:${r.candidate.email}`} className="text-kerala-700 hover:underline inline-flex items-center gap-1"><Mail className="w-3 h-3" />{r.candidate.email}</a></div>
                      )}
                      {waDigits && (
                        <div className="text-[11px]"><a href={`https://wa.me/${waDigits}`} target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline inline-flex items-center gap-1"><MessageCircle className="w-3 h-3" />{r.candidate.phone}</a></div>
                      )}
                    </td>
                    <td className="p-3 text-gray-500 whitespace-nowrap">{new Date(r.appliedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td className="p-3">
                      <select
                        value={r.status}
                        disabled={busy}
                        onChange={(e) => patchOne(r.id, e.target.value)}
                        className={`text-xs border border-gray-200 rounded px-2 py-1 ${STATUS_TONE[r.status] ?? ''}`}
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                      </select>
                    </td>
                    <td className="p-3">
                      {r.candidate.resumeUrl && (
                        <a href={r.candidate.resumeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-kerala-700 hover:underline text-xs">
                          <FileText className="w-3 h-3" /> Resume
                        </a>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      {jobId && null /* jobId prop is here for future use (e.g. re-fetch) */}
    </div>
  )
}
