'use client'

// Admin editor for the AMAI microsite at /amai. One big form: page-level prose
// + contact scalars, plus add/remove/reorder editors for the repeating lists
// (office bearers, milestones, vision points, core values, strategic issues,
// activities, committees). Saves the whole thing in one PUT /api/amai which
// does a transactional full-replace server-side.

import { useEffect, useState } from 'react'
import { adminApi } from '../../../lib/admin-api'
import { Field, inputClass } from '../../../components/admin/entity-form-shell'

type Bearer    = { name: string; position: string; category: string; photoUrl: string }
type Milestone = { year: string; description: string }
type ListKey   = 'vision' | 'core_value' | 'strategic_issue' | 'activity' | 'committee'

type PageScalars = {
  orgName: string; shortName: string; tagline: string
  heroImageUrl: string; logoUrl: string
  mission: string; aboutText: string; foundedInfo: string
  strategicNote: string; membershipInfo: string
  contactAddress: string; contactPhone: string; contactEmail: string
  websiteUrl: string; registrationInfo: string; copyrightText: string
  published: boolean
}

const EMPTY_PAGE: PageScalars = {
  orgName: 'Ayurveda Medical Association of India', shortName: 'AMAI', tagline: '',
  heroImageUrl: '', logoUrl: '',
  mission: '', aboutText: '', foundedInfo: '',
  strategicNote: '', membershipInfo: '',
  contactAddress: '', contactPhone: '', contactEmail: '',
  websiteUrl: '', registrationInfo: '', copyrightText: '',
  published: true,
}

const BEARER_CATEGORIES = [
  { value: 'executive', label: 'Executive leadership' },
  { value: 'secretary', label: 'Secretary' },
  { value: 'women',     label: 'Women Sub Committee' },
  { value: 'apta',      label: 'APTA (Publication)' },
  { value: 'other',     label: 'Other' },
]

const LIST_META: Array<{ key: ListKey; label: string; placeholder: string }> = [
  { key: 'vision',           label: 'Vision points',     placeholder: 'e.g. Unity of Ayurvedic Physicians' },
  { key: 'core_value',       label: 'Core values',       placeholder: 'e.g. Integrity and Ethical Behavior' },
  { key: 'strategic_issue',  label: 'Strategic issues',  placeholder: 'e.g. Implementation of BAMS credentials (1979)' },
  { key: 'activity',         label: 'Activities & events', placeholder: 'e.g. Monthly APTA journal' },
  { key: 'committee',        label: 'Committees',        placeholder: 'e.g. Kerala State Committee' },
]

const emptyLists = (): Record<ListKey, string[]> =>
  ({ vision: [], core_value: [], strategic_issue: [], activity: [], committee: [] })

function move<T>(arr: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir
  if (j < 0 || j >= arr.length) return arr
  const next = [...arr]
  ;[next[i], next[j]] = [next[j], next[i]]
  return next
}

