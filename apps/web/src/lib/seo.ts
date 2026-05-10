// Shared SEO helpers — JSON-LD builders, meta-description shaping, canonical URLs.
// All builders return plain objects safe to JSON.stringify into a <script type="application/ld+json">.

export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://ayurconnect.com'
export const SITE_NAME = 'AyurConnect'
export const SITE_TAGLINE = "Kerala's #1 Ayurveda Platform"
export const DEFAULT_OG_IMAGE = `${SITE_URL}/opengraph-image`

// ─── String helpers ──────────────────────────────────────────────────────
export function clip(text: string | null | undefined, max = 155): string {
  if (!text) return ''
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  return clean.slice(0, max - 1).replace(/\s+\S*$/, '') + '…'
}

export function abs(path: string): string {
  if (!path) return SITE_URL
  if (path.startsWith('http')) return path
  return `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`
}

// ─── JSON-LD builders ────────────────────────────────────────────────────

export function organizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalOrganization',
    '@id': `${SITE_URL}#org`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
    medicalSpecialty: ['Ayurveda', 'Panchakarma', 'Traditional Indian Medicine'],
    areaServed: { '@type': 'AdministrativeArea', name: 'Kerala, India' },
    description: `${SITE_TAGLINE} — CCIM-verified doctors, classical Panchakarma centres, herb encyclopedia, AyurBot AI.`,
    sameAs: [
      // Add real social URLs here once they exist
    ],
  }
}

export function websiteLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_TAGLINE,
    publisher: { '@id': `${SITE_URL}#org` },
    // Sitelinks search box — Google may render an inline search box for your site in SERPs
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/doctors?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
    inLanguage: ['en-IN', 'ml-IN'],
  }
}

export function breadcrumbLd(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: abs(item.url),
    })),
  }
}

export function physicianLd(d: {
  id: string
  name: string
  specialization?: string | null
  district?: string | null
  qualification?: string | null
  bio?: string | null
  profile?: string | null
  contact?: string | null
  address?: string | null
  photoUrl?: string | null
  languages?: string[] | null
  averageRating?: number | null
  reviewsCount?: number
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    '@id': `${SITE_URL}/doctors/${d.id}`,
    name: d.name,
    medicalSpecialty: d.specialization ? d.specialization.split(/[,/|]/).map((s) => s.trim()).filter(Boolean) : undefined,
    description: d.bio ?? d.profile ?? undefined,
    url: `${SITE_URL}/doctors/${d.id}`,
    image: d.photoUrl ? abs(d.photoUrl) : `${SITE_URL}/doctors/${d.id}/opengraph-image`,
    knowsLanguage: d.languages?.length ? d.languages : undefined,
    address: d.district ? {
      '@type': 'PostalAddress',
      addressLocality: d.district,
      addressRegion: 'KL',
      addressCountry: 'IN',
      streetAddress: d.address ?? undefined,
    } : undefined,
    telephone: d.contact ?? undefined,
    aggregateRating: d.averageRating != null && d.reviewsCount && d.reviewsCount > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: d.averageRating,
      reviewCount: d.reviewsCount,
      bestRating: 5,
      worstRating: 1,
    } : undefined,
    memberOf: { '@id': `${SITE_URL}#org` },
  }
}

