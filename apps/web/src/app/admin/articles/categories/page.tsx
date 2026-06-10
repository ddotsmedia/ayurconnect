'use client'

import { useEffect, useState } from 'react'
import { Loader2, AlertCircle, Plus, Save, X, RefreshCw, Power } from 'lucide-react'

type Cat = {
  id: string; slug: string; name: string; nameMl: string | null
  description: string | null; descriptionMl: string | null
  icon: string | null; color: string | null
  sortOrder: number; isActive: boolean; articleCount: number
}

const ICON_OPTIONS = ['Sun','Moon','Leaf','Heart','Brain','Stethoscope','BookOpen','Flower2','Sparkles','Activity','Salad','Droplets','Wind','CloudRain','Baby','Compass','PersonStanding','FlaskConical']

export default function ArticleCategoriesAdmin() {
  const [items, setItems] = useState<Cat[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr]   = useState<string | null>(null)
  const [editing, setEditing] = useState<Partial<Cat> | null>(null)

  async function load() {
    setLoading(true); setErr(null)
    try {
      const r = await fetch('/api/admin/article-categories')
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? `HTTP ${r.status}`)
      const j = await r.json() as { items: Cat[] }
      setItems(j.items)
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)) } finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [])

  async function save() {
    if (!editing || !editing.name?.trim()) { setErr('Name required'); return }
    try {
      const r = await fetch(editing.id ? `/api/admin/article-categories/${editing.id}` : '/api/admin/article-categories', {
        method:  editing.id ? 'PATCH' : 'POST',
        headers: { 'content-type': 'application/json' },
        body:    JSON.stringify(editing),
      })
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? `HTTP ${r.status}`)
      setEditing(null); void load()
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)) }
  }

  async function patch(id: string, partial: Partial<Cat>) {
    try {
      await fetch(`/api/admin/article-categories/${id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(partial) })
      void load()
    } catch { /* ignore */ }
  }

  async function del(id: string) {
    if (!window.confirm('Delete this category? (If articles exist, it will be deactivated.)')) return
    try {
      await fetch(`/api/admin/article-categories/${id}`, { method: 'DELETE' })
      void load()
    } catch { /* ignore */ }
  }

  async function refresh() {
    await fetch('/api/admin/article-categories/refresh-counts', { method: 'POST' }).catch(() => null)
    void load()
  }

  return (
    <main className="space-y-5">
      <header className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-2xl text-ink">Article categories</h1>
          <p className="text-sm text-muted mt-1">Manage the taxonomy used across /articles + /articles/category/[slug]. Soft-delete preserves articles; hard-delete only when articleCount = 0.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={refresh} className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded text-xs hover:bg-gray-50"><RefreshCw className="w-3.5 h-3.5" /> refresh counts</button>
          <button onClick={() => setEditing({ name: '', sortOrder: 100, isActive: true })} className="inline-flex items-center gap-1.5 px-4 py-2 bg-kerala-700 hover:bg-kerala-800 text-white rounded text-sm font-semibold">
            <Plus className="w-4 h-4" /> New category
          </button>
        </div>
      </header>

      {err && (
        <div className="p-3 rounded bg-red-50 border border-red-100 text-sm text-red-800 inline-flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5" /> {err}
        </div>
      )}

      {loading ? <Loader2 className="w-5 h-5 animate-spin text-kerala-700" /> : (
        <div className="overflow-x-auto bg-white border border-gray-100 rounded-card shadow-card">
          <table className="min-w-full text-sm">
            <thead className="bg-cream text-left text-gray-700 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-3 py-2">Sort</th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Slug</th>
                <th className="px-3 py-2">Icon</th>
                <th className="px-3 py-2">Color</th>
                <th className="px-3 py-2 text-center">Articles</th>
                <th className="px-3 py-2">Active</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((c) => (
                <tr key={c.id}>
                  <td className="px-3 py-2">
                    <input type="number" defaultValue={c.sortOrder} onBlur={(e) => patch(c.id, { sortOrder: parseInt(e.target.value, 10) || 0 })} className="w-16 px-2 py-1 border border-gray-200 rounded text-xs" />
                  </td>
                  <td className="px-3 py-2">
                    <p className="font-semibold text-ink">{c.name}</p>
                    {c.nameMl && <p className="text-[11px] text-gray-500">{c.nameMl}</p>}
                  </td>
                  <td className="px-3 py-2"><code className="text-[11px] px-1.5 py-0.5 bg-gray-100 rounded">{c.slug}</code></td>
                  <td className="px-3 py-2 text-xs">{c.icon ?? '—'}</td>
                  <td className="px-3 py-2">{c.color ? <span className="inline-block w-5 h-5 rounded-full border border-gray-200" style={{ backgroundColor: c.color }} title={c.color} /> : '—'}</td>
                  <td className="px-3 py-2 text-center">{c.articleCount}</td>
                  <td className="px-3 py-2">
                    <button onClick={() => patch(c.id, { isActive: !c.isActive })} className={'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] ' + (c.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600')}>
                      <Power className="w-3 h-3" /> {c.isActive ? 'on' : 'off'}
                    </button>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button onClick={() => setEditing(c)} className="text-xs text-kerala-700 hover:underline mr-3">edit</button>
                    <button onClick={() => del(c.id)}     className="text-xs text-red-700 hover:underline">delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-card max-w-2xl w-full p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg text-ink">{editing.id ? 'Edit category' : 'New category'}</h2>
              <button onClick={() => setEditing(null)}><X className="w-4 h-4 text-gray-500" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <Field label="Name (English) *"><input className="w-full px-3 py-2 border border-gray-200 rounded text-sm" value={editing.name ?? ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
              <Field label="Name (Malayalam)"><input className="w-full px-3 py-2 border border-gray-200 rounded text-sm" value={editing.nameMl ?? ''} onChange={(e) => setEditing({ ...editing, nameMl: e.target.value })} /></Field>
              <Field label="Slug (URL)"><input className="w-full px-3 py-2 border border-gray-200 rounded text-sm" value={editing.slug ?? ''} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder="auto from name" /></Field>
              <Field label="Sort order"><input type="number" className="w-full px-3 py-2 border border-gray-200 rounded text-sm" value={editing.sortOrder ?? 100} onChange={(e) => setEditing({ ...editing, sortOrder: parseInt(e.target.value, 10) || 0 })} /></Field>
              <Field label="Icon (lucide name)">
                <select className="w-full px-3 py-2 border border-gray-200 rounded text-sm" value={editing.icon ?? ''} onChange={(e) => setEditing({ ...editing, icon: e.target.value || null })}>
                  <option value="">— none —</option>
                  {ICON_OPTIONS.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </Field>
              <Field label="Color (hex)"><input className="w-full px-3 py-2 border border-gray-200 rounded text-sm" value={editing.color ?? ''} onChange={(e) => setEditing({ ...editing, color: e.target.value || null })} placeholder="#155228" /></Field>
              <Field label="Description (English)" full><textarea className="w-full px-3 py-2 border border-gray-200 rounded text-sm min-h-[60px]" value={editing.description ?? ''} onChange={(e) => setEditing({ ...editing, description: e.target.value || null })} /></Field>
              <Field label="Description (മലയാളം)" full><textarea className="w-full px-3 py-2 border border-gray-200 rounded text-sm min-h-[60px]" value={editing.descriptionMl ?? ''} onChange={(e) => setEditing({ ...editing, descriptionMl: e.target.value || null })} /></Field>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditing(null)} className="px-3 py-1.5 text-xs text-gray-700">Cancel</button>
              <button onClick={save} className="inline-flex items-center gap-1 px-4 py-1.5 bg-kerala-700 hover:bg-kerala-800 text-white rounded text-xs font-semibold"><Save className="w-3.5 h-3.5" /> Save</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={'block ' + (full ? 'md:col-span-2' : '')}>
      <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 mb-1.5 block">{label}</span>
      {children}
    </label>
  )
}
