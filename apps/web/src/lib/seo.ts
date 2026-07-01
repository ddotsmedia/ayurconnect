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
    // UAE local intent expansion
    'ayurvedic clinic abu dhabi', 'ayurvedic doctor dubai', 'ayurveda near me',
    'best ayurvedic center uae', 'panchakarma uae', 'ayurvedic treatment dubai',
    'holistic wellness abu dhabi', 'natural medicine uae', 'alternative medicine uae',
    'ayurvedic medicine dubai', 'ayurvedic consultation uae',
    'best ayurvedic clinic abu dhabi', 'best ayurvedic doctor dubai',
    'ayurvedic skin treatment near me',
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
    'AyurConnect', 'AyurBot', 'AyurBot AI',
    'ayurveda app', 'ayurvedic consultation app',
    'book ayurveda online', 'find ayurveda doctor near me',
    // Brand-modifier combinations
    'AyurConnect UAE', 'AyurConnect Ayurveda', 'AyurConnect wellness',
    'AyurConnect online consultation', 'AyurConnect holistic health',
    'AyurConnect ayurvedic clinic', 'AyurConnect healthcare platform',
    'AyurConnect Dubai', 'AyurConnect Abu Dhabi', 'AyurConnect Kerala',
  ],
  // Wellness, lifestyle, preventive health — adjacency intent.
  wellness: [
    'wellness consultation', 'holistic wellness', 'natural wellness clinic',
    'detox therapy', 'herbal wellness', 'preventive healthcare', 'lifestyle medicine',
    'wellness coaching', 'mind body healing', 'ayurvedic nutrition',
    'ayurvedic diet plan', 'ayurvedic lifestyle', 'wellness program',
    'wellness retreat', 'ayurvedic spa', 'ayurvedic rejuvenation',
    'ayurvedic detox', 'natural detox', 'panchakarma detox',
    'mind body wellness', 'mental wellness ayurveda',
  ],
  // Online + digital service language.
  online: [
    'online ayurvedic doctor', 'virtual ayurveda consultation',
    'book ayurvedic consultation online', 'telehealth ayurveda',
    'online holistic consultation', 'digital wellness platform',
    'health consultation online', 'video ayurveda consultation',
    'online ayurvedic clinic', 'ayurveda telemedicine',
    'online ayurvedic prescription', 'ayurveda consultation by phone',
    'home ayurveda consultation', 'remote ayurveda consultation',
    'ayurvedic health app', 'ayurveda video call',
  ],
  // Long-tail, high-intent local queries.
  longtail: [
    'best online ayurvedic consultation in UAE',
    'affordable ayurvedic treatment in dubai',
    'natural healing clinic in abu dhabi',
    'book panchakarma therapy online',
    'herbal treatment for stress and anxiety',
    'ayurvedic doctor for digestive issues',
    'holistic wellness services UAE',
    'online natural medicine consultation',
    'traditional ayurveda for modern lifestyle',
    'ayurvedic treatment for chronic conditions',
    'kerala ayurveda doctor online consultation',
    'best ayurvedic specialists for PCOS',
    'ayurvedic doctor for back pain online',
    'panchakarma packages in kerala for foreigners',
    'classical ayurveda treatment kerala for UAE patients',
  ],
  // Educational / blog content keywords.
  blog: [
    'benefits of ayurveda', 'what is panchakarma', 'ayurvedic daily routine',
    'best herbs in ayurveda', 'ayurveda for immunity', 'natural ways to reduce stress',
    'ayurvedic diet for weight loss', 'ayurveda vs modern medicine',
    'how ayurveda improves digestion', 'ayurvedic skincare tips',
    'holistic healing methods', 'seasonal wellness in ayurveda',
    'dinacharya routine', 'ritucharya seasonal', 'karkidaka chikitsa monsoon',
    'ayurvedic morning routine', 'ayurvedic evening routine',
    'ayurveda for beginners', 'introduction to ayurveda',
  ],
} as const

