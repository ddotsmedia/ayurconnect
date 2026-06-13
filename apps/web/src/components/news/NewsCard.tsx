import Link from 'next/link'
import { Eye, Clock, Calendar } from 'lucide-react'
import type { NewsArticle } from '../../lib/types/platform'

const CAT_COLOR: Record<string, string> = {
  Industry: 'bg-blue-100 text-blue-800', Research: 'bg-violet-100 text-violet-800',
  Government: 'bg-amber-100 text-amber-800', Community: 'bg-emerald-100 text-emerald-800',
  International: 'bg-rose-100 text-rose-800',
}

export function NewsCard({ article, variant = 'standard' }: { article: NewsArticle; variant?: 'featured' | 'standard' }) {
  if (variant === 'featured') {
    return (
      <Link href={`/news/${article.slug}`} className="group block bg-white border border-gray-100 rounded-card overflow-hidden shadow-card hover:shadow-cardLg transition-shadow">
        <div className="aspect-video bg-gradient-to-br from-kerala-700 via-kerala-600 to-amber-600 flex items-center justify-center" aria-label={article.imageAlt}>
          <span className="text-white/90 font-serif text-3xl px-4 text-center line-clamp-3">{article.title}</span>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {article.breaking && <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-red-600 text-white rounded font-semibold animate-pulse">Breaking</span>}
            <span className={'text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-semibold ' + (CAT_COLOR[article.category] ?? 'bg-gray-100 text-gray-700')}>{article.category}</span>
          </div>
          <h2 className="font-serif text-xl text-ink leading-tight group-hover:text-kerala-700 transition-colors">{article.title}</h2>
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{article.excerpt}</p>
          <div className="mt-3 flex items-center gap-3 text-[11px] text-gray-500 flex-wrap">
            <span>{article.author}</span>
            <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(article.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
            <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {article.readTime} min</span>
            <span className="inline-flex items-center gap-1"><Eye className="w-3 h-3" /> {article.views.toLocaleString()}</span>
          </div>
        </div>
      </Link>
    )
  }
  return (
    <Link href={`/news/${article.slug}`} className="group block bg-white border border-gray-100 rounded-card overflow-hidden shadow-card hover:shadow-cardLg transition-shadow">
      <div className="aspect-[3/1] md:aspect-[16/9] bg-gradient-to-br from-kerala-700 to-amber-700 flex items-center justify-center" aria-label={article.imageAlt}>
        <span className="text-white/90 font-serif text-base md:text-lg px-3 text-center line-clamp-2">{article.title}</span>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {article.breaking && <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-red-600 text-white rounded font-semibold">Breaking</span>}
          <span className={'text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-semibold ' + (CAT_COLOR[article.category] ?? 'bg-gray-100 text-gray-700')}>{article.category}</span>
        </div>
        <h3 className="font-serif text-base text-ink leading-tight group-hover:text-kerala-700 transition-colors">{article.title}</h3>
        <p className="text-xs text-gray-600 mt-1.5 line-clamp-2">{article.excerpt}</p>
        <div className="mt-2 flex items-center gap-2 text-[10px] text-gray-500 flex-wrap">
          <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(article.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
          <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {article.readTime} min</span>
          <span className="inline-flex items-center gap-1"><Eye className="w-3 h-3" /> {article.views.toLocaleString()}</span>
        </div>
      </div>
    </Link>
  )
}
