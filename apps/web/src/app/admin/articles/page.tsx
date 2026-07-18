'use client'

import { useEffect, useRef, useState } from 'react'
import { adminApi } from '../../../lib/admin-api'
import { EntityFormShell, Field, inputClass } from '../../../components/admin/entity-form-shell'
import { ArticleImageUpload, AiOptimizeButton, SocialPreview } from './_editor-widgets'

const CATEGORIES = ['classical-text', 'research', 'seasonal-health', 'lifestyle']
const LANGUAGES = [{ id: 'en', name: 'English' }, { id: 'ml', name: 'Malayalam' }]

type Article = {
  id: string
  title: string
  content: string
  category: string
  source: string | null
  language: string
  featuredImage?: string | null
  featuredImageAlt?: string | null
  seoTitle?: string | null
  seoDescription?: string | null
  seoKeywords?: string | null
  readTimeMinutes?: number | null
  createdAt: string
}

const empty = {
  title: '', content: '', category: '', source: '', language: 'en',
  featuredImage: '', featuredImageAlt: '',
  seoTitle: '', seoDescription: '', seoKeywords: '',
  readTimeMinutes: 0,
}

type Tab = 'content' | 'seo' | 'social'

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

  const contentRef = useRef<HTMLTextAreaElement>(null)
  const [tab, setTab] = useState<Tab>('content')

  function startEdit(a: Article) {
    setEditingId(a.id)
    setForm({
      title: a.title, content: a.content,
      category: a.category, source: a.source ?? '', language: a.language || 'en',
      featuredImage:    a.featuredImage    ?? '',
      featuredImageAlt: a.featuredImageAlt ?? '',
      seoTitle:         a.seoTitle         ?? '',
      seoDescription:   a.seoDescription   ?? '',
      seoKeywords:      a.seoKeywords      ?? '',
      readTimeMinutes:  a.readTimeMinutes  ?? 0,
    })
    setTab('content')
    setShowForm(true)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function insertAtCursor(snippet: string) {
    const el = contentRef.current
    if (!el) { setForm((f) => ({ ...f, content: f.content + snippet })); return }
    const start = el.selectionStart, end = el.selectionEnd
    const next  = form.content.slice(0, start) + snippet + form.content.slice(end)
    setForm((f) => ({ ...f, content: next }))
    // Restore caret after React re-render.
    setTimeout(() => { el.focus(); el.setSelectionRange(start + snippet.length, start + snippet.length) }, 0)
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
          <button onClick={() => { setEditingId(null); setForm({ ...empty }); setShowForm(true) }} className="px-4 py-2 bg-kerala-700 text-white rounded text-sm hover:bg-kerala-800">
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
            <textarea ref={contentRef} required rows={12} className={inputClass + ' font-mono text-xs'} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          </Field>

          {/* Tabs */}
          <div className="border-t border-gray-100 pt-4">
            <div className="flex flex-wrap gap-2 mb-3">
              {(['content','seo','social'] as Tab[]).map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full border ${tab === t ? 'bg-kerala-700 text-white border-kerala-700' : 'bg-white text-gray-700 border-gray-200 hover:border-kerala-300'}`}
                >
                  {t === 'content' ? 'Image + AI' : t === 'seo' ? 'SEO' : 'Social preview'}
                </button>
              ))}
            </div>

            {tab === 'content' && (
              <div className="space-y-4">
                <ArticleImageUpload
                  onInsert={insertAtCursor}
                  onFeatured={(url, alt) => setForm((f) => ({ ...f, featuredImage: url, featuredImageAlt: alt }))}
                />
                <AiOptimizeButton
                  title={form.title}
                  content={form.content}
                  category={form.category}
                  onApply={(patch) => setForm((f) => ({
                    ...f,
                    ...(patch.title !== undefined            ? { title: patch.title } : {}),
                    ...(patch.seoDescription !== undefined   ? { seoDescription: patch.seoDescription } : {}),
                    ...(patch.seoKeywords !== undefined      ? { seoKeywords: patch.seoKeywords } : {}),
                    ...(patch.readTimeMinutes !== undefined  ? { readTimeMinutes: patch.readTimeMinutes } : {}),
                  }))}
                />
              </div>
            )}

            {tab === 'seo' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Featured image URL">
                  <input className={inputClass} value={form.featuredImage} onChange={(e) => setForm({ ...form, featuredImage: e.target.value })} placeholder="/api/uploads/…" />
                </Field>
                <Field label="Featured image alt (≤200 chars)">
                  <input className={inputClass} maxLength={200} value={form.featuredImageAlt} onChange={(e) => setForm({ ...form, featuredImageAlt: e.target.value })} />
                </Field>
                <Field label="SEO title (leave blank to use main title)">
                  <input className={inputClass} maxLength={200} value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} />
                </Field>
                <Field label="Meta description (≤160 chars)">
                  <input className={inputClass} maxLength={160} value={form.seoDescription} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} />
                </Field>
                <Field label="SEO keywords (comma-separated)">
                  <input className={inputClass} value={form.seoKeywords} onChange={(e) => setForm({ ...form, seoKeywords: e.target.value })} placeholder="ayurveda, panchakarma, ritucharya" />
                </Field>
                <Field label="Reading time (minutes)">
                  <input type="number" min={0} max={120} className={inputClass} value={form.readTimeMinutes} onChange={(e) => setForm({ ...form, readTimeMinutes: Number(e.target.value) || 0 })} />
                </Field>
              </div>
            )}

            {tab === 'social' && (
              <SocialPreview
                title={form.seoTitle || form.title || '(no title yet)'}
                description={form.seoDescription || 'Add a meta description in the SEO tab to preview here.'}
                featuredImage={form.featuredImage}
                authorName="AyurConnect"
              />
            )}
          </div>
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
                  <button onClick={() => startEdit(a)} className="text-kerala-700 hover:underline text-xs">Edit</button>
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
