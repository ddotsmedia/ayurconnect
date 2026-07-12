import type { Metadata } from 'next'
import { LandingPage } from '../../_gsc/LandingPage'
import { TOPIC_PAGES } from '../../_gsc/_topics'

const CONTENT = TOPIC_PAGES['jobs/government-ayurveda-jobs']

export const metadata: Metadata = {
  title: CONTENT.metaTitle,
  description: CONTENT.metaDescription,
  alternates: { canonical: '/jobs/government-ayurveda-jobs' },
  keywords: CONTENT.keywords,
  openGraph: { title: CONTENT.metaTitle, description: CONTENT.metaDescription, url: '/jobs/government-ayurveda-jobs', type: 'article' },
  other: { robots: 'max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
}

export default function Page() {
  return (
    <LandingPage
      content={CONTENT}
      breadcrumb={[
        { name: 'Home', url: 'https://ayurconnect.com' },
        { name: 'Jobs', url: 'https://ayurconnect.com/jobs' },
        { name: 'Government Ayurveda Jobs', url: 'https://ayurconnect.com/jobs/government-ayurveda-jobs' },
      ]}
      aboutName={'Government Ayurveda Jobs'}
      ctaHref={'/jobs'}
      ctaLabel={'Browse jobs →'}
    />
  )
}
