import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { breadcrumbLd, SITE_URL } from '../lib/seo'

export type Crumb = { label: string; href?: string }

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all: Crumb[] = [{ label: 'Home', href: '/' }, ...items]
  const ldItems = all.map((c) => ({ name: c.label, url: c.href ?? '' })).filter((c) => c.url)
  const ld = breadcrumbLd(ldItems.map((c) => ({ name: c.name, url: c.url.startsWith('http') ? c.url : `${SITE_URL}${c.url}` })))
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <nav aria-label="Breadcrumb" className="container mx-auto px-4 mt-4 mb-2">
        <ol className="flex flex-wrap items-center gap-1 text-xs text-gray-500">
          {all.map((c, i) => {
            const last = i === all.length - 1
            return (
              <li key={i} className="inline-flex items-center gap-1">
                {i > 0 && <ChevronRight className="w-3 h-3 text-gray-300" />}
                {!last && c.href ? <Link href={c.href} className="hover:text-kerala-700">{c.label}</Link> : <span className={last ? 'text-gray-800 font-medium' : ''}>{c.label}</span>}
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}
