import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { headers as nextHeaders } from 'next/headers'
import { getServerSession } from '../../../lib/auth'
import { API_INTERNAL as API } from '../../../lib/server-fetch'
import { SavedJobsClient, type SavedJob } from './_client'

export const metadata: Metadata = {
  title: 'Saved Jobs — Your Ayurveda Wishlist',
  description: "Jobs you've bookmarked on AyurConnect. Compare up to 3 openings side-by-side, apply, or remove from list.",
  robots: { index: false, follow: false },
}
export const dynamic = 'force-dynamic'

async function fetchSaved(searchParams: Record<string, string | undefined>): Promise<SavedJob[]> {
  const qs = new URLSearchParams()
  if (searchParams.type)      qs.set('type',      searchParams.type)
  if (searchParams.district)  qs.set('district',  searchParams.district)
  if (searchParams.specialty) qs.set('specialty', searchParams.specialty)
  try {
    const h = await nextHeaders(); const cookie = h.get('cookie') ?? ''
    const url = `${API}/jobs-portal/wishlist${qs.toString() ? `?${qs}` : ''}`
    const r = await fetch(url, { headers: { cookie }, cache: 'no-store' })
    if (!r.ok) return []
    const data = await r.json() as { items: SavedJob[] }
    return data.items ?? []
  } catch { return [] }
}

export default async function SavedJobsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sess = await getServerSession()
  if (!sess) redirect('/sign-in?next=/jobs/saved')
  const sp = await searchParams
  const items = await fetchSaved(sp)

  // Derive filter options from what the user has actually saved so the
  // filter UI never offers a value that returns [].
  const types      = Array.from(new Set(items.map((i) => i.type).filter(Boolean)))
  const districts  = Array.from(new Set(items.map((i) => i.district ?? undefined).filter((v): v is string => !!v)))
  const specialties = Array.from(new Set(items.map((i) => i.specialty ?? undefined).filter((v): v is string => !!v)))

  return (
    <div className="min-h-screen bg-cream/40">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <nav className="text-xs text-gray-500 mb-3">
          <Link href="/jobs" className="hover:text-kerala-700">← All jobs</Link>
        </nav>
        <div className="flex items-baseline justify-between flex-wrap gap-2 mb-1">
          <h1 className="font-serif text-3xl text-ink">Saved Jobs</h1>
          <p className="text-xs text-gray-500">{items.length} saved</p>
        </div>
        <p className="text-sm text-gray-600 mb-6">Your wishlist. Tick up to 3 jobs → <strong>Compare</strong> to see them side-by-side.</p>

        {items.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-card p-8 text-center">
            <p className="text-4xl mb-2" aria-hidden>❤️</p>
            <p className="font-serif text-lg text-ink">Nothing saved yet</p>
            <p className="text-sm text-gray-600 mt-1">Tap the heart on any job card to add it to this list.</p>
            <Link href="/jobs" className="mt-4 inline-block px-5 py-2 bg-kerala-700 hover:bg-kerala-800 text-white text-sm font-semibold rounded">Browse jobs</Link>
          </div>
        ) : (
          <SavedJobsClient
            initial={items}
            active={{ type: sp.type ?? '', district: sp.district ?? '', specialty: sp.specialty ?? '' }}
            options={{ types, districts, specialties }}
          />
        )}
      </div>
    </div>
  )
}