// Flat union — used as the default site-wide keywords array in layout.tsx.
export const AYURVEDA_KEYWORDS = {
  ...KW,
  all: Array.from(new Set([
    ...KW.primary, ...KW.conditions, ...KW.treatments, ...KW.herbs,
    ...KW.specialisations, ...KW.concepts, ...KW.geographic, ...KW.signals, ...KW.brand,
    ...KW.wellness, ...KW.online, ...KW.longtail, ...KW.blog,
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
      'https://instagram.com/ayurconnect',
      'https://linkedin.com/company/ayurconnect',
      'https://facebook.com/ayurconnect',
      'https://x.com/ayurconnect',
      'https://youtube.com/@vaidyasala',
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
    inLanguage: ['en-IN'],
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
    // MedicalClinic + MedicalBusiness + HealthAndBeautyBusiness — broadest
    // accepted typing across Google, Bing, and DuckDuckGo rich-result eligibility.
    '@type': ['MedicalClinic', 'MedicalBusiness', 'HealthAndBeautyBusiness'],
    '@id': `${SITE_URL}#business`,
    name: SITE_NAME,
    url: SITE_URL,
    description: 'Online platform connecting patients with verified Ayurvedic doctors for personalized consultations, classical Panchakarma, and herbal wellness guidance. Serving India and the UAE diaspora.',
    medicalSpecialty: ['Ayurvedic Medicine', 'Panchakarma', 'Traditional Indian Medicine'],
    parentOrganization: { '@id': `${SITE_URL}#org` },
    areaServed: [
      { '@type': 'Country',          name: 'India'                },
      { '@type': 'Country',          name: 'United Arab Emirates' },
      { '@type': 'AdministrativeArea', name: 'Kerala'             },
      { '@type': 'City',             name: 'Dubai'                },
      { '@type': 'City',             name: 'Abu Dhabi'            },
      { '@type': 'City',             name: 'Sharjah'              },
    ],
    priceRange: '₹₹',
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

// ─── VideoObject — for /videos and embedded explainer videos ─────────────
// Required by Google: name, description, thumbnailUrl, uploadDate.
// Adding duration (ISO 8601), contentUrl, embedUrl, and inLanguage lifts
// eligibility for Video carousel + Key Moments rich results.
export function videoLd(v: {
  id: string
  title: string
  description: string
  thumbnailUrl: string
  uploadDate: string | Date
  duration?: string | null          // ISO 8601, e.g. PT2M30S
  contentUrl?: string | null
  embedUrl?: string | null
  language?: string | null
  authorName?: string | null
  urlPath?: string
}) {
  const uploaded = v.uploadDate instanceof Date ? v.uploadDate.toISOString() : v.uploadDate
  const path = v.urlPath ?? `/videos/${v.id}`
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    '@id': `${SITE_URL}${path}`,
    name: v.title,
    description: clip(v.description, 5000),
    thumbnailUrl: [v.thumbnailUrl],
    uploadDate: uploaded,
    duration: v.duration ?? undefined,
    contentUrl: v.contentUrl ?? undefined,
    embedUrl: v.embedUrl ?? undefined,
    inLanguage: v.language ?? 'en',
    publisher: { '@id': `${SITE_URL}#org` },
    author: v.authorName ? { '@type': 'Person', name: v.authorName } : undefined,
    url: `${SITE_URL}${path}`,
  }
}

// ─── Course — for /academy and /programs educational tracks ──────────────
export function courseLd(c: {
  id: string
  name: string
  description: string
  urlPath: string
  provider?: string
  duration?: string | null          // ISO 8601, e.g. P21D
  language?: string | null
  free?: boolean
  price?: number | null
  currency?: string | null
  level?: 'Beginner' | 'Intermediate' | 'Advanced' | null
  startDate?: string | Date | null
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    '@id': `${SITE_URL}${c.urlPath}`,
    name: c.name,
    description: clip(c.description, 500),
    provider: {
      '@type': 'Organization',
      name: c.provider ?? SITE_NAME,
      '@id': `${SITE_URL}#org`,
    },
    url: `${SITE_URL}${c.urlPath}`,
    inLanguage: c.language ?? 'en',
    educationalLevel: c.level ?? undefined,
    timeRequired: c.duration ?? undefined,
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'Online',
      ...(c.startDate
        ? { startDate: c.startDate instanceof Date ? c.startDate.toISOString() : c.startDate }
        : {}),
    },
    offers: c.price != null
      ? {
          '@type': 'Offer',
          price: c.price,
          priceCurrency: c.currency ?? 'INR',
          availability: 'https://schema.org/InStock',
          url: `${SITE_URL}${c.urlPath}`,
        }
      : c.free
        ? { '@type': 'Offer', price: 0, priceCurrency: c.currency ?? 'INR' }
        : undefined,
  }
}

// ─── Event — for retreats, webinars, on-site Panchakarma camps ───────────
export function eventLd(e: {
  id: string
  name: string
  description: string
  startDate: string | Date
  endDate?: string | Date | null
  urlPath: string
  online?: boolean
  locationName?: string | null
  locationAddress?: string | null
  locationCity?: string | null
  locationCountry?: string | null
  price?: number | null
  currency?: string | null
  capacity?: number | null
  imageUrl?: string | null
}) {
  const start = e.startDate instanceof Date ? e.startDate.toISOString() : e.startDate
  const end = e.endDate
    ? (e.endDate instanceof Date ? e.endDate.toISOString() : e.endDate)
    : undefined
  const location = e.online
    ? {
        '@type': 'VirtualLocation',
        url: `${SITE_URL}${e.urlPath}`,
      }
    : {
        '@type': 'Place',
        name: e.locationName ?? 'AyurConnect Centre',
        address: {
          '@type': 'PostalAddress',
          streetAddress: e.locationAddress ?? undefined,
          addressLocality: e.locationCity ?? undefined,
          addressCountry: e.locationCountry ?? 'IN',
        },
      }
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    '@id': `${SITE_URL}${e.urlPath}`,
    name: e.name,
    description: clip(e.description, 500),
    startDate: start,
    endDate: end,
    eventAttendanceMode: e.online
      ? 'https://schema.org/OnlineEventAttendanceMode'
      : 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location,
    url: `${SITE_URL}${e.urlPath}`,
    image: e.imageUrl ? abs(e.imageUrl) : `${SITE_URL}/opengraph-image`,
    organizer: { '@id': `${SITE_URL}#org` },
    offers: e.price != null
      ? {
          '@type': 'Offer',
          price: e.price,
          priceCurrency: e.currency ?? 'INR',
          availability: 'https://schema.org/InStock',
          url: `${SITE_URL}${e.urlPath}`,
          validFrom: start,
        }
      : undefined,
    maximumAttendeeCapacity: e.capacity ?? undefined,
  }
}

// ─── Review — single patient review attached to a doctor / hospital / herb
export function reviewLd(r: {
  id: string
  itemReviewed: { type: 'Physician' | 'Hospital' | 'Substance' | 'Product' | 'MedicalTherapy'; name: string; urlPath: string }
  ratingValue: number
  body?: string | null
  authorName?: string | null
  datePublished?: string | Date | null
}) {
  const date = r.datePublished
    ? (r.datePublished instanceof Date ? r.datePublished.toISOString() : r.datePublished)
    : new Date().toISOString()
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    '@id': `${SITE_URL}${r.itemReviewed.urlPath}#review-${r.id}`,
    itemReviewed: {
      '@type': r.itemReviewed.type,
      name: r.itemReviewed.name,
      url: `${SITE_URL}${r.itemReviewed.urlPath}`,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: r.ratingValue,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody: r.body ?? undefined,
    author: r.authorName ? { '@type': 'Person', name: r.authorName } : undefined,
    datePublished: date,
    publisher: { '@id': `${SITE_URL}#org` },
  }
}

// ─── Service — for paid platform services (consultation, second opinion) ─
export function serviceLd(s: {
  name: string
  description: string
  urlPath: string
  serviceType?: string
  price?: number | null
  currency?: string | null
  duration?: string | null         // ISO 8601, e.g. PT30M
  areaServed?: string[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalProcedure',
    '@id': `${SITE_URL}${s.urlPath}`,
    name: s.name,
    description: clip(s.description, 500),
    procedureType: s.serviceType ?? 'Telemedicine',
    url: `${SITE_URL}${s.urlPath}`,
    provider: { '@id': `${SITE_URL}#org` },
    areaServed: s.areaServed?.length
      ? s.areaServed.map((a) => ({ '@type': 'Country', name: a }))
      : [
          { '@type': 'Country', name: 'India' },
          { '@type': 'Country', name: 'United Arab Emirates' },
        ],
    offers: s.price != null
      ? {
          '@type': 'Offer',
          price: s.price,
          priceCurrency: s.currency ?? 'INR',
          availability: 'https://schema.org/InStock',
          url: `${SITE_URL}${s.urlPath}`,
        }
      : undefined,
    estimatedDuration: s.duration ?? undefined,
  }
}

// ─── MedicalProcedure — for classical Panchakarma treatments ─────────────
export function medicalProcedureLd(p: {
  slug: string
  name: string
  alternateName?: string | null
  description: string
  procedureType?: string             // e.g. 'Therapeutic', 'Diagnostic'
  bodyLocation?: string | null
  indication?: string[] | null       // condition names this treats
  preparation?: string | null
  followup?: string | null
  duration?: string | null
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalProcedure',
    '@id': `${SITE_URL}/panchakarma/${p.slug}`,
    name: p.name,
    alternateName: p.alternateName ?? undefined,
    description: clip(p.description, 1000),
    procedureType: p.procedureType ?? 'Therapeutic',
    url: `${SITE_URL}/panchakarma/${p.slug}`,
    bodyLocation: p.bodyLocation ?? undefined,
    indication: p.indication?.length
      ? p.indication.map((i) => ({ '@type': 'MedicalIndication', name: i }))
      : undefined,
    preparation: p.preparation ?? undefined,
    followup: p.followup ?? undefined,
    estimatedDuration: p.duration ?? undefined,
    performer: { '@id': `${SITE_URL}#org` },
  }
}

// ─── HowTo — for procedure pages, diet plans, daily-routine guides ───────
export function howToLd(h: {
  name: string
  description: string
  urlPath: string
  steps: Array<{ name: string; text: string; image?: string }>
  totalTime?: string | null          // ISO 8601
  supplies?: string[]
  yield?: string | null
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    '@id': `${SITE_URL}${h.urlPath}`,
    name: h.name,
    description: clip(h.description, 500),
    url: `${SITE_URL}${h.urlPath}`,
    totalTime: h.totalTime ?? undefined,
    yield: h.yield ?? undefined,
    supply: h.supplies?.map((s) => ({ '@type': 'HowToSupply', name: s })),
    step: h.steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
      image: s.image ? abs(s.image) : undefined,
    })),
  }
}

