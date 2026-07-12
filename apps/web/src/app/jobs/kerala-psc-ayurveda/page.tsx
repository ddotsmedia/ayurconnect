import type { Metadata } from 'next'
import { LandingPage } from '../../_gsc/LandingPage'
import { TOPIC_PAGES } from '../../_gsc/_topics'

const CONTENT = TOPIC_PAGES['jobs/kerala-psc-ayurveda']

export const metadata: Metadata = {
  title: CONTENT.metaTitle,
  description: CONTENT.metaDescription,
  alternates: { canonical: '/jobs/kerala-psc-ayurveda' },
  keywords: CONTENT.keywords,
  openGraph: { title: CONTENT.metaTitle, description: CONTENT.metaDescription, url: '/jobs/kerala-psc-ayurveda', type: 'article' },
  other: { robots: 'max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
}

export default function Page() {
  return (
    <LandingPage
      content={CONTENT}
      breadcrumb={[
        { name: 'Home', url: 'https://ayurconnect.com' },
        { name: 'Jobs', url: 'https://ayurconnect.com/jobs' },
        { name: 'Kerala PSC Ayurveda', url: 'https://ayurconnect.com/jobs/kerala-psc-ayurveda' },
      ]}
      aboutName={'Kerala PSC Ayurveda Medical Officer'}
      ctaHref={'/learn/mcq'}
      ctaLabel={'Practice MCQs →'}
    />
  )
}
