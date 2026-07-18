import type { Metadata } from 'next'
import { FilteredJobsList, FilterPageHeader, fetchFilteredJobs } from '../_filtered/FilteredJobsList'

export const metadata: Metadata = {
  title: 'Ayurveda Doctor Jobs — BAMS, MD Ayurveda Vacancies',
  description: 'BAMS + MD Ayurveda doctor vacancies across Kerala, UAE, GCC. Kayachikitsa, Panchakarma, Prasuti, Shalya, Shalakya specialists in demand. Apply free.',
  alternates: { canonical: '/jobs/doctor' },
  keywords: ['ayurveda doctor job', 'BAMS vacancy', 'MD ayurveda job', 'panchakarma physician job', 'kayachikitsa doctor'],
}

export default async function DoctorJobsPage() {
  const jobs = await fetchFilteredJobs('type=doctor')
  return (
    <>
      <FilterPageHeader eyebrow="Doctors" title="Ayurveda Doctor Jobs" subtitle="BAMS + MD Ayurveda vacancies — Kayachikitsa, Panchakarma, Prasuti, Shalya specialists." icon="👨‍⚕️" />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <FilteredJobsList
          jobs={jobs}
          emptyHeadline="No doctor-tagged openings right now."
          emptyBody="Browse all jobs — many employers post without an explicit role tag."
          schemaBoardName="Ayurveda Doctor Jobs"
          breadcrumb={[
            { name: 'Home', url: 'https://ayurconnect.com' },
            { name: 'Jobs', url: 'https://ayurconnect.com/jobs' },
            { name: 'Doctors', url: 'https://ayurconnect.com/jobs/doctor' },
          ]}
        />
      </div>
    </>
  )
}
