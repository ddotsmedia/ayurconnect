import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getServerSession } from '../../../../lib/auth'
import { CmeClient } from './_client'

export const metadata = { title: 'CME tracker | AyurConnect', robots: { index: false, follow: false } }

export default async function CmePage() {
  const session = await getServerSession()
  if (!session) redirect('/sign-in?next=/doctor/dashboard/cme')
  if (!['DOCTOR', 'DOCTOR_PENDING', 'ADMIN'].includes(session.user.role)) redirect('/dashboard')
  return (
    <div className="min-h-screen bg-cream py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <CmeClient />
        <p className="text-xs text-gray-500 mt-6 text-center">Looking for upcoming CME? <Link href="/seminars" className="text-kerala-700 hover:underline">Browse seminars & events →</Link></p>
      </div>
    </div>
  )
}
