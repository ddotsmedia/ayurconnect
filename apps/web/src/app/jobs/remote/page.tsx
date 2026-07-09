import type { Metadata } from 'next'
import { FilteredJobsList, FilterPageHeader, fetchFilteredJobs } from '../_filtered/FilteredJobsList'

export const metadata: Metadata = {
  title: "Remote Ayurveda Jobs — Telemedicine & Work from Home",
  description: "Remote Ayurveda doctor jobs. Telemedicine, online consultation, work-from-home BAMS/MD roles. Apply free on AyurConnect.",
  alternates: { canonical: '/jobs/remote' },
  keywords: ["ayurveda doctor work from home","online ayurveda consultation job","telemedicine ayurveda doctor","remote BAMS job"],
}

export default async function Page() {
  const jobs = await fetchFilteredJobs("remote=1")
  return (
    <>
      <FilterPageHeader eyebrow="Remote / Telemedicine" title="Remote Ayurveda Jobs" subtitle="Work-from-home + telemedicine roles for Ayurveda doctors." icon="🏠" />
      <div className='container mx-auto px-4 py-8 max-w-4xl'>
        <FilteredJobsList
          jobs={jobs}
          emptyHeadline="No remote roles open right now."
          emptyBody="Telemedicine openings come up regularly. Set a job alert to be notified."
          schemaBoardName="Remote Ayurveda Jobs"
          breadcrumb={[
            { name: 'Home', url: 'https://ayurconnect.com' },
            { name: 'Jobs', url: 'https://ayurconnect.com/jobs' },
            { name: "Remote / Telemedicine", url: 'https://ayurconnect.com/jobs/remote' },
          ]}
        />
      </div>
    </>
  )
}
