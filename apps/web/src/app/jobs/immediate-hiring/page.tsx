import type { Metadata } from 'next'
import { FilteredJobsList, FilterPageHeader, fetchFilteredJobs } from '../_filtered/FilteredJobsList'

export const metadata: Metadata = {
  title: "Urgent Ayurveda Jobs — Immediate Hiring | AyurConnect",
  description: "Ayurveda doctor urgent requirements. Hospitals and clinics hiring immediately. BAMS, MD, Panchakarma roles across India and GCC.",
  alternates: { canonical: '/jobs/immediate-hiring' },
  keywords: ["ayurveda doctor urgent requirement","immediate ayurveda job vacancy","urgent BAMS hiring","urgent panchakarma doctor"],
}

export default async function Page() {
  const jobs = await fetchFilteredJobs("urgent=1")
  return (
    <>
      <FilterPageHeader eyebrow="Urgent hiring" title="Urgent Ayurveda Jobs" subtitle="Immediate-hiring openings — employer needs you to start fast." icon="🔴" />
      <div className='container mx-auto px-4 py-8 max-w-4xl'>
        <FilteredJobsList
          jobs={jobs}
          emptyHeadline="No urgent openings posted right now."
          emptyBody="Employers mark jobs urgent when they need a fast hire. Set a job alert to be notified when an urgent role posts."
          schemaBoardName="Urgent Ayurveda Jobs"
          breadcrumb={[
            { name: 'Home', url: 'https://ayurconnect.com' },
            { name: 'Jobs', url: 'https://ayurconnect.com/jobs' },
            { name: "Urgent hiring", url: 'https://ayurconnect.com/jobs/immediate-hiring' },
          ]}
        />
      </div>
    </>
  )
}
