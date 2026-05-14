'use client'

import { useEffect, useState } from 'react'
import { adminApi } from '../../../lib/admin-api'
import { EntityFormShell, Field, inputClass } from '../../../components/admin/entity-form-shell'

// Admin CRUD for the homepage "Stories of Healing" testimonials. These render
// in section 9 of `/` (apps/web/src/app/page.tsx). The public endpoint
// (/testimonials) returns only published rows; this page hits /testimonials/admin
// which includes drafts.

type Testimonial = {
  id: string
  name: string
  condition: string | null
  initials: string | null
  stars: number
  quote: string
  imageUrl: string | null
  published: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

const empty = {
  name: '',
  condition: '',
  initials: '',
  stars: 5,
  quote: '',
  imageUrl: '',
  published: true,
  sortOrder: 0,
}

export default function TestimonialsAdminPage() {
  const [items, setItems] = useState<Testimonial[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...empty })
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true); setError(null)
    try {
      const data = await adminApi.get<{ testimonials: Testimonial[] }>('/testimonials/admin')
      setItems(data.testimonials)
    } catch (e) { setError(String(e)) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  function startEdit(t: Testimonial) {
    setEditingId(t.id)
    setForm({
      name:      t.name,
      condition: t.condition ?? '',
      initials:  t.initials ?? '',
      stars:     t.stars,
      quote:     t.quote,
      imageUrl:  t.imageUrl ?? '',
      published: t.published,
      sortOrder: t.sortOrder,
    })
    setShowForm(true)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    try {
      const payload = {
        name:      form.name.trim(),
        quote:     form.quote.trim(),
        condition: form.condition.trim() || null,
        initials:  form.initials.trim() || null,    // server auto-derives if null
        stars:     Number(form.stars) || 5,
        imageUrl:  form.imageUrl.trim() || null,
        published: form.published,
        sortOrder: Number(form.sortOrder) || 0,
      }
      if (editingId) await adminApi.patch(`/testimonials/${editingId}`, payload)
      else await adminApi.post('/testimonials', payload)
      setShowForm(false); await load()
    } catch (err) { alert(String(err)) } finally { setSaving(false) }
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Delete testimonial from "${name}"?`)) return
    try { await adminApi.del(`/testimonials/${id}`); await load() } catch (e) { alert(String(e)) }
  }

  async function togglePublished(t: Testimonial) {
    try { await adminApi.patch(`/testimonials/${t.id}`, { published: !t.published }); await load() }
    catch (e) { alert(String(e)) }
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Stories of Healing</h1>
          <p className="text-gray-600 mt-1">
            {items.length} loaded · these render in section 9 of the homepage.
            Unpublished entries are hidden from public visitors.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => { setEditingId(null); setForm({ ...empty }); setShowForm(true) }}
            className="px-4 py-2 bg-kerala-700 text-white rounded text-sm hover:bg-kerala-800"
          >
            + New testimonial
          </button>
        )}
      </header>

      {error && <div className="p-3 rounded bg-red-50 text-red-800 text-sm">{error}</div>}

      {showForm && (
        <EntityFormShell
          title="testimonial"
          isEditing={!!editingId}
          onSubmit={save}
          onCancel={() => setShowForm(false)}
          saving={saving}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Field label="Patient name *">
              <input
                required
                className={inputClass}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Anita M."
              />
            </Field>
            <Field label="Condition / context">
              <input
                className={inputClass}
                value={form.condition}
                onChange={(e) => setForm({ ...form, condition: e.target.value })}
                placeholder="e.g. Chronic migraine"
              />
            </Field>
            <Field label="Initials override">
              <input
                className={inputClass}
                value={form.initials}
                onChange={(e) => setForm({ ...form, initials: e.target.value })}
                placeholder="Auto from name if blank (e.g. AM)"
                maxLength={4}
              />
            </Field>
            <Field label="Star rating">
              <select
                className={inputClass}
                value={form.stars}
                onChange={(e) => setForm({ ...form, stars: Number(e.target.value) })}
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>{'★'.repeat(n) + '☆'.repeat(5 - n)} ({n})</option>
                ))}
              </select>
            </Field>
            <Field label="Sort order (smaller shows first)">
              <input
                type="number"
                className={inputClass}
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
              />
            </Field>
            <Field label="Status">
              <label className="flex items-center gap-2 mt-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm({ ...form, published: e.target.checked })}
                />
                Published (visible on homepage)
              </label>
            </Field>
            <Field label="Photo URL (optional)">
              <input
                className={inputClass}
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://… — falls back to initials avatar"
              />
            </Field>
          </div>
          <Field label="Quote *">
            <textarea
              required
              rows={5}
              className={inputClass}
              value={form.quote}
              onChange={(e) => setForm({ ...form, quote: e.target.value })}
              placeholder="The patient's testimonial in their own words."
            />
          </Field>
        </EntityFormShell>
      )}

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-4 py-2.5 w-12">Order</th>
              <th className="px-4 py-2.5">Patient</th>
              <th className="px-4 py-2.5">Condition</th>
              <th className="px-4 py-2.5 w-20">Stars</th>
              <th className="px-4 py-2.5">Quote</th>
              <th className="px-4 py-2.5 w-24">Status</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading && <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Loading…</td></tr>}
            {!loading && items.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No testimonials yet.</td></tr>
            )}
            {items.map((t) => (
              <tr key={t.id}>
                <td className="px-4 py-2.5 text-xs text-gray-500 tabular-nums">{t.sortOrder}</td>
                <td className="px-4 py-2.5">
                  <div className="font-medium">{t.name}</div>
                  {t.initials && <div className="text-[10px] text-gray-500 mt-0.5">{t.initials}</div>}
                </td>
                <td className="px-4 py-2.5 text-xs text-gray-600">{t.condition ?? '—'}</td>
                <td className="px-4 py-2.5 text-yellow-500 text-xs">{'★'.repeat(t.stars)}</td>
                <td className="px-4 py-2.5 max-w-md">
                  <p className="text-xs text-gray-700 line-clamp-2">{t.quote}</p>
                </td>
                <td className="px-4 py-2.5">
                  <button
                    onClick={() => togglePublished(t)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      t.published
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {t.published ? 'Published' : 'Hidden'}
                  </button>
                </td>
                <td className="px-4 py-2.5 text-right space-x-3 whitespace-nowrap">
                  <button onClick={() => startEdit(t)} className="text-kerala-700 hover:underline text-xs">Edit</button>
                  <button onClick={() => remove(t.id, t.name)} className="text-red-600 hover:underline text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
