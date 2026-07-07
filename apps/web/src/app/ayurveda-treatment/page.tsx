import type { Metadata } from 'next'
import { LandingPage } from '../_gsc/LandingPage'
import { TOPIC_PAGES } from '../_gsc/_topics'

const CONTENT = TOPIC_PAGES['ayurveda-treatment']

export const metadata: Metadata = {
  title: CONTENT.metaTitle,
  description: CONTENT.metaDescription,
  alternates: { canonical: '/ayurveda-treatment' },
  keywords: CONTENT.keywords,
  openGraph: { title: CONTENT.metaTitle, description: CONTENT.metaDescription, url: '/ayurveda-treatment', type: 'article' },
  other: { robots: 'max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
}

export default function Page() {
  return (
    <LandingPage
      content={CONTENT}
      breadcrumb={[
        { name: 'Home', url: 'https://ayurconnect.com' },
        { name: 'Ayurveda Treatments', url: 'https://ayurconnect.com/ayurveda-treatment' },
      ]}
      aboutName={'Ayurveda Treatments'}
      ctaHref={'/hospitals'}
      ctaLabel={'Find treatment centres →'}
    />
  )
}
