'use client'

import { useState } from 'react'
import { Plus, Trash2, Bell, Save } from 'lucide-react'

export type Alert = { id: string; keywords: string | null; specialization: string | null; location: string | null; jobType: string | null; salaryMin: number | null; frequency: string; channel: string; isActive: boolean }

export function AlertsClient({ initial }: { initial: Alert[] }) {
  const [items, setItems] = useState(initial)
  const [form, setForm] = useState({ keywords: '', specialization: '', location: '', jobType: '', salaryMin: '', frequency: 'daily', channel: 'email' })
  const [busy, setBusy] = useState(false)

  async function create(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      const r = await fetch('/api/jobs-portal/alerts', {
        method: 'POST', credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...form, salaryMin: form.salaryMin ? Number(form.salaryMin) : null }),
      })
      if (r.ok) {
        const u = await r.json() as Alert
        setItems((x) => [u, ...x])
        setForm({ keywords: '', specialization: '', location: '', jobType: '', salaryMin: '', frequency: 'daily', channel: 'email' })
      }
    } finally { setBusy(false) }
  }
  async function toggle(a: Alert) {
    const r = await fetch(`/api/jobs-portal/alerts/${a.id}`, { method: 'PATCH', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ isActive: !a.isActive }) })
    if (r.ok) setItems((x) => x.map((y) => y.id === a.id ? { ...y, isActive: !a.isActive } : y))
  }
  async function remove(id: string) {
    if (!confirm('Delete this alert?')) return
    await fetch(`/api/jobs-portal/alerts/${id}`, { method: 'DELETE', credentials: 'include' })
    setItems((x) => x.filter((y) => y.id !== id))
  }

  return (
    <div className="mt-5 space-y-4">
      <form onSubmit={create} className="bg-white border border-gray-100 rounded-card p-4 shadow-card space-y-2">
        <h2 className="font-serif text-base text-ink inline-flex items-center gap-1.5"><Plus className="w-4 h-4" /> New alert</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <input placeholder="Keywords" className="input" value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} />
          <input placeholder="Specialization" className="input" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} />
          <input placeholder="Location" className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <select className="input" value={form.jobType} onChange={(e) => setForm({ ...form, jobType: e.target.value })}><option value="">Any job type</option><option>full_time</option><option>part_time</option><option>contract</option><option>locum</option><option>telemedicine</option></select>
          <input type="number" placeholder="Min salary" className="input" value={form.salaryMin} onChange={(e) => setForm({ ...form, salaryMin: e.target.value })} />
          <select className="input" value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}><option value="instant">Instant</option><option value="daily">Daily</option><option value="weekly">Weekly</option></select>
          <select className="input col-span-2" value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}><option value="email">Email</option><option value="whatsapp">WhatsApp</option><option value="both">Both</option></select>
        </div>
        <button disabled={busy} className="inline-flex items-center gap-1 px-4 py-2 bg-kerala-700 text-white rounded text-sm font-semibold disabled:opacity-50"><Save className="w-3.5 h-3.5" /> Save alert</button>
        <style jsx global>{`.input{width:100%;border:1px solid #e5e7eb;border-radius:0.375rem;padding:0.5rem 0.75rem;font-size:14px;background:white}.input:focus{outline:none;box-shadow:0 0 0 1px #155228;border-color:#155228}`}</style>
      </form>

      <ul className="space-y-2">
        {items.length === 0 && <li className="text-sm text-gray-500 bg-white border border-gray-100 rounded-card p-6 text-center">No alerts yet.</li>}
        {items.map((a) => (
          <li key={a.id} className={'border rounded-card p-3 text-sm flex items-center justify-between gap-2 ' + (a.isActive ? 'bg-white border-gray-100' : 'bg-gray-50 border-gray-200 opacity-70')}>
            <div className="flex items-center gap-2"><Bell className="w-4 h-4 text-kerala-700" />
              <span>{[a.specialization, a.location, a.keywords].filter(Boolean).join(' · ') || 'All jobs'} · {a.frequency} · {a.channel}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => toggle(a)} className="text-xs text-gray-700 hover:underline">{a.isActive ? 'Pause' : 'Activate'}</button>
              <button onClick={() => remove(a.id)} className="text-red-600"><Trash2 className="w-4 h-4" /></button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
