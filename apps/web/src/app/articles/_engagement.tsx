'use client'

import { useEffect, useState } from 'react'
import { Heart, Share2, MessageCircle, Copy, CheckCircle2 } from 'lucide-react'

// Engagement bar: increments view count once on mount; renders like + share
// buttons that POST to the API and bump local state. localStorage prevents
// repeat likes from the same browser.

export function ArticleEngagement({ id, title }: { id: string; title: string }) {
  const [liked, setLiked]   = useState(false)
  const [likes, setLikes]   = useState<number | null>(null)
  const [shares, setShares] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Fire-and-forget view-counter increment
    fetch(`/api/article-categories/articles/${id}/view`, { method: 'POST' }).catch(() => null)
    // Hydrate like state from localStorage
    try {
      const k = 'ayur_liked_articles'
      const v = JSON.parse(localStorage.getItem(k) ?? '[]') as string[]
      if (v.includes(id)) setLiked(true)
    } catch { /* ignore */ }
  }, [id])

  async function like() {
    if (liked) return
    try {
      const r = await fetch(`/api/article-categories/articles/${id}/like`, { method: 'POST' })
      if (r.ok) {
        const j = await r.json() as { likeCount: number | null }
        setLikes(j.likeCount)
        setLiked(true)
        try {
          const k = 'ayur_liked_articles'
          const v = JSON.parse(localStorage.getItem(k) ?? '[]') as string[]
          v.push(id); localStorage.setItem(k, JSON.stringify(v))
        } catch { /* ignore */ }
      }
    } catch { /* ignore */ }
  }

  async function bumpShare() {
    try {
      const r = await fetch(`/api/article-categories/articles/${id}/share`, { method: 'POST' })
      if (r.ok) { const j = await r.json() as { shareCount: number | null }; setShares(j.shareCount) }
    } catch { /* ignore */ }
  }

  const url = typeof window !== 'undefined' ? window.location.href : `https://ayurconnect.com/articles/${id}`
  const wa  = `https://wa.me/?text=${encodeURIComponent(`Check out this Ayurveda article: ${title} ${url}`)}`
  const fb  = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
  const tw  = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`

  function copy() {
    void navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); void bumpShare() })
  }

  return (
    <section className="bg-cream border border-gray-100 rounded-card p-5 my-8" aria-label="Engage with this article">
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={like} disabled={liked} className={'inline-flex items-center gap-1.5 px-4 py-2 rounded text-sm font-semibold ' + (liked ? 'bg-rose-100 text-rose-700 cursor-default' : 'bg-rose-600 hover:bg-rose-700 text-white')}>
          <Heart className={'w-4 h-4 ' + (liked ? 'fill-current' : '')} />
          {liked ? 'Liked' : 'Like'} {likes !== null && <span className="text-xs opacity-80">· {likes}</span>}
        </button>
        <span className="text-xs text-gray-500 mx-1">Share:</span>
        <a href={wa} target="_blank" rel="noreferrer noopener" onClick={bumpShare} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25d366] hover:opacity-90 text-white rounded text-xs font-semibold">
          <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
        </a>
        <a href={fb} target="_blank" rel="noreferrer noopener" onClick={bumpShare} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1877f2] hover:opacity-90 text-white rounded text-xs font-semibold">
          <Share2 className="w-3.5 h-3.5" /> Facebook
        </a>
        <a href={tw} target="_blank" rel="noreferrer noopener" onClick={bumpShare} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1da1f2] hover:opacity-90 text-white rounded text-xs font-semibold">
          <Share2 className="w-3.5 h-3.5" /> Twitter
        </a>
        <button onClick={copy} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded text-xs hover:bg-gray-50">
          {copied ? <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy link</>}
        </button>
        {shares !== null && <span className="text-xs text-gray-500">· {shares} shares</span>}
      </div>
    </section>
  )
}
