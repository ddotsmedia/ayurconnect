'use client'

import { useEffect, useState } from 'react'
import { adminApi } from '../../../lib/admin-api'
import { EntityFormShell, Field, inputClass } from '../../../components/admin/entity-form-shell'

type Video = {
  id: string
  title: string
  description: string | null
  youtubeUrl: string
  youtubeId: string
  thumbnailUrl: string | null
  category: string | null
  speaker: string | null
  speakerDoctorId: string | null
  duration: string | null
  language: string
  tags: string[]
  published: boolean
  featured: boolean
  sortOrder: number
  viewCount: number
  speakerDoctor: { id: string; name: string } | null
}

const CATEGORIES = [
  { id: '',                value: '— uncategorised —' },
  { id: 'panchakarma',     value: 'Panchakarma' },
  { id: 'yoga',            value: 'Yoga & Pranayama' },
  { id: 'herbs',           value: 'Herbs & Formulations' },
  { id: 'lifestyle',       value: 'Lifestyle & Dinacharya' },
  { id: 'qa',              value: 'Doctor Q&A' },
  { id: 'research',        value: 'Research & Evidence' },
  { id: 'recipes',         value: 'Ayurvedic Recipes' },
  { id: 'kids',            value: 'Children\'s Health' },
  { id: 'womens-health',   value: 'Women\'s Health' },
  { id: 'mens-health',     value: 'Men\'s Health' },
]
const LANGUAGES = [
  { id: 'en', value: 'English' },
  { id: 'ml', value: 'Malayalam' },
  { id: 'hi', value: 'Hindi' },
  { id: 'ta', value: 'Tamil' },
  { id: 'ar', value: 'Arabic' },
]

const empty = {
  title: '',
  description: '',
  youtubeUrl: '',
  thumbnailUrl: '',
  category: '',
  speaker: '',
  speakerDoctorId: '',
  duration: '',
  language: 'en',
  tags: '',
  published: true,
  featured: false,
  sortOrder: 0,
}