export function hospitalLd(h: {
  id: string
  name: string
  type?: string | null
  district?: string | null
  ayushCertified?: boolean
  panchakarma?: boolean
  nabh?: boolean
  classification?: string | null
  establishedYear?: number | null
  services?: string[] | null
  contact?: string | null
  address?: string | null
  profile?: string | null
  latitude?: number | null
  longitude?: number | null
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Hospital',
    '@id': `${SITE_URL}/hospitals/${h.id}`,
    name: h.name,
    description: h.profile ?? `${h.name} — Ayurveda hospital in ${h.district ?? 'Kerala'}.`,
    url: `${SITE_URL}/hospitals/${h.id}`,
    image: `${SITE_URL}/hospitals/${h.id}/opengraph-image`,
    medicalSpecialty: h.services?.length ? h.services : ['Ayurveda', 'Panchakarma'],
    foundingDate: h.establishedYear ? String(h.establishedYear) : undefined,
    address: h.district ? {
      '@type': 'PostalAddress',
      addressLocality: h.district,
      addressRegion: 'KL',
      addressCountry: 'IN',
      streetAddress: h.address ?? undefined,
    } : undefined,
    telephone: h.contact ?? undefined,
    geo: h.latitude != null && h.longitude != null ? {
      '@type': 'GeoCoordinates',
      latitude: h.latitude,
      longitude: h.longitude,
    } : undefined,
    isAcceptingNewPatients: true,
    parentOrganization: { '@id': `${SITE_URL}#org` },
  }
}

// MedicalIndication / Substance — for herbs. Schema.org has limited support
// for traditional medicine, so we use Substance with extension properties.
export function herbLd(h: {
  id: string
  name: string
  sanskrit?: string | null
  english?: string | null
  malayalam?: string | null
  rasa?: string | null
  guna?: string | null
  virya?: string | null
  vipaka?: string | null
  description?: string | null
  uses?: string | null
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Substance',
    '@id': `${SITE_URL}/herbs/${h.id}`,
    name: h.name,
    alternateName: [h.sanskrit, h.english, h.malayalam].filter(Boolean) as string[],
    description: h.description ?? undefined,
    url: `${SITE_URL}/herbs/${h.id}`,
    image: `${SITE_URL}/herbs/${h.id}/opengraph-image`,
    additionalProperty: [
      h.rasa   ? { '@type': 'PropertyValue', name: 'Rasa (taste)',                  value: h.rasa } : null,
      h.guna   ? { '@type': 'PropertyValue', name: 'Guna (quality)',                value: h.guna } : null,
      h.virya  ? { '@type': 'PropertyValue', name: 'Virya (potency)',               value: h.virya } : null,
      h.vipaka ? { '@type': 'PropertyValue', name: 'Vipaka (post-digestive effect)', value: h.vipaka } : null,
      h.uses   ? { '@type': 'PropertyValue', name: 'Traditional uses',              value: h.uses } : null,
    ].filter(Boolean),
  }
}

export function articleLd(a: {
  id: string
  title: string
  content?: string | null
  category?: string | null
  language?: string | null
  createdAt?: string | Date
  updatedAt?: string | Date
  authorName?: string | null
  type?: 'Article' | 'NewsArticle' | 'BlogPosting' | 'MedicalScholarlyArticle' | 'DiscussionForumPosting'
  urlPath: string // e.g. '/articles/abc123' or '/forum/abc123'
}) {
  const created = a.createdAt instanceof Date ? a.createdAt.toISOString() : (a.createdAt ?? new Date().toISOString())
  const updated = a.updatedAt instanceof Date ? a.updatedAt.toISOString() : (a.updatedAt ?? created)
  return {
    '@context': 'https://schema.org',
    '@type': a.type ?? 'Article',
    '@id': `${SITE_URL}${a.urlPath}`,
    headline: a.title,
    description: clip(a.content, 200),
    url: `${SITE_URL}${a.urlPath}`,
    inLanguage: a.language ?? 'en',
    datePublished: created,
    dateModified: updated,
    author: a.authorName ? { '@type': 'Person', name: a.authorName } : undefined,
    publisher: { '@id': `${SITE_URL}#org` },
    articleSection: a.category ?? undefined,
    image: `${SITE_URL}/opengraph-image`,
  }
}

export function faqLd(items: Array<{ q: string; a: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: { '@type': 'Answer', text: it.a },
    })),
  }
}

// Convenience: combine multiple JSON-LD blocks into a graph for one tag.
export function ldGraph(...nodes: object[]) {
  return { '@context': 'https://schema.org', '@graph': nodes }
}
