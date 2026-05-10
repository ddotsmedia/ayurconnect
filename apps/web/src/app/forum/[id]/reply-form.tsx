'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export function ReplyForm({ postId }: { postId: string }) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [needSignIn, setNeedSignIn] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setError(null); setNeedSignIn(false)
    try {
      const res = await fetch(`/api/forum/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content }),
      })
      if (res.status === 401) { setNeedSignIn(true); return }
      if (!res.ok) { setError(`reply failed (${res.status})`); return }
      setContent('')
      router.refresh()
    } catch (e) { setError(String(e)) } finally { setBusy(false) }
  }

  if (needSignIn) {
    return (
      <div className="mt-6 p-5 bg-kerala-50 border border-kerala-100 rounded-card text-center">
        <p className="text-sm text-kerala-800 mb-3">Sign in to reply</p>
        <Link href={`/sign-in?next=/forum`} className="inline-block px-4 py-2 bg-kerala-600 text-white rounded-md text-sm font-semibold hover:bg-kerala-700">
          Sign in
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="mt-6 bg-white rounded-card border border-gray-100 shadow-card p-4 space-y-3">
      <label className="block">
        <span className="block text-xs font-medium text-gray-700 mb-1.5">Your reply</span>
        <textarea
          required
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your perspective. Doctors: cite classical references where relevant."
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-kerala-600 resize-y"
        />
      </label>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={busy || !content.trim()}
          className="px-4 py-2 bg-kerala-600 text-white rounded-md text-sm font-semibold hover:bg-kerala-700 disabled:opacity-50"
        >
          {busy ? 'Posting…' : 'Post reply'}
        </button>
      </div>
    </form>
  )
}
