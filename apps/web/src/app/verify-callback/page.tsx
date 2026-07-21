'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react'
import { PENDING_DOCTOR_KEY, PENDING_HOSPITAL_KEY, PENDING_PATIENT_KEY, postJson } from '../register/_lib'

export const dynamic = 'force-dynamic'

// Landing page after Better Auth verifies the email link. Session cookie is
// now active (autoSignInAfterVerification=true), so we can finish the
// role-specific profile setup that was blocked at signup time by the
// verification gate. Pending profile payloads live in localStorage —
// written by the /register/* forms before signup, read here after verify.

type Status = 'working' | 'ok' | 'skipped' | 'error'

async function finishDoctorProfile(): Promise<{ redirect: string } | null> {
  const raw = localStorage.getItem(PENDING_DOCTOR_KEY)
  if (!raw) return null
  try {
    const payload = JSON.parse(raw) as Record<string, unknown>
    const res = await postJson<{ doctorId?: string }>('/me/promote-to-doctor', payload)
    // Referral tracking preserved from the original flow.
    const refCode = payload._refCode as string | undefined
    if (refCode && res?.doctorId) {
      void fetch('/api/doctor-viral/track-registration', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ code: refCode, doctorId: res.doctorId }),
      }).catch(() => {})
    }
  } finally {
    localStorage.removeItem(PENDING_DOCTOR_KEY)
  }
  return { redirect: '/doctor/welcome' }
}

async function finishHospitalProfile(): Promise<{ redirect: string } | null> {
  const raw = localStorage.getItem(PENDING_HOSPITAL_KEY)
  if (!raw) return null
  try {
    const payload = JSON.parse(raw) as Record<string, unknown>
    await postJson('/me/promote-to-hospital', payload)
  } finally {
    localStorage.removeItem(PENDING_HOSPITAL_KEY)
  }
  return { redirect: '/dashboard?welcome=hospital' }
}

async function finishPatientProfile(): Promise<{ redirect: string } | null> {
  const raw = localStorage.getItem(PENDING_PATIENT_KEY)
  if (!raw) return null
  try {
    const payload = JSON.parse(raw) as Record<string, unknown>
    // Patient just patches /me with country / state / phone / name — no promote endpoint.
    const r = await fetch('/api/me', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!r.ok) throw new Error(`patient profile update HTTP ${r.status}`)
  } finally {
    localStorage.removeItem(PENDING_PATIENT_KEY)
  }
  return { redirect: '/dashboard' }
}

export default function VerifyCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState<Status>('working')
  const [msg,    setMsg]    = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function run() {
      try {
        // Try each finisher in turn — only one pending key should exist at a
        // time. If none exist, this was a plain email-verification (no signup
        // in progress in this browser) — just redirect to /dashboard.
        const outcome = await finishDoctorProfile()
                     ?? await finishHospitalProfile()
                     ?? await finishPatientProfile()
        if (cancelled) return
        if (!outcome) {
          setStatus('skipped')
          setTimeout(() => router.replace('/dashboard'), 400)
          return
        }
        setStatus('ok')
        setTimeout(() => { router.replace(outcome.redirect); router.refresh() }, 500)
      } catch (e) {
        if (cancelled) return
        setStatus('error')
        setMsg(e instanceof Error ? e.message : String(e))
      }
    }
    void run()
    return () => { cancelled = true }
  }, [router])

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center py-8 sm:py-16 px-4">
      <div className="max-w-md w-full bg-white rounded-card border border-gray-100 shadow-card p-6 sm:p-8 text-center">
        {status === 'working' && (
          <>
            <Loader2 className="w-10 h-10 text-kerala-700 mx-auto animate-spin" />
            <h1 className="font-serif text-xl text-kerala-700 mt-4">Finishing your profile…</h1>
            <p className="text-sm text-gray-600 mt-2">Wiring up the last few details.</p>
          </>
        )}
        {(status === 'ok' || status === 'skipped') && (
          <>
            <CheckCircle2 className="w-10 h-10 text-kerala-700 mx-auto" />
            <h1 className="font-serif text-xl text-kerala-700 mt-4">
              {status === 'ok' ? 'Email verified — profile ready!' : 'Email verified!'}
            </h1>
            <p className="text-sm text-gray-600 mt-2">Redirecting…</p>
          </>
        )}
        {status === 'error' && (
          <>
            <AlertTriangle className="w-10 h-10 text-amber-600 mx-auto" />
            <h1 className="font-serif text-xl text-amber-800 mt-4">Something went wrong finishing your profile</h1>
            <p className="text-sm text-gray-700 mt-2">{msg}</p>
            <p className="text-xs text-gray-500 mt-3">
              Your email is verified. Try refreshing this page, or go to <a href="/dashboard" className="text-kerala-700 hover:underline">/dashboard</a>.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
