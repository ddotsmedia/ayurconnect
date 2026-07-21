'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Mail, RefreshCw, CheckCircle2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

// Shown right after successful sign-up. The Better Auth account exists but
// no session cookie was issued (requireEmailVerification=true), so we don't
// try to hit any protected endpoint here — the flow resumes at /verify-callback
// after the user clicks the link in their inbox.

function ResendButton({ email }: { email: string }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errMsg, setErrMsg] = useState<string | null>(null)
  async function resend() {
    setStatus('sending'); setErrMsg(null)
    try {
      const r = await fetch('/api/auth/send-verification-email', {
        method:  'POST',
        headers: { 'content-type': 'application/json' },
        body:    JSON.stringify({ email, callbackURL: '/verify-callback' }),
      })
      if (!r.ok) throw new Error(await r.text() || `HTTP ${r.status}`)
      setStatus('sent')
    } catch (e) {
      setStatus('error')
      setErrMsg(e instanceof Error ? e.message : String(e))
    }
  }
  if (status === 'sent') {
    return <p className="text-sm text-kerala-800 inline-flex items-center gap-1.5 mt-3"><CheckCircle2 className="w-4 h-4" /> Email sent again — check your inbox.</p>
  }
  return (
    <>
      <button
        type="button"
        onClick={resend}
        disabled={status === 'sending' || !email}
        className="inline-flex items-center gap-1.5 px-4 py-2 border border-kerala-300 text-kerala-800 rounded-md hover:bg-kerala-50 disabled:opacity-50 text-sm font-semibold"
      >
        <RefreshCw className={`w-4 h-4 ${status === 'sending' ? 'animate-spin' : ''}`} />
        {status === 'sending' ? 'Sending…' : 'Resend verification email'}
      </button>
      {status === 'error' && <p className="text-xs text-red-600 mt-2">{errMsg ?? 'Could not send — try again in a minute.'}</p>}
    </>
  )
}

function VerifyEmailSentInner() {
  const search = useSearchParams()
  const email  = search?.get('email') ?? ''
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center py-8 sm:py-16 px-4">
      <div className="max-w-md w-full bg-white rounded-card border border-gray-100 shadow-card p-6 sm:p-8 text-center">
        <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-kerala-50 text-kerala-700 ring-4 ring-kerala-100 mb-4">
          <Mail className="w-7 h-7" />
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl text-kerala-700">Check your inbox</h1>
        <p className="text-sm text-gray-700 mt-3">
          We've sent a verification link{email ? <> to <strong>{email}</strong></> : ''}. Click it to activate your account
          and finish setting up your profile.
        </p>
        <div className="mt-6 space-y-3">
          <ResendButton email={email} />
        </div>
        <p className="text-xs text-gray-500 mt-6">
          Wrong email? <Link href="/register" className="text-kerala-700 hover:underline">Start over</Link>
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Already verified? <Link href="/sign-in" className="text-kerala-700 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

export default function VerifyEmailSentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream" />}>
      <VerifyEmailSentInner />
    </Suspense>
  )
}
