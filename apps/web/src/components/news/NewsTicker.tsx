import Link from 'next/link'
import { Zap } from 'lucide-react'
import type { NewsArticle } from '../../lib/types/platform'

export function NewsTicker({ articles }: { articles: NewsArticle[] }) {
  const breaking = articles.filter((a) => a.breaking)
  if (breaking.length === 0) return null
  const repeated = [...breaking, ...breaking, ...breaking]
  return (
    <div className="bg-kerala-800 text-white py-2 overflow-hidden border-b border-kerala-900" role="region" aria-label="Breaking news">
      <div className="flex items-center gap-3">
        <span className="flex-shrink-0 inline-flex items-center gap-1 px-3 text-[10px] uppercase tracking-wider font-bold text-amber-300">
          <Zap className="w-3 h-3" /> Breaking
        </span>
        <div className="flex-1 overflow-hidden">
          <div className="flex gap-10 whitespace-nowrap animate-ticker hover:[animation-play-state:paused]">
            {repeated.map((a, i) => (
              <Link key={`${a.id}-${i}`} href={`/news/${a.slug}`} className="text-sm text-white/90 hover:text-amber-300 transition-colors">
                {a.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
