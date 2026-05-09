'use client'

import { useEffect, useState } from 'react'
import { adminApi } from '../../../lib/admin-api'
import { EntityFormShell, Field, inputClass } from '../../../components/admin/entity-form-shell'

const CATEGORIES = ['classical-text', 'research', 'seasonal-health', 'lifestyle']
const LANGUAGES = [{ id: 'en', name: 'English' }, { id: 'ml', name: 'Malayalam' }]

type Article = {
  id: string
  title: string
  content: string
  category: string
  source: string | null
  language: string
  createdAt: string
}

const empty = { title: '', content: '', category: '', source: '', language: 'en' }

export default function ArticlesAdminPage() {
  const [items, setItems] = useState<Article[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...empty })
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true); setError(null)
    try {
      const data = await adminApi.get<{ articles: Article[]; pagination: unknown }>('/articles?limit=100')
      setItems(data.articles)
    } catch (e) { setError(String(e)) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  function startEdit(a: Article) {
    setEditingId(a.id)
    setForm({
      title: a.title, content: a.content,
      category: a.category, source: a.source ?? '', language: a.language || 'en',
    })
    setShowForm(true)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    try {
      if (editingId) await adminApi.patch(`/articles/${editingId}`, form)
      else await adminApi.post('/articles', form)
      setShowForm(false); await load()
    } catch (err) { alert(String(err)) } finally { setSaving(false) }
  }

  async function remove(id: string, title: string) {
    if (!confirm(`Delete article "${title}"?`)) return
    try { await adminApi.del(`/articles/${id}`); await load() } catch (e) { alert(String(e)) }
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Knowledge articles</h1>
          <p className="text-gray-600 mt-1">{items.length} loaded</p>
        </div>
        {!showForm && (
          <button onClick={() => { setEditingId(null); setForm({ ...empty }); setShowForm(true) }} className="px-4 py-2 bg-green-700 text-white rounded text-sm hover:bg-green-800">
            + New article
          </button>
        )}
      </header>

      {error && <div className="p-3 rounded bg-red-50 text-red-800 text-sm">{error}</div>}

      {showForm && (
        <EntityFormShell title="article" isEditing={!!editingId} onSubmit={save} onCancel={() => setShowForm(false)} saving={saving}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Field label="Title *">
              <input required className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Field>
            <Field label="Category *">
              <select required className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="">— select —</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Language">
              <select className={inputClass} value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>
                {LANGUAGES.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Source (book / paper / URL)">
            <input className={inputClass} value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="Charaka Samhita, Sutrasthana 5.1" />
          </Field>
          <Field label="Content (Markdown OK) *">
            <textarea required rows={10} className={inputClass + ' font-mono text-xs'} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          </Field>
        </EntityFormShell>
      )}

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-4 py-2.5">Title</th>
              <th className="px-4 py-2.5">Category</th>
              <th className="px-4 py-2.5">Source</th>
              <th className="px-4 py-2.5">Lang</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Loading…</td></tr>}
            {!loading && items.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No articles yet.</td></tr>
            )}
            {items.map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-2.5 font-medium">{a.title}</td>
                <td className="px-4 py-2.5 text-xs">{a.category}</td>
                <td className="px-4 py-2.5 text-xs text-gray-500">{a.source ?? '—'}</td>
                <td className="px-4 py-2.5 text-xs uppercase">{a.language}</td>
                <td className="px-4 py-2.5 text-right space-x-3">
                  <button onClick={() => startEdit(a)} className="text-green-700 hover:underline text-xs">Edit</button>
                  <button onClick={() => remove(a.id, a.title)} className="text-red-600 hover:underline text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
