import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { GradientHero } from '@ayurconnect/ui'
import { getServerSession } from '../../../lib/auth'
import { PostJobForm } from '../../../components/jobs/PostJobForm'

export const metadata = {
  title: 'Post an Ayurveda Job — AyurConnect',
  description: 'Hospitals + clinics post BAMS doctor, Panchakarma therapist, and pharmacist roles. Doctors post locum availability. Verified reach across Kerala + UAE.',
  alternates: { canonical: '/jobs/post' },
}

export default async function PostJobPage() {
  const sess = await getServerSession()
  const role = sess?.user?.role ?? null

  return (
    <>
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <Link href="/jobs" className="text-sm text-white/70 hover:text-white inline-flex items-center gap-1 mb-3">
            <ArrowLeft className="w-3.5 h-3.5" /> All jobs
          </Link>
          <h1 className="font-serif text-3xl md:text-4xl text-white">
            {role === 'DOCTOR' || role === 'DOCTOR_PENDING' ? 'Post your availability' : 'Post a job'}
          </h1>
          <p className="text-sm text-white/80 mt-2">Kerala&apos;s largest verified Ayurveda professional network.</p>
        </div>
      </GradientHero>

      <section className="container mx-auto px-4 py-10">
        <PostJobForm role={role} />
      </section>
    </>
  )
}
