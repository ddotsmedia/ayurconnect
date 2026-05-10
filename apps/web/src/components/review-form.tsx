'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Star, Loader2, CheckCircle2 } from 'lucide-react'

type Props = {
  // exactly one of these:
  doctorId?: string
  hospitalId?: string
  // the signed-in user (null if not signed in)
  signedIn: boolean
}

export function ReviewForm({ doctorId, hospitalId, signedIn }: Props) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  if (!signedIn) {
    const next = doctorId ? `/doctors/${doctorId}` : `/hospitals/${hospitalId}`
    return (
      <div className="bg-white rounded-card border border-gray-100 shadow-card p-5">
        <h3 className="font-semibold text-gray-900 mb-2">Leave a review</h3>
        <p className="text-sm text-gray-600">
          <Link href={`/sign-in?next=${encodeURIComponent(next)}`} className="text-kerala-700 font-medium hover:underline">Sign in</Link>
          {' '}to share your experience. Only verified accounts can review.
        </p>
      </div>
    )
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (rating < 1) { setErr('Please select a star rating.'); return }
    setBusy(true); setErr(null)
    try {
      const body: Record<string, unknown> = { rating, comment }
      if (doctorId) body.doctorId = doctorId
      if (hospitalId) body.hospitalId = hospitalId
      const res = await fetch('/api/reviews', {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error ?? `HTTP ${res.status}`)
      }
      setDone(true)
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e))
    } finally { setBusy(false) }
  }

  if (done) {
    return (
      <div className="bg-kerala-50 border border-kerala-200 rounded-card p-5 text-sm text-kerala-900 flex gap-2">
        <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>
          <strong>Thanks for your review!</strong> It will appear here after a brief moderation check.
          <button onClick={() => { setDone(false); setRating(0); setComment('') }} className="block mt-2 text-xs text-kerala-700 hover:underline">
            Edit my review
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-card border border-gray-100 shadow-card p-5">
      <h3 className="font-semibold text-gray-900 mb-3">Leave a review</h3>

      <div className="flex items-center gap-1 mb-3" role="radiogroup" aria-label="Star rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(n)}
            className="p-1 -ml-1 hover:scale-110 transition-transform"
          >
            <Star
              className={`w-7 h-7 ${(hover || rating) >= n ? 'fill-gold-400 text-gold-400' : 'text-gray-300'}`}
            />
          </button>
        ))}
        {rating > 0 && <span className="ml-2 text-sm text-gray-700">{rating}/5</span>}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value.slice(0, 2000))}
        placeholder="Share your experience (optional)..."
        rows={3}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-kerala-700"
      />
      <div className="text-[11px] text-gray-400 mt-1">{comment.length}/2000</div>

      {err && <p className="text-sm text-red-600 mt-2">{err}</p>}

      <div className="flex justify-end mt-3">
        <button
          type="submit"
          disabled={busy || rating < 1}
          className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-semibold rounded-md bg-kerala-700 text-white hover:bg-kerala-800 disabled:opacity-50"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Post review
        </button>
      </div>
    </form>
  )
}
