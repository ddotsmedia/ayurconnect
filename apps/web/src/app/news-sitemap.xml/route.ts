// Google News sitemap — articles published in the last 48 hours, with
// <news:publication> + <news:publication_date> elements so Google News and
// Google Discover can pick them up promptly. Spec:
// https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap
import { API_INTERNAL, logServerFetchError } from '@/lib/server-fetch'
import { SITE_URL, SITE_NAME } from '@/lib/seo'

export const revalidate = 600   // 10 minutes — news bots crawl very often

type Article = {
  id: string
  title: string
  category?: string | null
  language?: string | null
  createdAt?: string
  updatedAt?: string
  authorName?: string | null
}

async function fetchArticles(): Promise<Article[]> {
  try {
    const res = await fetch(`${API_INTERNAL}/articles?limit=200`, { next: { revalidate: 600 } })
    if (!res.ok) return []
    const data = await res.json() as { articles?: Article[] }
    return Array.isArray(data.articles) ? data.articles : []
  } catch (err) {
    logServerFetchError('news-sitemap', err)
    return []
  }
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const all = await fetchArticles()
  const cutoff = Date.now() - 1000 * 60 * 60 * 48   // 48h window per Google News spec
  const fresh = all
    .filter((a) => a.createdAt && +new Date(a.createdAt) >= cutoff)
    .slice(0, 1000)                                  // hard 1000-url cap per spec

  const urls = fresh.map((a) => {
    const loc = `${SITE_URL}/articles/${a.id}`
    const pub = new Date(a.createdAt!).toISOString()
    const lang = (a.language ?? 'en').slice(0, 2)
    return `  <url>
    <loc>${loc}</loc>
    <news:news>
      <news:publication>
        <news:name>${esc(SITE_NAME)}</news:name>
        <news:language>${lang}</news:language>
      </news:publication>
      <news:publication_date>${pub}</news:publication_date>
      <news:title>${esc(a.title)}</news:title>
      ${a.category ? `<news:keywords>${esc(a.category)}</news:keywords>` : ''}
    </news:news>
  </url>`
  }).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1800',
    },
  })
}
