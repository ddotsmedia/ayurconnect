'use client'

import { useEffect, useState } from 'react'
import { adminApi } from '../../../lib/admin-api'
import { EntityFormShell, Field, inputClass } from '../../../components/admin/entity-form-shell'

const LOCATIONS = [
  'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 'Kottayam',
  'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram', 'Kozhikode',
  'Wayanad', 'Kannur', 'Kasaragod',
]

type Pkg = {
  id: string
  title: string
  description: string
  duration: number
  price: number | null
  location: string
  includes: string | null
  createdAt: string
}

const empty = { title: '', description: '', duration: '14', price: '', location: '', includes: '' }

export default function TourismAdminPage() {
  const [items, setItems] = useState<Pkg[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...empty })
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true); setError(null)
    try {
      const data = await adminApi.get<{ packages: Pkg[]; pagination: unknown }>('/tourism/packages?limit=100')
      setItems(data.packages)
    } catch (e) { setError(String(e)) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  function startEdit(p: Pkg) {
    setEditingId(p.id)
    setForm({
      title: p.title, description: p.description,
      duration: String(p.duration), price: p.price == null ? '' : String(p.price),
      location: p.location, includes: p.includes ?? '',
    })
    setShowForm(true)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    try {
      if (editingId) await adminApi.patch(`/tourism/packages/${editingId}`, form)
      else await adminApi.post('/tourism/packages', form)
      setShowForm(false); await load()
    } catch (err) { alert(String(err)) } finally { setSaving(false) }
  }

  async function remove(id: string, title: string) {
    if (!confirm(`Delete package "${title}"?`)) return
    try { await adminApi.del(`/tourism/packages/${id}`); await load() } catch (e) { alert(String(e)) }
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Medical tourism packages</h1>
          <p className="text-gray-600 mt-1">{items.length} loaded</p>
        </div>
        {!showForm && (
          <button onClick={() => { setEditingId(null); setForm({ ...empty }); setShowForm(true) }} className="px-4 py-2 bg-kerala-700 text-white rounded text-sm hover:bg-kerala-800">
            + New package
          </button>
        )}
      </header>

      {error && <div className="p-3 rounded bg-red-50 text-red-800 text-sm">{error}</div>}

      {showForm && (
        <EntityFormShell title="package" isEditing={!!editingId} onSubmit={save} onCancel={() => setShowForm(false)} saving={saving}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Title *">
              <input required className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Field>
            <Field label="Location *">
              <select required className={inputClass} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}>
                <option value="">— select —</option>
                {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </Field>
            <Field label="Duration (days) *">
              <input required type="number" min="1" className={inputClass} value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
            </Field>
            <Field label="Price (INR)">
              <input type="number" min="0" step="100" className={inputClass} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </Field>
          </div>
          <Field label="Description *">
            <textarea required rows={3} className={inputClass} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <Field label="Includes">
            <textarea rows={2} className={inputClass} value={form.includes} onChange={(e) => setForm({ ...form, includes: e.target.value })} placeholder="Consultation, Panchakarma, accommodation, meals…" />
          </Field>
        </EntityFormShell>
      )}

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-4 py-2.5">Title</th>
              <th className="px-4 py-2.5">Location</th>
              <th className="px-4 py-2.5">Duration</th>
              <th className="px-4 py-2.5">Price (₹)</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Loading…</td></tr>}
            {!loading && items.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No packages yet.</td></tr>
            )}
            {items.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-2.5 font-medium">{p.title}</td>
                <td className="px-4 py-2.5">{p.location}</td>
                <td className="px-4 py-2.5">{p.duration} days</td>
                <td className="px-4 py-2.5">{p.price?.toLocaleString() ?? '—'}</td>
                <td className="px-4 py-2.5 text-right space-x-3">
                  <button onClick={() => startEdit(p)} className="text-kerala-700 hover:underline text-xs">Edit</button>
                  <button onClick={() => remove(p.id, p.title)} className="text-red-600 hover:underline text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
