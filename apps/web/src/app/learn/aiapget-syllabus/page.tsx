import type { Metadata } from 'next'
import { LandingPage } from '../../_gsc/LandingPage'
import { TOPIC_PAGES } from '../../_gsc/_topics'

const CONTENT = TOPIC_PAGES['learn/aiapget-syllabus']

export const metadata: Metadata = {
  title: CONTENT.metaTitle,
  description: CONTENT.metaDescription,
  alternates: { canonical: '/learn/aiapget-syllabus' },
  keywords: CONTENT.keywords,
  openGraph: { title: CONTENT.metaTitle, description: CONTENT.metaDescription, url: '/learn/aiapget-syllabus', type: 'article' },
  other: { robots: 'max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
}

export default function Page() {
  return (
    <LandingPage
      content={CONTENT}
      breadcrumb={[
        { name: 'Home', url: 'https://ayurconnect.com' },
        { name: 'Learn', url: 'https://ayurconnect.com/learn' },
        { name: 'AIAPGET Syllabus', url: 'https://ayurconnect.com/learn/aiapget-syllabus' },
      ]}
      aboutName={'AIAPGET Syllabus'}
      ctaHref={'/learn/mcq'}
      ctaLabel={'Practice MCQs →'}
    />
  )
}
