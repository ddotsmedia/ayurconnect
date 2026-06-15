import { redirect } from 'next/navigation'
import { getServerSession } from '../../../../lib/auth'
import { SearchClient } from './_client'

export const metadata = { title: 'Search Candidates | AyurConnect Employer', robots: { index: false, follow: false } }

export default async function SearchPage() {
  const sess = await getServerSession()
  if (!sess) redirect('/sign-in?next=/jobs/employers/search')
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="font-serif text-2xl text-ink">Search candidates</h1>
      <p className="text-xs text-gray-600 mt-1">Find verified Ayurveda doctors actively looking for work.</p>
      <SearchClient />
    </div>
  )
}
