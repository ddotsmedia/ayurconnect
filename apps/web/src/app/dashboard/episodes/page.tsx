'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Loader2, ChevronRight, Activity, ShieldCheck, AlertCircle } from 'lucide-react'

type Episode = {
  id: string; condition: string; conditionSlug: string | null; status: 'active' | 'completed' | 'paused' | 'abandoned'
  startDate: string; endDate: string | null; protocolNotes: string | null
  consentForResearch: boolean
  _count: { logs: number }
}

export default function EpisodesPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [loading, setLoading]   = useState(true)
  const [err, setErr]           = useState<string | null>(null)
  const [showNew, setShowNew]   = useState(false)
  const [form, setForm] = useState({ condition: '', protocolNotes: '', consentForResearch: false })

  async function load() {
    setLoading(true); setErr(null)
    try {
      const r = await fetch('/api/episodes')
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? `HTTP ${r.status}`)
      const j = await r.json() as { episodes: Episode[] }
      setEpisodes(j.episodes)
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)) } finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [])

  async function create() {
    if (!form.condition.trim()) { setErr('Condition required'); return }
    try {
      const r = await fetch('/api/episodes', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? `HTTP ${r.status}`)
      setShowNew(false); setForm({ condition: '', protocolNotes: '', consentForResearch: false })
      void load()
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)) }
  }

  return (
    <main className="space-y-6">
      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-serif text-2xl text-ink">Treatment progress</h1>
          <p className="text-sm text-muted mt-1">Track symptom severity over the course of a treatment. Daily check-ins build a trend you and your doctor can read.</p>
        </div>
        <button onClick={() => setShowNew(true)} className="inline-flex items-center gap-1.5 px-4 py-2 bg-kerala-700 hover:bg-kerala-800 text-white rounded text-sm font-semibold">
          <Plus className="w-4 h-4" /> Start a new episode
        </button>
      </header>

      {err && (
        <div className="p-3 rounded bg-red-50 border border-red-100 text-sm text-red-800 inline-flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5" /> {err}
        </div>
      )}

      {loading && <Loader2 className="w-5 h-5 animate-spin text-kerala-700" />}

      {!loading && episodes.length === 0 && (
        <div className="bg-white border border-gray-100 rounded-card p-10 text-center shadow-card">
          <Activity className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-700">No episodes yet.</p>
          <p className="text-xs text-gray-500 mt-1">Start one when you begin a new treatment — log daily, and you&apos;ll have weeks of trend data to share with your doctor.</p>
        </div>
      )}

      {!loading && episodes.length > 0 && (
        <ul className="space-y-3">
          {episodes.map((ep) => (
            <li key={ep.id}>
              <Link href={`/dashboard/episodes/${ep.id}`} className="block bg-white border border-gray-100 rounded-card p-5 shadow-card hover:shadow-cardLg transition-shadow">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-serif text-lg text-ink">{ep.condition}</h3>
                    <p className="text-xs text-muted mt-0.5">
                      Started {new Date(ep.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} ·
                      {' '}{ep._count.logs} log{ep._count.logs === 1 ? '' : 's'} ·
                      {' '}<span className="capitalize">{ep.status}</span>
                    </p>
                    {ep.consentForResearch && (
                      <p className="text-[10px] uppercase tracking-wider text-emerald-700 inline-flex items-center gap-1 mt-2">
                        <ShieldCheck className="w-3 h-3" /> Contributing to anonymized research
                      </p>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {showNew && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowNew(false)}>
          <div className="bg-white rounded-card max-w-md w-full p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-serif text-lg text-ink">Start a treatment episode</h2>
            <input
              className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-kerala-700"
              placeholder="Condition (e.g. PCOS, arthritis, IBS)"
              value={form.condition}
              onChange={(e) => setForm({ ...form, condition: e.target.value })}
            />
            <textarea
              className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-kerala-700 min-h-[80px]"
              placeholder="Protocol notes (optional) — what was prescribed, by whom, for how long"
              maxLength={2000}
              value={form.protocolNotes}
              onChange={(e) => setForm({ ...form, protocolNotes: e.target.value })}
            />
            <label className="flex items-start gap-2 text-xs text-gray-700">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={form.consentForResearch}
                onChange={(e) => setForm({ ...form, consentForResearch: e.target.checked })}
              />
              <span>
                <strong>Anonymized research opt-in.</strong> Allow my anonymized severity scores to contribute to aggregated outcome stats on /research. No personal information is ever shared. You can turn this off any time.
              </span>
            </label>
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => setShowNew(false)} className="px-3 py-1.5 text-xs text-gray-700">Cancel</button>
              <button onClick={create} className="px-4 py-1.5 bg-kerala-700 hover:bg-kerala-800 text-white rounded text-xs font-semibold">Start tracking</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
