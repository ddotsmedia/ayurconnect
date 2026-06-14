'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, Star, X, Save } from 'lucide-react'

export type Package = {
  id: string; hospitalId: string; name: string; nameMl: string | null; slug: string
  description: string; descriptionMl: string | null; treatments: string[]
  duration: string; priceFrom: number; priceTo: number | null; currency: string
  includes: string[]; idealFor: string[]; season: string[]; maxPatients: number | null
  isActive: boolean; isFeatured: boolean; createdAt: string
}

const EMPTY: Omit<Package, 'id' | 'hospitalId' | 'slug' | 'createdAt'> = {
  name: '', nameMl: null, description: '', descriptionMl: null, treatments: [],
  duration: '7 days', priceFrom: 0, priceTo: null, currency: 'INR',
  includes: ['Accommodation', 'Meals', 'Doctor consultation', 'Daily treatments'], idealFor: [],
  season: ['all'], maxPatients: null, isActive: true, isFeatured: false,
}

export function PackagesClient({ initial }: { initial: Package[] }) {
  const [items, setItems] = useState<Package[]>(initial)
  const [editing, setEditing] = useState<Package | (Omit<Package, 'id'|'hospitalId'|'slug'|'createdAt'> & { id?: string }) | null>(null)

  async function save() {
    if (!editing) return
    const isNew = !('id' in editing) || !editing.id
    const res = await fetch(`/api/hospital/packages${isNew ? '' : '/' + (editing as Package).id}`, {
      method: isNew ? 'POST' : 'PATCH',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(editing),
    })
    if (res.ok) {
      const saved = (await res.json()) as Package
      setItems((it) => isNew ? [saved, ...it] : it.map((x) => x.id === saved.id ? saved : x))
      setEditing(null)
    }
  }
  async function remove(id: string) {
    if (!confirm('Delete this package?')) return
    await fetch(`/api/hospital/packages/${id}`, { method: 'DELETE', credentials: 'include' })
    setItems((it) => it.filter((x) => x.id !== id))
  }
  async function toggleActive(p: Package) {
    const res = await fetch(`/api/hospital/packages/${p.id}`, { method: 'PATCH', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ isActive: !p.isActive }) })
    if (res.ok) { const u = (await res.json()) as Package; setItems((it) => it.map((x) => x.id === u.id ? u : x)) }
  }
  async function toggleFeatured(p: Package) {
    const res = await fetch(`/api/hospital/packages/${p.id}`, { method: 'PATCH', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ isFeatured: !p.isFeatured }) })
    if (res.ok) { const u = (await res.json()) as Package; setItems((it) => it.map((x) => x.id === u.id ? u : x)) }
  }

  return (
    <div className="space-y-4">
      <header className="bg-white border border-gray-100 rounded-card p-4 shadow-card flex items-center justify-between">
        <div><h1 className="font-serif text-xl text-ink">Treatment packages</h1><p className="text-xs text-gray-600">{items.length} package{items.length === 1 ? '' : 's'}</p></div>
        <button onClick={() => setEditing(EMPTY)} className="inline-flex items-center gap-1 px-3 py-1.5 bg-kerala-700 text-white rounded text-sm font-semibold"><Plus className="w-4 h-4" /> New package</button>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {items.map((p) => (
          <article key={p.id} className={'bg-white border rounded-card p-4 shadow-card ' + (p.isActive ? 'border-gray-100' : 'border-gray-200 opacity-70')}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className="font-semibold text-ink">{p.name}</h3>
                <p className="text-xs text-gray-600">{p.duration} · {p.currency} {p.priceFrom.toLocaleString()}{p.priceTo ? ` – ${p.priceTo.toLocaleString()}` : ''}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => toggleFeatured(p)} title="Feature" className={p.isFeatured ? 'text-amber-500' : 'text-gray-400'}><Star className="w-4 h-4" /></button>
                <button onClick={() => setEditing(p)} className="text-gray-500 hover:text-kerala-700"><Edit className="w-4 h-4" /></button>
                <button onClick={() => remove(p.id)} className="text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <p className="text-xs text-gray-700 mt-2 line-clamp-2">{p.description}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {p.treatments.slice(0, 4).map((t) => <span key={t} className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-800 rounded">{t}</span>)}
            </div>
            <div className="mt-3 flex justify-between items-center text-xs">
              <button onClick={() => toggleActive(p)} className={p.isActive ? 'text-emerald-700' : 'text-gray-500'}>● {p.isActive ? 'Active' : 'Inactive'}</button>
              {p.isFeatured && <span className="text-amber-700 font-semibold">FEATURED</span>}
            </div>
          </article>
        ))}
        {items.length === 0 && <p className="text-sm text-gray-500 bg-white border border-gray-100 rounded-card p-8 text-center col-span-2">No packages yet. Add your first one to attract patients.</p>}
      </section>

      {editing && <Editor editing={editing} onChange={setEditing} onSave={save} onClose={() => setEditing(null)} />}
    </div>
  )
}

