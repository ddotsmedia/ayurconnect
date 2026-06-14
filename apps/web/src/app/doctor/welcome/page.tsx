import { redirect } from 'next/navigation'
import { GradientHero } from '@ayurconnect/ui'
import { CheckCircle2 } from 'lucide-react'
import { getServerSession } from '../../../lib/auth'
import { WelcomeClient } from './_client'

export const metadata = {
  title: 'Welcome to AyurConnect | Doctor',
  robots: { index: false, follow: false },
}

export default async function DoctorWelcomePage() {
  const session = await getServerSession()
  if (!session) redirect('/sign-in')
  if (!['DOCTOR', 'DOCTOR_PENDING', 'ADMIN'].includes(session.user.role)) redirect('/dashboard')

  return (
    <>
      <GradientHero variant="green" size="md">
        <div className="max-w-2xl mx-auto text-center">
          <CheckCircle2 className="w-14 h-14 text-white mx-auto" />
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight mt-4">🎉 Welcome to AyurConnect</h1>
          <p className="text-white/90 mt-3 text-lg">Your profile is under review. Verification takes 5–7 business days.</p>
        </div>
      </GradientHero>
      <section className="container mx-auto px-4 py-10 max-w-3xl">
        <WelcomeClient />
      </section>
    </>
  )
}
