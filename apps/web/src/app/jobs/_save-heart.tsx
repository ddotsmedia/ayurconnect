'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart } from 'lucide-react'

// Heart-icon toggle for a single job card. Optimistic — flips instantly
// then reverts on error. Not-logged-in click redirects to /sign-in with a
// return-to so the user lands back on the same jobs page after login.
//
// Wrap in a stopPropagation click handler if the parent card is a <Link>
// (which most job cards are); we handle stopPropagation inside so callers
// don't need to.
export function SaveHeart({
  jobId,
  initialSaved = false,
  size = 4,   // Tailwind w-N h-N units
}: {
  jobId:         string
  initialSaved?: boolean
  size?:         3 | 3.5 | 4 | 5
}) {
  const router = useRouter()
  const [saved, setSaved] = useState(initialSaved)
  const [busy,  setBusy]  = useState(false)

  async function toggle(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation()
    if (busy) return
    const next = !saved
    setSaved(next); setBusy(true)
    try {
      const rsp = await fetch(`/api/jobs-portal/wishlist/${jobId}`, {
        method:      next ? 'POST' : 'DELETE',
        credentials: 'include',
      })
      if (rsp.status === 401) {
        // Not logged in — revert + redirect to sign-in with return-to.
        setSaved(!next)
        const here = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/jobs'
        router.push(`/sign-in?next=${encodeURIComponent(here)}`)
        return
      }
      if (!rsp.ok) throw new Error(`HTTP ${rsp.status}`)
    } catch {
      setSaved(!next) // revert on error
    } finally {
      setBusy(false)
    }
  }

  const sizeCls = size === 3 ? 'w-3 h-3' : size === 3.5 ? 'w-3.5 h-3.5' : size === 5 ? 'w-5 h-5' : 'w-4 h-4'
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from saved jobs' : 'Save job for later'}
      title={saved ? 'Saved · click to unsave' : 'Save for later'}
      className={`inline-flex items-center justify-center rounded-full p-1.5 transition-colors ${saved ? 'text-rose-600 hover:bg-rose-50' : 'text-gray-400 hover:text-rose-500 hover:bg-rose-50'} ${busy ? 'opacity-60 cursor-wait' : ''}`}
    >
      <Heart className={`${sizeCls} ${saved ? 'fill-current' : ''}`} />
    </button>
  )
}
