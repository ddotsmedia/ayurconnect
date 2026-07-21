import type { Metadata } from 'next'
import { KeywordLanding } from '../../../components/landing/KeywordLanding'
import { getLandingByPath } from '../../../lib/data/landing-pages'
import { pageMetadata } from '../../../lib/seo'

// SEO keyword landing page (auto-generated 2026-07-21 batch).
// All content + FAQ live in landing-pages.ts so each of the 15 pages stays
// a 4-line shell. Edit copy there, not here.

const CONFIG = getLandingByPath('/services/herbal-medicine')!

export const metadata: Metadata = pageMetadata({
  path:        '/services/herbal-medicine',
  title:       CONFIG.metaTitle,
  description: CONFIG.metaDesc,
  type:        'article',
})

export default function Page() {
  return <KeywordLanding content={CONFIG.content} />
}
