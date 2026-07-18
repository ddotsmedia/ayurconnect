'use client'

import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'

// Engagement bar: view + like tracking only. Share buttons live in
// ArticleShareBar (single source of truth on the detail page).
// localStorage prevents repeat likes from the same browser.

export function ArticleEngagement({ id }: { id: string; title?: string }) {
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState<number | null>(null)

  useEffect(() => {
    fetch(`/api/article-categories/articles/${id}/view`, { method: 'POST' }).catch(() => null)
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

  return (
    <div className="my-6 flex items-center gap-3">
      <button
        onClick={like}
        disabled={liked}
        className={'inline-flex items-center gap-1.5 px-4 py-2 rounded text-sm font-semibold ' + (liked ? 'bg-rose-100 text-rose-700 cursor-default' : 'bg-rose-600 hover:bg-rose-700 text-white')}
      >
        <Heart className={'w-4 h-4 ' + (liked ? 'fill-current' : '')} />
        {liked ? 'Liked' : 'Like'} {likes !== null && <span className="text-xs opacity-80">· {likes}</span>}
      </button>
    </div>
  )
}
