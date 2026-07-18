'use client'

import { useRef, useState } from 'react'
import { Loader2, ImagePlus, Sparkles, Check, X } from 'lucide-react'

// Shared class from EntityFormShell used across admin editors.
const inputClass = 'w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-kerala-600'

// ─── Image upload zone ────────────────────────────────────────────────────
// Drag/drop or click. POSTs to /api/articles/upload-image (admin-gated) and
// returns { url, srcset, thumb, altPlaceholder }. On success calls onInsert
// with a markdown snippet that the editor can paste at the cursor.
export function ArticleImageUpload({
  onInsert,
  onFeatured,
}: {
  onInsert:   (markdown: string) => void
  onFeatured: (url: string, alt: string) => void
}) {
  const [busy,   setBusy]   = useState(false)
  const [err,    setErr]    = useState<string | null>(null)
  const [thumb,  setThumb]  = useState<string | null>(null)
  const [alt,    setAlt]    = useState('')
  const [dropOn, setDropOn] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function upload(file: File) {
    setBusy(true); setErr(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const r = await fetch('/api/articles/upload-image', { method: 'POST', credentials: 'include', body: fd })
      if (!r.ok) throw new Error(`Upload failed (${r.status})`)
      const j = await r.json() as { url: string; srcset: string; thumb: string; altPlaceholder: string }
      setThumb(j.thumb)
      setAlt(j.altPlaceholder)
      onInsert(`\n\n![${j.altPlaceholder}](${j.url})\n\n`)
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDropOn(true) }}
        onDragLeave={() => setDropOn(false)}
        onDrop={(e) => {
          e.preventDefault(); setDropOn(false)
          const f = e.dataTransfer.files[0]
          if (f) upload(f)
        }}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer border-2 border-dashed rounded-md p-6 text-center transition-colors ${dropOn ? 'border-kerala-600 bg-kerala-50' : 'border-gray-300 hover:border-kerala-400 hover:bg-cream/40'}`}
      >
        {busy ? (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
            <Loader2 className="w-4 h-4 animate-spin" />
            Image optimizing…
          </div>
        ) : thumb ? (
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={thumb} alt="" className="w-16 h-16 object-cover rounded" />
            <div className="text-left flex-1">
              <p className="text-sm text-kerala-700 font-medium">Uploaded · 3 sizes generated</p>
              <p className="text-xs text-gray-600">Inserted markdown at cursor. Drop another to add more.</p>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-600">
            <ImagePlus className="w-6 h-6 mx-auto text-gray-400 mb-1" />
            Click or drop image here (JPG/PNG/WebP)
            <p className="text-xs text-gray-500 mt-1">Resized to 1200/800/400 · converted to WebP</p>
          </div>
        )}
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f) }} />
      </div>
      {err && <p className="text-xs text-red-600 mt-2">{err}</p>}
      {thumb && (
        <div className="mt-2 flex items-center gap-2">
          <input value={alt} onChange={(e) => setAlt(e.target.value)} className={inputClass} placeholder="Featured image alt text" />
          <button type="button" onClick={() => thumb && onFeatured(thumb.replace('-400.webp', '-1200.webp'), alt)} className="whitespace-nowrap px-3 py-2 bg-kerala-700 text-white text-xs rounded hover:bg-kerala-800">
            Set as featured
          </button>
        </div>
      )}
    </div>
  )
}

// ─── AI Optimize (Haiku) ──────────────────────────────────────────────────
export type OptimizeResult = {
  titles: string[]
  descriptions: string[]
  keywords: string[]
  readingTime: number
  gaps: string
}

export function AiOptimizeButton({
  title, content, category,
  onApply,
}: {
  title:    string
  content:  string
  category: string
  onApply:  (patch: Partial<{ title: string; seoDescription: string; seoKeywords: string; readTimeMinutes: number }>) => void
}) {
  const [busy,   setBusy]   = useState(false)
  const [err,    setErr]    = useState<string | null>(null)
  const [result, setResult] = useState<OptimizeResult | null>(null)

  async function run() {
    if (!title.trim() || !content.trim()) { setErr('Add a title + content first'); return }
    setBusy(true); setErr(null); setResult(null)
    try {
      const r = await fetch('/api/articles/ai/optimize', {
        method: 'POST', credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ title, content, tags: category }),
      })
      if (!r.ok) throw new Error(`AI request failed (${r.status})`)
      setResult(await r.json() as OptimizeResult)
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="border border-gray-200 rounded-md p-4 bg-cream/40">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-kerala-800 inline-flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-amber-500" /> AI Optimize</p>
          <p className="text-xs text-gray-600">Haiku suggests better titles, descriptions, keywords + reading time.</p>
        </div>
        <button type="button" onClick={run} disabled={busy} className="inline-flex items-center gap-1.5 px-3 py-2 bg-kerala-700 hover:bg-kerala-800 text-white text-xs font-semibold rounded disabled:opacity-50">
          {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
          {busy ? 'Analyzing…' : 'Optimize with AI'}
        </button>
      </div>
      {err && <p className="text-xs text-red-600 mt-2">{err}</p>}
      {result && (
        <div className="mt-4 space-y-3">
          <SuggestionGroup label="Titles" items={result.titles} onPick={(v) => onApply({ title: v })} />
          <SuggestionGroup label="Meta descriptions" items={result.descriptions} onPick={(v) => onApply({ seoDescription: v })} />
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-1">Keywords</p>
            <div className="flex flex-wrap gap-1 mb-2">
              {result.keywords.map((k) => (
                <span key={k} className="text-[11px] px-2 py-0.5 bg-white border border-gray-200 rounded-full">{k}</span>
              ))}
            </div>
            <button type="button" onClick={() => onApply({ seoKeywords: result.keywords.join(', ') })} className="text-xs text-kerala-700 hover:underline">
              ← Set as SEO keywords
            </button>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="px-2 py-1 bg-white border border-gray-200 rounded">Reading time: <strong>{result.readingTime} min</strong></span>
            <button type="button" onClick={() => onApply({ readTimeMinutes: result.readingTime })} className="text-kerala-700 hover:underline">Apply</button>
          </div>
          {result.gaps && (
            <div className="text-xs bg-amber-50 border border-amber-100 rounded p-2 text-amber-900">
              <strong>Content gaps:</strong> {result.gaps}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SuggestionGroup({ label, items, onPick }: { label: string; items: string[]; onPick: (v: string) => void }) {
  if (!items.length) return null
  return (
    <div>
      <p className="text-xs font-semibold text-gray-700 mb-1">{label}</p>
      <ul className="space-y-1">
        {items.map((v, i) => (
          <li key={i} className="flex items-start gap-2 group">
            <button type="button" onClick={() => onPick(v)} title="Apply" className="mt-0.5 w-5 h-5 rounded-full border border-kerala-300 hover:bg-kerala-100 flex items-center justify-center flex-shrink-0">
              <Check className="w-3 h-3 text-kerala-700" />
            </button>
            <p className="text-xs text-gray-800 leading-snug">{v}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── Social Preview (WhatsApp / Facebook / Twitter mock cards) ─────────────
export function SocialPreview({
  title,
  description,
  featuredImage,
  authorName = 'AyurConnect',
}: {
  title:         string
  description:   string
  featuredImage: string
  authorName?:   string
}) {
  const truncTitle = (n: number) => (title.length > n ? title.slice(0, n - 1) + '…' : title)
  const truncDesc  = (n: number) => (description.length > n ? description.slice(0, n - 1) + '…' : description)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <PreviewCard platform="WhatsApp" tint="bg-emerald-50 border-emerald-200">
        <div className="bg-white border rounded p-2 text-xs">
          {featuredImage && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={featuredImage} alt="" className="w-full h-24 object-cover rounded mb-1" />
          )}
          <p className="font-semibold text-gray-900 leading-snug">{truncTitle(65)}</p>
          <p className="text-gray-600 mt-0.5 leading-snug">{truncDesc(90)}</p>
          <p className="text-gray-400 uppercase text-[10px] mt-1">ayurconnect.com</p>
        </div>
      </PreviewCard>
      <PreviewCard platform="Facebook" tint="bg-blue-50 border-blue-200">
        <div className="bg-white border rounded overflow-hidden text-xs">
          {featuredImage && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={featuredImage} alt="" className="w-full h-24 object-cover" />
          )}
          <div className="p-2">
            <p className="text-gray-500 uppercase text-[10px]">AYURCONNECT.COM</p>
            <p className="font-semibold text-gray-900 leading-snug">{truncTitle(88)}</p>
            <p className="text-gray-600 mt-0.5 leading-snug">{truncDesc(150)}</p>
          </div>
        </div>
      </PreviewCard>
      <PreviewCard platform="Twitter / X" tint="bg-gray-50 border-gray-200">
        <div className="bg-white border rounded overflow-hidden text-xs">
          {featuredImage && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={featuredImage} alt="" className="w-full h-24 object-cover" />
          )}
          <div className="p-2">
            <p className="text-gray-500 uppercase text-[10px]">ayurconnect.com</p>
            <p className="font-semibold text-gray-900 leading-snug">{truncTitle(70)}</p>
            <p className="text-gray-600 mt-0.5 leading-snug">{truncDesc(125)}</p>
            <p className="text-gray-400 text-[10px] mt-1">by {authorName}</p>
          </div>
        </div>
      </PreviewCard>
    </div>
  )
}

function PreviewCard({ platform, tint, children }: { platform: string; tint: string; children: React.ReactNode }) {
  return (
    <div className={`border rounded-md p-2 ${tint}`}>
      <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-1.5">{platform}</p>
      {children}
    </div>
  )
}

export { X } // re-export to silence unused import warning; used elsewhere
