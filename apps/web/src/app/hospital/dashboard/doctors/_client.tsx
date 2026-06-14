'use client'

import { useState } from 'react'
import { Search, Trash2, UserPlus, Send, ShieldCheck } from 'lucide-react'

export type Link = {
  id: string; hospitalId: string; doctorId: string; role: string | null; position: number
  doctor: { id: string; name: string; specialization: string; district: string; ccimVerified: boolean; qualification: string | null; photoUrl: string | null }
}

type DoctorHit = { id: string; name: string; specialization: string; district: string; ccimVerified: boolean }

export function DoctorsClient({ initial }: { initial: Link[] }) {
  const [links, setLinks] = useState<Link[]>(initial)
  const [q, setQ] = useState('')
  const [hits, setHits] = useState<DoctorHit[]>([])
  const [busy, setBusy] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteSent, setInviteSent] = useState(false)

  async function search() {
    if (!q.trim()) return
    setBusy(true)
    try {
      const res = await fetch(`/api/hospital/doctors/search?q=${encodeURIComponent(q)}`, { credentials: 'include' })
      if (res.ok) setHits(await res.json())
    } finally { setBusy(false) }
  }
  async function link(doctorId: string, role: string | null = null) {
    const res = await fetch('/api/hospital/doctors/link', { method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ doctorId, role, position: links.length }) })
    if (res.ok) {
      const fresh = await fetch('/api/hospital/doctors', { credentials: 'include' })
      if (fresh.ok) setLinks(await fresh.json())
      setHits([]); setQ('')
    }
  }
  async function unlink(doctorId: string) {
    if (!confirm('Remove this doctor from your team?')) return
    await fetch(`/api/hospital/doctors/link/${doctorId}`, { method: 'DELETE', credentials: 'include' })
    setLinks((x) => x.filter((l) => l.doctorId !== doctorId))
  }
  async function changeRole(doctorId: string, role: string) {
    await fetch('/api/hospital/doctors/link', { method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ doctorId, role }) })
    setLinks((x) => x.map((l) => l.doctorId === doctorId ? { ...l, role } : l))
  }
  function sendInvite() {
    // Send email-based invite link. Until SMTP wiring lands, we copy a pre-filled invite to clipboard.
    const text = `Join AyurConnect and connect with our hospital: ${typeof window !== 'undefined' ? window.location.origin : ''}/register/doctor?invite=hospital`
    navigator.clipboard?.writeText(`${text}\n\n— Sent to: ${inviteEmail}`)
    setInviteSent(true); window.setTimeout(() => setInviteSent(false), 3000)
  }

  return (
    <div className="space-y-4">
      <header className="bg-white border border-gray-100 rounded-card p-4 shadow-card">
        <h1 className="font-serif text-xl text-ink">Doctor team</h1>
        <p className="text-xs text-gray-600">Showcase your physicians on the public profile. Chief physician appears first.</p>
      </header>

      <article className="bg-white border border-gray-100 rounded-card p-4 shadow-card">
        <h2 className="font-serif text-base text-ink">Link an existing AyurConnect doctor</h2>
        <div className="mt-2 flex gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && search()} placeholder="Search by name or TCMC #" className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm" />
          <button onClick={search} disabled={busy} className="inline-flex items-center gap-1 px-3 py-2 bg-kerala-700 text-white rounded text-sm font-semibold disabled:opacity-50"><Search className="w-4 h-4" /> Search</button>
        </div>
        {hits.length > 0 && (
          <ul className="mt-3 space-y-1">
            {hits.map((h) => (
              <li key={h.id} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2 text-sm">
                <div><p className="font-semibold text-ink">{h.name}{h.ccimVerified && <ShieldCheck className="inline w-3.5 h-3.5 ml-1 text-emerald-600" />}</p><p className="text-xs text-gray-600">{h.specialization} · {h.district}</p></div>
                <button onClick={() => link(h.id)} className="inline-flex items-center gap-1 px-2.5 py-1 bg-kerala-700 text-white rounded text-xs"><UserPlus className="w-3.5 h-3.5" /> Link</button>
              </li>
            ))}
          </ul>
        )}
      </article>

      <article className="bg-white border border-gray-100 rounded-card p-4 shadow-card">
        <h2 className="font-serif text-base text-ink">Invite a new doctor</h2>
        <p className="text-xs text-gray-600">Send an invitation. Once they register on AyurConnect, you can link them.</p>
        <div className="mt-2 flex gap-2">
          <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="doctor@example.com" className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm" />
          <button onClick={sendInvite} disabled={!inviteEmail.includes('@')} className="inline-flex items-center gap-1 px-3 py-2 bg-amber-600 text-white rounded text-sm disabled:opacity-50"><Send className="w-4 h-4" /> {inviteSent ? 'Copied!' : 'Copy invite'}</button>
        </div>
      </article>

      <section className="space-y-2">
        <h2 className="font-serif text-lg text-ink">Your team ({links.length})</h2>
        {links.map((l) => (
          <article key={l.id} className="bg-white border border-gray-100 rounded-card p-3 shadow-card flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-kerala-50 flex items-center justify-center text-kerala-700 font-bold flex-shrink-0">
              {l.doctor.photoUrl ? /* eslint-disable-next-line @next/next/no-img-element */
                <img src={l.doctor.photoUrl} alt="" className="w-full h-full rounded-full object-cover" />
                : l.doctor.name.split(' ').map((s) => s[0]).slice(0, 2).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-ink truncate">{l.doctor.name}{l.doctor.ccimVerified && <ShieldCheck className="inline w-3.5 h-3.5 ml-1 text-emerald-600" />}</p>
              <p className="text-xs text-gray-600">{l.doctor.specialization} · {l.doctor.district}</p>
            </div>
            <select value={l.role ?? ''} onChange={(e) => changeRole(l.doctorId, e.target.value)} className="text-xs border border-gray-200 rounded px-2 py-1">
              <option value="">— role —</option><option>Chief Physician</option><option>Senior Consultant</option><option>Consultant</option><option>Resident</option>
            </select>
            <a href={`/doctors/${l.doctorId}`} target="_blank" rel="noreferrer" className="text-xs text-kerala-700 hover:underline">View →</a>
            <button onClick={() => unlink(l.doctorId)} className="text-red-600"><Trash2 className="w-4 h-4" /></button>
          </article>
        ))}
        {links.length === 0 && <p className="text-sm text-gray-500 bg-white border border-gray-100 rounded-card p-8 text-center">No doctors linked yet.</p>}
      </section>
    </div>
  )
}
