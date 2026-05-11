'use client'

import { useEffect, useMemo, useState } from 'react'
import { adminApi } from '../../../lib/admin-api'

type Note = { at: string; by: { id: string; name: string | null; email: string }; text: string; kind: 'note' | 'stage' | 'assignment' | 'follow_up' }
type Admin = { id: string; email: string; name: string | null }
type Stage = 'new' | 'contacted' | 'qualified' | 'quoted' | 'won' | 'lost' | 'spam'

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
  stage: Stage
  status: string
  assignedToId: string | null
  assignedTo: Admin | null
  followUpAt: string | null
  notesJson: Note[] | null
  createdAt: string
  updatedAt: string
}

type LeadsResponse = {
  items: Lead[]
  total: number
  summary: { byKind: Record<string, number>; byStage: Record<string, number> }
}

const STAGES: Array<{ key: Stage; label: string; color: string; badge: string }> = [
  { key: 'new',        label: 'New',         color: 'bg-blue-50',    badge: 'bg-blue-100 text-blue-800' },
  { key: 'contacted',  label: 'Contacted',   color: 'bg-amber-50',   badge: 'bg-amber-100 text-amber-800' },
  { key: 'qualified',  label: 'Qualified',   color: 'bg-purple-50',  badge: 'bg-purple-100 text-purple-800' },
  { key: 'quoted',     label: 'Quoted',      color: 'bg-indigo-50',  badge: 'bg-indigo-100 text-indigo-800' },
  { key: 'won',        label: 'Won',         color: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-800' },
  { key: 'lost',       label: 'Lost',        color: 'bg-gray-100',   badge: 'bg-gray-200 text-gray-700' },
  { key: 'spam',       label: 'Spam',        color: 'bg-gray-50',    badge: 'bg-gray-100 text-gray-500' },
]
const KIND_LABELS: Record<string, string> = {
  cost_estimator:     'Cost est.',
  contact:            'Contact',
  partnership:        'Partnership',
  franchise:          'Franchise',
  marketplace_vendor: 'Vendor',
  academy:            'Academy',
  product_waitlist:   'Waitlist',
}

export default function LeadsKanbanPage() {
  const [data, setData] = useState<LeadsResponse | null>(null)
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [kindFilter, setKindFilter] = useState('')
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState<Lead | null>(null)
  const [view, setView] = useState<'kanban' | 'table'>('kanban')

  async function load() {
    setLoading(true); setError(null)
    try {
      const params = new URLSearchParams()
      if (kindFilter) params.set('kind', kindFilter)
      if (q) params.set('q', q)
      params.set('limit', '500')
      const [resp, adminsResp] = await Promise.all([
        adminApi.get<LeadsResponse>(`/admin/leads?${params.toString()}`),
        admins.length > 0 ? Promise.resolve({ admins }) : adminApi.get<{ admins: Admin[] }>('/admin/leads/_admins'),
      ])
      setData(resp)
      if (adminsResp.admins) setAdmins(adminsResp.admins)
    } catch (e) { setError(String(e)) } finally { setLoading(false) }
  }
  useEffect(() => { load() /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [kindFilter])

  async function patchLead(id: string, patch: Partial<{ stage: Stage; assignedToId: string | null; followUpAt: string | null }>) {
    try {
      const { lead } = await adminApi.patch<{ lead: Lead }>(`/admin/leads/${id}`, patch)
      // Update list in-place
      setData((d) => d ? { ...d, items: d.items.map((x) => x.id === id ? lead : x) } : d)
      if (selected?.id === id) setSelected(lead)
    } catch (e) { alert(String(e)) }
  }
  async function addNote(id: string, text: string) {
    try {
      const { lead } = await adminApi.post<{ lead: Lead }>(`/admin/leads/${id}/notes`, { text })
      setData((d) => d ? { ...d, items: d.items.map((x) => x.id === id ? lead : x) } : d)
      if (selected?.id === id) setSelected(lead)
    } catch (e) { alert(String(e)) }
  }
  async function remove(id: string) {
    if (!confirm('Delete this lead? Permanent.')) return
    try { await adminApi.del(`/admin/leads/${id}`); setSelected(null); await load() }
    catch (e) { alert(String(e)) }
  }

  const groupedByStage = useMemo(() => {
    const g: Record<Stage, Lead[]> = { new: [], contacted: [], qualified: [], quoted: [], won: [], lost: [], spam: [] }
    if (!data) return g
    for (const l of data.items) {
      const s = (g[l.stage] ?? g.new)
      s.push(l)
    }
    return g
  }, [data])

  const overdueCount = useMemo(() => {
    if (!data) return 0
    const now = new Date()
    return data.items.filter((l) => l.followUpAt && new Date(l.followUpAt) < now && !['won', 'lost', 'spam'].includes(l.stage)).length
  }, [data])

  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Leads &amp; CRM</h1>
          <p className="text-gray-600 mt-1">
            Pipeline view of all submissions. {data?.total ?? 0} total.
            {overdueCount > 0 && <span className="ml-2 text-rose-700 font-semibold">{overdueCount} follow-up{overdueCount === 1 ? '' : 's'} overdue.</span>}
          </p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded p-1">
          <button onClick={() => setView('kanban')} className={`px-3 py-1.5 text-sm rounded ${view === 'kanban' ? 'bg-white shadow-sm font-semibold' : 'text-gray-600'}`}>Kanban</button>
          <button onClick={() => setView('table')}  className={`px-3 py-1.5 text-sm rounded ${view === 'table'  ? 'bg-white shadow-sm font-semibold' : 'text-gray-600'}`}>Table</button>
        </div>
      </header>

      {/* Filters */}
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
      {loading && <div className="p-8 text-center text-gray-500">Loading…</div>}

      {/* Kanban */}
      {view === 'kanban' && !loading && data && (
        <div className="overflow-x-auto pb-4">
          <div className="grid grid-cols-7 gap-3 min-w-[1400px]">
            {STAGES.map((s) => {
              const items = groupedByStage[s.key]
              return (
                <div key={s.key} className={`${s.color} rounded-lg border border-gray-200 min-h-64`}>
                  <div className="px-3 py-2 border-b border-gray-200 sticky top-0 bg-inherit flex items-center justify-between">
                    <h3 className="text-xs uppercase tracking-wider font-semibold text-gray-700">{s.label}</h3>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${s.badge}`}>{items.length}</span>
                  </div>
                  <div className="p-2 space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto">
                    {items.map((l) => {
                      const overdue = l.followUpAt && new Date(l.followUpAt) < new Date() && !['won', 'lost', 'spam'].includes(l.stage)
                      return (
                        <button
                          key={l.id}
                          onClick={() => setSelected(l)}
                          className={`w-full text-left p-3 bg-white rounded-md border ${overdue ? 'border-rose-300' : 'border-gray-200'} hover:shadow-md transition-all`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">{KIND_LABELS[l.kind] ?? l.kind}</span>
                            {overdue && <span className="text-[10px] text-rose-700 font-bold">⚠ overdue</span>}
                          </div>
                          <div className="font-medium text-sm mt-1.5 truncate">{l.name}</div>
                          {l.subject && <div className="text-xs text-gray-600 mt-0.5 truncate">{l.subject}</div>}
                          <div className="text-[10px] text-gray-500 mt-1.5 flex items-center justify-between">
                            <span>{new Date(l.createdAt).toLocaleDateString()}</span>
                            {l.assignedTo && <span className="text-green-700">@{(l.assignedTo.name ?? l.assignedTo.email).split('@')[0].slice(0, 8)}</span>}
                          </div>
                        </button>
                      )
                    })}
                    {items.length === 0 && <div className="text-xs text-gray-400 text-center py-4">empty</div>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Table */}
      {view === 'table' && !loading && data && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-2.5">Date</th>
                <th className="px-4 py-2.5">Kind</th>
                <th className="px-4 py-2.5">Name</th>
                <th className="px-4 py-2.5">Stage</th>
                <th className="px-4 py-2.5">Assigned</th>
                <th className="px-4 py-2.5">Follow up</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.items.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No leads.</td></tr>
              )}
              {data.items.map((l) => {
                const stage = STAGES.find((s) => s.key === l.stage)!
                const overdue = l.followUpAt && new Date(l.followUpAt) < new Date()
                return (
                  <tr key={l.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelected(l)}>
                    <td className="px-4 py-2 text-xs text-gray-500">{new Date(l.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-2"><span className="text-xs px-2 py-0.5 rounded bg-gray-100">{KIND_LABELS[l.kind] ?? l.kind}</span></td>
                    <td className="px-4 py-2 font-medium">{l.name}<div className="text-xs text-gray-500">{l.email}</div></td>
                    <td className="px-4 py-2"><span className={`text-xs px-2 py-0.5 rounded ${stage.badge}`}>{stage.label}</span></td>
                    <td className="px-4 py-2 text-xs">{l.assignedTo?.name ?? l.assignedTo?.email ?? '—'}</td>
                    <td className={`px-4 py-2 text-xs ${overdue ? 'text-rose-700 font-semibold' : 'text-gray-600'}`}>{l.followUpAt ? new Date(l.followUpAt).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-2 text-right">
                      <button onClick={(e) => { e.stopPropagation(); remove(l.id) }} className="text-red-600 hover:underline text-xs">Delete</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Drawer */}
      {selected && (
        <LeadDrawer
          lead={selected}
          admins={admins}
          onClose={() => setSelected(null)}
          onPatch={(patch) => patchLead(selected.id, patch)}
          onAddNote={(text) => addNote(selected.id, text)}
          onDelete={() => remove(selected.id)}
        />
      )}
    </div>
  )
}

function LeadDrawer({ lead, admins, onClose, onPatch, onAddNote, onDelete }: {
  lead: Lead
  admins: Admin[]
  onClose: () => void
  onPatch: (p: Partial<{ stage: Stage; assignedToId: string | null; followUpAt: string | null }>) => void
  onAddNote: (text: string) => void
  onDelete: () => void
}) {
  const [noteText, setNoteText] = useState('')
  const stage = STAGES.find((s) => s.key === lead.stage)!
  const notes = (lead.notesJson ?? []).slice().reverse()

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-stretch justify-end" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl h-full overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
        <header className="p-5 border-b sticky top-0 bg-white flex items-start justify-between gap-3 z-10">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className={`px-2 py-0.5 rounded ${stage.badge}`}>{stage.label}</span>
              <span>{KIND_LABELS[lead.kind] ?? lead.kind}</span>
              <span>· {new Date(lead.createdAt).toLocaleString()}</span>
            </div>
            <h2 className="font-bold text-xl mt-1 truncate">{lead.name}</h2>
            <a href={`mailto:${lead.email}`} className="text-sm text-blue-700 hover:underline">{lead.email}</a>
            {lead.phone && <span className="text-sm text-gray-600 ml-3">{lead.phone}</span>}
            {lead.country && <span className="text-sm text-gray-600 ml-3">· {lead.country}</span>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none flex-shrink-0">×</button>
        </header>

        <div className="p-5 space-y-5">
          {/* Stage / Assignment / Follow-up controls */}
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Stage</label>
              <select value={lead.stage} onChange={(e) => onPatch({ stage: e.target.value as Stage })} className="mt-1 w-full border rounded px-2 py-1.5 text-sm bg-white">
                {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Assigned to</label>
              <select value={lead.assignedToId ?? ''} onChange={(e) => onPatch({ assignedToId: e.target.value || null })} className="mt-1 w-full border rounded px-2 py-1.5 text-sm bg-white">
                <option value="">— Unassigned —</option>
                {admins.map((a) => <option key={a.id} value={a.id}>{a.name ?? a.email}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Follow-up</label>
              <input
                type="date"
                value={lead.followUpAt ? lead.followUpAt.slice(0, 10) : ''}
                onChange={(e) => onPatch({ followUpAt: e.target.value || null })}
                className="mt-1 w-full border rounded px-2 py-1.5 text-sm"
              />
            </div>
          </div>

          {/* Submission details */}
          {lead.subject && (
            <div>
              <div className="text-xs uppercase text-gray-500 font-semibold mb-1">Subject</div>
              <p className="text-sm">{lead.subject}</p>
            </div>
          )}
          <div>
            <div className="text-xs uppercase text-gray-500 font-semibold mb-1">Message</div>
            <p className="text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded border">{lead.message}</p>
          </div>
          {lead.meta && Object.keys(lead.meta).length > 0 && (
            <details className="text-sm">
              <summary className="text-xs uppercase text-gray-500 font-semibold cursor-pointer">Metadata</summary>
              <pre className="text-xs bg-gray-50 p-3 rounded border overflow-x-auto mt-2">{JSON.stringify(lead.meta, null, 2)}</pre>
            </details>
          )}

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            <a href={`mailto:${lead.email}?subject=Re:%20${encodeURIComponent(lead.subject ?? 'Your AyurConnect enquiry')}`}
               className="px-4 py-2 bg-green-700 text-white rounded text-sm hover:bg-green-800">
              Reply by email →
            </a>
            {lead.phone && (
              <a href={`https://wa.me/${lead.phone.replace(/[^\d]/g, '')}`} target="_blank" rel="noreferrer"
                 className="px-4 py-2 border border-green-700 text-green-700 rounded text-sm hover:bg-green-50">
                WhatsApp
              </a>
            )}
            <button onClick={onDelete} className="ml-auto px-4 py-2 text-red-600 border border-red-200 rounded text-sm hover:bg-red-50">Delete lead</button>
          </div>

          {/* Notes timeline */}
          <div className="border-t pt-5">
            <h3 className="font-semibold text-sm mb-3">Activity &amp; notes</h3>
            <form
              onSubmit={(e) => { e.preventDefault(); if (noteText.trim()) { onAddNote(noteText.trim()); setNoteText('') } }}
              className="mb-3 flex gap-2"
            >
              <input value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Add a note…" className="flex-1 border rounded px-2 py-1.5 text-sm" />
              <button type="submit" className="px-3 py-1.5 bg-green-700 text-white rounded text-sm hover:bg-green-800">Add</button>
            </form>
            <div className="space-y-2">
              {notes.length === 0 && <p className="text-xs text-gray-500 italic">No activity yet.</p>}
              {notes.map((n, i) => (
                <div key={i} className="text-sm bg-gray-50 p-3 rounded border-l-4 border-l-green-600">
                  <div className="flex items-baseline justify-between gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-gray-700">{n.by.name ?? n.by.email}</span>
                    <span className="text-[10px] text-gray-500">{new Date(n.at).toLocaleString()}</span>
                  </div>
                  <p className="text-gray-800">{n.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
