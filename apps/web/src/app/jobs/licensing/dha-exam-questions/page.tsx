import type { Metadata } from 'next'
import { LandingPage } from '../../../_gsc/LandingPage'
import { TOPIC_PAGES } from '../../../_gsc/_topics'

const CONTENT = TOPIC_PAGES['jobs/licensing/dha-exam-questions']

export const metadata: Metadata = {
  title: CONTENT.metaTitle,
  description: CONTENT.metaDescription,
  alternates: { canonical: '/jobs/licensing/dha-exam-questions' },
  keywords: CONTENT.keywords,
  openGraph: { title: CONTENT.metaTitle, description: CONTENT.metaDescription, url: '/jobs/licensing/dha-exam-questions', type: 'article' },
  other: { robots: 'max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
}

export default function Page() {
  return (
    <LandingPage
      content={CONTENT}
      breadcrumb={[
        { name: 'Home', url: 'https://ayurconnect.com' },
        { name: 'Jobs', url: 'https://ayurconnect.com/jobs' },
        { name: 'Licensing', url: 'https://ayurconnect.com/jobs/licensing' },
        { name: 'DHA Exam Questions', url: 'https://ayurconnect.com/jobs/licensing/dha-exam-questions' },
      ]}
      aboutName={'DHA Exam Questions Ayurveda'}
      ctaHref={'/learn/mcq'}
      ctaLabel={'Practice 100 MCQs →'}
    />
  )
}
