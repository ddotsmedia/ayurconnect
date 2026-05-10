import type { MetadataRoute } from 'next'
import { API_INTERNAL } from '@/lib/server-fetch'

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://ayurconnect.com'

const STATIC: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }> = [
  { path: '',                priority: 1.0, changeFrequency: 'daily'   },
  { path: '/doctors',        priority: 0.9, changeFrequency: 'daily'   },
  { path: '/hospitals',      priority: 0.8, changeFrequency: 'weekly'  },
  { path: '/herbs',          priority: 0.8, changeFrequency: 'weekly'  },
  { path: '/health-tips',    priority: 0.7, changeFrequency: 'weekly'  },
  { path: '/panchakarma',    priority: 0.7, changeFrequency: 'monthly' },
  { path: '/articles',       priority: 0.7, changeFrequency: 'weekly'  },
  { path: '/forum',          priority: 0.6, changeFrequency: 'daily'   },
  { path: '/jobs',           priority: 0.6, changeFrequency: 'daily'   },
  { path: '/colleges',       priority: 0.5, changeFrequency: 'monthly' },
  { path: '/tourism',        priority: 0.6, changeFrequency: 'monthly' },
  { path: '/ayurbot',        priority: 0.5, changeFrequency: 'monthly' },
]

async function fetchIds(path: string): Promise<Array<{ id: string; updatedAt?: string }>> {
  try {
    const res = await fetch(`${API_INTERNAL}${path}`, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    const data = await res.json()
    const items = Array.isArray(data) ? data : (data.items ?? data.data ?? [])
    return items.map((x: { id: string; updatedAt?: string }) => ({ id: x.id, updatedAt: x.updatedAt }))
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
    fetchIds('/api/doctors?limit=500'),
    fetchIds('/api/hospitals?limit=500'),
    fetchIds('/api/herbs?limit=1000'),
    fetchIds('/api/articles?limit=500'),
    fetchIds('/api/health-tips?limit=500'),
    fetchIds('/api/forum?limit=500'),
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