export default function VideosAdminPage() {
  const [items, setItems] = useState<Video[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...empty })
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true); setError(null)
    try {
      const data = await adminApi.get<{ videos: Video[] }>('/videos/admin')
      setItems(data.videos)
    } catch (e) { setError(String(e)) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  function startEdit(v: Video) {
    setEditingId(v.id)
    setForm({
      title:           v.title,
      description:     v.description ?? '',
      youtubeUrl:      v.youtubeUrl,
      thumbnailUrl:    v.thumbnailUrl ?? '',
      category:        v.category ?? '',
      speaker:         v.speaker ?? '',
      speakerDoctorId: v.speakerDoctorId ?? '',
      duration:        v.duration ?? '',
      language:        v.language,
      tags:            v.tags.join(', '),
      published:       v.published,
      featured:        v.featured,
      sortOrder:       v.sortOrder,
    })
    setShowForm(true)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    try {
      const payload = {
        title:           form.title.trim(),
        description:     form.description.trim() || null,
        youtubeUrl:      form.youtubeUrl.trim(),
        thumbnailUrl:    form.thumbnailUrl.trim() || null,
        category:        form.category || null,
        speaker:         form.speaker.trim() || null,
        speakerDoctorId: form.speakerDoctorId.trim() || null,
        duration:        form.duration.trim() || null,
        language:        form.language,
        tags:            form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        published:       form.published,
        featured:        form.featured,
        sortOrder:       Number(form.sortOrder) || 0,
      }
      if (editingId) await adminApi.patch(`/videos/${editingId}`, payload)
      else await adminApi.post('/videos', payload)
      setShowForm(false); await load()
    } catch (err) { alert(String(err)) } finally { setSaving(false) }
  }

  async function remove(id: string, title: string) {
    if (!confirm(`Delete video "${title}"?`)) return
    try { await adminApi.del(`/videos/${id}`); await load() } catch (e) { alert(String(e)) }
  }

  async function togglePublished(v: Video) {
    try { await adminApi.patch(`/videos/${v.id}`, { published: !v.published }); await load() }
    catch (e) { alert(String(e)) }
  }
  async function toggleFeatured(v: Video) {
    try { await adminApi.patch(`/videos/${v.id}`, { featured: !v.featured }); await load() }
    catch (e) { alert(String(e)) }
  }

  // Live YouTube ID preview so admin can verify the URL parsed correctly
  // before saving. Mirrors the server-side parser exactly.
  function previewId(raw: string): string | null {
    if (!raw) return null
    const RE = /^[A-Za-z0-9_-]{11}$/
    if (RE.test(raw.trim())) return raw.trim()
    try {
      const u = new URL(raw.startsWith('http') ? raw : `https://${raw}`)
      const host = u.hostname.replace(/^www\.|^m\./, '')
      if (host === 'youtu.be') {
        const id = u.pathname.replace(/^\//, '').split('/')[0]
        return RE.test(id) ? id : null
      }
      if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
        const v = u.searchParams.get('v')
        if (v && RE.test(v)) return v
        const parts = u.pathname.split('/').filter(Boolean)
        const idx = parts.findIndex((p) => ['embed', 'shorts', 'v', 'live'].includes(p))
        if (idx >= 0 && parts[idx + 1] && RE.test(parts[idx + 1])) return parts[idx + 1]
      }
    } catch { /* ignore */ }
    return null
  }
  const liveId = previewId(form.youtubeUrl)

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Health videos</h1>
          <p className="text-gray-600 mt-1">
            {items.length} loaded · curated YouTube embeds shown at /videos. Paste any YouTube URL — we parse the video id automatically.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => { setEditingId(null); setForm({ ...empty }); setShowForm(true) }}
            className="px-4 py-2 bg-kerala-700 text-white rounded text-sm hover:bg-kerala-800"
          >
            + New video
          </button>
        )}
      </header>

      {error && <div className="p-3 rounded bg-red-50 text-red-800 text-sm">{error}</div>}

      {showForm && (
        <EntityFormShell
          title="video"
          isEditing={!!editingId}
          onSubmit={save}
          onCancel={() => setShowForm(false)}
          saving={saving}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Title *">
              <input required className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Field>
            <Field label="YouTube URL *">
              <input
                required
                className={inputClass}
                value={form.youtubeUrl}
                onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=… or https://youtu.be/…"
              />
              <p className={`text-[11px] mt-1 ${liveId ? 'text-green-700' : form.youtubeUrl ? 'text-red-600' : 'text-gray-400'}`}>
                {liveId ? `✓ parsed id: ${liveId}` : form.youtubeUrl ? '✗ could not parse a YouTube id from this URL' : 'paste any youtube.com or youtu.be URL'}
              </p>
            </Field>
            <Field label="Category">
              <select className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c.id || 'none'} value={c.id}>{c.value}</option>)}
              </select>
            </Field>
            <Field label="Language">
              <select className={inputClass} value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>
                {LANGUAGES.map((l) => <option key={l.id} value={l.id}>{l.value}</option>)}
              </select>
            </Field>
            <Field label="Speaker / channel">
              <input
                className={inputClass}
                value={form.speaker}
                onChange={(e) => setForm({ ...form, speaker: e.target.value })}
                placeholder="Free text — e.g. Dr. Anil Kumar"
              />
            </Field>
            <Field label="Speaker doctor id (optional)">
              <input
                className={inputClass}
                value={form.speakerDoctorId}
                onChange={(e) => setForm({ ...form, speakerDoctorId: e.target.value })}
                placeholder="cuid — links to /doctors/[id]"
              />
            </Field>
            <Field label="Duration">
              <input
                className={inputClass}
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                placeholder="12:34"
              />
            </Field>
            <Field label="Sort order">
              <input
                type="number"
                className={inputClass}
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
              />
            </Field>
            <Field label="Thumbnail URL (optional)">
              <input
                className={inputClass}
                value={form.thumbnailUrl}
                onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
                placeholder="defaults to YouTube hqdefault.jpg"
              />
            </Field>
            <Field label="Tags (comma-separated)">
              <input
                className={inputClass}
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="ashwagandha, stress, sleep"
              />
            </Field>
          </div>
          <Field label="Description">
            <textarea
              rows={5}
              className={inputClass}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Short summary — shows under the embed on the detail page."
            />
          </Field>
          <div className="flex flex-wrap gap-4 pt-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
              Published (visible on /videos)
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
              Featured (gold badge + top of grid)
            </label>
          </div>

          {liveId && (
            <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Thumbnail preview:</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.thumbnailUrl || `https://i.ytimg.com/vi/${liveId}/hqdefault.jpg`} alt="thumbnail" className="w-64 rounded border border-gray-200" />
            </div>
          )}
        </EntityFormShell>
      )}

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-4 py-2.5 w-16">Thumb</th>
              <th className="px-4 py-2.5">Title</th>
              <th className="px-4 py-2.5">Category</th>
              <th className="px-4 py-2.5">Speaker</th>
              <th className="px-4 py-2.5 w-20">Views</th>
              <th className="px-4 py-2.5 w-32">Status</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading && <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Loading…</td></tr>}
            {!loading && items.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No videos yet.</td></tr>
            )}
            {items.map((v) => (
              <tr key={v.id}>
                <td className="px-4 py-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={v.thumbnailUrl || `https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`} alt="" className="w-14 h-8 object-cover rounded" />
                </td>
                <td className="px-4 py-2.5">
                  <a href={`/videos/${v.id}`} target="_blank" rel="noreferrer" className="font-medium text-gray-900 hover:underline">{v.title}</a>
                  {v.duration && <span className="text-[10px] text-gray-500 ml-2">{v.duration}</span>}
                </td>
                <td className="px-4 py-2.5 text-xs">{v.category ? <span className="px-2 py-0.5 rounded-full bg-gray-100 capitalize">{v.category.replace('-', ' ')}</span> : '—'}</td>
                <td className="px-4 py-2.5 text-xs">{v.speakerDoctor?.name ?? v.speaker ?? '—'}</td>
                <td className="px-4 py-2.5 text-xs tabular-nums">{v.viewCount.toLocaleString()}</td>
                <td className="px-4 py-2.5 space-x-1">
                  <button onClick={() => togglePublished(v)} className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${v.published ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
                    {v.published ? 'Live' : 'Hidden'}
                  </button>
                  <button onClick={() => toggleFeatured(v)} className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${v.featured ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'}`}>
                    {v.featured ? 'Featured' : '—'}
                  </button>
                </td>
                <td className="px-4 py-2.5 text-right space-x-3 whitespace-nowrap">
                  <button onClick={() => startEdit(v)} className="text-kerala-700 hover:underline text-xs">Edit</button>
                  <button onClick={() => remove(v.id, v.title)} className="text-red-600 hover:underline text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
