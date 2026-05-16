// Shared SEO helpers — JSON-LD builders, meta-description shaping, canonical URLs.
// All builders return plain objects safe to JSON.stringify into a <script type="application/ld+json">.

export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://ayurconnect.com'
export const SITE_NAME = 'AyurConnect'
export const SITE_TAGLINE = "Kerala's #1 Ayurveda Platform"
export const DEFAULT_OG_IMAGE = `${SITE_URL}/opengraph-image`

// ─── Keyword catalogue ───────────────────────────────────────────────────
// Single source of truth for Ayurveda-related keywords. Google effectively
// ignores <meta name="keywords">, but Bing / Yandex / Baidu still weight it
// lightly, and the array also lets per-page generateMetadata() pull a
// targeted subset (e.g. condition pages spread CONDITIONS + TREATMENTS).
//
// Add new keywords here — do not duplicate strings on individual pages.

const KW = {
  // High-intent generic queries.
  primary: [
    'ayurveda', 'ayurvedic medicine', 'ayurvedic consultation', 'online ayurvedic consultation',
    'ayurvedic doctor online', 'online ayurveda doctor', 'ayurveda treatment online',
    'virtual ayurveda consultation', 'telemedicine ayurveda', 'video ayurveda consultation',
    'ayurvedic health consultation', 'ayurvedic clinic', 'ayurvedic hospital',
    'ayurvedic practitioner', 'best ayurvedic doctor', 'ayurvedic specialist',
  ],
  // Conditions Ayurveda is commonly searched for (Tier 2 conversion queries).
  conditions: [
    'ayurvedic treatment for PCOS', 'ayurvedic treatment for PCOD',
    'ayurvedic treatment for thyroid', 'ayurvedic treatment for diabetes',
    'ayurvedic treatment for hypertension', 'ayurvedic treatment for high blood pressure',
    'ayurvedic treatment for cholesterol', 'ayurvedic treatment for fatty liver',
    'ayurvedic treatment for arthritis', 'ayurvedic treatment for rheumatoid arthritis',
    'ayurvedic treatment for back pain', 'ayurvedic treatment for joint pain',
    'ayurvedic treatment for sciatica', 'ayurvedic treatment for spondylitis',
    'ayurvedic treatment for migraine', 'ayurvedic treatment for headache',
    'ayurvedic treatment for anxiety', 'ayurvedic treatment for stress',
    'ayurvedic treatment for depression', 'ayurvedic treatment for insomnia',
    'ayurvedic treatment for sleep disorders', 'ayurvedic treatment for skin diseases',
    'ayurvedic treatment for eczema', 'ayurvedic treatment for psoriasis',
    'ayurvedic treatment for acne', 'ayurvedic treatment for hair fall',
    'ayurvedic treatment for hair loss', 'ayurvedic treatment for dandruff',
    'ayurvedic treatment for digestion', 'ayurvedic treatment for IBS',
    'ayurvedic treatment for constipation', 'ayurvedic treatment for acidity',
    'ayurvedic treatment for ulcer', 'ayurvedic treatment for piles',
    'ayurvedic treatment for fissure', 'ayurvedic treatment for fistula',
    'ayurvedic treatment for asthma', 'ayurvedic treatment for sinusitis',
    'ayurvedic treatment for allergy', 'ayurvedic treatment for cold and cough',
    'ayurvedic treatment for infertility', 'ayurvedic treatment for menopause',
    'ayurvedic treatment for irregular periods', 'ayurvedic treatment for menstrual disorders',
    'ayurvedic treatment for obesity', 'ayurvedic treatment for weight loss',
    'ayurvedic treatment for weight gain', 'ayurvedic treatment for kidney stones',
    'ayurvedic treatment for liver problems', 'ayurvedic treatment for paralysis',
    'ayurvedic treatment for stroke recovery', 'ayurvedic treatment for cervical pain',
    'ayurvedic treatment for varicose veins', 'ayurvedic treatment for autoimmune disease',
  ],
  // Classical Ayurvedic procedures and Panchakarma therapies.
  treatments: [
    'panchakarma', 'panchakarma treatment', 'panchakarma in kerala', 'panchakarma consultation online',
    'shirodhara', 'abhyanga', 'nasya', 'basti', 'virechana', 'vamana', 'raktamokshana',
    'udvartana', 'udwarthanam', 'njavara kizhi', 'pizhichil', 'kati basti', 'janu basti',
    'greeva basti', 'snehapana', 'takradhara', 'sirovasti', 'ksheeradhara', 'thalapothichil',
    'thakradhara', 'marma therapy', 'marma chikitsa', 'karkidaka chikitsa',
    'rasayana chikitsa', 'agnikarma', 'jalaukavacharana', 'leech therapy',
    'uttara basti', 'matra basti', 'kashaya basti', 'anuvasana basti',
    'kerala panchakarma', 'classical panchakarma', 'rejuvenation therapy',
  ],
  // Medicinal herbs and classical formulations.
  herbs: [
    'ashwagandha', 'triphala', 'brahmi', 'tulsi', 'neem', 'turmeric', 'curcumin',
    'guduchi', 'giloy', 'shatavari', 'gokshura', 'guggulu', 'arjuna', 'amla',
    'manjistha', 'haritaki', 'bibhitaki', 'jatamansi', 'vacha', 'yashtimadhu',
    'mulethi', 'licorice', 'pippali', 'long pepper', 'trikatu', 'dashamoola',
    'chyawanprash', 'kanchanara guggulu', 'yogaraj guggulu', 'kaishore guggulu',
    'mahanarayana taila', 'ksheerabala taila', 'dhanwantharam', 'kottakkal arishtam',
    'saraswatarishta', 'dashamoolarishta', 'drakshasava', 'lohasava', 'pippalyasava',
    'ayurvedic herbs', 'herbal medicine', 'herbal remedy', 'medicinal plants of kerala',
    'ayurvedic formulary', 'classical ayurvedic formulations',
  ],
  // BAMS specialisations recognised by CCIM / NCISM.
  specialisations: [
    'kayachikitsa', 'general medicine ayurveda', 'panchakarma specialist',
    'prasuti tantra', 'streeroga', 'ayurvedic gynecologist', 'kaumarbhritya',
    'ayurvedic pediatrician', 'shalya tantra', 'ayurvedic surgeon', 'shalakya tantra',
    'ayurvedic ENT', 'ayurvedic ophthalmology', 'agada tantra', 'rasashastra',
    'bhaishajya kalpana', 'dravyaguna', 'roganidana', 'swasthavritta',
    'manasika', 'ayurvedic psychiatry', 'kriya sharira', 'rachana sharira',
  ],
  // Dosha / concept / theory vocabulary.
  concepts: [
    'vata dosha', 'pitta dosha', 'kapha dosha', 'tridosha', 'prakriti', 'vikriti',
    'dosha test', 'prakriti analysis', 'sapta dhatu', 'agni', 'ama', 'ojas', 'tejas',
    'prana', 'srotas', 'rasayana', 'shodhana', 'shamana', 'ahara', 'vihara',
    'dinacharya', 'ritucharya', 'sadvritta', 'pathya apathya', 'ayurvedic diet',
    'ayurvedic lifestyle', 'ayurvedic body type',
  ],
  // Geographic + diaspora intent — Kerala towns + GCC + global.
  geographic: [
    'ayurveda kerala', 'kerala ayurveda', 'ayurveda kochi', 'ayurveda ernakulam',
    'ayurveda thrissur', 'ayurveda kottakkal', 'ayurveda calicut', 'ayurveda kozhikode',
    'ayurveda trivandrum', 'ayurveda thiruvananthapuram', 'ayurveda kollam',
    'ayurveda alappuzha', 'ayurveda kottayam', 'ayurveda palakkad', 'ayurveda wayanad',
    'ayurveda dubai', 'ayurveda abu dhabi', 'ayurveda sharjah', 'ayurveda uae',
    'ayurveda gcc', 'ayurveda nri', 'ayurveda london', 'ayurveda usa',
    'kerala ayurveda doctor in uae', 'malayali ayurveda doctor',
    'ayurveda tourism kerala', 'ayurveda retreat kerala',
  ],
  // Trust signals + adjacent terms patients search for.
  signals: [
    'verified', 'BAMS doctor', 'MD ayurveda', 'AYUSH ministry', 'AYUSH certified',
    'AYUSH approved', 'CCRAS', 'NIA jaipur', 'NABH ayurveda', 'evidence based ayurveda',
    'classical ayurveda', 'authentic ayurveda', 'ayurveda research', 'traditional indian medicine',
    'integrative medicine', 'holistic medicine', 'alternative medicine',
  ],
  // Brand + product lines for completeness.
  brand: [
    'AyurConnect', 'AyurBot', 'AyurBot AI', 'ayurveda app', 'ayurvedic consultation app',
    'book ayurveda online', 'find ayurveda doctor near me',
  ],
} as const

