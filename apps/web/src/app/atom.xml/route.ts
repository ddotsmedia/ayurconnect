// Atom 1.0 feed — modern XML feed format, preferred by many feed readers
// and aggregator pipelines (W3C-recommended over RSS for new feeds).
import { API_INTERNAL, logServerFetchError } from '@/lib/server-fetch'
import { SITE_URL, SITE_NAME, SITE_TAGLINE, clip } from '@/lib/seo'

export const revalidate = 1800

type Item = {
  id: string
  title: string
  content?: string | null
  excerpt?: string | null
  category?: string | null
  createdAt?: string
  updatedAt?: string
  authorName?: string | null
}

async function fetchList(path: string, key: string): Promise<Item[]> {
  try {
    const res = await fetch(`${API_INTERNAL}${path}`, { next: { revalidate: 1800 } })
    if (!res.ok) return []
    const data = await res.json() as Record<string, Item[]>
    return Array.isArray(data[key]) ? data[key] : []
  } catch (err) {
    logServerFetchError(`atom:${path}`, err)
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

  const updated = entries[0]?.updatedAt ?? entries[0]?.createdAt ?? new Date().toISOString()
  const entriesXml = entries.map((e) => {
    const link = `${SITE_URL}/${e.kind}/${e.id}`
    const published = new Date(e.createdAt!).toISOString()
    const upd = new Date(e.updatedAt ?? e.createdAt!).toISOString()
    const summary = clip(e.excerpt ?? e.content ?? '', 500)
    return `
  <entry>
    <id>${link}</id>
    <title>${esc(e.title)}</title>
    <link href="${link}" rel="alternate" type="text/html" />
    <published>${published}</published>
    <updated>${upd}</updated>
    ${e.authorName ? `<author><name>${esc(e.authorName)}</name></author>` : `<author><name>${esc(SITE_NAME)}</name></author>`}
    ${e.category ? `<category term="${esc(e.category)}" />` : ''}
    <summary type="html">${esc(summary)}</summary>
  </entry>`
  }).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en-IN">
  <id>${SITE_URL}/</id>
  <title>${esc(SITE_NAME)}</title>
  <subtitle>${esc(SITE_TAGLINE)}</subtitle>
  <link href="${SITE_URL}/atom.xml" rel="self" type="application/atom+xml" />
  <link href="${SITE_URL}" rel="alternate" type="text/html" />
  <updated>${new Date(updated).toISOString()}</updated>
  <generator uri="${SITE_URL}">AyurConnect</generator>
  <icon>${SITE_URL}/icon.svg</icon>
  <logo>${SITE_URL}/icon.svg</logo>
  <rights>© ${new Date().getFullYear()} ${esc(SITE_NAME)}</rights>${entriesXml}
</feed>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/atom+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
    },
  })
}