// ─── LocalBusiness — for /tourism / city landing pages with opening hours
export function localBusinessLd(b: {
  id: string
  name: string
  description: string
  urlPath: string
  city: string
  region?: string | null
  country?: string | null
  streetAddress?: string | null
  postalCode?: string | null
  telephone?: string | null
  latitude?: number | null
  longitude?: number | null
  priceRange?: string
  openingHours?: Array<{ days: string[]; opens: string; closes: string }>
  aggregateRating?: { ratingValue: number; reviewCount: number } | null
}) {
  return {
    '@context': 'https://schema.org',
    '@type': ['MedicalClinic', 'LocalBusiness'],
    '@id': `${SITE_URL}${b.urlPath}#business`,
    name: b.name,
    description: clip(b.description, 500),
    url: `${SITE_URL}${b.urlPath}`,
    image: `${SITE_URL}/opengraph-image`,
    telephone: b.telephone ?? undefined,
    priceRange: b.priceRange ?? '₹₹',
    address: {
      '@type': 'PostalAddress',
      streetAddress: b.streetAddress ?? undefined,
      addressLocality: b.city,
      addressRegion: b.region ?? undefined,
      postalCode: b.postalCode ?? undefined,
      addressCountry: b.country ?? 'IN',
    },
    geo: b.latitude != null && b.longitude != null
      ? { '@type': 'GeoCoordinates', latitude: b.latitude, longitude: b.longitude }
      : undefined,
    openingHoursSpecification: b.openingHours?.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.days,
      opens: h.opens,
      closes: h.closes,
    })),
    aggregateRating: b.aggregateRating
      ? {
          '@type': 'AggregateRating',
          ratingValue: b.aggregateRating.ratingValue,
          reviewCount: b.aggregateRating.reviewCount,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined,
    parentOrganization: { '@id': `${SITE_URL}#org` },
  }
}

