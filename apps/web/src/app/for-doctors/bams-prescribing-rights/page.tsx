import type { Metadata } from 'next'
import { LandingPage } from '../../_gsc/LandingPage'
import { TOPIC_PAGES } from '../../_gsc/_topics'

const CONTENT = TOPIC_PAGES['for-doctors/bams-prescribing-rights']

export const metadata: Metadata = {
  title: CONTENT.metaTitle,
  description: CONTENT.metaDescription,
  alternates: { canonical: '/for-doctors/bams-prescribing-rights' },
  keywords: CONTENT.keywords,
  openGraph: { title: CONTENT.metaTitle, description: CONTENT.metaDescription, url: '/for-doctors/bams-prescribing-rights', type: 'article' },
  other: { robots: 'max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
}

export default function Page() {
  return (
    <LandingPage
      content={CONTENT}
      breadcrumb={[
        { name: 'Home', url: 'https://ayurconnect.com' },
        { name: 'For Doctors', url: 'https://ayurconnect.com/for-doctors' },
        { name: 'BAMS Prescribing Rights', url: 'https://ayurconnect.com/for-doctors/bams-prescribing-rights' },
      ]}
      aboutName={'BAMS Prescribing Rights'}
      ctaHref={'/for-doctors'}
      ctaLabel={'More for doctors →'}
    />
  )
}