// Flat union — used as the default site-wide keywords array in layout.tsx.
export const AYURVEDA_KEYWORDS = {
  ...KW,
  all: Array.from(new Set([
    ...KW.primary, ...KW.conditions, ...KW.treatments, ...KW.herbs,
    ...KW.specialisations, ...KW.concepts, ...KW.geographic, ...KW.signals, ...KW.brand,
  ])),
}

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
    medicalSpecialty: [
      'Ayurveda', 'Traditional Indian Medicine', 'Panchakarma',
      'Kayachikitsa (General Medicine)', 'Prasuti Tantra (Gynecology & Obstetrics)',
      'Kaumarbhritya (Pediatrics)', 'Shalya Tantra (Surgery)',
      'Shalakya Tantra (ENT & Ophthalmology)', 'Agada Tantra (Toxicology)',
      'Rasashastra & Bhaishajya Kalpana (Pharmaceutics)',
      'Dravyaguna (Materia Medica)', 'Roganidana (Pathology)',
      'Swasthavritta (Preventive Medicine)', 'Manasika (Ayurvedic Psychiatry)',
      'Rasayana (Rejuvenation Therapy)', 'Marma Chikitsa',
      'Karkidaka Chikitsa (Monsoon Rejuvenation)',
    ],
    // UAE listed alongside Kerala because the Kerala diaspora consultations
    // are a primary use case. Google will surface us for "ayurveda doctor uae"
    // queries when areaServed includes Country/UAE entities.
    areaServed: [
      { '@type': 'Country', name: 'India' },
      { '@type': 'AdministrativeArea', name: 'Kerala, India' },
      { '@type': 'Country', name: 'United Arab Emirates' },
      { '@type': 'City', name: 'Dubai' },
      { '@type': 'City', name: 'Abu Dhabi' },
      { '@type': 'City', name: 'Sharjah' },
    ],
    description: `${SITE_TAGLINE} — verified doctors, classical Panchakarma centres, herb encyclopedia, AyurBot AI. Online consultations across UAE, GCC, US, UK, and Europe.`,
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        telephone: '+971-50-937-9212',
        availableLanguage: ['English', 'Malayalam', 'Hindi', 'Arabic'],
        areaServed: ['IN', 'AE', 'SA', 'QA', 'KW', 'OM', 'BH', 'US', 'GB'],
      },
      {
        '@type': 'ContactPoint',
        contactType: 'doctor contact concierge',
        telephone: '+971-55-448-5169',
        availableLanguage: ['English', 'Malayalam', 'Hindi', 'Arabic'],
      },
    ],
    sameAs: [
      // Add real social URLs here once they exist
    ],
  }
}

