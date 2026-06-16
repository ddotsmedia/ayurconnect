import { redirect } from 'next/navigation'
import { headers as nextHeaders } from 'next/headers'
import { getServerSession } from '../../../../lib/auth'
import { API_INTERNAL } from '../../../../lib/server-fetch'
import { NotificationsClient, type Prefs } from './_client'

export const metadata = { title: 'Notification Preferences | AyurConnect Jobs', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

async function fetchPrefs(): Promise<{ whatsapp: string | null; alert: boolean; status: boolean; reminder: boolean } | null> {
  const h = await nextHeaders(); const cookie = h.get('cookie') ?? ''
  try {
    const r = await fetch(`${API_INTERNAL}/jobs-portal/candidates/me`, { headers: { cookie }, cache: 'no-store' })
    if (!r.ok) return null
    const c = await r.json() as { whatsapp: string | null; whatsappAlertOptIn: boolean; whatsappStatusOptIn: boolean; whatsappReminderOptIn: boolean }
    return { whatsapp: c.whatsapp, alert: c.whatsappAlertOptIn, status: c.whatsappStatusOptIn, reminder: c.whatsappReminderOptIn }
  } catch { return null }
}

export default async function NotificationsPage() {
  const sess = await getServerSession()
  if (!sess) redirect('/sign-in?next=/jobs/settings/notifications')
  const prefs = await fetchPrefs()
  const initial: Prefs = prefs ?? { whatsapp: '', alert: false, status: false, reminder: true }
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="font-serif text-2xl text-ink">Notification preferences</h1>
      <p className="text-xs text-gray-600 mt-1">Choose how you want to be notified about jobs and applications.</p>
      <NotificationsClient initial={initial} />
    </div>
  )
}
