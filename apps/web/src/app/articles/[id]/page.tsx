import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowLeft, BookOpen, Calendar, ScrollText, FlaskConical, Leaf } from 'lucide-react'
import { API_INTERNAL as API } from '../../../lib/server-fetch'
import { articleLd, breadcrumbLd, ldGraph, clip, SITE_URL } from '../../../lib/seo'
import { ArticleEngagement } from '../_engagement'
import { ArticleShareBar } from '../_share-bar'

type Article = {
  id: string
  title: string
  content: string
  category: string
  source: string | null
  language: string
  createdAt: string
  updatedAt: string
  featuredImage?:    string | null
  featuredImageAlt?: string | null
  seoTitle?:         string | null
  seoDescription?:   string | null
  seoKeywords?:      string | null
  readTimeMinutes?:  number | null
}

const CATEGORY_LABEL: Record<string, string> = {
  'classical-text':  'Classical Text',
  research:          'Research',
  'seasonal-health': 'Seasonal Health',
  lifestyle:         'Lifestyle',
}

const CATEGORY_ICON: Record<string, typeof BookOpen> = {
  'classical-text':  ScrollText,
  research:          FlaskConical,
  'seasonal-health': Calendar,
  lifestyle:         Leaf,
}

async function fetchArticle(id: string): Promise<Article | null> {
  try {
    const res = await fetch(`${API}/articles/${id}`, { cache: 'no-store' })
    if (!res.ok) return null
    return (await res.json()) as Article
  } catch { return null }
}

async function fetchRelated(currentId: string, category: string): Promise<Article[]> {
  try {
    // Prefer the scored /related endpoint (tag + keyword + source scoring).
    const res = await fetch(`${API}/articles/${currentId}/related`, { next: { revalidate: 600 } })
    if (res.ok) {
      const data = await res.json() as { articles?: Article[] }
      if (data.articles?.length) return data.articles.slice(0, 4)
    }
    // Fallback: category-only listing.
    const fallback = await fetch(`${API}/articles?category=${encodeURIComponent(category)}&limit=8`, { next: { revalidate: 600 } })
    if (!fallback.ok) return []
    const data = await fallback.json() as { articles?: Article[] }
    return (data.articles ?? []).filter((a) => a.id !== currentId).slice(0, 4)
  } catch { return [] }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const a = await fetchArticle(id)
  if (!a) return { title: 'Article not found' }

  const title       = a.seoTitle       ?? a.title
  const description = a.seoDescription  ?? clip(a.content, 200)
  // Facebook / LinkedIn recommend 1200x630 (1.91:1). Sharp resizes the upload
  // as 1200x600 (2:1) which is close enough; declaring 1200x630 here lets
  // Facebook fit-with-borders instead of substituting its own thumbnail.
  const ogImage     = a.featuredImage
    ? { url: a.featuredImage.startsWith('http') ? a.featuredImage : `${SITE_URL}${a.featuredImage}`, width: 1200, height: 630, alt: a.featuredImageAlt ?? a.title }
    : { url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630 }
  return {
    title: `${title}`,
    description,
    keywords: a.seoKeywords ? a.seoKeywords.split(',').map((k) => k.trim()).filter(Boolean) : undefined,
    alternates: { canonical: `/articles/${a.id}` },
    openGraph: {
      title, description,
      url: `${SITE_URL}/articles/${a.id}`,
      type: 'article',
      images: [ogImage],
    },
    twitter: { card: 'summary_large_image', title, description, images: [ogImage.url] },
  }
}

// Minimal Markdown → React renderer. Purpose-built for the article editor's
// output (image upload emits ![alt](url); AI-optimize may emit links, bold,
// italic, headings, bullet lists). No 3rd-party dep — pulling react-markdown
// would add ~150KB to the bundle for this thin surface. Returns React
// elements only, never dangerouslySetInnerHTML, so untrusted content
// can never inject <script> or event handlers even if the API bypasses
// its 200KB length cap.
//
// Supported:
//   ![alt](url)            → <img src="url" alt="alt" loading="lazy" />
//   [text](url)            → <a href="url">text</a>  (only http(s)/mailto/tel/# schemes)
//   **bold** / __bold__   → <strong>
//   *em* / _em_            → <em>
//   `code`                 → <code>
//   ## heading (1-4 #)     → <h2>…<h5>
//   -/* bullet             → <ul><li>
//   blank line             → paragraph break
//
// Everything else renders as plain text.

