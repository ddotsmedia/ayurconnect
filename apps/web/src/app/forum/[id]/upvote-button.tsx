'use client'

import { useState } from 'react'
import { ArrowUp } from 'lucide-react'

export function UpvoteButton({ postId, initialCount }: { postId: string; initialCount: number }) {
  const [count, setCount] = useState(initialCount)
  const [active, setActive] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function toggle() {
    setBusy(true); setError(null)
    try {
      const res = await fetch(`/api/forum/posts/${postId}/upvote`, { method: 'POST', credentials: 'include' })
      if (res.status === 401) { setError('sign in to upvote'); return }
      if (!res.ok)            { setError(`upvote failed (${res.status})`); return }
      const data = (await res.json()) as { upvoted: boolean; count: number }
      setActive(data.upvoted)
      setCount(data.count)
    } catch (e) { setError(String(e)) } finally { setBusy(false) }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        className={
          active
            ? 'flex items-center gap-1.5 px-3 py-1.5 bg-kerala-600 text-white rounded-md text-sm font-medium hover:bg-kerala-700 disabled:opacity-50'
            : 'flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-md text-sm font-medium hover:border-kerala-200 hover:text-kerala-700 disabled:opacity-50'
        }
      >
        <ArrowUp className="w-4 h-4" />
        {count}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  )
}
