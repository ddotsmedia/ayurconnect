import type { Metadata } from 'next'
import { LandingPage } from '../_gsc/LandingPage'
import { TOPIC_PAGES } from '../_gsc/_topics'

const CONTENT = TOPIC_PAGES['ayurveda-back-pain-treatment']

export const metadata: Metadata = {
  title: CONTENT.metaTitle,
  description: CONTENT.metaDescription,
  alternates: { canonical: '/ayurveda-back-pain-treatment' },
  keywords: CONTENT.keywords,
  openGraph: { title: CONTENT.metaTitle, description: CONTENT.metaDescription, url: '/ayurveda-back-pain-treatment', type: 'article' },
  other: { robots: 'max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
}

export default function Page() {
  return (
    <LandingPage
      content={CONTENT}
      breadcrumb={[
        { name: 'Home', url: 'https://ayurconnect.com' },
        { name: 'Back Pain Treatment', url: 'https://ayurconnect.com/ayurveda-back-pain-treatment' },
      ]}
      aboutName={'Back Pain Treatment'}
      ctaHref={'/doctors'}
      ctaLabel={'Find back-pain specialists →'}
    />
  )
}
