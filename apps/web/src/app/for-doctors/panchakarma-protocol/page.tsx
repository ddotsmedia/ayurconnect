import type { Metadata } from 'next'
import { LandingPage } from '../../_gsc/LandingPage'
import { TOPIC_PAGES } from '../../_gsc/_topics'

const CONTENT = TOPIC_PAGES['for-doctors/panchakarma-protocol']

export const metadata: Metadata = {
  title: CONTENT.metaTitle,
  description: CONTENT.metaDescription,
  alternates: { canonical: '/for-doctors/panchakarma-protocol' },
  keywords: CONTENT.keywords,
  openGraph: { title: CONTENT.metaTitle, description: CONTENT.metaDescription, url: '/for-doctors/panchakarma-protocol', type: 'article' },
  other: { robots: 'max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
}

export default function Page() {
  return (
    <LandingPage
      content={CONTENT}
      breadcrumb={[
        { name: 'Home', url: 'https://ayurconnect.com' },
        { name: 'For Doctors', url: 'https://ayurconnect.com/for-doctors' },
        { name: 'Panchakarma Protocol', url: 'https://ayurconnect.com/for-doctors/panchakarma-protocol' },
      ]}
      aboutName={'Panchakarma Protocol'}
      ctaHref={'/quick-reference'}
      ctaLabel={'Quick drug reference →'}
    />
  )
}
