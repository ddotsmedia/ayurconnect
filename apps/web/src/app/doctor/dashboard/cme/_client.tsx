'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, GraduationCap, Save, X } from 'lucide-react'

type Log = { id: string; eventName: string; organizer: string | null; date: string; credits: number; certificateUrl: string | null; notes: string | null }
type Data = { items: Log[]; yearTotal: number }

const EMPTY = { eventName: '', organizer: '', date: '', credits: 1, certificateUrl: '', notes: '' }

export function CmeClient() {
  const [data, setData] = useState<Data | null>(null)
  const [editing, setEditing] = useState<typeof EMPTY | null>(null)

  useEffect(() => { load() }, [])
  async function load() {
    const r = await fetch('/api/doctor-viral/cme', { credentials: 'include' })
    if (r.ok) setData(await r.json())
  }
  async function save() {
    if (!editing) return
    const res = await fetch('/api/doctor-viral/cme', { method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify(editing) })
    if (res.ok) { setEditing(null); load() }
  }
  async function remove(id: string) {
    if (!confirm('Delete this CME entry?')) return
    await fetch(`/api/doctor-viral/cme/${id}`, { method: 'DELETE', credentials: 'include' })
    load()
  }

  return (
    <div className="space-y-4">
      <header className="bg-white border border-gray-100 rounded-card p-4 shadow-card flex items-center justify-between">
        <div>
          <h1 className="font-serif text-xl text-ink inline-flex items-center gap-2"><GraduationCap className="w-5 h-5 text-kerala-700" /> CME tracker</h1>
          <p className="text-xs text-gray-600">This year: <strong>{data?.yearTotal ?? 0}</strong> credits</p>
        </div>
        <button onClick={() => setEditing({ ...EMPTY, date: new Date().toISOString().slice(0, 10) })} className="inline-flex items-center gap-1 px-3 py-1.5 bg-kerala-700 text-white rounded text-sm font-semibold"><Plus className="w-4 h-4" /> Log CME</button>
      </header>

      <section className="bg-white border border-gray-100 rounded-card shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs text-gray-600 uppercase">
            <tr><th className="px-3 py-2">Date</th><th className="px-3 py-2">Event</th><th className="px-3 py-2">Organizer</th><th className="px-3 py-2 text-right">Credits</th><th /></tr>
          </thead>
          <tbody>
            {(data?.items ?? []).map((l) => (
              <tr key={l.id} className="border-t border-gray-100">
                <td className="px-3 py-2 text-xs">{new Date(l.date).toLocaleDateString('en-GB')}</td>
                <td className="px-3 py-2">{l.eventName}{l.certificateUrl && <a href={l.certificateUrl} target="_blank" rel="noreferrer" className="ml-2 text-[10px] text-kerala-700 hover:underline">cert↗</a>}</td>
                <td className="px-3 py-2 text-xs text-gray-600">{l.organizer ?? '—'}</td>
                <td className="px-3 py-2 text-right font-semibold">{l.credits}</td>
                <td className="px-3 py-2 text-right"><button onClick={() => remove(l.id)} className="text-red-600"><Trash2 className="w-4 h-4" /></button></td>
              </tr>
            ))}
            {(!data || data.items.length === 0) && <tr><td colSpan={5} className="p-8 text-center text-gray-500">No CME logged yet.</td></tr>}
          </tbody>
        </table>
      </section>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-card max-w-md w-full p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between"><h2 className="font-serif text-lg text-ink">Log CME</h2><button onClick={() => setEditing(null)}><X className="w-4 h-4" /></button></div>
            <L l="Event name *"><input className="input" value={editing.eventName} onChange={(e) => setEditing({ ...editing, eventName: e.target.value })} /></L>
            <L l="Organizer"><input className="input" value={editing.organizer} onChange={(e) => setEditing({ ...editing, organizer: e.target.value })} /></L>
            <div className="grid grid-cols-2 gap-2">
              <L l="Date *"><input type="date" className="input" value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} /></L>
              <L l="Credits"><input type="number" step="0.5" className="input" value={editing.credits} onChange={(e) => setEditing({ ...editing, credits: Number(e.target.value) })} /></L>
            </div>
            <L l="Certificate URL"><input className="input" value={editing.certificateUrl} onChange={(e) => setEditing({ ...editing, certificateUrl: e.target.value })} placeholder="https://…" /></L>
            <L l="Notes"><textarea rows={2} className="input" value={editing.notes} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} /></L>
            <button onClick={save} className="w-full inline-flex justify-center items-center gap-1.5 px-4 py-2 bg-kerala-700 text-white rounded font-semibold"><Save className="w-4 h-4" /> Save</button>
            <style jsx global>{`.input{width:100%;border:1px solid #e5e7eb;border-radius:0.375rem;padding:0.5rem 0.75rem;font-size:14px;background:white}.input:focus{outline:none;box-shadow:0 0 0 1px #155228;border-color:#155228}`}</style>
          </div>
        </div>
      )}
    </div>
  )
}

function L({ l, children }: { l: string; children: React.ReactNode }) {
  return <label className="block"><span className="block text-xs font-medium text-gray-700 mb-1">{l}</span>{children}</label>
}
