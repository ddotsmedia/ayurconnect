import type { Metadata } from 'next'
import { CommunityClient } from './_client'
import { API_INTERNAL as API, logServerFetchError, srvFetch } from '@/lib/server-fetch'

export const metadata: Metadata = {
  title: 'BAMS Study Community — Free Discussion + Doubts',
  description: 'Ask doubts, share resources, discuss BAMS subjects with peers and verified doctors. Free, no subscription.',
  alternates: { canonical: '/learn/community' },
  keywords: ['BAMS doubt clarification', 'BAMS study group', 'ayurveda student community'],
}

type Thread = { id: string; title: string; content: string; category: string; subjectSlug: string | null; upvoteCount: number; replyCount: number; createdAt: string; author?: { name: string | null } | null }

async function fetchThreads(): Promise<Thread[]> {
  // Phase 3 (2026-07-23): srvFetch + 5s timeout + content-type guard.
  try {
    const r = await srvFetch(`${API}/study-community/threads?limit=30`, { next: { revalidate: 60 }, timeoutMs: 5000 })
    if (!r.ok || !r.headers.get('content-type')?.includes('json')) {
      if (!r.ok) logServerFetchError('learn-community', `HTTP ${r.status}`)
      return []
    }
    const d = await r.json() as { items: Thread[] }
    return d.items ?? []
  } catch (err) { logServerFetchError('learn-community', err); return [] }
}

export default async function CommunityPage() {
  const threads = await fetchThreads()
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <p className="text-xs uppercase tracking-wider text-kerala-700">Study Community</p>
      <h1 className="font-serif text-3xl text-kerala-800">BAMS Study Community</h1>
      <p className="text-sm text-gray-600 mt-1">Ask doubts. Share resources. Discuss with peers and verified doctors. Free, no subscription.</p>
      <CommunityClient initial={threads} />
    </div>
  )
}
