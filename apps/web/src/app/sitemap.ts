import type { MetadataRoute } from 'next'
import { API_INTERNAL } from '@/lib/server-fetch'
import { CONDITION_SLUGS } from './treatments/_data/conditions'
import { PRODUCT_SLUGS } from './products/_data/products'
import { CASE_STUDY_SLUGS } from './case-studies/_data/cases'

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
  { path: '/prakriti-quiz',  priority: 0.85, changeFrequency: 'monthly' },
  { path: '/wellness-check', priority: 0.85, changeFrequency: 'monthly' },
  { path: '/diet-planner',   priority: 0.8,  changeFrequency: 'monthly' },
  { path: '/knowledge',      priority: 0.75, changeFrequency: 'weekly'  },
  { path: '/case-studies',   priority: 0.75, changeFrequency: 'monthly' },
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

  const [doctors, hospitals, herbs, articles, healthTips, forum] = await Promise.all([
    fetchIds('/doctors?limit=500',     'doctors'),
    fetchIds('/hospitals?limit=500'),
    fetchIds('/herbs?limit=1000',      'herbs'),
    fetchIds('/articles?limit=500',    'articles'),
    fetchIds('/health-tips?limit=500', 'tips'),
    fetchIds('/forum?limit=500',       'posts'),
  ])

  const dynamic = (prefix: string, items: Array<{ id: string; updatedAt?: string }>, priority: number): MetadataRoute.Sitemap =>
    items.map((it) => ({
      url: `${BASE}${prefix}/${it.id}`,
      lastModified: it.updatedAt ? new Date(it.updatedAt) : now,
      changeFrequency: 'weekly',
      priority,
    }))

  return [
    ...staticEntries,
    ...dynamic('/doctors', doctors, 0.7),
    ...dynamic('/hospitals', hospitals, 0.6),
    ...dynamic('/herbs', herbs, 0.5),
    ...dynamic('/articles', articles, 0.5),
    ...dynamic('/health-tips', healthTips, 0.5),
    ...dynamic('/forum', forum, 0.4),
  ]
}
