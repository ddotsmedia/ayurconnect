'use client'

// Family Health Dashboard — sub-profiles a primary account holder manages.
// Common Indian-market pattern: one phone tracks parents/spouse/children.
// Each member has their own dosha + chronic conditions but no login.

import { useEffect, useState } from 'react'
import { Users, Plus, Trash2, Edit3, X, Loader2, Heart } from 'lucide-react'

type Member = {
  id: string
  name: string
  relation: string
  dob: string | null
  gender: string | null
  prakriti: string | null
  conditions: string[]
  notes: string | null
  avatarColor: string | null
  createdAt: string
  updatedAt: string
}

const RELATIONS: Array<{ id: string; label: string }> = [
  { id: 'self',    label: 'Self' },
  { id: 'spouse',  label: 'Spouse' },
  { id: 'parent',  label: 'Parent' },
  { id: 'child',   label: 'Child' },
  { id: 'sibling', label: 'Sibling' },
  { id: 'other',   label: 'Other' },
]
const GENDERS = ['female', 'male', 'other']
const DOSHAS  = ['vata', 'pitta', 'kapha', 'vata-pitta', 'pitta-kapha', 'vata-kapha', 'tridosha']

const RELATION_COLORS: Record<string, string> = {
  self:    'bg-kerala-700',
  spouse:  'bg-rose-600',
  parent:  'bg-amber-600',
  child:   'bg-blue-600',
  sibling: 'bg-purple-600',
  other:   'bg-gray-500',
}

function initials(name: string): string {
  return name.split(/\s+/).slice(0, 2).map((s) => s[0]?.toUpperCase() ?? '').join('') || '?'
}

function emptyForm() {
  return { name: '', relation: 'other', gender: '', prakriti: '', dob: '', conditions: '', notes: '' }
}

export default function FamilyPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/me/family', { credentials: 'include' })
      const data = await res.json() as { members: Member[] }
      setMembers(data.members ?? [])
    } catch (e) { setError(String(e)) } finally { setLoading(false) }
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load() }, [])

  function startEdit(m: Member) {
    setEditingId(m.id)
    setForm({
      name: m.name,
      relation: m.relation,
      gender:   m.gender ?? '',
      prakriti: m.prakriti ?? '',
      dob:      m.dob ? m.dob.slice(0, 10) : '',
      conditions: m.conditions.join(', '),
      notes:    m.notes ?? '',
    })
    setShowForm(true)
  }
  function startNew() {
    setEditingId(null); setForm(emptyForm()); setShowForm(true)
  }

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError(null)
    try {
      const payload = {
        ...form,
        conditions: form.conditions.split(',').map((s) => s.trim()).filter(Boolean),
        gender:   form.gender   || null,
        prakriti: form.prakriti || null,
        dob:      form.dob      || null,
        notes:    form.notes    || null,
      }
      const url = editingId ? `/api/me/family/${editingId}` : '/api/me/family'
      const method = editingId ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(data.error ?? `HTTP ${res.status}`)
      }
      setShowForm(false); await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally { setSaving(false) }
  }

  async function remove(m: Member) {
    if (!confirm(`Remove ${m.name} from your family list?`)) return
    try {
      const res = await fetch(`/api/me/family/${m.id}`, { method: 'DELETE', credentials: 'include' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await load()
    } catch (e) { setError(e instanceof Error ? e.message : String(e)) }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-3xl text-ink">Family Health</h1>
          <p className="text-sm text-muted mt-1">Track your family members&apos; constitution and conditions in one place.</p>
        </div>
        {!showForm && (
          <button onClick={startNew} className="inline-flex items-center gap-2 px-4 py-2 bg-kerala-700 text-white rounded-md text-sm hover:bg-kerala-800">
            <Plus className="w-4 h-4" /> Add family member
          </button>
        )}
      </header>

      {error && <div className="p-3 rounded bg-red-50 border border-red-100 text-red-800 text-sm">{error}</div>}

      {showForm && (
        <form onSubmit={save} className="bg-white border border-gray-100 rounded-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl text-ink">{editingId ? 'Edit family member' : 'New family member'}</h2>
            <button type="button" onClick={() => setShowForm(false)} className="p-1.5 rounded hover:bg-gray-100">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-medium text-gray-700 mb-1 block">Name *</span>
              <input required className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-gray-700 mb-1 block">Relation</span>
              <select className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" value={form.relation} onChange={(e) => setForm({ ...form, relation: e.target.value })}>
                {RELATIONS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-gray-700 mb-1 block">Date of birth</span>
              <input type="date" className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-gray-700 mb-1 block">Gender</span>
              <select className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option value="">—</option>
                {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-gray-700 mb-1 block">Prakriti (Ayurvedic constitution)</span>
              <select className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" value={form.prakriti} onChange={(e) => setForm({ ...form, prakriti: e.target.value })}>
                <option value="">— unknown / take quiz</option>
                {DOSHAS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-gray-700 mb-1 block">Chronic conditions <span className="text-gray-400">(comma-separated)</span></span>
              <input className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" value={form.conditions} onChange={(e) => setForm({ ...form, conditions: e.target.value })} placeholder="diabetes, hypertension, asthma" />
            </label>
          </div>
          <label className="block">
            <span className="text-xs font-medium text-gray-700 mb-1 block">Notes</span>
            <textarea rows={3} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Allergies, regular medications, etc." />
          </label>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">Cancel</button>
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 bg-kerala-700 text-white text-sm rounded-md hover:bg-kerala-800 disabled:opacity-60">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingId ? 'Save changes' : 'Add member'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading…</div>
      ) : members.length === 0 && !showForm ? (
        <div className="text-center py-16 bg-white border border-gray-100 rounded-card">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-muted">No family members added yet.</p>
          <button onClick={startNew} className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-kerala-700 text-white rounded-md text-sm hover:bg-kerala-800">
            <Plus className="w-4 h-4" /> Add your first
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((m) => {
            const relColor = RELATION_COLORS[m.relation] ?? 'bg-gray-500'
            const relLabel = RELATIONS.find((r) => r.id === m.relation)?.label ?? m.relation
            return (
              <article key={m.id} className="bg-white border border-gray-100 rounded-card p-5 shadow-card hover:shadow-cardLg transition-shadow">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-full text-white text-sm font-semibold flex items-center justify-center ${relColor}`}>
                    {initials(m.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-ink truncate">{m.name}</h3>
                    <p className="text-xs text-gray-500">{relLabel}{m.gender ? ` · ${m.gender}` : ''}</p>
                  </div>
                </div>
                {m.prakriti && (
                  <div className="text-xs mb-2"><span className="text-gray-400">Prakriti:</span> <span className="font-medium text-kerala-700">{m.prakriti}</span></div>
                )}
                {m.conditions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {m.conditions.map((c) => (
                      <span key={c} className="px-2 py-0.5 text-[10px] bg-amber-50 text-amber-800 rounded-full border border-amber-200">
                        <Heart className="w-2.5 h-2.5 inline mr-0.5" /> {c}
                      </span>
                    ))}
                  </div>
                )}
                {m.notes && <p className="text-xs text-gray-600 mb-3 line-clamp-3">{m.notes}</p>}
                <div className="flex justify-end gap-1 pt-3 border-t border-gray-100">
                  <button onClick={() => startEdit(m)} className="p-1.5 rounded hover:bg-kerala-50 text-kerala-700" aria-label="Edit">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => remove(m)} className="p-1.5 rounded hover:bg-red-50 text-red-600" aria-label="Remove">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
