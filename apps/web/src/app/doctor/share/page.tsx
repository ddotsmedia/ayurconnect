import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ShieldCheck, ArrowLeft } from 'lucide-react'
import { GradientHero } from '@ayurconnect/ui'
import { getServerSession } from '../../../lib/auth'
import { headers } from 'next/headers'
import { API_INTERNAL as API } from '../../../lib/server-fetch'
import { DoctorShareClient } from './_client'

export const metadata = {
  title: 'Share your profile + invite colleagues | AyurConnect',
  robots: { index: false, follow: false },
}

type DoctorSelf = {
  id: string; name: string; profileCompleteness?: number | null
  ksmcRegNumber?: string | null; homeDistrict?: string | null; college?: string | null
  aboutMl?: string | null; bio?: string | null; specialTreatmentsOffered?: string[] | null
  ccimVerified: boolean
}

async function fetchSelf(): Promise<DoctorSelf | null> {
  const hdrs = await headers(); const cookie = hdrs.get('cookie') ?? ''
  try {
    const r = await fetch(`${API}/me/doctor`, { headers: { cookie }, cache: 'no-store' })
    if (!r.ok) return null
    const j = await r.json() as { doctor?: DoctorSelf }
    return j.doctor ?? null
  } catch { return null }
}

export default async function DoctorSharePage() {
  const sess = await getServerSession()
  if (!sess) redirect('/sign-in?next=/doctor/share')
  if (!['DOCTOR', 'DOCTOR_PENDING', 'ADMIN'].includes(sess.user.role)) redirect('/dashboard')
  const doc = await fetchSelf()

  return (
    <>
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-white/80 hover:text-white mb-3">
            <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
          </Link>
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
            <ShieldCheck className="w-3 h-3" /> Profile reach
          </span>
          <h1 className="font-serif text-4xl text-white">Share + invite</h1>
          <p className="text-white/85 mt-3">Grow Kerala&apos;s most comprehensive Ayurveda directory.</p>
        </div>
      </GradientHero>

      <section className="container mx-auto px-4 py-10 max-w-3xl">
        <DoctorShareClient doctor={doc} />
      </section>
    </>
  )
}
