import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth'
import { CmeClient } from './_client'

export const metadata: Metadata = {
  title: 'CME Tracker — Continuing Medical Education',
  description: 'Log and track your CME credits — conferences, workshops, webinars, online courses. KSMC renewal progress at a glance.',
  alternates: { canonical: '/doctors/cme' },
  robots: { index: false, follow: false },
}

export default async function CmePage() {
  const sess = await getServerSession()
  if (!sess) redirect('/sign-in?next=/doctors/cme')
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="font-serif text-3xl text-kerala-800">CME Tracker</h1>
      <p className="text-sm text-gray-600 mt-1">Log your continuing medical education credits. KSMC recommends 30 credits per renewal cycle.</p>
      <CmeClient />
    </div>
  )
}
