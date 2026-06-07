import Link from 'next/link'
import { Activity, ChevronRight } from 'lucide-react'
import { headers } from 'next/headers'
import { API_INTERNAL as API } from '../../../lib/server-fetch'

type Episode = {
  id: string; condition: string; status: string; startDate: string; endDate: string | null
  patient: { id: string; name: string | null; email: string }
  _count: { logs: number }
}

export const metadata = {
  title: 'Patient progress | Doctor Hub',
  robots: { index: false, follow: false },
}

async function fetchEpisodes(): Promise<Episode[]> {
  const hdrs = await headers()
  const cookie = hdrs.get('cookie') ?? ''
  try {
    const r = await fetch(`${API}/dr/episodes`, { headers: { cookie }, cache: 'no-store' })
    if (!r.ok) return []
    const j = await r.json() as { episodes?: Episode[] }
    return j.episodes ?? []
  } catch { return [] }
}

export default async function DrEpisodesPage() {
  const episodes = await fetchEpisodes()
  return (
    <main className="space-y-5">
      <header>
        <h1 className="font-serif text-2xl text-ink inline-flex items-center gap-2">
          <Activity className="w-6 h-6 text-kerala-700" /> Patient progress
        </h1>
        <p className="text-sm text-muted mt-1">
          Episodes where you&apos;re the assigned doctor. PHI reads are audited.
        </p>
      </header>

      {episodes.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-card p-10 text-center shadow-card">
          <Activity className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-700">No episodes assigned to you yet.</p>
          <p className="text-xs text-gray-500 mt-1">Once a patient starts a treatment episode and tags you as the assigned doctor, you&apos;ll see their trend here.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {episodes.map((ep) => (
            <li key={ep.id}>
              <Link href={`/dr/episodes/${ep.id}`} className="block bg-white border border-gray-100 rounded-card p-5 shadow-card hover:shadow-cardLg transition-shadow">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-serif text-lg text-ink">{ep.condition}</h3>
                    <p className="text-xs text-muted mt-0.5">
                      {ep.patient.name ?? ep.patient.email} · started {new Date(ep.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} ·
                      {' '}{ep._count.logs} log{ep._count.logs === 1 ? '' : 's'} ·
                      {' '}<span className="capitalize">{ep.status}</span>
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
