import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { headers } from 'next/headers'
import { API_INTERNAL as API } from '../../../../lib/server-fetch'
import { DrTrendChart } from './_chart'

type Log = { id: string; date: string; severity: number; energy: number | null; sleepQuality: number | null; mood: number | null; note: string | null }
type Episode = {
  id: string; condition: string; conditionSlug: string | null
  status: string; startDate: string; endDate: string | null
  protocolNotes: string | null
  patient: { id: string; name: string | null; email: string }
  logs: Log[]
}

export const metadata = {
  title: 'Episode trend | Doctor Hub',
  robots: { index: false, follow: false },
}

async function fetchEpisode(id: string): Promise<Episode | null> {
  const hdrs = await headers()
  const cookie = hdrs.get('cookie') ?? ''
  try {
    const r = await fetch(`${API}/dr/episodes/${id}`, { headers: { cookie }, cache: 'no-store' })
    if (!r.ok) return null
    const j = await r.json() as { episode?: Episode }
    return j.episode ?? null
  } catch { return null }
}

export default async function DrEpisodeDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ep = await fetchEpisode(id)
  if (!ep) notFound()

  return (
    <main className="space-y-5">
      <Link href="/dr/episodes" className="inline-flex items-center gap-1 text-sm text-kerala-700 hover:underline">
        <ArrowLeft className="w-3.5 h-3.5" /> All patient episodes
      </Link>

      <header className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
        <p className="text-xs text-muted">
          Patient: <strong>{ep.patient.name ?? ep.patient.email}</strong> · started {new Date(ep.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          {ep.endDate && ` · ended ${new Date(ep.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`}
        </p>
        <h1 className="font-serif text-2xl text-ink mt-1">{ep.condition}</h1>
        <p className="text-xs text-muted mt-1 capitalize">Status: <strong>{ep.status}</strong></p>
        {ep.protocolNotes && (
          <div className="mt-3 p-3 rounded bg-cream border border-gray-100 text-sm text-gray-700 leading-relaxed">
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">Protocol notes (patient self-reported)</p>
            {ep.protocolNotes}
          </div>
        )}
        <p className="text-[11px] text-gray-500 mt-3 inline-flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-700" /> This read is logged in the PHI audit trail.
        </p>
      </header>

      <DrTrendChart logs={ep.logs} />

      <section className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
        <h2 className="font-serif text-lg text-ink mb-3">Logs ({ep.logs.length})</h2>
        {ep.logs.length === 0 ? (
          <p className="text-sm text-gray-600">No logs yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-600 text-xs">
                <tr>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Severity</th>
                  <th className="px-3 py-2">Energy</th>
                  <th className="px-3 py-2">Sleep</th>
                  <th className="px-3 py-2">Mood</th>
                  <th className="px-3 py-2">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {ep.logs.slice().reverse().slice(0, 60).map((l) => (
                  <tr key={l.id}>
                    <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap">{new Date(l.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</td>
                    <td className="px-3 py-2 font-semibold text-red-700">{l.severity}</td>
                    <td className="px-3 py-2 text-cyan-700">{l.energy ?? '—'}</td>
                    <td className="px-3 py-2 text-violet-700">{l.sleepQuality ?? '—'}</td>
                    <td className="px-3 py-2 text-green-700">{l.mood ?? '—'}</td>
                    <td className="px-3 py-2 text-gray-700 text-xs max-w-xs truncate">{l.note ?? ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}