// ─── SiteNavigationElement — helps Google understand primary nav links ───
export function siteNavigationLd(items: Array<{ name: string; url: string }>) {
  return items.map((it, i) => ({
    '@context': 'https://schema.org',
    '@type': 'SiteNavigationElement',
    position: i + 1,
    name: it.name,
    url: abs(it.url),
  }))
}

// ─── Speakable — marks content that voice assistants should read aloud ───
// Used on the root layout to opt the FAQ + lede paragraph into Google
// Assistant's "search results read aloud" feature.
export function speakableLd(cssSelectors: string[] = ['h1', '.lede', '.faq-question', '.faq-answer']) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${SITE_URL}#speakable`,
    url: SITE_URL,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: cssSelectors,
    },
  }
}

// ─── ImageObject — for hero/feature images we want indexed in Google Images
export function imageObjectLd(i: {
  url: string
  caption?: string
  width?: number
  height?: number
  license?: string
  creditText?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    contentUrl: abs(i.url),
    url: abs(i.url),
    caption: i.caption,
    width: i.width,
    height: i.height,
    license: i.license,
    creditText: i.creditText ?? SITE_NAME,
    creator: { '@id': `${SITE_URL}#org` },
    copyrightNotice: `© ${new Date().getFullYear()} ${SITE_NAME}`,
  }
}

