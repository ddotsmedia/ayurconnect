import type { MetadataRoute } from 'next'
import { API_INTERNAL } from '@/lib/server-fetch'
import { CONDITION_SLUGS } from './treatments/_data/conditions'
import { PRODUCT_SLUGS } from './products/_data/products'
import { CASE_STUDY_SLUGS } from './case-studies/_data/cases'
import { CONDITIONS as SEO_CONDITIONS } from './conditions/_data/conditions'
import { CITIES as SEO_CITIES } from './conditions/_data/cities'
import { ANSWERED_QA } from './learn/ask-the-classics/_answered'
import { NEWS_SLUGS } from '@/lib/data/news-seed'
import { EVENT_SLUGS } from '@/lib/data/events-seed'
import { DISTRICT_SLUGS as HOSPITAL_DISTRICT_SLUGS } from './hospitals/in/[district]/_slugs'
import { TYPE_SLUGS as HOSPITAL_TYPE_SLUGS } from './hospitals/type/[type]/_slugs'

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://ayurconnect.com'

const STATIC: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }> = [
  { path: '',                priority: 1.0, changeFrequency: 'daily'   },
  { path: '/doctors',        priority: 0.9, changeFrequency: 'daily'   },
  { path: '/hospitals',      priority: 0.8, changeFrequency: 'weekly'  },
  { path: '/treatments',     priority: 0.85, changeFrequency: 'weekly' },
  { path: '/herbs',          priority: 0.8, changeFrequency: 'weekly'  },
  { path: '/health-tips',    priority: 0.7, changeFrequency: 'weekly'  },
  { path: '/panchakarma',    priority: 0.7, changeFrequency: 'monthly' },
  { path: '/articles',       priority: 0.7, changeFrequency: 'weekly'  },
  { path: '/videos',         priority: 0.75, changeFrequency: 'weekly' },
  { path: '/research',                 priority: 0.7, changeFrequency: 'monthly' },
  { path: '/about',                    priority: 0.6, changeFrequency: 'monthly' },
  { path: '/about/leadership',         priority: 0.5, changeFrequency: 'monthly' },
  { path: '/about/methodology',        priority: 0.55, changeFrequency: 'monthly' },
  { path: '/about/why-ayurveda-works', priority: 0.65, changeFrequency: 'monthly' },
  { path: '/about/certifications',     priority: 0.55, changeFrequency: 'monthly' },
  { path: '/cost-estimator', priority: 0.75, changeFrequency: 'monthly' },
  { path: '/contact',        priority: 0.5,  changeFrequency: 'yearly'  },
  { path: '/partnership',    priority: 0.5,  changeFrequency: 'yearly'  },
  { path: '/forum',          priority: 0.6, changeFrequency: 'daily'   },
  { path: '/jobs',           priority: 0.6, changeFrequency: 'daily'   },
  { path: '/colleges',       priority: 0.5, changeFrequency: 'monthly' },
  { path: '/tourism',        priority: 0.6, changeFrequency: 'monthly' },
  { path: '/ayurbot',        priority: 0.5, changeFrequency: 'monthly' },
  { path: '/online-consultation', priority: 0.9, changeFrequency: 'weekly' },
  // UAE city landing pages — high-intent SEO targets for diaspora keywords.
  { path: '/dubai/ayurveda-doctors',     priority: 0.85, changeFrequency: 'weekly' },
  { path: '/abu-dhabi/ayurveda-doctors', priority: 0.85, changeFrequency: 'weekly' },
  { path: '/sharjah/ayurveda-doctors',   priority: 0.85, changeFrequency: 'weekly' },
  { path: '/wellness-plans',             priority: 0.75, changeFrequency: 'monthly' },
  // Phase-8 SEO surfaces.
  { path: '/qa',                  priority: 0.9,  changeFrequency: 'daily'   },
  { path: '/qa/ask',              priority: 0.6,  changeFrequency: 'monthly' },
  { path: '/programs',            priority: 0.85, changeFrequency: 'weekly'  },
  { path: '/formulary',           priority: 0.85, changeFrequency: 'weekly'  },
  { path: '/doctor-match',        priority: 0.8,  changeFrequency: 'monthly' },
  { path: '/second-opinion',      priority: 0.75, changeFrequency: 'monthly' },
  { path: '/prakriti-quiz',  priority: 0.85, changeFrequency: 'monthly' },
  { path: '/wellness-check', priority: 0.85, changeFrequency: 'monthly' },
  { path: '/diet-planner',   priority: 0.8,  changeFrequency: 'monthly' },
  { path: '/knowledge',      priority: 0.75, changeFrequency: 'weekly'  },
  { path: '/case-studies',   priority: 0.75, changeFrequency: 'monthly' },
  { path: '/conditions',     priority: 0.85, changeFrequency: 'monthly' },
  { path: '/careers',        priority: 0.5,  changeFrequency: 'weekly'  },
  { path: '/kerala-guide',   priority: 0.8,  changeFrequency: 'monthly' },
  { path: '/heritage',                    priority: 0.8,  changeFrequency: 'monthly' },
  { path: '/heritage/ashtavaidya',        priority: 0.7,  changeFrequency: 'yearly'  },
  { path: '/heritage/classical-texts',    priority: 0.7,  changeFrequency: 'yearly'  },
  { path: '/heritage/history',            priority: 0.7,  changeFrequency: 'yearly'  },
  { path: '/heritage/temples',            priority: 0.65, changeFrequency: 'yearly'  },
  { path: '/karkidaka',                   priority: 0.85, changeFrequency: 'monthly' },
  { path: '/learn/ask-the-classics',      priority: 0.8,  changeFrequency: 'weekly'  },
  { path: '/learn/tridosha',              priority: 0.9,  changeFrequency: 'monthly' },
  // Article category pages — generated for the 16 default ArticleCategory slugs.
  { path: '/articles/category/lifestyle',       priority: 0.75, changeFrequency: 'weekly' },
  { path: '/articles/category/herbs',           priority: 0.75, changeFrequency: 'weekly' },
  { path: '/articles/category/diet-nutrition',  priority: 0.75, changeFrequency: 'weekly' },
  { path: '/articles/category/treatments',      priority: 0.75, changeFrequency: 'weekly' },
  { path: '/articles/category/conditions',      priority: 0.8,  changeFrequency: 'weekly' },
  { path: '/articles/category/karkidaka',       priority: 0.8,  changeFrequency: 'weekly' },
  { path: '/articles/category/tridosha',        priority: 0.85, changeFrequency: 'weekly' },
  { path: '/articles/category/panchakarma',     priority: 0.8,  changeFrequency: 'weekly' },
  { path: '/articles/category/womens-health',   priority: 0.75, changeFrequency: 'weekly' },
  { path: '/articles/category/childrens-health',priority: 0.7,  changeFrequency: 'weekly' },
  { path: '/articles/category/mental-health',   priority: 0.75, changeFrequency: 'weekly' },
  { path: '/articles/category/skin-care',       priority: 0.75, changeFrequency: 'weekly' },
  { path: '/articles/category/pain-management', priority: 0.75, changeFrequency: 'weekly' },
  { path: '/articles/category/yoga-exercise',   priority: 0.7,  changeFrequency: 'weekly' },
  { path: '/articles/category/classical-text',  priority: 0.75, changeFrequency: 'weekly' },
  { path: '/articles/category/general',         priority: 0.6,  changeFrequency: 'weekly' },
  { path: '/clinic-portal',  priority: 0.7,  changeFrequency: 'monthly' },
  { path: '/seminars',       priority: 0.75, changeFrequency: 'weekly'  },
  { path: '/news',           priority: 0.85, changeFrequency: 'daily'   },
  { path: '/events',         priority: 0.85, changeFrequency: 'daily'   },
  { path: '/hospitals/register', priority: 0.85, changeFrequency: 'monthly' },
  { path: '/hospitals/why-join', priority: 0.9,  changeFrequency: 'monthly' },
  { path: '/doctors/register/bams',   priority: 0.85, changeFrequency: 'monthly' },
  { path: '/doctors/register/kerala', priority: 0.85, changeFrequency: 'monthly' },
  { path: '/doctors/register/uae',    priority: 0.85, changeFrequency: 'monthly' },
  { path: '/doctors/register/dubai',  priority: 0.85, changeFrequency: 'monthly' },
  { path: '/doctors/leaderboard',     priority: 0.8,  changeFrequency: 'weekly' },
  { path: '/interaction-checker', priority: 0.85, changeFrequency: 'monthly' },
  { path: '/ritucharya',          priority: 0.85, changeFrequency: 'monthly' },
  { path: '/heal-in-kerala',      priority: 0.95, changeFrequency: 'weekly'  },
  { path: '/tools',                       priority: 0.7,  changeFrequency: 'monthly' },
  { path: '/tools/bmi-calculator',        priority: 0.75, changeFrequency: 'monthly' },
  { path: '/tools/symptom-checker',       priority: 0.8,  changeFrequency: 'monthly' },
  { path: '/community/malayalees',        priority: 0.8,  changeFrequency: 'monthly' },
  { path: '/community/malayalees/uae',        priority: 0.8, changeFrequency: 'monthly' },
  { path: '/community/malayalees/dubai',      priority: 0.85, changeFrequency: 'monthly' },
  { path: '/community/malayalees/abu-dhabi',  priority: 0.8, changeFrequency: 'monthly' },
  { path: '/community/malayalees/qatar',      priority: 0.75, changeFrequency: 'monthly' },
  { path: '/community/malayalees/kuwait',     priority: 0.75, changeFrequency: 'monthly' },
  { path: '/community/malayalees/uk',         priority: 0.75, changeFrequency: 'monthly' },
  { path: '/community/malayalees/canada',     priority: 0.7,  changeFrequency: 'monthly' },
  { path: '/doctors/ambassador',          priority: 0.85, changeFrequency: 'monthly' },
  { path: '/heal-in-kerala/plan',  priority: 0.8,  changeFrequency: 'monthly' },
  { path: '/verify',               priority: 0.6,  changeFrequency: 'monthly' },
  { path: '/marketplace',    priority: 0.75, changeFrequency: 'weekly'  },
  { path: '/academy',        priority: 0.7,  changeFrequency: 'monthly' },
  { path: '/roi-calculator', priority: 0.6,  changeFrequency: 'monthly' },
  { path: '/about/press',     priority: 0.55, changeFrequency: 'monthly' },
  { path: '/about/investors', priority: 0.55, changeFrequency: 'monthly' },
  ...CONDITION_SLUGS.map((slug) => ({
    path: `/treatments/${slug}` as const,
    priority: 0.8,
    changeFrequency: 'monthly' as const,
  })),
  ...CASE_STUDY_SLUGS.map((slug) => ({
    path: `/case-studies/${slug}` as const,
    priority: 0.65,
    changeFrequency: 'monthly' as const,
  })),
  ...PRODUCT_SLUGS.map((slug) => ({
    path: `/products/${slug}` as const,
    priority: 0.55,
    changeFrequency: 'monthly' as const,
  })),
  ...ANSWERED_QA.map((qa) => ({
    path: `/learn/ask-the-classics/${qa.slug}` as const,
    priority: 0.6,
    changeFrequency: 'monthly' as const,
  })),
]

