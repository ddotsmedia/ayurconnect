// RSS 2.0 feed — surfaces the latest /articles and /health-tips for
// aggregators, Google Discover, and Apple News. Pure server route, cached
// upstream of the CDN.
import { API_INTERNAL, logServerFetchError } from '@/lib/server-fetch'
import { SITE_URL, SITE_NAME, SITE_TAGLINE, clip } from '@/lib/seo'

export const revalidate = 1800   // 30 minutes — articles publish hourly at most

type Item = {
  id: string
  title: string
  content?: string | null
  excerpt?: string | null
  category?: string | null
  createdAt?: string
  updatedAt?: string
  authorName?: string | null
  authorEmail?: string | null
}

async function fetchList(path: string, key: string): Promise<Item[]> {
  try {
    const res = await fetch(`${API_INTERNAL}${path}`, { next: { revalidate: 1800 } })
    if (!res.ok) return []
    const data = await res.json() as Record<string, Item[]>
    return Array.isArray(data[key]) ? data[key] : []
  } catch (err) {
    logServerFetchError(`feed:${path}`, err)
    return []
  }
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function cdata(s: string): string {
  return `<![CDATA[${s.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`
}

export async function GET() {
  const [articles, tips] = await Promise.all([
    fetchList('/articles?limit=30', 'articles'),
    fetchList('/health-tips?limit=20', 'tips'),
  ])

  const entries = [
    ...articles.map((a) => ({ kind: 'articles' as const, ...a })),
    ...tips.map((t)    => ({ kind: 'health-tips' as const, ...t })),
  ]
    .filter((e) => e.createdAt)
    .sort((a, b) => +new Date(b.createdAt!) - +new Date(a.createdAt!))
    .slice(0, 40)

  const buildDate = new Date().toUTCString()
  const items = entries.map((e) => {
    const link = `${SITE_URL}/${e.kind}/${e.id}`
    const date = new Date(e.createdAt!).toUTCString()
    const desc = clip(e.excerpt ?? e.content ?? '', 500)
    return `
    <item>
      <title>${escapeXml(e.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${date}</pubDate>
      ${e.category ? `<category>${escapeXml(e.category)}</category>` : ''}
      ${e.authorName ? `<dc:creator>${cdata(e.authorName)}</dc:creator>` : ''}
      <description>${cdata(desc)}</description>
    </item>`
  }).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <description>${escapeXml(SITE_TAGLINE)} — articles, health tips, and Ayurveda guidance.</description>
    <language>en-IN</language>
    <copyright>© ${new Date().getFullYear()} ${escapeXml(SITE_NAME)}</copyright>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <generator>AyurConnect Next.js</generator>
    <ttl>30</ttl>
    <image>
      <url>${SITE_URL}/icon.svg</url>
      <title>${escapeXml(SITE_NAME)}</title>
      <link>${SITE_URL}</link>
    </image>${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
    },
  })
}
