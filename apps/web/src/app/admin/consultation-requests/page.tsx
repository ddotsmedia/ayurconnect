import { redirect } from 'next/navigation'
import { headers as nextHeaders } from 'next/headers'
import { getServerSession } from '../../../lib/auth'
import { API_INTERNAL } from '../../../lib/server-fetch'
import { ConsultationRequestsClient, type ConsultationRequest } from './_client'

export const metadata = { title: 'Consultation Requests · Admin', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

async function fetchAll(): Promise<{ items: ConsultationRequest[]; summary: { byStatus: Record<string, number> } } | null> {
  const h = await nextHeaders(); const cookie = h.get('cookie') ?? ''
  try {
    const r = await fetch(`${API_INTERNAL}/admin/consultation-requests`, { headers: { cookie }, cache: 'no-store' })
    if (!r.ok) return null
    return r.json() as Promise<{ items: ConsultationRequest[]; summary: { byStatus: Record<string, number> } }>
  } catch { return null }
}

export default async function AdminConsultationRequestsPage() {
  const sess = await getServerSession()
  if (!sess) redirect('/sign-in?next=/admin/consultation-requests')
  if (sess.user.role !== 'ADMIN') redirect('/dashboard')
  const data = await fetchAll()
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="font-serif text-2xl text-ink">Consultation Requests</h1>
      <p className="text-xs text-gray-600 mt-1">Callback requests from /online-consultation. Contact within a few hours (IST business hours).</p>
      <ConsultationRequestsClient initial={data?.items ?? []} summary={data?.summary ?? { byStatus: {} }} />
    </div>
  )
}
