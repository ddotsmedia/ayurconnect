import type { Metadata } from 'next'
import { LandingPage } from '../_gsc/LandingPage'
import { TOPIC_PAGES } from '../_gsc/_topics'

const CONTENT = TOPIC_PAGES['bams-vs-mbbs']

export const metadata: Metadata = {
  title: CONTENT.metaTitle,
  description: CONTENT.metaDescription,
  alternates: { canonical: '/bams-vs-mbbs' },
  keywords: CONTENT.keywords,
  openGraph: { title: CONTENT.metaTitle, description: CONTENT.metaDescription, url: '/bams-vs-mbbs', type: 'article' },
  other: { robots: 'max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
}

export default function Page() {
  return (
    <LandingPage
      content={CONTENT}
      breadcrumb={[
        { name: 'Home', url: 'https://ayurconnect.com' },
        { name: 'BAMS vs MBBS', url: 'https://ayurconnect.com/bams-vs-mbbs' },
      ]}
      aboutName={'BAMS vs MBBS'}
      ctaHref={'/bams'}
      ctaLabel={'BAMS overview →'}
    />
  )
}
