import type { Metadata } from 'next'
import { FilteredJobsList, FilterPageHeader, fetchFilteredJobs } from '../_filtered/FilteredJobsList'

export const metadata: Metadata = {
  title: "Ayurveda Walk-in Interviews — Upcoming Job Walks | AyurConnect",
  description: "Upcoming Ayurveda walk-in interviews across Kerala and India. Date, time, venue, documents to bring.",
  alternates: { canonical: '/jobs/walk-in' },
  keywords: ["ayurveda walk-in interview","walk-in ayurveda job","BAMS walk-in","ayurveda direct interview"],
}

export default async function Page() {
  const jobs = await fetchFilteredJobs("tag=walk-in")
  return (
    <>
      <FilterPageHeader eyebrow="Walk-in" title="Walk-in Interviews" subtitle="Upcoming Ayurveda job walks — show up, interview on the spot." icon="📍" />
      <div className='container mx-auto px-4 py-8 max-w-4xl'>
        <FilteredJobsList
          jobs={jobs}
          emptyHeadline="No walk-in interviews scheduled right now."
          emptyBody="Employers post walk-in interviews here. Check back soon — or browse all jobs below."
          schemaBoardName="Walk-in Interviews"
          breadcrumb={[
            { name: 'Home', url: 'https://ayurconnect.com' },
            { name: 'Jobs', url: 'https://ayurconnect.com/jobs' },
            { name: "Walk-in", url: 'https://ayurconnect.com/jobs/walk-in' },
          ]}
        />
      </div>
    </>
  )
}
