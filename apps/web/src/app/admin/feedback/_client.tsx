'use client'

import { useMemo, useState } from 'react'
import { Trash2, Save, ChevronRight, Search, Mail, Phone, Globe } from 'lucide-react'

export type FeedbackItem = {
  id: string; name: string; email: string | null; phone: string | null
  category: string; subject: string; message: string; page: string | null
  status: string; adminNotes: string | null; userId: string | null
  isRead: boolean; createdAt: string
}
export type Stats = { total: number; unread: number; new: number; reviewed: number; in_progress: number; resolved: number; dismissed: number }

const STATUSES = ['new', 'reviewed', 'in_progress', 'resolved', 'dismissed'] as const
const CATEGORIES = ['feedback', 'suggestion', 'bug_report', 'feature_request', 'complaint'] as const

const CAT_COLOR: Record<string, string> = {
  feedback:        'bg-kerala-50 text-kerala-800 border-kerala-200',
  suggestion:      'bg-amber-50 text-amber-800 border-amber-200',
  bug_report:      'bg-rose-50 text-rose-800 border-rose-200',
  feature_request: 'bg-blue-50 text-blue-800 border-blue-200',
  complaint:       'bg-purple-50 text-purple-800 border-purple-200',
}
const STATUS_COLOR: Record<string, string> = {
  new:         'bg-amber-50 text-amber-800',
  reviewed:    'bg-blue-50 text-blue-800',
  in_progress: 'bg-purple-50 text-purple-800',
  resolved:    'bg-emerald-50 text-emerald-800',
  dismissed:   'bg-gray-100 text-gray-600',
}

