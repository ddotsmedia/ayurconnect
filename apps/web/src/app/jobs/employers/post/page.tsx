import { redirect } from 'next/navigation'
import { getServerSession } from '../../../../lib/auth'
import { JobPostClient } from './_client'

export const metadata = { title: 'Post a Job | AyurConnect Jobs', robots: { index: false, follow: false } }

export default async function PostJobPage() {
  const sess = await getServerSession()
  if (!sess) redirect('/sign-in?next=/jobs/employers/post')
  return (
    <div className="min-h-screen bg-cream py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="font-serif text-3xl text-ink">Post a Job</h1>
        <p className="text-sm text-gray-600 mt-1">Reach 500+ verified Ayurveda doctors. First job is free.</p>
        <JobPostClient />
      </div>
    </div>
  )
}
