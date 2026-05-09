'use client'

import { useEffect, useState } from 'react'
import { adminApi } from '../../../lib/admin-api'
import { EntityFormShell, Field, inputClass } from '../../../components/admin/entity-form-shell'

type Herb = {
  id: string
  name: string
  sanskrit: string | null
  english: string | null
  malayalam: string | null
  rasa: string | null
  guna: string | null
  virya: string | null
  vipaka: string | null
  description: string | null
  uses: string | null
}

const empty = {
  name: '', sanskrit: '', english: '', malayalam: '',
  rasa: '', guna: '', virya: '', vipaka: '',
  description: '', uses: '',
}

export default function HerbsAdminPage() {
  const [items, setItems] = useState<Herb[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...empty })
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true); setError(null)
    try {
      const data = await adminApi.get<{ herbs: Herb[]; pagination: unknown }>('/herbs?limit=100')
      setItems(data.herbs)
    } catch (e) { setError(String(e)) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  function startEdit(h: Herb) {
    setEditingId(h.id)
    setForm({
      name: h.name,
      sanskrit: h.sanskrit ?? '', english: h.english ?? '', malayalam: h.malayalam ?? '',
      rasa: h.rasa ?? '', guna: h.guna ?? '', virya: h.virya ?? '', vipaka: h.vipaka ?? '',
      description: h.description ?? '', uses: h.uses ?? '',
    })
    setShowForm(true)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    try {
      if (editingId) await adminApi.patch(`/herbs/${editingId}`, form)
      else await adminApi.post('/herbs', form)
      setShowForm(false); await load()
    } catch (err) { alert(String(err)) } finally { setSaving(false) }
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Delete herb "${name}"?`)) return
    try { await adminApi.del(`/herbs/${id}`); await load() } catch (e) { alert(String(e)) }
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Herbs</h1>
          <p className="text-gray-600 mt-1">{items.length} loaded</p>
        </div>
        {!showForm && (
          <button onClick={() => { setEditingId(null); setForm({ ...empty }); setShowForm(true) }} className="px-4 py-2 bg-green-700 text-white rounded text-sm hover:bg-green-800">
            + New herb
          </button>
        )}
      </header>

      {error && <div className="p-3 rounded bg-red-50 text-red-800 text-sm">{error}</div>}

      {showForm && (
        <EntityFormShell title="herb" isEditing={!!editingId} onSubmit={save} onCancel={() => setShowForm(false)} saving={saving}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Name *">
              <input required className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Sanskrit (Devanagari)">
              <input className={inputClass} value={form.sanskrit} onChange={(e) => setForm({ ...form, sanskrit: e.target.value })} placeholder="अश्वगन्धा" />
            </Field>
            <Field label="English">
              <input className={inputClass} value={form.english} onChange={(e) => setForm({ ...form, english: e.target.value })} />
            </Field>
            <Field label="Malayalam">
              <input className={inputClass} value={form.malayalam} onChange={(e) => setForm({ ...form, malayalam: e.target.value })} placeholder="അമുക്കുരം" />
            </Field>
            <Field label="Rasa (taste)">
              <input className={inputClass} value={form.rasa} onChange={(e) => setForm({ ...form, rasa: e.target.value })} placeholder="tikta, kashaya" />
            </Field>
            <Field label="Guna (quality)">
              <input className={inputClass} value={form.guna} onChange={(e) => setForm({ ...form, guna: e.target.value })} />
            </Field>
            <Field label="Virya (potency)">
              <input className={inputClass} value={form.virya} onChange={(e) => setForm({ ...form, virya: e.target.value })} placeholder="ushna / sheeta" />
            </Field>
            <Field label="Vipaka (post-digestive)">
              <input className={inputClass} value={form.vipaka} onChange={(e) => setForm({ ...form, vipaka: e.target.value })} />
            </Field>
          </div>
          <Field label="Description">
            <textarea rows={3} className={inputClass} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <Field label="Traditional uses">
            <textarea rows={3} className={inputClass} value={form.uses} onChange={(e) => setForm({ ...form, uses: e.target.value })} />
          </Field>
        </EntityFormShell>
      )}

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-4 py-2.5">Name</th>
              <th className="px-4 py-2.5">Sanskrit</th>
              <th className="px-4 py-2.5">Malayalam</th>
              <th className="px-4 py-2.5">Rasa</th>
              <th className="px-4 py-2.5">Virya</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Loading…</td></tr>}
            {!loading && items.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No herbs yet.</td></tr>
            )}
            {items.map((h) => (
              <tr key={h.id}>
                <td className="px-4 py-2.5 font-medium">{h.name}</td>
                <td className="px-4 py-2.5">{h.sanskrit || '—'}</td>
                <td className="px-4 py-2.5">{h.malayalam || '—'}</td>
                <td className="px-4 py-2.5 text-xs">{h.rasa || '—'}</td>
                <td className="px-4 py-2.5 text-xs">{h.virya || '—'}</td>
                <td className="px-4 py-2.5 text-right space-x-3">
                  <button onClick={() => startEdit(h)} className="text-green-700 hover:underline text-xs">Edit</button>
                  <button onClick={() => remove(h.id, h.name)} className="text-red-600 hover:underline text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
