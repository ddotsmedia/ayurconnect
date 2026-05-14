'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FileText, Plus, Heart, MessageCircle, Search } from 'lucide-react'

type Case = {
  id: string; title: string; specialty: string; condition: string
  ayurvedicDiagnosis: string; outcomeAtFollowUp: string | null
  publishedAt: string | null
  author: { id: string; name: string | null; ownedDoctor: { specialization: string; ccimVerified: boolean } | null } | null
  _count: { comments: number; upvotes: number }
}

const SPECS = [
  { id: '',                label: 'All specialties' },
  { id: 'kayachikitsa',    label: 'Kayachikitsa' },
  { id: 'panchakarma',     label: 'Panchakarma' },
  { id: 'prasuti-tantra',  label: "Prasuti Tantra" },
  { id: 'kaumarbhritya',   label: 'Kaumarbhritya' },
  { id: 'manasika',        label: 'Manasika' },
  { id: 'shalakya',        label: 'Shalakya' },
  { id: 'shalya',          label: 'Shalya' },
]

export default function DrCasesIndex() {
  const [cases, setCases]     = useState<Case[]>([])
  const [specialty, setSpec]  = useState('')
  const [q, setQ]             = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const params = new URLSearchParams()
    if (specialty) params.set('specialty', specialty)
    if (q) params.set('q', q)
    params.set('limit', '40')
    const res = await fetch(`/api/dr/cases?${params}`, { credentials: 'include' })
    if (res.ok) {
      const d = await res.json() as { cases: Case[] }
      setCases(d.cases)
    }
    setLoading(false)
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load() }, [specialty])

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-3xl text-kerala-700 inline-flex items-center gap-2"><FileText className="w-7 h-7" /> Clinical cases</h1>
          <p className="text-sm text-muted mt-1">Structured anonymized case sharing. All cases reviewed by admin before publication.</p>
        </div>
        <Link href="/dr/cases/new" className="inline-flex items-center gap-1.5 px-4 py-2 bg-kerala-700 hover:bg-kerala-800 text-white rounded-md text-sm font-semibold"><Plus className="w-4 h-4" /> Share a case</Link>
      </header>

      <form onSubmit={(e) => { e.preventDefault(); void load() }} className="flex gap-2 flex-wrap">
        <div className="flex-1 relative min-w-[260px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title, diagnosis, complaint…" className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-md text-sm" />
        </div>
        <select value={specialty} onChange={(e) => setSpec(e.target.value)} className="border border-gray-200 rounded-md px-3 py-2.5 text-sm bg-white">
          {SPECS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <button type="submit" className="px-4 py-2.5 bg-kerala-700 text-white rounded-md text-sm hover:bg-kerala-800">Search</button>
      </form>

      {loading ? <p className="text-muted">Loading…</p>
        : cases.length === 0 ? <p className="text-muted">No cases yet. Be the first to share.</p>
        : (
          <div className="space-y-3">
            {cases.map((c) => (
              <Link key={c.id} href={`/dr/cases/${c.id}`} className="block bg-white border border-gray-100 rounded-card p-5 shadow-card hover:shadow-cardLg transition-shadow">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h2 className="font-serif text-lg text-ink hover:text-kerala-700">{c.title}</h2>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-kerala-50 text-kerala-700 rounded-full whitespace-nowrap">{c.specialty.replace('-', ' ')}</span>
                </div>
                <p className="text-sm text-gray-700">{c.ayurvedicDiagnosis}</p>
                <p className="text-xs text-muted mt-2">
                  Dr {c.author?.name ?? 'AyurConnect'}{c.author?.ownedDoctor?.ccimVerified ? ' ✓' : ''} · {c.condition}
                  {c.outcomeAtFollowUp && <> · <span className="text-emerald-700">{c.outcomeAtFollowUp.replace('-', ' ')}</span></>}
                </p>
                <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1"><Heart className="w-3 h-3" /> {c._count.upvotes}</span>
                  <span className="inline-flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {c._count.comments}</span>
                  {c.publishedAt && <span>{new Date(c.publishedAt).toLocaleDateString()}</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
    </div>
  )
}
