// Malayalam SEO landing pages — content generated via Sonnet for authenticity.
// Each entry powers /ml/[slug] with full Malayalam article + FAQ + schema.

export type MlPage = {
  slug: string
  titleMl: string
  titleEn: string
  metaDescMl: string
  conditionEn: string
  conditionMl: string
  leadParagraph: string
  sections: Array<{ heading: string; body: string }>
  faqs: Array<{ q: string; a: string }>
  relatedEnSlug: string | null
}

import { ML_PAGES_DATA } from './_content'

export const ML_PAGES: MlPage[] = Object.values(ML_PAGES_DATA)
export const ML_SLUGS: string[] = ML_PAGES.map((p) => p.slug)

export function getMlPage(slug: string): MlPage | null {
  return ML_PAGES_DATA[slug] ?? null
}
