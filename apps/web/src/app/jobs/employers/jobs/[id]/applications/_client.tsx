'use client'

import { useState } from 'react'
import { Calendar, X } from 'lucide-react'

export type App = {
  id: string; status: string; appliedAt: string; matchScore: number | null
  candidate: { id: string; fullName: string; headline: string | null; currentLocation: string | null; totalExperience: number; specializations: string[]; languages: string[] }
}

const COLS: Array<{ key: string; label: string; color: string }> = [
  { key: 'applied',             label: 'Applied',     color: 'bg-amber-50 border-amber-200' },
  { key: 'viewed',              label: 'Viewed',      color: 'bg-blue-50 border-blue-200' },
  { key: 'shortlisted',         label: 'Shortlisted', color: 'bg-emerald-50 border-emerald-200' },
  { key: 'interview_scheduled', label: 'Interview',   color: 'bg-purple-50 border-purple-200' },
  { key: 'offered',             label: 'Offered',     color: 'bg-cyan-50 border-cyan-200' },
  { key: 'hired',               label: 'Hired',       color: 'bg-kerala-50 border-kerala-200' },
]

export function AtsClient({ initial }: { initial: App[] }) {
  const [apps, setApps] = useState(initial)
  const [interview, setInterview] = useState<App | null>(null)
  async function move(id: string, status: string) {
    const r = await fetch(`/api/jobs-portal/applications/${id}`, { method: 'PATCH', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status }) })
    if (r.ok) setApps((x) => x.map((a) => a.id === id ? { ...a, status } : a))
  }

  async function schedule(payload: { scheduledAt: string; duration: number; type: string; meetingLink: string; location: string; interviewers: string }) {
    if (!interview) return
    const r = await fetch(`/api/jobs-portal/applications/${interview.id}/interview`, {
      method: 'POST', credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        scheduledAt: payload.scheduledAt,
        duration: payload.duration,
        type: payload.type,
        meetingLink: payload.meetingLink || null,
        location: payload.location || null,
        interviewerNames: payload.interviewers.split(',').map((s) => s.trim()).filter(Boolean),
      }),
    })
    if (r.ok) {
      setApps((x) => x.map((a) => a.id === interview.id ? { ...a, status: 'interview_scheduled' } : a))
      setInterview(null)
    }
  }

  return (
    <>
    {interview && <ScheduleModal app={interview} onClose={() => setInterview(null)} onSubmit={schedule} />}
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {COLS.map((col) => {
        const items = apps.filter((a) => a.status === col.key)
        return (
          <div key={col.key} className={'border rounded-card p-2 ' + col.color}>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-700 px-1">{col.label} <span className="text-gray-500">({items.length})</span></p>
            <ul className="mt-2 space-y-2">
              {items.map((a) => (
                <li key={a.id} className="bg-white border border-gray-100 rounded p-2 text-xs">
                  <p className="font-semibold text-ink truncate">{a.candidate.fullName}</p>
                  <p className="text-gray-600 truncate">{a.candidate.headline ?? '—'}</p>
                  <p className="text-[10px] text-gray-500">{a.candidate.currentLocation ?? '—'} · {a.candidate.totalExperience}y</p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {COLS.filter((c) => c.key !== col.key).map((c) => (
                      <button key={c.key} onClick={() => move(a.id, c.key)} className="text-[9px] px-1.5 py-0.5 bg-gray-100 hover:bg-gray-200 rounded">→ {c.label}</button>
                    ))}
                    {a.status === 'shortlisted' && (
                      <button onClick={() => setInterview(a)} className="text-[9px] px-1.5 py-0.5 bg-purple-600 text-white hover:bg-purple-700 rounded inline-flex items-center gap-0.5"><Calendar className="w-2.5 h-2.5" /> Schedule</button>
                    )}
                  </div>
                </li>
              ))}
              {items.length === 0 && <li className="text-[10px] text-gray-400 text-center py-2">—</li>}
            </ul>
          </div>
        )
      })}
    </div>
    </>
  )
}

function ScheduleModal({ app, onClose, onSubmit }: { app: App; onClose: () => void; onSubmit: (p: { scheduledAt: string; duration: number; type: string; meetingLink: string; location: string; interviewers: string }) => void }) {
  const [p, setP] = useState({ scheduledAt: '', duration: 30, type: 'video', meetingLink: '', location: '', interviewers: '' })
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-card max-w-md w-full p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg text-ink">Schedule interview · {app.candidate.fullName}</h2>
          <button onClick={onClose} aria-label="Close"><X className="w-4 h-4" /></button>
        </div>
        <label className="block text-xs"><span className="block font-medium text-gray-700 mb-1">Date & time</span><input type="datetime-local" value={p.scheduledAt} onChange={(e) => setP({ ...p, scheduledAt: e.target.value })} className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm" /></label>
        <div className="grid grid-cols-2 gap-2">
          <label className="block text-xs"><span className="block font-medium text-gray-700 mb-1">Duration (min)</span><select value={p.duration} onChange={(e) => setP({ ...p, duration: Number(e.target.value) })} className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm"><option>30</option><option>45</option><option>60</option></select></label>
          <label className="block text-xs"><span className="block font-medium text-gray-700 mb-1">Type</span><select value={p.type} onChange={(e) => setP({ ...p, type: e.target.value })} className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm"><option value="video">Video</option><option value="phone">Phone</option><option value="in_person">In person</option></select></label>
        </div>
        <label className="block text-xs"><span className="block font-medium text-gray-700 mb-1">Meeting link (video)</span><input value={p.meetingLink} onChange={(e) => setP({ ...p, meetingLink: e.target.value })} placeholder="https://" className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm" /></label>
        <label className="block text-xs"><span className="block font-medium text-gray-700 mb-1">Location (in person)</span><input value={p.location} onChange={(e) => setP({ ...p, location: e.target.value })} className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm" /></label>
        <label className="block text-xs"><span className="block font-medium text-gray-700 mb-1">Interviewers (comma-separated)</span><input value={p.interviewers} onChange={(e) => setP({ ...p, interviewers: e.target.value })} className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm" /></label>
        <button disabled={!p.scheduledAt} onClick={() => onSubmit(p)} className="w-full px-4 py-2 bg-kerala-700 hover:bg-kerala-800 text-white rounded text-sm font-semibold disabled:opacity-50">Schedule + notify candidate</button>
      </div>
    </div>
  )
}