async function fetchIds(path: string, key?: string): Promise<Array<{ id: string; updatedAt?: string }>> {
  try {
    const res = await fetch(`${API_INTERNAL}${path}`, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    const data = await res.json()
    let items: unknown = []
    if (Array.isArray(data)) items = data
    else if (key && Array.isArray((data as Record<string, unknown>)[key])) items = (data as Record<string, unknown>)[key]
    else {
      // Fall back to first array-valued key on the response.
      const firstArrayKey = Object.keys(data ?? {}).find((k) => Array.isArray((data as Record<string, unknown>)[k]))
      if (firstArrayKey) items = (data as Record<string, unknown>)[firstArrayKey]
    }
    if (!Array.isArray(items)) return []
    return (items as Array<{ id?: string; updatedAt?: string }>)
      .filter((x) => typeof x?.id === 'string')
      .map((x) => ({ id: x.id as string, updatedAt: x.updatedAt }))
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const staticEntries: MetadataRoute.Sitemap = STATIC.map((s) => ({
    url: `${BASE}${s.path}`,
    lastModified: now,
    changeFrequency: s.changeFrequency,
    priority: s.priority,
  }))

  const [doctors, hospitals, herbs, articles, healthTips, forum, qa, programs, formulations, videos] = await Promise.all([
    fetchIds('/doctors?limit=500',          'doctors'),
    fetchIds('/hospitals?limit=500'),
    fetchIds('/herbs?limit=1000',           'herbs'),
    fetchIds('/articles?limit=500',         'articles'),
    fetchIds('/health-tips?limit=500',      'tips'),
    fetchIds('/forum?limit=500',            'posts'),
    fetchIds('/qa?limit=500',               'questions'),
    fetchIds('/programs?limit=100',         'programs'),
    fetchIds('/formulations?limit=500',     'formulations'),
    fetchIds('/videos?limit=500',           'videos'),
  ])
  // Dynamic Q&A / programs / formulations use `slug` (not id) for canonical
  // URLs. Re-pull slugs separately since fetchIds() only grabs ids.
  async function fetchSlugs(path: string, key: string): Promise<string[]> {
    try {
      const res = await fetch(`${API_INTERNAL}${path}`, { next: { revalidate: 3600 } })
      if (!res.ok) return []
      const data = await res.json() as Record<string, Array<{ slug?: string | null }>>
      return (data[key] ?? []).map((x) => x.slug).filter((s): s is string => !!s)
    } catch { return [] }
  }
  const [qaSlugs, programSlugs, formulationSlugs] = await Promise.all([
    fetchSlugs('/qa?limit=500',           'questions'),
    fetchSlugs('/programs?limit=100',     'programs'),
    fetchSlugs('/formulations?limit=500', 'formulations'),
  ])

  const dynamic = (prefix: string, items: Array<{ id: string; updatedAt?: string }>, priority: number): MetadataRoute.Sitemap =>
    items.map((it) => ({
      url: `${BASE}${prefix}/${it.id}`,
      lastModified: it.updatedAt ? new Date(it.updatedAt) : now,
      changeFrequency: 'weekly',
      priority,
    }))

  // Note: qa/programs/formulations are indexed by their `slug` field (not
  // id), so we reuse the slug arrays fetched above rather than dynamic().
  const dynamicBySlug = (prefix: string, slugs: string[], priority: number): MetadataRoute.Sitemap =>
    slugs.map((slug) => ({
      url: `${BASE}${prefix}/${slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority,
    }))

  // Mark the qa variable as used (it's a parallel-fetch byproduct).
  void qa; void programs; void formulations

  return [
    ...staticEntries,
    ...dynamic('/doctors', doctors, 0.7),
    ...dynamic('/hospitals', hospitals, 0.6),
    ...dynamic('/herbs', herbs, 0.5),
    ...dynamic('/articles', articles, 0.5),
    ...dynamic('/health-tips', healthTips, 0.5),
    ...dynamic('/forum', forum, 0.4),
    ...dynamic('/videos', videos, 0.6),
    ...dynamicBySlug('/qa',         qaSlugs,         0.6),
    ...dynamicBySlug('/programs',   programSlugs,    0.8),
    ...dynamicBySlug('/formulary',  formulationSlugs, 0.7),
    // /conditions/[slug] — high-intent SEO landing pages.
    ...SEO_CONDITIONS.map((c) => ({
      url: `${BASE}/conditions/${c.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    // /conditions/[slug]/[city] — programmatic long-tail (condition x geo).
    ...SEO_CONDITIONS.flatMap((c) =>
      SEO_CITIES.map((ci) => ({
        url: `${BASE}/conditions/${c.slug}/${ci.slug}`,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      })),
    ),
    // /ayurveda-doctors/[location] — 14 Kerala districts + 3 UAE cities.
    ...[
      'thiruvananthapuram','kollam','pathanamthitta','alappuzha','kottayam',
      'idukki','ernakulam','thrissur','palakkad','malappuram',
      'kozhikode','wayanad','kannur','kasaragod',
      'dubai','abu-dhabi','sharjah',
    ].map((loc) => ({
      url: `${BASE}/ayurveda-doctors/${loc}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    // /doctors/[country] — 15 international markets (data-gated noindex when <3).
    ...[
      'uae','saudi-arabia','qatar','oman','kuwait','bahrain',
      'uk','germany','russia','usa','canada','australia',
      'japan','malaysia','singapore',
    ].map((slug) => ({
      url: `${BASE}/doctors/in/${slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    })),
    // /doctors/register — high-priority signup landing.
    { url: `${BASE}/doctors/register`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.9 },
    // /heal-in-kerala/[country] — 15 international source markets.
    ...[
      'uae','saudi-arabia','qatar','oman','kuwait','bahrain',
      'uk','germany','russia','usa','canada','australia',
      'japan','malaysia','singapore',
    ].map((slug) => ({
      url: `${BASE}/heal-in-kerala/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.85,
    })),
    // /hospitals/in/[district] + /hospitals/type/[type] — SEO directory pages.
    ...HOSPITAL_DISTRICT_SLUGS.map((slug) => ({
      url: `${BASE}/hospitals/in/${slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    })),
    ...HOSPITAL_TYPE_SLUGS.map((slug) => ({
      url: `${BASE}/hospitals/type/${slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    // /news/[slug] + /events/[slug] — static seed data.
    ...NEWS_SLUGS.map((slug) => ({
      url: `${BASE}/news/${slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...EVENT_SLUGS.map((slug) => ({
      url: `${BASE}/events/${slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    // /ayurveda/[specialty] — 11 classical Ayurveda specialties.
    ...[
      'kayachikitsa','panchakarma','prasuti-tantra','kaumarbhritya','shalya',
      'shalakya','manasika','rasashastra','general-practice','research','online-consultation',
    ].map((spec) => ({
      url: `${BASE}/ayurveda/${spec}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ]
}
