'use client'

import { useEffect, useState } from 'react'
import { adminApi } from '../../../lib/admin-api'
import { EntityFormShell, Field, inputClass } from '../../../components/admin/entity-form-shell'

const DISTRICTS = [
  'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 'Kottayam',
  'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram', 'Kozhikode',
  'Wayanad', 'Kannur', 'Kasaragod',
]
const TYPES = ['ayurveda', 'modern', 'nursing', 'pharmacy', 'research']

type College = {
  id: string
  name: string
  district: string
  type: string
  profile: string | null
  contact: string | null
  address: string | null
}

const empty = { name: '', district: '', type: '', profile: '', contact: '', address: '' }

export default function CollegesAdminPage() {
  const [items, setItems] = useState<College[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...empty })
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true); setError(null)
    try {
      const data = await adminApi.get<{ colleges: College[]; pagination: unknown }>('/colleges?limit=100')
      setItems(data.colleges)
    } catch (e) { setError(String(e)) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  function startEdit(c: College) {
    setEditingId(c.id)
    setForm({
      name: c.name, district: c.district, type: c.type,
      profile: c.profile ?? '', contact: c.contact ?? '', address: c.address ?? '',
    })
    setShowForm(true)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    try {
      if (editingId) await adminApi.patch(`/colleges/${editingId}`, form)
      else await adminApi.post('/colleges', form)
      setShowForm(false); await load()
    } catch (err) { alert(String(err)) } finally { setSaving(false) }
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Delete college "${name}"?`)) return
    try { await adminApi.del(`/colleges/${id}`); await load() } catch (e) { alert(String(e)) }
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Medical colleges</h1>
          <p className="text-gray-600 mt-1">{items.length} loaded</p>
        </div>
        {!showForm && (
          <button onClick={() => { setEditingId(null); setForm({ ...empty }); setShowForm(true) }} className="px-4 py-2 bg-kerala-700 text-white rounded text-sm hover:bg-kerala-800">
            + New college
          </button>
        )}
      </header>

      {error && <div className="p-3 rounded bg-red-50 text-red-800 text-sm">{error}</div>}

      {showForm && (
        <EntityFormShell title="college" isEditing={!!editingId} onSubmit={save} onCancel={() => setShowForm(false)} saving={saving}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Name *">
              <input required className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Type *">
              <select required className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="">— select —</option>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="District *">
              <select required className={inputClass} value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })}>
                <option value="">— select —</option>
                {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Contact">
              <input className={inputClass} value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
            </Field>
            <Field label="Address">
              <input className={inputClass} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </Field>
          </div>
          <Field label="Profile">
            <textarea rows={3} className={inputClass} value={form.profile} onChange={(e) => setForm({ ...form, profile: e.target.value })} />
          </Field>
        </EntityFormShell>
      )}

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-4 py-2.5">Name</th>
              <th className="px-4 py-2.5">Type</th>
              <th className="px-4 py-2.5">District</th>
              <th className="px-4 py-2.5">Contact</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Loading…</td></tr>}
            {!loading && items.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No colleges yet.</td></tr>
            )}
            {items.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-2.5 font-medium">{c.name}</td>
                <td className="px-4 py-2.5">{c.type}</td>
                <td className="px-4 py-2.5">{c.district}</td>
                <td className="px-4 py-2.5 text-xs text-gray-500">{c.contact ?? '—'}</td>
                <td className="px-4 py-2.5 text-right space-x-3">
                  <button onClick={() => startEdit(c)} className="text-kerala-700 hover:underline text-xs">Edit</button>
                  <button onClick={() => remove(c.id, c.name)} className="text-red-600 hover:underline text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
