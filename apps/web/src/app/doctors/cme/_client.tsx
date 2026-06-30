'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Download } from 'lucide-react'

type Item = { id: string; description: string; source: string; credits: number; earnedAt: string; sourceRefId: string | null }
type Resp = { items: Item[]; totalCredits: number; thisYearCredits: number; eventsAttended: number }

const CATS = ['conference', 'workshop', 'webinar', 'online_course', 'publication', 'other'] as const
const TARGET = 30

export function CmeClient() {
  const [data, setData] = useState<Resp | null>(null)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ eventName: '', organizer: '', date: new Date().toISOString().slice(0, 10), credits: '1', category: 'conference', certificateUrl: '', notes: '' })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function load() {
    const r = await fetch('/api/cme', { credentials: 'include' })
    if (r.ok) setData(await r.json())
  }
  useEffect(() => { void load() }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(''); setBusy(true)
    const r = await fetch('/api/cme', {
      method: 'POST', credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...form, credits: parseFloat(form.credits) }),
    })
    if (!r.ok) { setErr((await r.json().catch(() => ({}))).error ?? 'Failed'); setBusy(false); return }
    setOpen(false)
    setForm({ eventName: '', organizer: '', date: new Date().toISOString().slice(0, 10), credits: '1', category: 'conference', certificateUrl: '', notes: '' })
    await load()
    setBusy(false)
  }
  async function remove(id: string) {
    if (!confirm('Delete this entry?')) return
    await fetch(`/api/cme/${id}`, { method: 'DELETE', credentials: 'include' })
    await load()
  }
  function exportCsv() {
    if (!data) return
    const rows = [['Date', 'Event', 'Category', 'Credits', 'Certificate URL']]
    for (const i of data.items) rows.push([new Date(i.earnedAt).toISOString().slice(0, 10), i.description, i.source, String(i.credits), i.sourceRefId ?? ''])
    const csv = rows.map((r) => r.map((c) => `"${(c ?? '').toString().replace(/"/g, '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a'); a.href = url; a.download = `cme-credits-${Date.now()}.csv`; a.click(); URL.revokeObjectURL(url)
  }

  if (!data) return <p className="mt-6 text-sm text-gray-500">Loading…</p>

  const pct = Math.min(100, Math.round((data.thisYearCredits / TARGET) * 100))

  return (
    <div className="mt-6 space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="This year" value={data.thisYearCredits.toFixed(1)} sub="credits" />
        <Stat label="All time"  value={data.totalCredits.toFixed(1)} sub="credits" />
        <Stat label="Events"    value={String(data.eventsAttended)} />
        <Stat label="Target"    value={`${TARGET}`} sub="cycle" />
      </div>

      <div className="bg-white border border-gray-100 rounded-card p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-ink">KSMC renewal cycle progress</p>
          <p className="text-xs text-gray-500">{pct}%</p>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-2 bg-kerala-600 rounded-full" style={{ width: pct + '%' }} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1 px-3 py-2 bg-kerala-700 text-white text-sm font-semibold rounded"><Plus className="w-4 h-4" /> Log CME</button>
        <button onClick={exportCsv} disabled={data.items.length === 0} className="inline-flex items-center gap-1 px-3 py-2 border border-gray-200 hover:bg-gray-50 text-sm rounded disabled:opacity-50"><Download className="w-4 h-4" /> Export CSV</button>
      </div>

      {open && (
        <form onSubmit={submit} className="bg-white border border-kerala-200 rounded-card p-4 space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <input required placeholder="Event name *" value={form.eventName}  onChange={(e) => setForm({ ...form, eventName: e.target.value })} className="border border-gray-200 rounded px-2 py-1.5 text-sm" />
            <input          placeholder="Organizer"     value={form.organizer}  onChange={(e) => setForm({ ...form, organizer: e.target.value })} className="border border-gray-200 rounded px-2 py-1.5 text-sm" />
            <input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="border border-gray-200 rounded px-2 py-1.5 text-sm" />
            <input required type="number" step="0.5" min="0" placeholder="Credits *" value={form.credits} onChange={(e) => setForm({ ...form, credits: e.target.value })} className="border border-gray-200 rounded px-2 py-1.5 text-sm" />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="border border-gray-200 rounded px-2 py-1.5 text-sm">
              {CATS.map((c) => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
            </select>
            <input placeholder="Certificate URL (optional)" value={form.certificateUrl} onChange={(e) => setForm({ ...form, certificateUrl: e.target.value })} className="border border-gray-200 rounded px-2 py-1.5 text-sm" />
          </div>
          <textarea rows={2} placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full border border-gray-200 rounded p-2 text-sm" />
          {err && <p className="text-xs text-rose-700">{err}</p>}
          <div className="flex gap-2">
            <button disabled={busy} className="px-4 py-1.5 bg-kerala-700 text-white text-sm font-semibold rounded disabled:opacity-50">{busy ? 'Saving…' : 'Save'}</button>
            <button type="button" onClick={() => setOpen(false)} className="px-3 py-1.5 text-sm text-gray-600 hover:text-kerala-700">Cancel</button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto bg-white border border-gray-100 rounded-card">
        <table className="w-full text-sm">
          <thead className="bg-cream/60">
            <tr><th className="px-3 py-2 text-left text-xs uppercase tracking-wider text-gray-600">Date</th>
                <th className="px-3 py-2 text-left text-xs uppercase tracking-wider text-gray-600">Event</th>
                <th className="px-3 py-2 text-left text-xs uppercase tracking-wider text-gray-600 hidden md:table-cell">Category</th>
                <th className="px-3 py-2 text-right text-xs uppercase tracking-wider text-gray-600">Credits</th>
                <th className="px-3 py-2 text-right text-xs uppercase tracking-wider text-gray-600"></th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.items.length === 0 && <tr><td colSpan={5} className="px-3 py-6 text-center text-gray-500 text-sm">No CME entries yet.</td></tr>}
            {data.items.map((i) => (
              <tr key={i.id}>
                <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{new Date(i.earnedAt).toLocaleDateString()}</td>
                <td className="px-3 py-2"><p className="font-semibold text-ink truncate max-w-md">{i.description.split(' — ')[0]}</p>
                  {i.sourceRefId && <a href={i.sourceRefId} target="_blank" rel="noreferrer" className="text-xs text-kerala-700 hover:underline">Certificate</a>}</td>
                <td className="px-3 py-2 hidden md:table-cell text-xs text-gray-600 capitalize">{i.source.replace(/_/g, ' ')}</td>
                <td className="px-3 py-2 text-right font-semibold">{i.credits}</td>
                <td className="px-3 py-2 text-right"><button onClick={() => remove(i.id)} className="text-rose-600 hover:bg-rose-50 p-1 rounded" aria-label="Delete"><Trash2 className="w-4 h-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-card p-3">
      <p className="text-[10px] uppercase tracking-wider text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-ink leading-tight">{value}{sub && <span className="text-xs text-gray-500 font-normal ml-1">{sub}</span>}</p>
    </div>
  )
}
