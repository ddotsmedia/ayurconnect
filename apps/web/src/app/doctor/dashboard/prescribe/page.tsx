import { redirect } from 'next/navigation'
import { getServerSession } from '../../../../lib/auth'
import { PrescribeClient } from './_client'

export const metadata = { title: 'Prescription pad | AyurConnect', robots: { index: false, follow: false } }

export default async function PrescribePage() {
  const session = await getServerSession()
  if (!session) redirect('/sign-in?next=/doctor/dashboard/prescribe')
  if (!['DOCTOR', 'DOCTOR_PENDING', 'ADMIN'].includes(session.user.role)) redirect('/dashboard')
  return (
    <div className="min-h-screen bg-cream py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <PrescribeClient />
      </div>
    </div>
  )
}
