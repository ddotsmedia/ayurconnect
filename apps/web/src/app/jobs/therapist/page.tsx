import type { Metadata } from 'next'
import { FilteredJobsList, FilterPageHeader, fetchFilteredJobs } from '../_filtered/FilteredJobsList'

export const metadata: Metadata = {
  title: 'Ayurveda Therapist Jobs — Panchakarma, Abhyanga, Shirodhara',
  description: 'Ayurveda therapist vacancies — Panchakarma, Abhyanga, Shirodhara, Kizhi therapists across Kerala, UAE, Gulf. Certified operators wanted. Apply free.',
  alternates: { canonical: '/jobs/therapist' },
  keywords: ['ayurveda therapist job', 'panchakarma therapist vacancy', 'abhyanga therapist job kerala', 'shirodhara therapist dubai', 'kizhi therapist'],
}

export default async function TherapistJobsPage() {
  const jobs = await fetchFilteredJobs('type=therapist')
  return (
    <>
      <FilterPageHeader eyebrow="Therapists" title="Ayurveda Therapist Jobs" subtitle="Panchakarma, Abhyanga, Shirodhara, Kizhi — certified therapists in demand across Kerala + Gulf." icon="💆" />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <FilteredJobsList
          jobs={jobs}
          emptyHeadline="No therapist openings tagged yet."
          emptyBody="Many spa + wellness employers do not tag jobs by role. Browse all jobs and filter by title (Panchakarma, Abhyanga, etc.)."
          schemaBoardName="Ayurveda Therapist Jobs"
          breadcrumb={[
            { name: 'Home', url: 'https://ayurconnect.com' },
            { name: 'Jobs', url: 'https://ayurconnect.com/jobs' },
            { name: 'Therapists', url: 'https://ayurconnect.com/jobs/therapist' },
          ]}
        />
      </div>
    </>
  )
}
