import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { Newspaper } from 'lucide-react'
import { breadcrumbLd, ldGraph, pageMetadata } from '../../lib/seo'
import { NEWS_ARTICLES } from '../../lib/data/news-seed'
import { NewsTicker } from '../../components/news/NewsTicker'
import { NewsCard } from '../../components/news/NewsCard'
import { NewsFilters } from '../../components/news/NewsFilters'
import { NewsletterSignup } from '../../components/news/NewsletterSignup'

export const metadata: Metadata = pageMetadata({
  path:        '/news',
  title:       'Ayurveda News — Industry, Research, Policy | AyurConnect',
  description: 'Latest Ayurveda news from Kerala + the diaspora — industry, clinical research, AYUSH policy, community events, international recognition. Curated weekly.',
  keywords:    ['ayurveda news', 'AYUSH policy', 'kerala ayurveda', 'CCRAS research', 'BAMS news'],
})

export default async function NewsListPage({ searchParams }: { searchParams: Promise<{ category?: string; q?: string; sort?: string; tag?: string }> }) {
  const sp = await searchParams
  let items = [...NEWS_ARTICLES]
  if (sp.category && sp.category !== 'All') items = items.filter((a) => a.category === sp.category)
  if (sp.tag)                                items = items.filter((a) => a.tags.includes(sp.tag!))
  if (sp.q) {
    const q = sp.q.toLowerCase()
    items = items.filter((a) => a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q) || a.tags.some((t) => t.toLowerCase().includes(q)))
  }
  switch (sp.sort) {
    case 'views':    items.sort((a, b) => b.views - a.views); break
    case 'featured': items.sort((a, b) => Number(b.featured) - Number(a.featured)); break
    default:         items.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
  }
  const featured = items.filter((a) => a.featured).slice(0, 3)
  const rest     = items.filter((a) => !featured.includes(a))
  const ld       = ldGraph(breadcrumbLd([{ name: 'Home', url: '/' }, { name: 'News', url: '/news' }]))

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-100 z-50">
        <div id="reading-progress" className="h-full bg-kerala-700 transition-all" style={{ width: '0%' }} />
      </div>
      <NewsTicker articles={NEWS_ARTICLES} />

      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
            <Newspaper className="w-3 h-3" /> Curated Ayurveda news
          </span>
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">Ayurveda News</h1>
          <p className="text-white/85 mt-3">Industry · research · policy · community · international.</p>
        </div>
      </GradientHero>

      <section className="container mx-auto px-4 py-10 max-w-6xl">
        {featured.length > 0 && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="md:row-span-2">{featured[0] && <NewsCard article={featured[0]} variant="featured" />}</div>
            {featured[1] && <NewsCard article={featured[1]} />}
            {featured[2] && <NewsCard article={featured[2]} />}
          </section>
        )}

        <NewsFilters />

        {rest.length === 0 ? (
          <p className="text-sm text-muted text-center bg-white border border-gray-100 rounded-card p-8">No articles match.</p>
        ) : (
          <>
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rest.slice(0, 6).map((a) => <NewsCard key={a.id} article={a} />)}
            </section>
            <NewsletterSignup />
            {rest.length > 6 && (
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rest.slice(6).map((a) => <NewsCard key={a.id} article={a} />)}
              </section>
            )}
          </>
        )}
      </section>

      <script
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: `
          (function(){function u(){var d=document.documentElement,h=d.scrollHeight-d.clientHeight,p=h>0?(d.scrollTop/h)*100:0;var b=document.getElementById('reading-progress');if(b)b.style.width=p+'%';}window.addEventListener('scroll',u,{passive:true});u();})();
        `}}
      />
    </>
  )
}
