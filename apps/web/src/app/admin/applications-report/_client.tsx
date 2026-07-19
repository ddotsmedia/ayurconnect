'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Download } from 'lucide-react'

export type Row = {
  id:              string
  appliedAt:       string
  status:          string
  statusUpdatedAt: string | null
  matchScore:      number | null
  rejectionReason: string | null
  notes:           string | null
  updatedBy:       string | null
  job:             { id: string; title: string; type?: string; district?: string | null; clinic?: string | null; status?: string }
  candidate:       { id: string; fullName: string; email: string | null; currentLocation: string | null }
}

const STATUSES  = ['applied', 'viewed', 'shortlisted', 'interview_scheduled', 'offered', 'hired', 'rejected', 'withdrawn']
const TYPES     = ['doctor', 'therapist', 'consultant', 'pharmacist', 'government', 'clinic', 'teaching']

export function ApplicationsReportClient({
  initial,
  active,
}: {
  initial: Row[]
  active: { from: string; to: string; status: string; type: string; district: string; search: string }
}) {
  const router = useRouter()
  const sp     = useSearchParams()

  function setFilter(key: keyof typeof active, value: string) {
    const params = new URLSearchParams(sp.toString())
    if (value) params.set(key, value); else params.delete(key)
    router.push(`/admin/applications-report?${params.toString()}`)
  }

  function exportCsv() {
    const header = ['Application ID','Job ID','Job Title','Job Type','District','Candidate','Email','Location','Status','Applied','Last Update','Match','Notes','Updated By']
    const esc = (v: unknown) => {
      const s = v === null || v === undefined ? '' : String(v)
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
    }
    const lines = [
      header.join(','),
      ...initial.map((r) => [
        r.id, r.job.id, r.job.title, r.job.type, r.job.district, r.candidate.fullName, r.candidate.email, r.candidate.currentLocation,
        r.status, new Date(r.appliedAt).toISOString().slice(0, 10),
        r.statusUpdatedAt ? new Date(r.statusUpdatedAt).toISOString().slice(0, 10) : '',
        r.matchScore, r.notes, r.updatedBy,
      ].map(esc).join(',')),
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `applications-report-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mt-4">
      <div className="bg-white border border-gray-100 rounded-card p-3 mb-4 flex flex-wrap items-center gap-2">
        <span className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold mr-1">Filter:</span>
        <input type="date"   value={active.from}   onChange={(e) => setFilter('from', e.target.value)}   className="text-xs border border-gray-200 rounded px-2 py-1" aria-label="From" />
        <input type="date"   value={active.to}     onChange={(e) => setFilter('to',   e.target.value)}   className="text-xs border border-gray-200 rounded px-2 py-1" aria-label="To" />
        <select value={active.status} onChange={(e) => setFilter('status', e.target.value)} className="text-xs border border-gray-200 rounded px-2 py-1 bg-white">
          <option value="">Status: any</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
        <select value={active.type} onChange={(e) => setFilter('type', e.target.value)} className="text-xs border border-gray-200 rounded px-2 py-1 bg-white">
          <option value="">Type: any</option>
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <input value={active.search} onChange={(e) => setFilter('search', e.target.value)} placeholder="Name or email" className="text-xs border border-gray-200 rounded px-2 py-1 flex-1 min-w-32" />
        <button
          type="button"
          onClick={exportCsv}
          disabled={initial.length === 0}
          className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 bg-kerala-700 hover:bg-kerala-800 disabled:opacity-40 text-white text-xs font-semibold rounded"
        >
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>

      {initial.length === 0 ? (
        <p className="text-sm text-gray-500 italic py-8 text-center">No applications match this filter.</p>
      ) : (
        <div className="overflow-x-auto bg-white border border-gray-100 rounded-card">
          <table className="w-full text-xs">
            <thead className="bg-cream/60 text-left text-gray-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Job</th>
                <th className="p-3">Candidate</th>
                <th className="p-3">Email</th>
                <th className="p-3">Applied</th>
                <th className="p-3">Status</th>
                <th className="p-3">Last update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {initial.map((r) => (
                <tr key={r.id} className="hover:bg-cream/40">
                  <td className="p-3">
                    <Link href={`/admin/jobs/${r.job.id}/applications`} className="font-semibold text-kerala-800 hover:underline">{r.job.title}</Link>
                    <div className="text-[11px] text-gray-500">{r.job.type} · {r.job.district ?? '—'}</div>
                  </td>
                  <td className="p-3 font-medium">{r.candidate.fullName}</td>
                  <td className="p-3 text-gray-700 font-mono">{r.candidate.email ?? '—'}</td>
                  <td className="p-3 text-gray-500 whitespace-nowrap">{new Date(r.appliedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                  <td className="p-3"><span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100">{r.status.replace(/_/g, ' ')}</span></td>
                  <td className="p-3 text-gray-500 whitespace-nowrap">{r.statusUpdatedAt ? new Date(r.statusUpdatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
