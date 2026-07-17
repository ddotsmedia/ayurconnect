'use client'

import { useMemo, useState } from 'react'

export type ConsultationRequest = {
  id: string
  name: string
  phone: string
  email: string | null
  concern: string
  preferredLanguage: string
  preferredTime: string
  country: string | null
  status: 'NEW' | 'CONTACTED' | 'MATCHED' | 'CLOSED'
  adminNotes: string | null
  createdAt: string
  updatedAt: string
}

const STATUSES: ConsultationRequest['status'][] = ['NEW', 'CONTACTED', 'MATCHED', 'CLOSED']

function waLink(phone: string, name: string): string {
  const clean = phone.replace(/[^\d]/g, '')
  const msg = encodeURIComponent(`Hi ${name.split(' ')[0]}, this is AyurConnect regarding your online consultation request.`)
  return `https://wa.me/${clean}?text=${msg}`
}

export function ConsultationRequestsClient({
  initial,
  summary,
}: {
  initial: ConsultationRequest[]
  summary: { byStatus: Record<string, number> }
}) {
  const [items, setItems] = useState<ConsultationRequest[]>(initial)
  const [filter, setFilter] = useState<'ALL' | ConsultationRequest['status']>('ALL')
  const [busyId, setBusyId] = useState<string | null>(null)

  const filtered = useMemo(() =>
    filter === 'ALL' ? items : items.filter((i) => i.status === filter),
  [items, filter])

  async function patchStatus(id: string, status: ConsultationRequest['status']) {
    setBusyId(id)
    try {
      const r = await fetch(`/api/admin/consultation-requests/${id}`, {
        method:  'PATCH',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body:    JSON.stringify({ status }),
      })
      if (r.ok) {
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)))
      }
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="mt-6">
      <div className="flex flex-wrap gap-2 mb-4">
        {(['ALL', ...STATUSES] as const).map((s) => {
          const count = s === 'ALL' ? items.length : (summary.byStatus[s] ?? 0)
          const active = filter === s
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${active ? 'bg-kerala-700 text-white border-kerala-700' : 'bg-white text-gray-700 border-gray-200 hover:border-kerala-300'}`}
            >
              {s} <span className="opacity-70">({count})</span>
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-500 italic py-8 text-center">No requests in this view.</p>
      ) : (
        <div className="overflow-x-auto bg-white border border-gray-100 rounded-card shadow-card">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-[11px] uppercase tracking-wider text-gray-500">
              <tr>
                <th className="p-3">When</th>
                <th className="p-3">Name</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Concern</th>
                <th className="p-3">Lang</th>
                <th className="p-3">Time</th>
                <th className="p-3">Country</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((r) => (
                <tr key={r.id} className="align-top hover:bg-cream/40">
                  <td className="p-3 text-[11px] text-gray-500 whitespace-nowrap">{new Date(r.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}<br />{new Date(r.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="p-3 font-medium text-ink">{r.name}{r.email ? <div className="text-[11px] text-gray-500 font-normal">{r.email}</div> : null}</td>
                  <td className="p-3">
                    <a href={waLink(r.phone, r.name)} target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline text-xs font-mono">
                      {r.phone}
                    </a>
                  </td>
                  <td className="p-3 max-w-xs">
                    <p className="line-clamp-3 text-gray-700 text-xs leading-relaxed" title={r.concern}>{r.concern}</p>
                  </td>
                  <td className="p-3 text-xs text-gray-700 whitespace-nowrap">{r.preferredLanguage}</td>
                  <td className="p-3 text-xs text-gray-700 whitespace-nowrap">{r.preferredTime}</td>
                  <td className="p-3 text-xs text-gray-700">{r.country ?? '—'}</td>
                  <td className="p-3">
                    <select
                      value={r.status}
                      disabled={busyId === r.id}
                      onChange={(e) => patchStatus(r.id, e.target.value as ConsultationRequest['status'])}
                      className="text-xs border border-gray-200 rounded px-2 py-1 bg-white"
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
