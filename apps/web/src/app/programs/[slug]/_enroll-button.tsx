'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle2, LogIn } from 'lucide-react'

// Enrollment button — client-side so we can show loading state and handle
// the 401 redirect into sign-in. After successful enroll, sends user to
// /dashboard where they can check in daily.
export function EnrollButton({ slug }: { slug: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [enrolled, setEnrolled] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function enroll() {
    setLoading(true); setError(null)
    try {
      const res = await fetch(`/api/programs/${slug}/enroll`, {
        method: 'POST',
        credentials: 'include',
      })
      if (res.status === 401) {
        router.push(`/sign-in?next=/programs/${slug}`)
        return
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(data.error ?? `HTTP ${res.status}`)
      }
      setEnrolled(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally { setLoading(false) }
  }

  if (enrolled) {
    return (
      <button
        type="button"
        onClick={() => router.push('/dashboard')}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-md text-sm font-semibold"
      >
        <CheckCircle2 className="w-4 h-4" /> Enrolled — go to dashboard
      </button>
    )
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={enroll}
        disabled={loading}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-kerala-700 hover:bg-kerala-800 disabled:opacity-60 text-white rounded-md text-sm font-semibold"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
        Enroll free
      </button>
      {error && <span className="text-xs text-red-700">{error}</span>}
    </div>
  )
}
