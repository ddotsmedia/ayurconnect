import type { Metadata } from 'next'
import { FilteredJobsList, FilterPageHeader, fetchFilteredJobs } from '../_filtered/FilteredJobsList'

export const metadata: Metadata = {
  title: "BAMS Fresher Jobs — Entry Level Ayurveda Careers",
  description: "BAMS fresher jobs across Kerala, UAE, India. Entry-level Ayurveda doctor vacancies for 0-2 years experience. Apply free.",
  alternates: { canonical: '/jobs/freshers' },
  keywords: ["BAMS fresher job","ayurveda fresher vacancy 2026","BAMS entry level job","BAMS first job","fresh BAMS job kerala"],
}

export default async function Page() {
  const jobs = await fetchFilteredJobs("expMaxLte=2")
  return (
    <>
      <FilterPageHeader eyebrow="Freshers" title="BAMS Fresher Jobs" subtitle="Entry-level Ayurveda roles — 0-2 years experience welcome." icon="🎓" />
      <div className='container mx-auto px-4 py-8 max-w-4xl'>
        <FilteredJobsList
          jobs={jobs}
          emptyHeadline="No fresher-tagged jobs right now."
          emptyBody="Many entry-level employers do not always tag experience. Browse all jobs and filter by experience."
          schemaBoardName="BAMS Fresher Jobs"
          breadcrumb={[
            { name: 'Home', url: 'https://ayurconnect.com' },
            { name: 'Jobs', url: 'https://ayurconnect.com/jobs' },
            { name: "Freshers", url: 'https://ayurconnect.com/jobs/freshers' },
          ]}
        />
      </div>
    </>
  )
}
