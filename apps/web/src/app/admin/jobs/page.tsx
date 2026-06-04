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

export default function JobsAdminPage() {
  const [items, setItems] = useState<Job[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...empty })
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<StatusTab>('all')

  async function load() {
    setLoading(true); setError(null)
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
        {(['all', 'pending', 'active', 'closed', 'rejected'] as StatusTab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={'px-3 py-1.5 rounded capitalize ' + (tab === t ? 'bg-white shadow-sm font-semibold' : 'text-gray-600')}>
            {t}
          </button>
        ))}
      </nav>

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
              <th className="px-4 py-2.5">Title</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5">Type</th>
              <th className="px-4 py-2.5">Apps</th>
              <th className="px-4 py-2.5">Posted by</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Loading…</td></tr>}
            {!loading && items.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No jobs yet.</td></tr>
            )}
            {items.map((j) => (
              <tr key={j.id}>
                <td className="px-4 py-2.5">
                  <div className="font-medium">{j.title}</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    {j.clinic ?? '—'} {j.featured && <span className="text-amber-700 ml-1">★</span>} {j.urgent && <span className="text-rose-700 ml-1">!</span>}
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  <span className={'inline-block px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold ' + (STATUS_TONE[j.status ?? 'active'] ?? 'bg-gray-100 text-gray-600')}>
                    {j.status ?? 'active'}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-xs text-gray-600">{j.type}</td>
                <td className="px-4 py-2.5 text-xs tabular-nums text-gray-700">{j.applicationCount ?? 0}</td>
                <td className="px-4 py-2.5 text-xs text-gray-500">{j.user?.email ?? '—'}</td>
                <td className="px-4 py-2.5 text-right space-x-2 whitespace-nowrap">
                  {j.status === 'pending' && (
                    <>
                      <button onClick={() => setStatus(j.id, 'active')}    className="text-emerald-700 hover:underline text-xs">Approve</button>
                      <button onClick={() => setStatus(j.id, 'rejected')}  className="text-rose-600 hover:underline text-xs">Reject</button>
                    </>
                  )}
                  {j.status === 'active' && (
                    <button onClick={() => setStatus(j.id, 'closed')}     className="text-gray-700 hover:underline text-xs">Close</button>
                  )}
                  <button onClick={() => toggleFeatured(j)}                className="text-amber-700 hover:underline text-xs">{j.featured ? 'Unfeature' : 'Feature'}</button>
                  <button onClick={() => startEdit(j)}                    className="text-kerala-700 hover:underline text-xs">Edit</button>
                  <button onClick={() => remove(j.id, j.title)}           className="text-red-600 hover:underline text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
