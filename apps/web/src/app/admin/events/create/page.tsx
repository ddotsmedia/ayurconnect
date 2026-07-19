import Link from 'next/link'
import { EventForm } from '../_form'

export const metadata = { title: 'Create event · Admin', robots: { index: false, follow: false } }

export default function CreateEventPage() {
  return (
    <div className="space-y-4">
      <nav className="text-xs">
        <Link href="/admin/events" className="text-gray-500 hover:text-kerala-700">← All events</Link>
      </nav>
      <h1 className="text-3xl font-bold">New event</h1>
      <EventForm />
    </div>
  )
}
