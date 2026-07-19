'use client'

import { useEffect, useState } from 'react'
import { adminApi } from '../../../lib/admin-api'
import { EntityFormShell, Field, inputClass } from '../../../components/admin/entity-form-shell'

const DISTRICTS = [
  'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 'Kottayam',
  'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram', 'Kozhikode',
  'Wayanad', 'Kannur', 'Kasaragod',
]
const TYPES = ['doctor', 'therapist', 'pharmacist', 'government', 'clinic', 'teaching']

type Job = {
  id: string
  title: string
  description: string
  type: string
  district: string | null
  salary: string | null
  user?: { name: string | null; email: string }
  createdAt: string
  status?: 'pending' | 'active' | 'closed' | 'rejected'
  featured?: boolean
  urgent?: boolean
  kind?: 'hiring' | 'availability'
  clinic?: string | null
  applicationCount?: number
}

type StatusTab = 'all' | 'pending' | 'active' | 'closed' | 'rejected'

const empty = { title: '', description: '', type: '', district: '', salary: '' }

const STATUS_TONE: Record<string, string> = {
  pending:  'bg-amber-50 text-amber-800',
  active:   'bg-emerald-50 text-emerald-700',
  closed:   'bg-gray-100 text-gray-600',
  rejected: 'bg-rose-50 text-rose-700',
}

// DB status "active" is surfaced to admins as "Approved" — the approval
// queue vocab (spec) doesn't distinguish live-and-approved from just-active.
const TAB_LABEL: Record<StatusTab, string> = {
  pending: 'Pending', active: 'Approved', rejected: 'Rejected', closed: 'Closed', all: 'All',
}
const STATUS_LABEL: Record<string, string> = { active: 'Approved', pending: 'Pending', rejected: 'Rejected', closed: 'Closed' }

