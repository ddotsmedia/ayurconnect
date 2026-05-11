'use client'

import { useEffect, useState } from 'react'
import { adminApi } from '../../../lib/admin-api'

type Lead = {
  id: string
  kind: string
  name: string
  email: string
  phone: string | null
  country: string | null
  subject: string | null
  message: string
  meta: Record<string, unknown> | null
  status: 'new' | 'contacted' | 'closed' | 'spam'
  createdAt: string
  updatedAt: string
}

type LeadsResponse = {
  items: Lead[]
  total: number
  page: number
  limit: number
  summary: {
    byKind:   Record<string, number>
    byStatus: Record<string, number>
  }
}

const KIND_LABELS: Record<string, string> = {
  cost_estimator: 'Cost estimator',
  contact:        'Contact form',
  partnership:    'Partnership',
  franchise:      'Franchise',
}

const STATUS_COLORS: Record<Lead['status'], string> = {
  new:        'bg-blue-50 text-blue-700 border-blue-200',
  contacted:  'bg-amber-50 text-amber-700 border-amber-200',
  closed:     'bg-green-50 text-green-700 border-green-200',
  spam:       'bg-gray-100 text-gray-500 border-gray-200',
}

export default function LeadsAdminPage() {
  const [data, setData] = useState<LeadsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [kindFilter, setKindFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState<Lead | null>(null)

  async function load() {
    setLoading(true); setError(null)
    try {
      const params = new URLSearchParams()
      if (kindFilter) params.set('kind', kindFilter)
      if (statusFilter) params.set('status', statusFilter)
      if (q) params.set('q', q)
      params.set('limit', '100')
      const resp = await adminApi.get<LeadsResponse>(`/admin/leads?${params.toString()}`)
      setData(resp)
    } catch (e) { setError(String(e)) } finally { setLoading(false) }
  }
  useEffect(() => { load() /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [kindFilter, statusFilter])

  async function updateStatus(id: string, status: Lead['status']) {
    try {
      await adminApi.patch(`/admin/leads/${id}`, { status })
      await load()
      if (selected?.id === id) setSelected({ ...selected, status })
    } catch (e) { alert(String(e)) }
  }
  async function remove(id: string) {
    if (!confirm('Delete this lead? This is permanent.')) return
    try { await adminApi.del(`/admin/leads/${id}`); await load(); if (selected?.id === id) setSelected(null) }
    catch (e) { alert(String(e)) }
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-3xl font-bold">Leads &amp; Enquiries</h1>
        <p className="text-gray-600 mt-1">
          Submissions from /cost-estimator, /contact, and /partnership. {data?.total ?? 0} total.
        </p>
      </header>

      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(data.summary.byStatus).map(([k, v]) => (
            <button
              key={k}
              onClick={() => setStatusFilter(statusFilter === k ? '' : k)}
              className={`p-3 border rounded-md text-left transition-all ${statusFilter === k ? 'border-green-600 bg-green-50' : 'border-gray-200 bg-white hover:border-green-300'}`}
            >
              <div className="text-xs uppercase text-gray-500">{k}</div>
              <div className="text-2xl font-semibold text-gray-800 mt-1">{v}</div>
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <select value={kindFilter} onChange={(e) => setKindFilter(e.target.value)} className="border rounded px-2 py-1.5 text-sm bg-white">
          <option value="">All kinds</option>
          {Object.entries(KIND_LABELS).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
        </select>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') load() }}
          placeholder="Search name/email/subject…"
          className="border rounded px-2 py-1.5 text-sm flex-1 min-w-48"
        />
        <button onClick={load} className="px-3 py-1.5 bg-green-700 text-white rounded text-sm hover:bg-green-800">Search</button>
      </div>

      {error && <div className="p-3 rounded bg-red-50 text-red-800 text-sm">{error}</div>}

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-4 py-2.5">Date</th>
              <th className="px-4 py-2.5">Kind</th>
              <th className="px-4 py-2.5">Name</th>
              <th className="px-4 py-2.5">Email</th>
              <th className="px-4 py-2.5">Country</th>
              <th className="px-4 py-2.5">Subject</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading && <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">Loading…</td></tr>}
            {!loading && data?.items.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">No leads yet.</td></tr>
            )}
            {data?.items.map((l) => (
              <tr key={l.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelected(l)}>
                <td className="px-4 py-2.5 text-xs text-gray-500">{new Date(l.createdAt).toLocaleDateString()}<br/><span className="text-[10px]">{new Date(l.createdAt).toLocaleTimeString()}</span></td>
                <td className="px-4 py-2.5"><span className="text-xs px-2 py-0.5 rounded bg-gray-100">{KIND_LABELS[l.kind] ?? l.kind}</span></td>
                <td className="px-4 py-2.5 font-medium">{l.name}</td>
                <td className="px-4 py-2.5 text-xs text-blue-700">{l.email}</td>
                <td className="px-4 py-2.5 text-xs">{l.country ?? '—'}</td>
                <td className="px-4 py-2.5 text-xs max-w-xs truncate" title={l.subject ?? ''}>{l.subject ?? '—'}</td>
                <td className="px-4 py-2.5"><span className={`text-xs px-2 py-0.5 rounded border ${STATUS_COLORS[l.status]}`}>{l.status}</span></td>
                <td className="px-4 py-2.5 text-right text-xs">
                  <button onClick={(e) => { e.stopPropagation(); setSelected(l) }} className="text-green-700 hover:underline mr-3">Open</button>
                  <button onClick={(e) => { e.stopPropagation(); remove(l.id) }} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <header className="p-5 border-b sticky top-0 bg-white flex items-start justify-between gap-3">
              <div>
                <div className="text-xs text-gray-500">{KIND_LABELS[selected.kind] ?? selected.kind} · {new Date(selected.createdAt).toLocaleString()}</div>
                <h2 className="font-bold text-xl mt-1">{selected.name}</h2>
                <a href={`mailto:${selected.email}`} className="text-sm text-blue-700 hover:underline">{selected.email}</a>
                {selected.phone && <span className="text-sm text-gray-600 ml-3">{selected.phone}</span>}
                {selected.country && <span className="text-sm text-gray-600 ml-3">· {selected.country}</span>}
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
            </header>
            <div className="p-5 space-y-4">
              {selected.subject && (
                <div>
                  <div className="text-xs uppercase text-gray-500 font-semibold mb-1">Subject</div>
                  <p className="text-sm">{selected.subject}</p>
                </div>
              )}
              <div>
                <div className="text-xs uppercase text-gray-500 font-semibold mb-1">Message</div>
                <p className="text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded border">{selected.message}</p>
              </div>
              {selected.meta && Object.keys(selected.meta).length > 0 && (
                <div>
                  <div className="text-xs uppercase text-gray-500 font-semibold mb-1">Metadata</div>
                  <pre className="text-xs bg-gray-50 p-3 rounded border overflow-x-auto">{JSON.stringify(selected.meta, null, 2)}</pre>
                </div>
              )}
              <div>
                <div className="text-xs uppercase text-gray-500 font-semibold mb-2">Status</div>
                <div className="flex gap-2 flex-wrap">
                  {(['new', 'contacted', 'closed', 'spam'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selected.id, s)}
                      className={`px-3 py-1.5 text-sm rounded border ${selected.status === s ? STATUS_COLORS[s] + ' font-semibold' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-3 border-t">
                <a href={`mailto:${selected.email}?subject=Re:%20${encodeURIComponent(selected.subject ?? 'Your AyurConnect enquiry')}`} className="px-4 py-2 bg-green-700 text-white rounded text-sm hover:bg-green-800">
                  Reply by email →
                </a>
                {selected.phone && (
                  <a href={`https://wa.me/${selected.phone.replace(/[^\d]/g, '')}`} target="_blank" rel="noreferrer" className="px-4 py-2 border border-green-700 text-green-700 rounded text-sm hover:bg-green-50">
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