// ─── ItemList — for grouping doctor / hospital cards into a SERP carousel ─
export function itemListLd(items: Array<{ name: string; url: string }>, name?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: name ?? 'AyurConnect items',
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      url: abs(it.url),
    })),
  }
}

// ─── Centralised page metadata helper ────────────────────────────────────
// Use in any page.tsx's exported `metadata` so every page emits consistent
// canonical, OG, Twitter, robots, and language alternates without copy-paste.
//
// Example:
//   export const metadata = pageMetadata({
//     title: 'Find an Ayurveda Doctor',
//     description: '500+ verified doctors across Kerala…',
//     path: '/doctors',
//     keywords: AYURVEDA_KEYWORDS.primary,
//   })
export function pageMetadata(opts: {
  title: string
  description: string
  path: string
  keywords?: string[]
  image?: string | null
  type?: 'website' | 'article' | 'profile'
  noindex?: boolean
  publishedTime?: string
  modifiedTime?: string
  authors?: string[]
}) {
  const canonical = opts.path.startsWith('/') ? opts.path : `/${opts.path}`
  const og = opts.image ? abs(opts.image) : DEFAULT_OG_IMAGE
  return {
    title: opts.title,
    description: clip(opts.description, 160),
    keywords: opts.keywords,
    alternates: {
      canonical,
      languages: {
        'en-IN': canonical,
        'x-default': canonical,
      },
    },
    openGraph: {
      type: opts.type ?? 'website',
      url: abs(canonical),
      siteName: SITE_NAME,
      title: opts.title,
      description: clip(opts.description, 160),
      locale: 'en_IN',
      alternateLocale: ['ml_IN'],
      images: [{ url: og, width: 1200, height: 630, alt: opts.title }],
      ...(opts.type === 'article' && opts.publishedTime
        ? {
            publishedTime: opts.publishedTime,
            modifiedTime: opts.modifiedTime ?? opts.publishedTime,
            authors: opts.authors,
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      site: '@ayurconnect',
      title: opts.title,
      description: clip(opts.description, 160),
      images: [og],
    },
    robots: opts.noindex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-snippet': -1,
            'max-image-preview': 'large' as const,
            'max-video-preview': -1,
          },
        },
  }
}

// ─── Geo meta — emit ICBM / geo.position / geo.region <meta> tags ────────
// Use in any page that has a physical location (clinics, hospitals, tourism).
// Returns an `other` block suitable for Next.js Metadata.
export function geoMeta(opts: {
  region: string      // ISO 3166-2 — e.g. 'IN-KL', 'AE-DU'
  placename: string   // e.g. 'Kochi, Kerala, India'
  latitude?: number
  longitude?: number
}) {
  const meta: Record<string, string> = {
    'geo.region':    opts.region,
    'geo.placename': opts.placename,
  }
  if (opts.latitude != null && opts.longitude != null) {
    meta['geo.position'] = `${opts.latitude};${opts.longitude}`
    meta['ICBM']         = `${opts.latitude}, ${opts.longitude}`
  }
  return meta
}
