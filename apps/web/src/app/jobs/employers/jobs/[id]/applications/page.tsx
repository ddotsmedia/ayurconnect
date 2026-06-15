import { redirect } from 'next/navigation'
import { headers as nextHeaders } from 'next/headers'
import { getServerSession } from '../../../../../../lib/auth'
import { API_INTERNAL } from '../../../../../../lib/server-fetch'
import { AtsClient, type App } from './_client'

export const metadata = { title: 'Applications | AyurConnect Employer', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

async function fetchApps(id: string): Promise<App[]> {
  const h = await nextHeaders(); const cookie = h.get('cookie') ?? ''
  try {
    const r = await fetch(`${API_INTERNAL}/jobs-portal/jobs/${id}/applications`, { headers: { cookie }, cache: 'no-store' })
    if (!r.ok) return []
    return r.json() as Promise<App[]>
  } catch { return [] }
}

export default async function AtsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sess = await getServerSession()
  if (!sess) redirect('/sign-in')
  const apps = await fetchApps(id)
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="font-serif text-2xl text-ink mb-4">Applicants</h1>
      <AtsClient initial={apps} />
    </div>
  )
}
