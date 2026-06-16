import { redirect } from 'next/navigation'
import { headers as nextHeaders } from 'next/headers'
import { getServerSession } from '../../../lib/auth'
import { API_INTERNAL } from '../../../lib/server-fetch'
import { AlertsClient, type Alert } from './_client'

export const metadata = { title: 'Job Alerts | AyurConnect Jobs', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

async function fetchAlerts(): Promise<Alert[]> {
  const h = await nextHeaders(); const cookie = h.get('cookie') ?? ''
  try {
    const r = await fetch(`${API_INTERNAL}/jobs-portal/alerts`, { headers: { cookie }, cache: 'no-store' })
    if (!r.ok) return []
    return r.json() as Promise<Alert[]>
  } catch { return [] }
}

export default async function AlertsPage() {
  const sess = await getServerSession()
  if (!sess) redirect('/sign-in?next=/jobs/alerts')
  const items = await fetchAlerts()
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="font-serif text-2xl text-ink">Job alerts</h1>
      <p className="text-xs text-gray-600 mt-1">Get notified when matching jobs are posted.</p>
      <AlertsClient initial={items} />
    </div>
  )
}
