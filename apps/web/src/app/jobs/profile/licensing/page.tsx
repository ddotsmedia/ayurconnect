import { redirect } from 'next/navigation'
import { headers as nextHeaders } from 'next/headers'
import Link from 'next/link'
import { getServerSession } from '../../../../lib/auth'
import { API_INTERNAL } from '../../../../lib/server-fetch'
import { GUIDES } from '../../licensing/_data'
import { TrackClient } from './_client'

export const metadata = { title: 'License Progress | AyurConnect Jobs', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

type Track = { id: string; jurisdictionSlug: string; stage: string; notes: string | null; updatedAt: string }

async function fetchTracks(): Promise<Track[]> {
  const h = await nextHeaders(); const cookie = h.get('cookie') ?? ''
  try {
    const r = await fetch(`${API_INTERNAL}/jobs-portal/licensing/me`, { headers: { cookie }, cache: 'no-store' })
    if (!r.ok) return []
    return r.json() as Promise<Track[]>
  } catch { return [] }
}

export default async function LicensingTrackerPage() {
  const sess = await getServerSession()
  if (!sess) redirect('/sign-in?next=/jobs/profile/licensing')
  const tracks = await fetchTracks()
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="font-serif text-2xl text-ink">License tracker</h1>
      <p className="text-xs text-gray-600 mt-1">Track your licensing progress across jurisdictions.</p>
      <TrackClient initial={tracks} guides={GUIDES.map((g) => ({ slug: g.slug, jurisdiction: g.jurisdiction }))} />
      <p className="text-xs text-gray-500 mt-6"><Link href="/jobs/licensing" className="text-kerala-700 hover:underline">Browse all licensing guides →</Link></p>
    </div>
  )
}
