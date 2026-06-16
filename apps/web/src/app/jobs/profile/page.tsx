import { redirect } from 'next/navigation'
import { headers as nextHeaders } from 'next/headers'
import { getServerSession } from '../../../lib/auth'
import { API_INTERNAL } from '../../../lib/server-fetch'
import { ProfileClient, type CandidateData } from './_client'

export const metadata = { title: 'My Profile | AyurConnect Jobs', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

async function fetchMe(): Promise<CandidateData | null> {
  const h = await nextHeaders(); const cookie = h.get('cookie') ?? ''
  try {
    const r = await fetch(`${API_INTERNAL}/jobs-portal/candidates/me`, { headers: { cookie }, cache: 'no-store' })
    if (r.status === 404) return null
    if (!r.ok) return null
    return r.json() as Promise<CandidateData>
  } catch { return null }
}

export default async function ProfilePage() {
  const sess = await getServerSession()
  if (!sess) redirect('/sign-in?next=/jobs/profile')
  const me = await fetchMe()
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <ProfileClient initial={me} />
    </div>
  )
}
