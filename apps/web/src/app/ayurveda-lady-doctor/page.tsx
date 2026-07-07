import type { Metadata } from 'next'
import { LandingPage } from '../_gsc/LandingPage'
import { TOPIC_PAGES } from '../_gsc/_topics'

const CONTENT = TOPIC_PAGES['ayurveda-lady-doctor']

export const metadata: Metadata = {
  title: CONTENT.metaTitle,
  description: CONTENT.metaDescription,
  alternates: { canonical: '/ayurveda-lady-doctor' },
  keywords: CONTENT.keywords,
  openGraph: { title: CONTENT.metaTitle, description: CONTENT.metaDescription, url: '/ayurveda-lady-doctor', type: 'article' },
  other: { robots: 'max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
}

export default function Page() {
  return (
    <LandingPage
      content={CONTENT}
      breadcrumb={[
        { name: 'Home', url: 'https://ayurconnect.com' },
        { name: 'Ayurveda Lady Doctor', url: 'https://ayurconnect.com/ayurveda-lady-doctor' },
      ]}
      aboutName={'Ayurveda Lady Doctor'}
      ctaHref={'/doctors'}
      ctaLabel={'Search doctors →'}
    />
  )
}
