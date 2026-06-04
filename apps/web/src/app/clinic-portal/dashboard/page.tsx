import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { GradientHero } from '@ayurconnect/ui'
import { getServerSession } from '../../../lib/auth'
import { DemoTabs } from './_demo-tabs'

export const metadata = {
  title: 'Clinic Portal — Demo Dashboard | AyurConnect',
  description: 'Demo of the AyurConnect Clinic Portal dashboard. Patient intake, treatment scheduling, OPD/IPD tracking. localStorage-only sandbox — your data stays on your device.',
  robots: { index: false, follow: true },
  alternates: { canonical: '/clinic-portal/dashboard' },
}

export default async function ClinicPortalDashboard() {
  const sess = await getServerSession()
  if (!sess) redirect('/sign-in?next=/clinic-portal/dashboard')

  const allowed = ['HOSPITAL', 'HOSPITAL_PENDING', 'ADMIN'].includes(sess.user.role)

  return (
    <>
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <Link href="/clinic-portal" className="text-sm text-white/70 hover:text-white inline-flex items-center gap-1 mb-3">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to landing
          </Link>
          <h1 className="font-serif text-3xl md:text-4xl text-white">Clinic Portal — Demo Dashboard</h1>
          <p className="text-sm text-white/80 mt-2">
            Sandbox preview. All data stays in your browser&apos;s localStorage — nothing leaves the device.
            Promote to a paid plan via <Link href="/clinic-portal#pricing" className="underline">/clinic-portal#pricing</Link> for the production multi-user version.
          </p>
        </div>
      </GradientHero>

      <section className="container mx-auto px-4 py-10">
        {!allowed ? (
          <div className="bg-white border border-gray-100 rounded-card p-8 max-w-xl mx-auto text-center shadow-card">
            <h2 className="font-serif text-xl text-ink">Demo gated to hospital accounts</h2>
            <p className="text-sm text-muted mt-2">
              You&apos;re signed in as <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">{sess.user.role}</code>.
              The demo dashboard is open to verified hospital / clinic owners and admins.
            </p>
            <div className="mt-5 flex justify-center gap-2 flex-wrap">
              <Link href="/register/hospital" className="px-5 py-2.5 bg-kerala-700 hover:bg-kerala-800 text-white rounded-md text-sm font-semibold">
                Register as a hospital
              </Link>
              <Link href="/clinic-portal" className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-50">
                See pricing
              </Link>
            </div>
          </div>
        ) : (
          <DemoTabs />
        )}
      </section>
    </>
  )
}