export default function JobsAdminPage() {
  const [items, setItems] = useState<Job[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...empty })
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<StatusTab>('pending')
  // Bulk selection — id set of jobs the admin has ticked. Cleared on tab
  // switch/reload so the action bar can't operate on stale ids.
  const [selected, setSelected] = useState<Set<string>>(new Set())
  // Reject modal state — { id, title } while open, null when closed.
  const [rejecting, setRejecting] = useState<{ id: string; title: string } | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [bulkBusy, setBulkBusy] = useState(false)

  async function load() {
    setLoading(true); setError(null); setSelected(new Set())
    try {
      const qs = tab === 'all' ? 'status=all&includeAll=1' : `status=${tab}&includeAll=1`
      const data = await adminApi.get<{ jobs: Job[]; pagination: unknown }>(`/jobs?${qs}&limit=200`)
      setItems(data.jobs)
    } catch (e) { setError(String(e)) } finally { setLoading(false) }
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load() }, [tab])

  async function setStatus(id: string, status: 'active' | 'rejected' | 'closed' | 'pending') {
    try { await adminApi.patch(`/jobs/${id}`, { status }); await load() }
    catch (e) { alert(String(e)) }
  }

  async function approve(id: string) {
    try { await adminApi.patch(`/jobs-portal/admin/jobs/${id}/approve`, {}); await load() }
    catch (e) { alert(String(e)) }
  }
  async function submitReject() {
    if (!rejecting) return
    const reason = rejectReason.trim()
    if (!reason) { alert('Reason required'); return }
    try {
      await adminApi.patch(`/jobs-portal/admin/jobs/${rejecting.id}/reject`, { reason })
      setRejecting(null); setRejectReason(''); await load()
    } catch (e) { alert(String(e)) }
  }
  async function bulkApprove() {
    const ids = [...selected]
    if (!ids.length) return
    if (!confirm(`Approve ${ids.length} job${ids.length === 1 ? '' : 's'}?`)) return
    setBulkBusy(true)
    try {
      await adminApi.patch(`/jobs-portal/admin/jobs/bulk-approve`, { ids })
      await load()
    } catch (e) { alert(String(e)) } finally { setBulkBusy(false) }
  }
  function toggleOne(id: string) {
    setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  function toggleAllVisible() {
    setSelected((s) => {
      const visibleIds = items.map((j) => j.id)
      const allOn = visibleIds.every((id) => s.has(id)) && visibleIds.length > 0
      return allOn ? new Set() : new Set(visibleIds)
    })
  }
  async function toggleFeatured(j: Job) {
    try { await adminApi.patch(`/jobs/${j.id}`, { featured: !j.featured }); await load() }
    catch (e) { alert(String(e)) }
  }

  const stats = {
    total:    items.length,
    pending:  items.filter((j) => j.status === 'pending').length,
    active:   items.filter((j) => j.status === 'active').length,
    apps:     items.reduce((a, j) => a + (j.applicationCount ?? 0), 0),
  }

  function startEdit(j: Job) {
    setEditingId(j.id)
    setForm({ title: j.title, description: j.description, type: j.type, district: j.district ?? '', salary: j.salary ?? '' })
    setShowForm(true)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    try {
      if (editingId) await adminApi.patch(`/jobs/${editingId}`, form)
      else await adminApi.post('/jobs', form)
      setShowForm(false); await load()
    } catch (err) { alert(String(err)) } finally { setSaving(false) }
  }

  async function remove(id: string, title: string) {
    if (!confirm(`Delete job "${title}"?`)) return
    try { await adminApi.del(`/jobs/${id}`); await load() } catch (e) { alert(String(e)) }
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Jobs</h1>
          <p className="text-gray-600 mt-1">{items.length} loaded</p>
        </div>
        {!showForm && (
          <button onClick={() => { setEditingId(null); setForm({ ...empty }); setShowForm(true) }} className="px-4 py-2 bg-kerala-700 text-white rounded text-sm hover:bg-kerala-800">
            + New job
          </button>
        )}
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Total"            value={stats.total} />
        <Stat label="Pending review"   value={stats.pending} tone="amber" />
        <Stat label="Active"           value={stats.active}  tone="kerala" />
        <Stat label="Applications"     value={stats.apps} />
      </div>

      <nav className="inline-flex bg-gray-100 rounded-md p-1 text-sm">
        {(['pending', 'active', 'rejected', 'closed', 'all'] as StatusTab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={'px-3 py-1.5 rounded ' + (tab === t ? 'bg-white shadow-sm font-semibold' : 'text-gray-600')}>
            {TAB_LABEL[t]}
          </button>
        ))}
      </nav>

      {selected.size > 0 && (
        <div className="flex items-center justify-between gap-3 bg-kerala-50 border border-kerala-200 rounded-md px-4 py-2.5 text-sm">
          <span className="text-kerala-800 font-medium">{selected.size} selected</span>
          <div className="flex items-center gap-2">
            <button onClick={bulkApprove} disabled={bulkBusy} className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded text-xs font-semibold">
              {bulkBusy ? 'Approving…' : `Approve ${selected.size}`}
            </button>
            <button onClick={() => setSelected(new Set())} className="px-3 py-1.5 border border-gray-300 hover:bg-white rounded text-xs">Clear</button>
          </div>
        </div>
      )}

      {error && <div className="p-3 rounded bg-red-50 text-red-800 text-sm">{error}</div>}

      {showForm && (
        <EntityFormShell title="job" isEditing={!!editingId} onSubmit={save} onCancel={() => setShowForm(false)} saving={saving}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Title *">
              <input required className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Field>
            <Field label="Type *">
              <select required className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="">— select —</option>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="District">
              <select className={inputClass} value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })}>
                <option value="">— anywhere —</option>
                {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Salary">
              <input className={inputClass} value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} placeholder="₹40,000 - ₹70,000 / month" />
            </Field>
          </div>
          <Field label="Description *">
            <textarea required rows={5} className={inputClass} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
        </EntityFormShell>
      )}

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-3 py-2.5 w-8">
                <input
                  type="checkbox"
                  aria-label="Select all"
                  checked={items.length > 0 && items.every((j) => selected.has(j.id))}
                  onChange={toggleAllVisible}
                />
              </th>
              <th className="px-4 py-2.5">Job title</th>
              <th className="px-4 py-2.5">Posted by</th>
              <th className="px-4 py-2.5">Date</th>
              <th className="px-4 py-2.5">Type</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading && <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Loading…</td></tr>}
            {!loading && items.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No jobs in this queue.</td></tr>
            )}
            {items.map((j) => (
              <tr key={j.id} className={selected.has(j.id) ? 'bg-kerala-50/60' : ''}>
                <td className="px-3 py-2.5">
                  <input
                    type="checkbox"
                    aria-label={`Select ${j.title}`}
                    checked={selected.has(j.id)}
                    onChange={() => toggleOne(j.id)}
                  />
                </td>
                <td className="px-4 py-2.5">
                  <div className="font-medium">{j.title}</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    {j.clinic ?? '—'} {j.featured && <span className="text-amber-700 ml-1">★</span>} {j.urgent && <span className="text-rose-700 ml-1">!</span>}
                  </div>
                </td>
                <td className="px-4 py-2.5 text-xs text-gray-500">{j.user?.email ?? '—'}</td>
                <td className="px-4 py-2.5 text-xs text-gray-500 tabular-nums whitespace-nowrap">
                  {new Date(j.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-4 py-2.5 text-xs text-gray-600">{j.type}</td>
                <td className="px-4 py-2.5">
                  <span className={'inline-block px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold ' + (STATUS_TONE[j.status ?? 'active'] ?? 'bg-gray-100 text-gray-600')}>
                    {STATUS_LABEL[j.status ?? 'active'] ?? (j.status ?? 'active')}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right space-x-2 whitespace-nowrap">
                  {j.status === 'pending' && (
                    <>
                      <button onClick={() => approve(j.id)}                                     className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold">Approve</button>
                      <button onClick={() => setRejecting({ id: j.id, title: j.title })}         className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold">Reject</button>
                    </>
                  )}
                  {j.status === 'rejected' && (
                    <button onClick={() => approve(j.id)}                                        className="text-emerald-700 hover:underline text-xs">Re-approve</button>
                  )}
                  {j.status === 'active' && (
                    <button onClick={() => setStatus(j.id, 'closed')}                            className="text-gray-700 hover:underline text-xs">Close</button>
                  )}
                  <a  href={`/admin/jobs/${j.id}/analytics`}                                     className="text-kerala-700 hover:underline text-xs">Analytics</a>
                  <a  href={`/admin/jobs/${j.id}/applications`}                                  className="text-kerala-700 hover:underline text-xs">Apps</a>
                  <button onClick={() => toggleFeatured(j)}                                     className="text-amber-700 hover:underline text-xs">{j.featured ? 'Unfeature' : 'Feature'}</button>
                  <button onClick={() => startEdit(j)}                                          className="text-kerala-700 hover:underline text-xs">Edit</button>
                  <button onClick={() => remove(j.id, j.title)}                                 className="text-red-600 hover:underline text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rejecting && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => { setRejecting(null); setRejectReason('') }}>
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-ink">Reject job</h2>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">&ldquo;{rejecting.title}&rdquo;</p>
            <label className="block text-[11px] uppercase tracking-wider text-kerala-700 font-semibold mt-4 mb-1">Reason (sent to poster) *</label>
            <textarea
              autoFocus
              rows={4}
              maxLength={500}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="E.g. Duplicate posting / missing salary details / policy violation…"
              className={inputClass}
            />
            <p className="text-[11px] text-gray-500 mt-1">{rejectReason.length}/500 — WhatsApp will be sent to the poster.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => { setRejecting(null); setRejectReason('') }} className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={submitReject} disabled={!rejectReason.trim()} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded text-sm font-semibold">Reject &amp; notify</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: 'amber' | 'kerala' }) {
  const t = tone === 'amber'  ? 'text-amber-700'
          : tone === 'kerala' ? 'text-kerala-700'
          :                      'text-gray-900'
  return (
    <div className="bg-white border border-gray-100 rounded-md p-4">
      <div className={`text-2xl font-serif tabular-nums ${t}`}>{value}</div>
      <div className="text-[11px] uppercase tracking-wider text-gray-500 mt-0.5">{label}</div>
    </div>
  )
}
