// Reusable editors for featuredArticles + featuredPosts. Used by:
//   - Admin doctor form  (apps/web/src/app/admin/doctors/page.tsx)
//   - Self-edit profile  (apps/web/src/app/dashboard/profile/page.tsx)
//
// Both keep the array as state; invalid items (missing url / title) are
// silently dropped server-side, but the UI does best-effort placeholder hints.

'use client'

import { Plus, X, ExternalLink, FileText, Share2 } from 'lucide-react'

export type FeaturedArticle = { title: string; url: string; source?: string | null; year?: number | null }
export type FeaturedPost    = { platform: string; url: string; caption?: string | null }

const POST_PLATFORMS = ['twitter', 'instagram', 'youtube', 'facebook', 'linkedin', 'tiktok', 'other'] as const

// Ensures we never call .map / .length on a non-array (the API may return null).
function safe<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : []
}

// ─── Featured articles editor ───────────────────────────────────────────
export function FeaturedArticlesField({
  values, onChange, max = 10,
}: {
  values: FeaturedArticle[] | null | undefined
  onChange: (next: FeaturedArticle[]) => void
  max?: number
}) {
  const list = safe<FeaturedArticle>(values)
  const update = (i: number, patch: Partial<FeaturedArticle>) =>
    onChange(list.map((it, idx) => idx === i ? { ...it, ...patch } : it))
  const remove = (i: number) => onChange(list.filter((_, idx) => idx !== i))
  const add    = () => onChange([...list, { title: '', url: '', source: null, year: null }])

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-500 inline-flex items-center gap-1.5">
          <FileText className="w-3 h-3" /> Health articles you&apos;ve authored, contributed to, or curate.
        </p>
        {list.length < max && (
          <button type="button" onClick={add} className="text-xs text-kerala-700 hover:underline inline-flex items-center gap-1">
            <Plus className="w-3 h-3" /> Add article
          </button>
        )}
      </div>
      {list.length === 0 ? (
        <p className="text-xs text-gray-400 italic">No articles yet. Add up to {max} to showcase your published work.</p>
      ) : (
        <div className="space-y-2">
          {list.map((a, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2 p-3 bg-gray-50 rounded-md border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <input
                  value={a.title}
                  onChange={(e) => update(i, { title: e.target.value })}
                  placeholder="Article title *"
                  className="border border-gray-200 rounded px-2 py-1.5 text-sm"
                />
                <input
                  value={a.url}
                  onChange={(e) => update(i, { url: e.target.value })}
                  placeholder="https://..."
                  className="border border-gray-200 rounded px-2 py-1.5 text-sm"
                />
                <input
                  value={a.source ?? ''}
                  onChange={(e) => update(i, { source: e.target.value || null })}
                  placeholder="Publication / source (optional, e.g. The Hindu)"
                  className="border border-gray-200 rounded px-2 py-1.5 text-sm"
                />
                <input
                  type="number" min="1900" max="2200"
                  value={a.year ?? ''}
                  onChange={(e) => update(i, { year: e.target.value ? Number(e.target.value) : null })}
                  placeholder="Year (optional)"
                  className="border border-gray-200 rounded px-2 py-1.5 text-sm"
                />
              </div>
              <button type="button" onClick={() => remove(i)} className="self-start p-1 text-red-500 hover:bg-red-50 rounded" aria-label="Remove">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Featured social posts editor ───────────────────────────────────────
export function FeaturedPostsField({
  values, onChange, max = 10,
}: {
  values: FeaturedPost[] | null | undefined
  onChange: (next: FeaturedPost[]) => void
  max?: number
}) {
  const list = safe<FeaturedPost>(values)
  const update = (i: number, patch: Partial<FeaturedPost>) =>
    onChange(list.map((it, idx) => idx === i ? { ...it, ...patch } : it))
  const remove = (i: number) => onChange(list.filter((_, idx) => idx !== i))
  const add    = () => onChange([...list, { platform: 'twitter', url: '', caption: null }])

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-500 inline-flex items-center gap-1.5">
          <Share2 className="w-3 h-3" /> Specific social posts you want to spotlight (different from your platform homepage URLs).
        </p>
        {list.length < max && (
          <button type="button" onClick={add} className="text-xs text-kerala-700 hover:underline inline-flex items-center gap-1">
            <Plus className="w-3 h-3" /> Add post
          </button>
        )}
      </div>
      {list.length === 0 ? (
        <p className="text-xs text-gray-400 italic">No posts pinned yet. Add up to {max} featured posts.</p>
      ) : (
        <div className="space-y-2">
          {list.map((p, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2 p-3 bg-gray-50 rounded-md border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-2">
                <select
                  value={p.platform}
                  onChange={(e) => update(i, { platform: e.target.value })}
                  className="border border-gray-200 rounded px-2 py-1.5 text-sm bg-white"
                >
                  {POST_PLATFORMS.map((pl) => <option key={pl} value={pl}>{pl}</option>)}
                </select>
                <input
                  value={p.url}
                  onChange={(e) => update(i, { url: e.target.value })}
                  placeholder="https://..."
                  className="border border-gray-200 rounded px-2 py-1.5 text-sm"
                />
                <input
                  value={p.caption ?? ''}
                  onChange={(e) => update(i, { caption: e.target.value || null })}
                  placeholder="Caption / short description (optional)"
                  className="md:col-span-2 border border-gray-200 rounded px-2 py-1.5 text-sm"
                />
              </div>
              <button type="button" onClick={() => remove(i)} className="self-start p-1 text-red-500 hover:bg-red-50 rounded" aria-label="Remove">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Public display helpers ─────────────────────────────────────────────
// Render the read-only lists on the public doctor profile.
export function FeaturedArticlesDisplay({ items }: { items: FeaturedArticle[] | null | undefined }) {
  const list = safe<FeaturedArticle>(items)
  if (list.length === 0) return null
  return (
    <ul className="space-y-2">
      {list.map((a, i) => (
        <li key={i} className="text-sm">
          <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-kerala-700 hover:underline font-medium inline-flex items-center gap-1">
            {a.title} <ExternalLink className="w-3 h-3" />
          </a>
          {(a.source || a.year) && (
            <span className="text-xs text-gray-500 ml-1">
              · {a.source ?? ''}{a.source && a.year ? ', ' : ''}{a.year ?? ''}
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}

const PLATFORM_LABEL: Record<string, string> = {
  twitter:   'Twitter / X',
  instagram: 'Instagram',
  youtube:   'YouTube',
  facebook:  'Facebook',
  linkedin:  'LinkedIn',
  tiktok:    'TikTok',
  other:     'Post',
}
export function FeaturedPostsDisplay({ items }: { items: FeaturedPost[] | null | undefined }) {
  const list = safe<FeaturedPost>(items)
  if (list.length === 0) return null
  return (
    <ul className="space-y-2">
      {list.map((p, i) => (
        <li key={i} className="bg-white rounded-md border border-gray-100 p-3 text-sm">
          <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{PLATFORM_LABEL[p.platform] ?? p.platform}</span>
          {p.caption && <p className="text-gray-800 mt-1">{p.caption}</p>}
          <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-xs text-kerala-700 hover:underline inline-flex items-center gap-1 mt-1">
            Open post <ExternalLink className="w-3 h-3" />
          </a>
        </li>
      ))}
    </ul>
  )
}