// Article upload API generates 3 sizes (1200 / 800 / 400) with the base URL
// ending in "-1200.webp". Derive a srcset so featured images pick the smallest
// variant on mobile. Legacy featuredImage URLs that don't match the pattern
// just fall back to the single-image src.
function buildSrcSet(url: string): string | undefined {
  if (!url.endsWith('-1200.webp')) return undefined
  const base = url.slice(0, -'-1200.webp'.length)
  return `${base}-400.webp 400w, ${base}-800.webp 800w, ${base}-1200.webp 1200w`
}

function safeUrl(u: string): string | null {
  const trimmed = u.trim()
  if (!trimmed) return null
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) return trimmed
  if (/^(https?:|mailto:|tel:)/i.test(trimmed)) return trimmed
  return null
}

// Parse inline markdown (bold/italic/code/link/image) → React nodes.
function renderInline(text: string, keyBase: string): React.ReactNode[] {
  // Token order: image → link → bold → italic → code. We use a single
  // combined regex + walk to keep O(n) rather than nested passes.
  const RX = /(!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\))|(\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\))|(\*\*([^*]+)\*\*|__([^_]+)__)|(\*([^*\n]+)\*|_([^_\n]+)_)|(`([^`]+)`)/g
  const out: React.ReactNode[] = []
  let last = 0
  let m: RegExpExecArray | null
  let n = 0
  while ((m = RX.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index))
    const key = `${keyBase}-${n++}`
    if (m[1]) {
      // Image
      const url = safeUrl(m[3])
      if (url) out.push(<img key={key} src={url} alt={m[2] || ''} loading="lazy" className="my-4 rounded max-w-full h-auto" />)
      else out.push(m[0])
    } else if (m[4]) {
      // Link
      const url = safeUrl(m[6])
      if (url) {
        const external = /^https?:/i.test(url) && !url.includes('ayurconnect.com')
        out.push(<a key={key} href={url} className="text-kerala-700 hover:underline" {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{m[5]}</a>)
      } else out.push(m[0])
    } else if (m[7]) {
      out.push(<strong key={key}>{m[8] ?? m[9]}</strong>)
    } else if (m[10]) {
      out.push(<em key={key}>{m[11] ?? m[12]}</em>)
    } else if (m[13]) {
      out.push(<code key={key} className="px-1 py-0.5 rounded bg-gray-100 text-[13px] font-mono">{m[14]}</code>)
    }
    last = m.index + m[0].length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

function renderContent(content: string) {
  const blocks = content.split(/\n\s*\n+/).map((b) => b.trim()).filter(Boolean)
  return blocks.map((block, i) => {
    // Heading: 1-4 leading '#'
    const h = /^(#{1,4})\s+(.+)$/.exec(block)
    if (h) {
      const level = h[1].length + 1 // # → h2, ## → h3, etc (h1 is the page title)
      const Tag = (`h${Math.min(level, 5)}`) as 'h2' | 'h3' | 'h4' | 'h5'
      const cls = level === 2 ? 'font-serif text-2xl text-kerala-800 mt-6 mb-2'
                : level === 3 ? 'font-serif text-xl text-kerala-800 mt-5 mb-2'
                              : 'font-serif text-lg text-kerala-800 mt-4 mb-2'
      return <Tag key={i} className={cls}>{renderInline(h[2], `h${i}`)}</Tag>
    }

    // Bullet list: every line begins with '- ' or '* '
    const lines = block.split(/\n/)
    if (lines.every((l) => /^\s*[-*]\s+/.test(l))) {
      return (
        <ul key={i} className="list-disc pl-5 space-y-1">
          {lines.map((l, j) => (
            <li key={j}>{renderInline(l.replace(/^\s*[-*]\s+/, ''), `li${i}-${j}`)}</li>
          ))}
        </ul>
      )
    }

    // Paragraph — preserve intra-block line breaks. Detect "standalone-image"
    // paragraphs (only a ![alt](url) inside) and render without <p> wrapper so
    // the browser doesn't complain about <img> inside <p> (still valid, but
    // block styling reads better without).
    const isJustImage = /^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)\s*$/.test(block)
    if (isJustImage) {
      return <div key={i}>{renderInline(block, `p${i}`)}</div>
    }
    return (
      <p key={i} className="leading-relaxed whitespace-pre-line">
        {renderInline(block, `p${i}`)}
      </p>
    )
  })
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const article = await fetchArticle(id)
  // Article deleted / old GSC slug (e.g. art-turmeric-curcumin-research) →
  // 301 to /articles listing instead of 404. Recovers PageRank.
  if (!article) redirect('/articles')

  const related = await fetchRelated(article.id, article.category)

  const Icon = CATEGORY_ICON[article.category] ?? BookOpen
  const categoryLabel = CATEGORY_LABEL[article.category] ?? article.category

  const jsonLd = ldGraph(
    articleLd({
      id: article.id,
      title: article.title,
      content: article.content,
      category: article.category,
      language: article.language,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      authorName: article.source ?? null,
      urlPath: `/articles/${article.id}`,
    }),
    breadcrumbLd([
      { name: 'Home', url: '/' },
      { name: 'Articles', url: '/articles' },
      { name: article.title, url: `/articles/${article.id}` },
    ]),
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="bg-kerala-50 border-b border-kerala-100">
        <div className="container mx-auto px-4 py-3 text-sm">
          <Link href="/articles" className="inline-flex items-center gap-1.5 text-kerala-700 hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" /> All articles
          </Link>
        </div>
      </div>

      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="mb-5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-kerala-50 text-kerala-700 border border-kerala-100">
            <Icon className="w-3 h-3" /> {categoryLabel}
          </span>
          {article.language !== 'en' && (
            <span className="ml-2 text-[10px] uppercase tracking-wider text-gray-400 font-mono">{article.language}</span>
          )}
        </div>

        <h1 className="font-serif text-3xl md:text-5xl text-ink leading-tight mb-4">{article.title}</h1>

        {article.source && (
          <p className="text-sm text-gray-500 italic mb-6">Source: {article.source}</p>
        )}

        {article.featuredImage && (
          <figure className="mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.featuredImage}
              srcSet={buildSrcSet(article.featuredImage)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
              alt={article.featuredImageAlt ?? article.title}
              width={1200}
              height={630}
              className="w-full h-auto object-cover rounded-lg"
              fetchPriority="high"
              loading="eager"
            />
            {article.featuredImageAlt && (
              <figcaption className="text-xs text-gray-500 mt-2 text-center italic">{article.featuredImageAlt}</figcaption>
            )}
          </figure>
        )}

        <div className="prose prose-kerala max-w-none text-gray-800 space-y-4 text-[15px]">
          {renderContent(article.content)}
        </div>

        <ArticleEngagement id={article.id} title={article.title} />

        <ArticleShareBar id={article.id} title={article.title} />

        <div className="mt-6 p-4 rounded-card bg-amber-50 border border-amber-100 text-sm text-amber-900">
          <strong>Consult a doctor about this topic.</strong> Articles are educational. For diagnosis + personalised treatment, talk to a verified Ayurveda doctor.
          <Link href="/doctors" className="text-kerala-800 hover:underline ml-1 font-semibold">Browse verified doctors →</Link>
        </div>

        <p className="mt-4 text-xs text-gray-400">Published {new Date(article.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </article>

      {related.length > 0 && (
        <section className="bg-gray-50 border-t border-gray-100 py-10">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="font-serif text-2xl text-ink mb-5">More Ayurveda Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map((a) => (
                <Link
                  key={a.id}
                  href={`/articles/${a.id}`}
                  className="group bg-white rounded-card border border-gray-100 shadow-card hover:shadow-cardLg transition-shadow overflow-hidden flex flex-col"
                >
                  {a.featuredImage && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={a.featuredImage} alt={a.featuredImageAlt ?? ''} className="w-full h-32 object-cover" />
                  )}
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-serif text-base text-ink leading-snug line-clamp-2 group-hover:text-kerala-700 transition-colors">{a.title}</h3>
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2 flex-1">{clip(a.content, 100)}</p>
                    <p className="mt-3 text-[11px] text-gray-400 flex items-center gap-2">
                      <span>{a.source ?? 'AyurConnect'}</span>
                      <span aria-hidden>·</span>
                      <span>{new Date(a.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                      {a.readTimeMinutes ? <><span aria-hidden>·</span><span>{a.readTimeMinutes} min</span></> : null}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
