export type AudiencePage = {
  slug: string
  title: string
  h1: string
  metaDescription: string
  ogSummary: string
  keywords: string[]
  leadParagraph: string
  sections: Array<{ heading: string; body: string }>
  ctas: Array<{ label: string; href: string }>
  faqs: Array<{ q: string; a: string }>
}
