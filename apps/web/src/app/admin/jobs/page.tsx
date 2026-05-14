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
}

const empty = { title: '', description: '', type: '', district: '', salary: '' }

export default function JobsAdminPage() {
  const [items, setItems] = useState<Job[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...empty })
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true); setError(null)
    try {
      const data = await adminApi.get<{ jobs: Job[]; pagination: unknown }>('/jobs?limit=100')
      setItems(data.jobs)
    } catch (e) { setError(String(e)) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

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
              <th className="px-4 py-2.5">Type</th>
              <th className="px-4 py-2.5">District</th>
              <th className="px-4 py-2.5">Posted by</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Loading…</td></tr>}
            {!loading && items.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No jobs yet.</td></tr>
            )}
            {items.map((j) => (
              <tr key={j.id}>
                <td className="px-4 py-2.5 font-medium">{j.title}</td>
                <td className="px-4 py-2.5">{j.type}</td>
                <td className="px-4 py-2.5">{j.district ?? '—'}</td>
                <td className="px-4 py-2.5 text-xs text-gray-500">{j.user?.email ?? '—'}</td>
                <td className="px-4 py-2.5 text-right space-x-3">
                  <button onClick={() => startEdit(j)} className="text-kerala-700 hover:underline text-xs">Edit</button>
                  <button onClick={() => remove(j.id, j.title)} className="text-red-600 hover:underline text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
