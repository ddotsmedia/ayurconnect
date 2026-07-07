import type { Metadata } from 'next'
import { LandingPage } from '../_gsc/LandingPage'
import { TOPIC_PAGES } from '../_gsc/_topics'

const CONTENT = TOPIC_PAGES['bams']

export const metadata: Metadata = {
  title: CONTENT.metaTitle,
  description: CONTENT.metaDescription,
  alternates: { canonical: '/bams' },
  keywords: CONTENT.keywords,
  openGraph: { title: CONTENT.metaTitle, description: CONTENT.metaDescription, url: '/bams', type: 'article' },
  other: { robots: 'max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
}

export default function Page() {
  return (
    <LandingPage
      content={CONTENT}
      breadcrumb={[
        { name: 'Home', url: 'https://ayurconnect.com' },
        { name: 'BAMS', url: 'https://ayurconnect.com/bams' },
      ]}
      aboutName={'BAMS'}
      ctaHref={'/learn'}
      ctaLabel={'Free study resources →'}
    />
  )
}
