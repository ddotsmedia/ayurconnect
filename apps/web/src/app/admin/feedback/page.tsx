import { redirect } from 'next/navigation'
import { headers as nextHeaders } from 'next/headers'
import { getServerSession } from '../../../lib/auth'
import { API_INTERNAL } from '../../../lib/server-fetch'
import { FeedbackAdminClient, type FeedbackItem, type Stats } from './_client'

export const metadata = { title: 'Feedback Admin', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

async function fetchAll(): Promise<{ items: FeedbackItem[]; stats: Stats } | null> {
  const h = await nextHeaders(); const cookie = h.get('cookie') ?? ''
  try {
    const r = await fetch(`${API_INTERNAL}/feedback`, { headers: { cookie }, cache: 'no-store' })
    if (!r.ok) return null
    return r.json() as Promise<{ items: FeedbackItem[]; stats: Stats }>
  } catch { return null }
}

export default async function AdminFeedbackPage() {
  const sess = await getServerSession()
  if (!sess) redirect('/sign-in?next=/admin/feedback')
  if (sess.user.role !== 'ADMIN') redirect('/dashboard')
  const data = await fetchAll()
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="font-serif text-2xl text-ink">Feedback &amp; Suggestions</h1>
      <p className="text-xs text-gray-600 mt-1">Review and manage all incoming feedback.</p>
      <FeedbackAdminClient initial={data?.items ?? []} stats={data?.stats ?? { total: 0, unread: 0, new: 0, reviewed: 0, in_progress: 0, resolved: 0, dismissed: 0 }} />
    </div>
  )
}