export function FeedbackAdminClient({ initial, stats }: { initial: FeedbackItem[]; stats: Stats }) {
  const [items, setItems] = useState(initial)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [q, setQ] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const visible = useMemo(() => items.filter((i) => {
    if (filterStatus !== 'all' && i.status !== filterStatus) return false
    if (filterCategory !== 'all' && i.category !== filterCategory) return false
    if (q) {
      const s = q.toLowerCase()
      if (!i.name.toLowerCase().includes(s) && !i.subject.toLowerCase().includes(s) && !i.message.toLowerCase().includes(s)) return false
    }
    return true
  }), [items, filterStatus, filterCategory, q])

  async function update(id: string, patch: Partial<FeedbackItem>) {
    const r = await fetch(`/api/feedback/${id}`, { method: 'PATCH', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify(patch) })
    if (r.ok) {
      const u = await r.json() as FeedbackItem
      setItems((x) => x.map((y) => y.id === id ? u : y))
    }
  }
  async function remove(id: string) {
    if (!confirm('Delete this feedback?')) return
    await fetch(`/api/feedback/${id}`, { method: 'DELETE', credentials: 'include' })
    setItems((x) => x.filter((y) => y.id !== id))
    setSelected((s) => { const n = new Set(s); n.delete(id); return n })
  }
  async function bulk(action: 'mark-read' | 'change-status' | 'delete', status?: string) {
    if (selected.size === 0) return
    if (action === 'delete' && !confirm(`Delete ${selected.size} feedback items?`)) return
    const r = await fetch('/api/feedback/bulk', {
      method: 'POST', credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ids: Array.from(selected), action, status }),
    })
    if (r.ok) {
      if (action === 'delete') setItems((x) => x.filter((y) => !selected.has(y.id)))
      else if (action === 'mark-read') setItems((x) => x.map((y) => selected.has(y.id) ? { ...y, isRead: true } : y))
      else if (action === 'change-status' && status) setItems((x) => x.map((y) => selected.has(y.id) ? { ...y, status } : y))
      setSelected(new Set())
    }
  }
  function toggleSel(id: string) { setSelected((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n }) }

  return (
    <div className="space-y-4">
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        <Stat label="Total"        value={stats.total} />
        <Stat label="Unread"       value={stats.unread} accent />
        <Stat label="In progress"  value={stats.in_progress} />
        <Stat label="Resolved"     value={stats.resolved} />
      </section>

      <article className="bg-white border border-gray-100 rounded-card p-3 shadow-card flex flex-wrap items-center gap-2">
        <nav className="inline-flex bg-gray-100 rounded-md p-0.5 text-xs">
          {['all', ...STATUSES].map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)} className={'px-2.5 py-1 rounded ' + (filterStatus === s ? 'bg-white shadow-sm font-semibold' : 'text-gray-600')}>{s.replace(/_/g, ' ')}</button>
          ))}
        </nav>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="text-xs border border-gray-200 rounded px-2 py-1">
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
        </select>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, subject, message…" className="w-full pl-7 pr-2 py-1 text-xs border border-gray-200 rounded" />
        </div>
      </article>

      {selected.size > 0 && (
        <article className="bg-kerala-50 border border-kerala-200 rounded-card p-3 flex items-center gap-2 text-sm">
          <strong>{selected.size}</strong> selected
          <button onClick={() => bulk('mark-read')} className="text-xs px-2.5 py-1 bg-white border border-gray-200 rounded hover:bg-gray-50">Mark read</button>
          <select onChange={(e) => { if (e.target.value) bulk('change-status', e.target.value); e.currentTarget.value = '' }} className="text-xs border border-gray-200 rounded px-2 py-1">
            <option value="">Change status…</option>
            {STATUSES.map((s) => <option key={s} value={s}>→ {s.replace(/_/g, ' ')}</option>)}
          </select>
          <button onClick={() => bulk('delete')} className="text-xs px-2.5 py-1 border border-red-200 text-red-700 hover:bg-red-50 rounded">Delete</button>
          <button onClick={() => setSelected(new Set())} className="text-xs text-gray-500 hover:underline ml-auto">Clear</button>
        </article>
      )}

      <ul className="space-y-2">
        {visible.length === 0 && <li className="text-sm text-gray-500 bg-white border border-gray-100 rounded-card p-8 text-center">No feedback matches these filters.</li>}
        {visible.map((it) => {
          const open = openId === it.id
          return (
            <li key={it.id} className={'bg-white border rounded-card shadow-card overflow-hidden ' + (it.isRead ? 'border-gray-100' : 'border-amber-200 ring-1 ring-amber-100')}>
              <button onClick={() => { setOpenId(open ? null : it.id); if (!it.isRead) void update(it.id, { isRead: true }) }} className="w-full text-left px-4 py-3 hover:bg-cream flex items-center gap-3">
                <input type="checkbox" checked={selected.has(it.id)} onClick={(e) => e.stopPropagation()} onChange={() => toggleSel(it.id)} className="w-4 h-4" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={'text-[10px] px-1.5 py-0.5 border rounded ' + (CAT_COLOR[it.category] ?? '')}>{it.category.replace(/_/g, ' ')}</span>
                    <span className={'text-[10px] px-1.5 py-0.5 rounded ' + (STATUS_COLOR[it.status] ?? 'bg-gray-100')}>{it.status.replace(/_/g, ' ')}</span>
                    {!it.isRead && <span className="text-[10px] px-1.5 py-0.5 bg-amber-300 text-amber-900 rounded font-bold">NEW</span>}
                  </div>
                  <p className="font-semibold text-ink text-sm mt-0.5 truncate">{it.subject}</p>
                  <p className="text-[11px] text-gray-600 truncate">{it.name} · {new Date(it.createdAt).toLocaleString('en-GB')}</p>
                </div>
                <ChevronRight className={'w-4 h-4 text-gray-400 transition-transform ' + (open ? 'rotate-90' : '')} />
              </button>
              {open && (
                <div className="px-4 py-3 border-t border-gray-100 bg-cream/30 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                    {it.email && <p className="inline-flex items-center gap-1 text-gray-700"><Mail className="w-3 h-3" /> {it.email}</p>}
                    {it.phone && <p className="inline-flex items-center gap-1 text-gray-700"><Phone className="w-3 h-3" /> {it.phone}</p>}
                    {it.page && <p className="inline-flex items-center gap-1 text-gray-700 truncate"><Globe className="w-3 h-3" /> from: {it.page}</p>}
                  </div>
                  <div className="bg-white border border-gray-100 rounded p-3 text-sm whitespace-pre-line text-gray-800">{it.message}</div>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="text-xs">
                      Status:
                      <select value={it.status} onChange={(e) => update(it.id, { status: e.target.value })} className="ml-1 text-xs border border-gray-200 rounded px-1.5 py-0.5">
                        {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                      </select>
                    </label>
                    <button onClick={() => remove(it.id)} className="text-xs px-2 py-0.5 border border-red-200 text-red-700 hover:bg-red-50 rounded inline-flex items-center gap-1"><Trash2 className="w-3 h-3" /> Delete</button>
                  </div>
                  <AdminNotes id={it.id} initial={it.adminNotes ?? ''} onSave={(notes) => update(it.id, { adminNotes: notes })} />
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function Stat({ label, value, accent = false }: { label: string; value: number; accent?: boolean }) {
  return (
    <article className={'rounded-card p-4 border shadow-card ' + (accent ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100')}>
      <p className="text-[10px] uppercase tracking-wider text-gray-600">{label}</p>
      <p className="text-2xl font-bold text-ink">{value}</p>
    </article>
  )
}

function AdminNotes({ id, initial, onSave }: { id: string; initial: string; onSave: (notes: string) => void }) {
  const [notes, setNotes] = useState(initial)
  const [saved, setSaved] = useState(false)
  function save() { onSave(notes); setSaved(true); window.setTimeout(() => setSaved(false), 1500) }
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">Admin notes (internal)</label>
      <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full border border-gray-200 rounded p-2 text-sm" />
      <button onClick={save} className="mt-1 inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-kerala-700 text-white rounded"><Save className="w-3 h-3" /> {saved ? 'Saved' : 'Save notes'}</button>
    </div>
  )
}
