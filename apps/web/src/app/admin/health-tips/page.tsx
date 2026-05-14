'use client'

import { useEffect, useState } from 'react'
import { adminApi } from '../../../lib/admin-api'
import { EntityFormShell, Field, inputClass } from '../../../components/admin/entity-form-shell'

const DOSHAS = ['vata', 'pitta', 'kapha', 'tridosha']
const SEASONS = [
  { id: '',         name: '— any —' },
  { id: 'varsha',   name: 'Varsha (Monsoon)' },
  { id: 'grishma',  name: 'Grishma (Summer)' },
  { id: 'vasantha', name: 'Vasantha (Spring)' },
  { id: 'sharad',   name: 'Sharad (Autumn)' },
  { id: 'hemanta',  name: 'Hemanta (Winter)' },
  { id: 'shishira', name: 'Shishira (Late Winter)' },
]

type Tip = {
  id: string
  title: string
  content: string
  dosha: string
  season: string | null
  language: string
  createdAt: string
}

const empty = { title: '', content: '', dosha: '', season: '', language: 'en' }

export default function HealthTipsAdminPage() {
  const [items, setItems] = useState<Tip[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...empty })
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true); setError(null)
    try {
      const data = await adminApi.get<{ tips: Tip[] }>('/health-tips?limit=100')
      setItems(data.tips)
    } catch (e) { setError(String(e)) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  function startEdit(t: Tip) {
    setEditingId(t.id)
    setForm({
      title: t.title, content: t.content,
      dosha: t.dosha, season: t.season ?? '', language: t.language || 'en',
    })
    setShowForm(true)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    try {
      const payload = { ...form, season: form.season || null }
      if (editingId) await adminApi.patch(`/health-tips/${editingId}`, payload)
      else await adminApi.post('/health-tips', payload)
      setShowForm(false); await load()
    } catch (err) { alert(String(err)) } finally { setSaving(false) }
  }

  async function remove(id: string, title: string) {
    if (!confirm(`Delete tip "${title}"?`)) return
    try { await adminApi.del(`/health-tips/${id}`); await load() } catch (e) { alert(String(e)) }
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Health tips</h1>
          <p className="text-gray-600 mt-1">{items.length} loaded</p>
        </div>
        {!showForm && (
          <button onClick={() => { setEditingId(null); setForm({ ...empty }); setShowForm(true) }} className="px-4 py-2 bg-kerala-700 text-white rounded text-sm hover:bg-kerala-800">
            + New tip
          </button>
        )}
      </header>

      {error && <div className="p-3 rounded bg-red-50 text-red-800 text-sm">{error}</div>}

      {showForm && (
        <EntityFormShell title="health tip" isEditing={!!editingId} onSubmit={save} onCancel={() => setShowForm(false)} saving={saving}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Field label="Title *">
              <input required className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Field>
            <Field label="Dosha *">
              <select required className={inputClass} value={form.dosha} onChange={(e) => setForm({ ...form, dosha: e.target.value })}>
                <option value="">— select —</option>
                {DOSHAS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Season">
              <select className={inputClass} value={form.season} onChange={(e) => setForm({ ...form, season: e.target.value })}>
                {SEASONS.map((s) => <option key={s.id || 'none'} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
            <Field label="Language">
              <select className={inputClass} value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>
                <option value="en">English</option>
                <option value="ml">Malayalam</option>
              </select>
            </Field>
          </div>
          <Field label="Content (Markdown OK) *">
            <textarea required rows={8} className={inputClass + ' font-mono text-xs'} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          </Field>
        </EntityFormShell>
      )}

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-4 py-2.5">Title</th>
              <th className="px-4 py-2.5">Dosha</th>
              <th className="px-4 py-2.5">Season</th>
              <th className="px-4 py-2.5">Lang</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Loading…</td></tr>}
            {!loading && items.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No tips yet.</td></tr>
            )}
            {items.map((t) => (
              <tr key={t.id}>
                <td className="px-4 py-2.5 font-medium">{t.title}</td>
                <td className="px-4 py-2.5 text-xs"><span className="px-2 py-0.5 rounded-full bg-gray-100 capitalize">{t.dosha}</span></td>
                <td className="px-4 py-2.5 text-xs">{t.season ?? '—'}</td>
                <td className="px-4 py-2.5 text-xs uppercase">{t.language}</td>
                <td className="px-4 py-2.5 text-right space-x-3">
                  <button onClick={() => startEdit(t)} className="text-kerala-700 hover:underline text-xs">Edit</button>
                  <button onClick={() => remove(t.id, t.title)} className="text-red-600 hover:underline text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
