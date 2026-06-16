import { redirect } from 'next/navigation'
import { getServerSession } from '../../../lib/auth'
import { ResumeBuilderClient } from './_client'

export const metadata = { title: 'AI Resume Builder | AyurConnect Jobs', robots: { index: false, follow: false } }

export default async function ResumeBuilderPage() {
  const sess = await getServerSession()
  if (!sess) redirect('/sign-in?next=/jobs/resume-builder')
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="font-serif text-3xl text-ink">AI Resume Builder</h1>
      <p className="text-sm text-gray-600 mt-1">Build a DHA/MOH-ready Ayurveda doctor resume with AI assistance.</p>
      <ResumeBuilderClient />
    </div>
  )
}