// JobPosting schema — emit one per imported / live job for Google Jobs.
// Schema.org docs: https://schema.org/JobPosting
export function jobPostingLd(j: {
  id: string
  title: string
  description: string
  type?: string | null            // doctor | therapist | pharmacist | government
  district?: string | null
  state?: string | null           // optional state, falls back to Kerala
  country?: string | null         // ISO-2 fallback IN
  salary?: string | null
  createdAt?: string | Date
  validThrough?: string | Date    // optional expiry
  employerName?: string | null
}) {
  const datePosted = (j.createdAt instanceof Date ? j.createdAt : new Date(j.createdAt ?? new Date())).toISOString()
  // Default validity = 60 days from posting if not given.
  const validThrough = j.validThrough
    ? (j.validThrough instanceof Date ? j.validThrough : new Date(j.validThrough)).toISOString()
    : new Date(Date.parse(datePosted) + 60 * 86400 * 1000).toISOString()
  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    '@id': `${SITE_URL}/jobs#${j.id}`,
    title: j.title,
    description: j.description,
    datePosted,
    validThrough,
    employmentType: 'FULL_TIME',
    hiringOrganization: j.employerName
      ? { '@type': 'Organization', name: j.employerName }
      : { '@id': `${SITE_URL}#org` },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: j.district ?? undefined,
        addressRegion: j.state ?? (j.country === 'IN' || !j.country ? 'Kerala' : undefined),
        addressCountry: j.country ?? 'IN',
      },
    },
    baseSalary: j.salary
      ? {
          '@type': 'MonetaryAmount',
          currency: j.country === 'AE' ? 'AED' : 'INR',
          value: { '@type': 'QuantitativeValue', value: j.salary, unitText: 'MONTH' },
        }
      : undefined,
    url: `${SITE_URL}/jobs#${j.id}`,
    industry: 'Ayurveda / AYUSH / Traditional Indian Medicine',
    occupationalCategory: 'Healthcare Practitioner',
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

