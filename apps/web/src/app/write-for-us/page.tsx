import type { Metadata } from 'next'
import { AudienceLandingPage } from '../_audience/AudienceLandingPage'
import { WRITE_FOR_US } from './_content'

export const metadata: Metadata = {
  title: WRITE_FOR_US.title,
  description: WRITE_FOR_US.metaDescription,
  alternates: { canonical: '/write-for-us' },
  keywords: WRITE_FOR_US.keywords,
  openGraph: { title: WRITE_FOR_US.title, description: WRITE_FOR_US.ogSummary, url: '/write-for-us', type: 'website' },
  other: { robots: 'max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
}

export default function WriteForUsPage() {
  return (
    <AudienceLandingPage
      page={WRITE_FOR_US}
      path="/write-for-us"
      breadcrumb={[
        { name: 'Home', url: 'https://ayurconnect.com' },
        { name: 'Write for AyurConnect', url: 'https://ayurconnect.com/write-for-us' },
      ]}
      variant="green"
    />
  )
}
