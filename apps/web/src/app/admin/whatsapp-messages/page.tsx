'use client'

// Admin manager for WhatsApp message templates surfaced by the shared
// <WhatsAppMessagePicker>. Grouped by context (doctor / hospital), each
// group in its own table for scan-ability.

import { useEffect, useState } from 'react'
import { adminApi } from '../../../lib/admin-api'
import { EntityFormShell, Field, inputClass } from '../../../components/admin/entity-form-shell'

type Template = {
  id: string
  context: 'doctor' | 'hospital'
  text: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

const CONTEXTS: Array<{ id: 'doctor' | 'hospital'; label: string }> = [
  { id: 'doctor',   label: 'Doctor templates'   },
  { id: 'hospital', label: 'Hospital templates' },
]

const empty: { context: 'doctor' | 'hospital'; text: string; sortOrder: number } = {
  context: 'doctor',
  text: '',
  sortOrder: 100,
}

export default function WhatsAppMessagesAdminPage() {
  const [items, setItems] = useState<Template[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...empty })
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true); setError(null)
    try {
      const data = await adminApi.get<{ items: Template[] }>('/admin/whatsapp-templates')
      setItems(data.items)
    } catch (e) { setError(String(e)) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  function startEdit(t: Template) {
    setEditingId(t.id)
    setForm({ context: t.context, text: t.text, sortOrder: t.sortOrder })
    setShowForm(true)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function startCreate(defaultContext: 'doctor' | 'hospital') {
    setEditingId(null)
    setForm({ ...empty, context: defaultContext })
    setShowForm(true)
  }

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    try {
      if (editingId) {
        await adminApi.patch(`/admin/whatsapp-templates/${editingId}`, form)
      } else {
        await adminApi.post('/admin/whatsapp-templates', form)
      }
      setShowForm(false); await load()
    } catch (err) { alert(String(err)) } finally { setSaving(false) }
  }

  async function remove(id: string, text: string) {
    if (!confirm(`Delete template "${text.slice(0, 60)}${text.length > 60 ? '…' : ''}"?`)) return
    try { await adminApi.del(`/admin/whatsapp-templates/${id}`); await load() } catch (e) { alert(String(e)) }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">WhatsApp message templates</h1>
          <p className="text-gray-600 mt-1">{items.length} loaded · shown to visitors in the WhatsApp message picker on doctor + hospital pages.</p>
        </div>
      </header>

      {error && <div className="p-3 rounded bg-red-50 text-red-800 text-sm">{error}</div>}

      {showForm && (
        <EntityFormShell title="WhatsApp template" isEditing={!!editingId} onSubmit={save} onCancel={() => setShowForm(false)} saving={saving}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Field label="Context *">
              <select required className={inputClass} value={form.context} onChange={(e) => setForm({ ...form, context: e.target.value as 'doctor' | 'hospital' })}>
                <option value="doctor">doctor</option>
                <option value="hospital">hospital</option>
              </select>
            </Field>
            <Field label="Sort order">
              <input type="number" className={inputClass} value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) || 0 })} />
            </Field>
          </div>
          <Field label="Message text *">
            <textarea
              required
              rows={3}
              maxLength={500}
              className={inputClass}
              value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
              placeholder="e.g. I'd like to book a consultation"
            />
          </Field>
          <p className="text-xs text-gray-500">
            Tip: keep templates concise and pricing-free. Visitors always have a free-text option so use these for the common asks only.
          </p>
        </EntityFormShell>
      )}

      {loading && <div className="text-sm text-gray-500">Loading…</div>}

      {!loading && CONTEXTS.map(({ id, label }) => {
        const rows = items.filter((it) => it.context === id)
        return (
          <section key={id} className="bg-white border rounded-lg overflow-hidden">
            <header className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
              <h2 className="text-sm font-semibold text-gray-800">{label} <span className="text-gray-400 font-normal">({rows.length})</span></h2>
              {!showForm && (
                <button onClick={() => startCreate(id)} className="px-3 py-1.5 bg-kerala-700 text-white rounded text-xs hover:bg-kerala-800">
                  + Add {id} template
                </button>
              )}
            </header>
            <table className="w-full text-sm">
              <thead className="text-left text-gray-600">
                <tr>
                  <th className="px-4 py-2 w-16">Order</th>
                  <th className="px-4 py-2">Text</th>
                  <th className="px-4 py-2 text-right w-40">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.length === 0 && (
                  <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-500 text-xs">No {id} templates yet.</td></tr>
                )}
                {rows.map((t) => (
                  <tr key={t.id}>
                    <td className="px-4 py-2 text-xs text-gray-500 font-mono">{t.sortOrder}</td>
                    <td className="px-4 py-2">{t.text}</td>
                    <td className="px-4 py-2 text-right space-x-3">
                      <button onClick={() => startEdit(t)} className="text-kerala-700 hover:underline text-xs">Edit</button>
                      <button onClick={() => remove(t.id, t.text)} className="text-red-600 hover:underline text-xs">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )
      })}
    </div>
  )
}