// Homepage MedicalBusiness — sits alongside the root MedicalOrganization
// (in layout.tsx) and adds a service catalog so Google can render service
// rich-result snippets. Keep services aligned with the actual offerings
// visible on the homepage.
export function medicalBusinessLd(services: string[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    '@id': `${SITE_URL}#business`,
    name: SITE_NAME,
    url: SITE_URL,
    description: 'Online platform connecting patients with verified Ayurvedic doctors for personalized consultations, classical Panchakarma, and herbal wellness guidance.',
    medicalSpecialty: 'Ayurvedic Medicine',
    parentOrganization: { '@id': `${SITE_URL}#org` },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Ayurvedic Services',
      itemListElement: services.map((s) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: s },
      })),
    },
  }
}

// MedicalCondition schema for /treatments/[slug] — lets Google associate
// the condition (e.g. PCOS) with the treatments / herbs / specialists we
// describe, and feeds the Medical knowledge panel.
export function medicalConditionLd(c: {
  slug: string
  name: string
  alternateName?: string | null   // Sanskrit name, classical synonym, etc.
  description: string
  symptoms?: string[] | null
  treatments?: string[] | null    // procedure / pillar names
  herbs?: string[] | null
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalCondition',
    '@id': `${SITE_URL}/treatments/${c.slug}`,
    name: c.name,
    alternateName: c.alternateName ?? undefined,
    description: c.description,
    url: `${SITE_URL}/treatments/${c.slug}`,
    signOrSymptom: c.symptoms?.length
      ? c.symptoms.map((s) => ({ '@type': 'MedicalSignOrSymptom', name: s }))
      : undefined,
    possibleTreatment: c.treatments?.length
      ? c.treatments.map((t) => ({ '@type': 'MedicalTherapy', name: t }))
      : undefined,
    drug: c.herbs?.length
      ? c.herbs.map((h) => ({ '@type': 'Drug', name: h, nonProprietaryName: h }))
      : undefined,
    associatedAnatomy: undefined,
    relevantSpecialty: { '@type': 'MedicalSpecialty', name: 'Ayurveda' },
  }
}

// Convenience: combine multiple JSON-LD blocks into a graph for one tag.
export function ldGraph(...nodes: object[]) {
  return { '@context': 'https://schema.org', '@graph': nodes }
}
