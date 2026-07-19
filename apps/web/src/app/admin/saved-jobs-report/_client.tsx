'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Download, Flame } from 'lucide-react'

export type ReportRow = {
  jobId:        string
  title:        string
  type:         string
  district:     string | null
  clinic:       string | null
  status:       string
  salary:       string | null
  createdAt:    string
  savesCount:   number
  uniqueUsers:  number
  applyCount:   number
  highInterest: boolean
}

const TYPES     = ['doctor', 'therapist', 'consultant', 'pharmacist', 'government', 'clinic', 'teaching']
const DISTRICTS = ['Thiruvananthapuram', 'Kollam', 'Alappuzha', 'Kottayam', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram', 'Kozhikode', 'Kannur', 'Kasaragod', 'Dubai', 'Abu Dhabi']

export function SavedJobsReportClient({
  initial,
  active,
}: {
  initial: ReportRow[]
  active:  { from: string; to: string; type: string; district: string }
}) {
  const router = useRouter()
  const sp     = useSearchParams()

  function setFilter(key: keyof typeof active, value: string) {
    const params = new URLSearchParams(sp.toString())
    if (value) params.set(key, value); else params.delete(key)
    router.push(`/admin/saved-jobs-report?${params.toString()}`)
  }

  function exportCsv() {
    const header = ['Job ID','Title','Clinic','Type','District','Status','Salary','Saves','Unique Users','Applies','High Interest','Created']
    const escape = (v: unknown) => {
      const s = v === null || v === undefined ? '' : String(v)
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
    }
    const lines = [
      header.join(','),
      ...initial.map((r) => [
        r.jobId, r.title, r.clinic, r.type, r.district, r.status, r.salary,
        r.savesCount, r.uniqueUsers, r.applyCount, r.highInterest ? 'yes' : 'no',
        new Date(r.createdAt).toISOString().slice(0, 10),
      ].map(escape).join(',')),
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `saved-jobs-report-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mt-4">
      <div className="bg-white border border-gray-100 rounded-card p-3 mb-4 flex flex-wrap items-center gap-2">
        <span className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold mr-1">Filter:</span>
        <input type="date" value={active.from} onChange={(e) => setFilter('from', e.target.value)} className="text-xs border border-gray-200 rounded px-2 py-1" aria-label="From" />
        <input type="date" value={active.to}   onChange={(e) => setFilter('to',   e.target.value)} className="text-xs border border-gray-200 rounded px-2 py-1" aria-label="To" />
        <select value={active.type} onChange={(e) => setFilter('type', e.target.value)} className="text-xs border border-gray-200 rounded px-2 py-1 bg-white">
          <option value="">Type: any</option>
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={active.district} onChange={(e) => setFilter('district', e.target.value)} className="text-xs border border-gray-200 rounded px-2 py-1 bg-white">
          <option value="">District: any</option>
          {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
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
        <p className="text-sm text-gray-500 italic py-8 text-center">No saved jobs match this filter.</p>
      ) : (
        <div className="overflow-x-auto bg-white border border-gray-100 rounded-card">
          <table className="w-full text-xs">
            <thead className="bg-cream/60 text-left text-gray-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Job</th>
                <th className="p-3">Type</th>
                <th className="p-3">District</th>
                <th className="p-3 text-right">Saves</th>
                <th className="p-3 text-right">Users</th>
                <th className="p-3 text-right">Applies</th>
                <th className="p-3">Signals</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {initial.map((r) => (
                <tr key={r.jobId} className="hover:bg-cream/40">
                  <td className="p-3">
                    <Link href={`/admin/jobs/${r.jobId}/analytics`} className="font-semibold text-kerala-800 hover:underline">{r.title}</Link>
                    {r.clinic && <div className="text-[11px] text-gray-500">{r.clinic}</div>}
                  </td>
                  <td className="p-3 text-gray-700">{r.type}</td>
                  <td className="p-3 text-gray-700">{r.district ?? '—'}</td>
                  <td className="p-3 text-right font-semibold text-kerala-700 tabular-nums">{r.savesCount}</td>
                  <td className="p-3 text-right text-gray-700 tabular-nums">{r.uniqueUsers}</td>
                  <td className="p-3 text-right text-gray-700 tabular-nums">{r.applyCount}</td>
                  <td className="p-3">
                    {r.highInterest && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-semibold rounded">
                        <Flame className="w-3 h-3" /> High interest
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-[11px] text-gray-500">{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
