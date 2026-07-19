import Link from 'next/link'
import { headers as nextHeaders } from 'next/headers'
import { API_INTERNAL } from '../../../../../lib/server-fetch'
import { EventForm, type EventFormValues } from '../../_form'

export const metadata = { title: 'Edit event · Admin', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

async function fetchOne(id: string): Promise<EventFormValues | null> {
  try {
    const h = await nextHeaders(); const cookie = h.get('cookie') ?? ''
    // Admin list endpoint returns full rows; hit it and pick out the target.
    // /event-listings/:id (public) rejects unpublished, so we go through /admin/events.
    const r = await fetch(`${API_INTERNAL}/admin/events`, { headers: { cookie }, cache: 'no-store' })
    if (!r.ok) return null
    const rows = await r.json() as EventFormValues[]
    return rows.find((x) => x.id === id) ?? null
  } catch { return null }
}

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const row = await fetchOne(id)
  return (
    <div className="space-y-4">
      <nav className="text-xs">
        <Link href="/admin/events" className="text-gray-500 hover:text-kerala-700">← All events</Link>
      </nav>
      <h1 className="text-3xl font-bold">Edit event</h1>
      {!row ? (
        <p className="text-sm text-gray-600 italic">Event not found.</p>
      ) : (
        <EventForm initial={row} />
      )}
    </div>
  )
}