export default function AmaiAdminPage() {
  const [page, setPage]       = useState<PageScalars>({ ...EMPTY_PAGE })
  const [bearers, setBearers] = useState<Bearer[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [lists, setLists]     = useState<Record<ListKey, string[]>>(emptyLists())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<string | null>(null)

  async function load() {
    setLoading(true); setError(null)
    try {
      const data = await adminApi.get<{
        page: Partial<PageScalars> | null
        officeBearers: Array<Partial<Bearer>>
        milestones: Array<Partial<Milestone>>
        listItems: Array<{ section: string; text: string }>
      }>('/amai')
      setPage({ ...EMPTY_PAGE, ...(data.page ?? {}) })
      setBearers((data.officeBearers ?? []).map((b) => ({
        name: b.name ?? '', position: b.position ?? '',
        category: b.category ?? 'other', photoUrl: b.photoUrl ?? '',
      })))
      setMilestones((data.milestones ?? []).map((m) => ({
        year: m.year ?? '', description: m.description ?? '',
      })))
      const grouped = emptyLists()
      for (const it of data.listItems ?? []) {
        if (it.section in grouped) grouped[it.section as ListKey].push(it.text)
      }
      setLists(grouped)
    } catch (e) { setError(String(e)) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError(null)
    try {
      const listItems = LIST_META.flatMap(({ key }) =>
        lists[key].map((text) => ({ section: key, text })).filter((l) => l.text.trim()),
      )
      await adminApi.put('/amai', {
        page,
        officeBearers: bearers.filter((b) => b.name.trim() && b.position.trim()),
        milestones: milestones.filter((m) => m.year.trim() && m.description.trim()),
        listItems,
      })
      setSavedAt(new Date().toLocaleTimeString())
      await load()
    } catch (err) { setError(String(err)) } finally { setSaving(false) }
  }

  function setField<K extends keyof PageScalars>(k: K, v: PageScalars[K]) {
    setPage((p) => ({ ...p, [k]: v }))
  }

  if (loading) return <div className="text-gray-500">Loading AMAI page…</div>

  return (
    <form onSubmit={save} className="space-y-8 pb-16">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">AMAI Microsite</h1>
          <p className="text-gray-600 mt-1 text-sm">
            Everything on the public <a href="/amai" target="_blank" rel="noreferrer" className="text-kerala-700 hover:underline">/amai</a> page.
            Edits save as one atomic replace.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {savedAt && <span className="text-xs text-green-700">Saved at {savedAt}</span>}
          <button
            type="submit" disabled={saving}
            className="px-5 py-2 bg-kerala-700 text-white rounded text-sm hover:bg-kerala-800 disabled:opacity-50"
          >{saving ? 'Saving…' : 'Save all changes'}</button>
        </div>
      </header>

      {error && <div className="p-3 rounded bg-red-50 text-red-800 text-sm">{error}</div>}

      {/* ── Identity ─────────────────────────────────────────────────── */}
      <section className="bg-white border rounded-lg p-5 space-y-4">
        <h2 className="font-semibold text-lg">Identity</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Field label="Organisation name">
            <input className={inputClass} value={page.orgName} onChange={(e) => setField('orgName', e.target.value)} />
          </Field>
          <Field label="Short name">
            <input className={inputClass} value={page.shortName} onChange={(e) => setField('shortName', e.target.value)} />
          </Field>
          <Field label="Status">
            <label className="flex items-center gap-2 mt-2 text-sm cursor-pointer">
              <input type="checkbox" checked={page.published} onChange={(e) => setField('published', e.target.checked)} />
              Published (visible at /amai)
            </label>
          </Field>
        </div>
        <Field label="Tagline">
          <input className={inputClass} value={page.tagline} onChange={(e) => setField('tagline', e.target.value)}
            placeholder="e.g. To promote Quality Ayurveda for Public health" />
        </Field>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Hero image URL (optional)">
            <input className={inputClass} value={page.heroImageUrl} onChange={(e) => setField('heroImageUrl', e.target.value)} placeholder="https://…" />
          </Field>
          <Field label="Logo URL (optional)">
            <input className={inputClass} value={page.logoUrl} onChange={(e) => setField('logoUrl', e.target.value)} placeholder="https://…" />
          </Field>
        </div>
      </section>

      {/* ── Prose ────────────────────────────────────────────────────── */}
      <section className="bg-white border rounded-lg p-5 space-y-4">
        <h2 className="font-semibold text-lg">About & mission</h2>
        <Field label="Mission statement">
          <textarea rows={2} className={inputClass} value={page.mission} onChange={(e) => setField('mission', e.target.value)} />
        </Field>
        <Field label="About / history (one paragraph per line)">
          <textarea rows={7} className={inputClass} value={page.aboutText} onChange={(e) => setField('aboutText', e.target.value)} />
        </Field>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Founded info (date, place)">
            <textarea rows={3} className={inputClass} value={page.foundedInfo} onChange={(e) => setField('foundedInfo', e.target.value)}
              placeholder="Founded 13 August 1978, Bini Tourist Home, Thrissur…" />
          </Field>
          <Field label="Membership info">
            <textarea rows={3} className={inputClass} value={page.membershipInfo} onChange={(e) => setField('membershipInfo', e.target.value)} />
          </Field>
        </div>
        <Field label="Strategic issues — intro note (the list itself is below)">
          <textarea rows={2} className={inputClass} value={page.strategicNote} onChange={(e) => setField('strategicNote', e.target.value)} />
        </Field>
      </section>

      {/* ── Contact ──────────────────────────────────────────────────── */}
      <section className="bg-white border rounded-lg p-5 space-y-4">
        <h2 className="font-semibold text-lg">Contact & meta</h2>
        <Field label="Postal address">
          <textarea rows={2} className={inputClass} value={page.contactAddress} onChange={(e) => setField('contactAddress', e.target.value)} />
        </Field>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Field label="Phone">
            <input className={inputClass} value={page.contactPhone} onChange={(e) => setField('contactPhone', e.target.value)} />
          </Field>
          <Field label="Email">
            <input className={inputClass} value={page.contactEmail} onChange={(e) => setField('contactEmail', e.target.value)} />
          </Field>
          <Field label="Website URL">
            <input className={inputClass} value={page.websiteUrl} onChange={(e) => setField('websiteUrl', e.target.value)} placeholder="https://ayurveda-amai.org" />
          </Field>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Registration info">
            <input className={inputClass} value={page.registrationInfo} onChange={(e) => setField('registrationInfo', e.target.value)} />
          </Field>
          <Field label="Copyright text">
            <input className={inputClass} value={page.copyrightText} onChange={(e) => setField('copyrightText', e.target.value)}
              placeholder="© 2026 Ayurveda Medical Association of India. All rights reserved." />
          </Field>
        </div>
      </section>

      {/* ── Office bearers ───────────────────────────────────────────── */}
      <section className="bg-white border rounded-lg p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Office bearers <span className="text-gray-400 text-sm font-normal">({bearers.length})</span></h2>
          <button type="button" onClick={() => setBearers([...bearers, { name: '', position: '', category: 'executive', photoUrl: '' }])}
            className="text-xs px-3 py-1.5 border rounded hover:bg-gray-50">+ Add bearer</button>
        </div>
        {bearers.length === 0 && <p className="text-sm text-gray-400">No office bearers yet.</p>}
        {bearers.map((b, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_180px_1fr_auto] gap-2 items-start border-b pb-3 last:border-0">
            <input className={inputClass} placeholder="Name" value={b.name}
              onChange={(e) => setBearers(bearers.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} />
            <input className={inputClass} placeholder="Position" value={b.position}
              onChange={(e) => setBearers(bearers.map((x, j) => j === i ? { ...x, position: e.target.value } : x))} />
            <select className={inputClass} value={b.category}
              onChange={(e) => setBearers(bearers.map((x, j) => j === i ? { ...x, category: e.target.value } : x))}>
              {BEARER_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <input className={inputClass} placeholder="Photo URL (optional)" value={b.photoUrl}
              onChange={(e) => setBearers(bearers.map((x, j) => j === i ? { ...x, photoUrl: e.target.value } : x))} />
            <div className="flex gap-1">
              <button type="button" onClick={() => setBearers(move(bearers, i, -1))} className="px-2 py-1 text-xs border rounded hover:bg-gray-50">↑</button>
              <button type="button" onClick={() => setBearers(move(bearers, i, 1))} className="px-2 py-1 text-xs border rounded hover:bg-gray-50">↓</button>
              <button type="button" onClick={() => setBearers(bearers.filter((_, j) => j !== i))} className="px-2 py-1 text-xs border rounded text-red-600 hover:bg-red-50">✕</button>
            </div>
          </div>
        ))}
      </section>

      {/* ── Milestones ───────────────────────────────────────────────── */}
      <section className="bg-white border rounded-lg p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Milestones <span className="text-gray-400 text-sm font-normal">({milestones.length})</span></h2>
          <button type="button" onClick={() => setMilestones([...milestones, { year: '', description: '' }])}
            className="text-xs px-3 py-1.5 border rounded hover:bg-gray-50">+ Add milestone</button>
        </div>
        {milestones.length === 0 && <p className="text-sm text-gray-400">No milestones yet.</p>}
        {milestones.map((m, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-[120px_1fr_auto] gap-2 items-start border-b pb-3 last:border-0">
            <input className={inputClass} placeholder="Year" value={m.year}
              onChange={(e) => setMilestones(milestones.map((x, j) => j === i ? { ...x, year: e.target.value } : x))} />
            <input className={inputClass} placeholder="What happened" value={m.description}
              onChange={(e) => setMilestones(milestones.map((x, j) => j === i ? { ...x, description: e.target.value } : x))} />
            <div className="flex gap-1">
              <button type="button" onClick={() => setMilestones(move(milestones, i, -1))} className="px-2 py-1 text-xs border rounded hover:bg-gray-50">↑</button>
              <button type="button" onClick={() => setMilestones(move(milestones, i, 1))} className="px-2 py-1 text-xs border rounded hover:bg-gray-50">↓</button>
              <button type="button" onClick={() => setMilestones(milestones.filter((_, j) => j !== i))} className="px-2 py-1 text-xs border rounded text-red-600 hover:bg-red-50">✕</button>
            </div>
          </div>
        ))}
      </section>

      {/* ── Simple text lists ────────────────────────────────────────── */}
      {LIST_META.map(({ key, label, placeholder }) => {
        const items = lists[key]
        const set = (next: string[]) => setLists({ ...lists, [key]: next })
        return (
          <section key={key} className="bg-white border rounded-lg p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg">{label} <span className="text-gray-400 text-sm font-normal">({items.length})</span></h2>
              <button type="button" onClick={() => set([...items, ''])}
                className="text-xs px-3 py-1.5 border rounded hover:bg-gray-50">+ Add</button>
            </div>
            {items.length === 0 && <p className="text-sm text-gray-400">None yet.</p>}
            {items.map((text, i) => (
              <div key={i} className="grid grid-cols-[1fr_auto] gap-2 items-start">
                <input className={inputClass} placeholder={placeholder} value={text}
                  onChange={(e) => set(items.map((x, j) => j === i ? e.target.value : x))} />
                <div className="flex gap-1">
                  <button type="button" onClick={() => set(move(items, i, -1))} className="px-2 py-1 text-xs border rounded hover:bg-gray-50">↑</button>
                  <button type="button" onClick={() => set(move(items, i, 1))} className="px-2 py-1 text-xs border rounded hover:bg-gray-50">↓</button>
                  <button type="button" onClick={() => set(items.filter((_, j) => j !== i))} className="px-2 py-1 text-xs border rounded text-red-600 hover:bg-red-50">✕</button>
                </div>
              </div>
            ))}
          </section>
        )
      })}

      <div className="flex items-center gap-3 sticky bottom-0 bg-gray-50 py-3 border-t">
        <button type="submit" disabled={saving}
          className="px-5 py-2 bg-kerala-700 text-white rounded text-sm hover:bg-kerala-800 disabled:opacity-50">
          {saving ? 'Saving…' : 'Save all changes'}
        </button>
        {savedAt && <span className="text-xs text-green-700">Saved at {savedAt}</span>}
        {error && <span className="text-xs text-red-700">{error}</span>}
      </div>
    </form>
  )
}
