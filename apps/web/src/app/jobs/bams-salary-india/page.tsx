import type { Metadata } from 'next'
import { LandingPage } from '../../_gsc/LandingPage'
import { TOPIC_PAGES } from '../../_gsc/_topics'

const CONTENT = TOPIC_PAGES['jobs/bams-salary-india']

export const metadata: Metadata = {
  title: CONTENT.metaTitle,
  description: CONTENT.metaDescription,
  alternates: { canonical: '/jobs/bams-salary-india' },
  keywords: CONTENT.keywords,
  openGraph: { title: CONTENT.metaTitle, description: CONTENT.metaDescription, url: '/jobs/bams-salary-india', type: 'article' },
  other: { robots: 'max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
}

export default function Page() {
  return (
    <LandingPage
      content={CONTENT}
      breadcrumb={[
        { name: 'Home', url: 'https://ayurconnect.com' },
        { name: 'Jobs', url: 'https://ayurconnect.com/jobs' },
        { name: 'BAMS Salary India', url: 'https://ayurconnect.com/jobs/bams-salary-india' },
      ]}
      aboutName={'BAMS Doctor Salary India'}
      ctaHref={'/jobs/salary-calculator'}
      ctaLabel={'Salary calculator →'}
    />
  )
}