function Editor({ editing, onChange, onSave, onClose }: {
  editing: Package | (Omit<Package, 'id'|'hospitalId'|'slug'|'createdAt'> & { id?: string })
  onChange: (p: typeof editing) => void; onSave: () => void; onClose: () => void
}) {
  function set<K extends keyof typeof editing>(k: K, v: (typeof editing)[K]) { onChange({ ...editing, [k]: v }) }
  function csv(arr: string[]): string { return arr.join(', ') }
  function fromCsv(v: string): string[] { return v.split(',').map((s) => s.trim()).filter(Boolean) }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-card max-w-2xl w-full p-5 my-8 space-y-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg text-ink">{('id' in editing && editing.id) ? 'Edit package' : 'New package'}</h2>
          <button onClick={onClose}><X className="w-4 h-4" /></button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <L l="Name *"><input className="input" value={editing.name} onChange={(e) => set('name', e.target.value)} /></L>
          <L l="Name (Malayalam)"><input className="input" dir="auto" value={editing.nameMl ?? ''} onChange={(e) => set('nameMl', e.target.value || null)} /></L>
          <L l="Duration"><input className="input" value={editing.duration} onChange={(e) => set('duration', e.target.value)} placeholder="7 days" /></L>
          <L l="Currency"><input className="input" value={editing.currency} onChange={(e) => set('currency', e.target.value.toUpperCase())} maxLength={4} /></L>
          <L l="Price from"><input type="number" className="input" value={editing.priceFrom} onChange={(e) => set('priceFrom', Number(e.target.value))} /></L>
          <L l="Price to (optional)"><input type="number" className="input" value={editing.priceTo ?? ''} onChange={(e) => set('priceTo', e.target.value ? Number(e.target.value) : null)} /></L>
        </div>
        <L l="Description"><textarea rows={3} className="input" value={editing.description} onChange={(e) => set('description', e.target.value)} /></L>
        <L l="Treatments (comma-separated)"><input className="input" value={csv(editing.treatments)} onChange={(e) => set('treatments', fromCsv(e.target.value))} placeholder="Pizhichil, Njavarakizhi, Sirodhara" /></L>
        <L l="Includes (comma-separated)"><input className="input" value={csv(editing.includes)} onChange={(e) => set('includes', fromCsv(e.target.value))} placeholder="Accommodation, Meals, Doctor consultation" /></L>
        <L l="Ideal for (comma-separated)"><input className="input" value={csv(editing.idealFor)} onChange={(e) => set('idealFor', fromCsv(e.target.value))} placeholder="Arthritis, Stress, Rejuvenation" /></L>
        <L l="Season (comma-separated)"><input className="input" value={csv(editing.season)} onChange={(e) => set('season', fromCsv(e.target.value))} placeholder="all, karkidaka, winter" /></L>
        <div className="grid grid-cols-2 gap-3">
          <L l="Max patients (optional)"><input type="number" className="input" value={editing.maxPatients ?? ''} onChange={(e) => set('maxPatients', e.target.value ? Number(e.target.value) : null)} /></L>
          <div className="flex items-end gap-3">
            <label className="inline-flex items-center gap-1.5 text-sm"><input type="checkbox" checked={editing.isActive} onChange={(e) => set('isActive', e.target.checked)} /> Active</label>
            <label className="inline-flex items-center gap-1.5 text-sm"><input type="checkbox" checked={editing.isFeatured} onChange={(e) => set('isFeatured', e.target.checked)} /> Featured</label>
          </div>
        </div>
        <button onClick={onSave} className="w-full inline-flex justify-center items-center gap-1.5 px-4 py-2 bg-kerala-700 hover:bg-kerala-800 text-white rounded font-semibold"><Save className="w-4 h-4" /> Save</button>
        <style jsx global>{`.input{width:100%;border:1px solid #e5e7eb;border-radius:0.375rem;padding:0.5rem 0.75rem;font-size:14px;background:white}.input:focus{outline:none;box-shadow:0 0 0 1px #155228;border-color:#155228}`}</style>
      </div>
    </div>
  )
}

function L({ l, children }: { l: string; children: React.ReactNode }) {
  return <label className="block"><span className="block text-xs font-medium text-gray-700 mb-1">{l}</span>{children}</label>
}
