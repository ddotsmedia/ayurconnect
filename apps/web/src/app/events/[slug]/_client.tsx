'use client'

import { useState } from 'react'
import { Copy, MessageCircle, Ticket } from 'lucide-react'
import type { AyurEvent } from '../../../lib/types/platform'
import { EventCountdown } from '../../../components/events/EventCountdown'
import { EventRegistration } from '../../../components/events/EventRegistration'

export function EventDetailClient({ event }: { event: AyurEvent }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const url = typeof window === 'undefined' ? `https://ayurconnect.com/events/${event.slug}` : window.location.href
  const wa = `https://wa.me/?text=${encodeURIComponent(`${event.title} — ${url}`)}`

  function copyLink() {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => { setCopied(true); window.setTimeout(() => setCopied(false), 1500) }).catch(() => {})
    }
  }

  const soldOut = event.capacity > 0 && event.registered >= event.capacity

  return (
    <div className="bg-cream border border-kerala-100 rounded-card p-5 shadow-card">
      <EventCountdown targetIso={`${event.startDate}T${event.startTime}:00`} />
      <div className="flex flex-wrap items-center gap-2 mt-3">
        <button
          onClick={() => setOpen(true)}
          disabled={soldOut}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-kerala-700 hover:bg-kerala-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-sm font-semibold"
        >
          <Ticket className="w-4 h-4" /> {soldOut ? 'Sold out' : event.isFree ? 'Register free' : `Register · ${event.currency} ${event.price.toLocaleString()}`}
        </button>
        <button onClick={copyLink} className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded text-sm">
          <Copy className="w-3.5 h-3.5" /> {copied ? 'Copied' : 'Copy link'}
        </button>
        <a href={wa} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#25d366] hover:opacity-90 text-white rounded text-sm">
          <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
        </a>
      </div>
      <EventRegistration event={event} open={open} onClose={() => setOpen(false)} />
    </div>
  )
}
