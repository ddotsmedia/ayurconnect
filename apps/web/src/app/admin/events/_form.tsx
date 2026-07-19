'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Loader2, ImagePlus } from 'lucide-react'
import { adminApi } from '../../../lib/admin-api'

export type EventFormValues = {
  id?:               string
  title:             string
  description:       string
  imageUrl:          string
  imageAlt?:         string | null
  eventDate:         string // ISO date-time (input[type=datetime-local] value)
  eventEndDate?:     string | null
  location?:         string | null
  category:          string
  organizer?:        string | null
  registrationLink?: string | null
  isPublished:       boolean
}

const CATEGORIES = ['seminar', 'workshop', 'job-fair', 'consultation', 'other']

// datetime-local input needs 'YYYY-MM-DDTHH:mm' with no timezone. Convert
// stored ISO string to that shape (drops seconds + Z).
function toLocalInput(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function EventForm({ initial }: { initial?: Partial<EventFormValues> }) {
  const router = useRouter()
  const [v, setV] = useState<EventFormValues>({
    id:               initial?.id,
    title:            initial?.title            ?? '',
    description:      initial?.description      ?? '',
    imageUrl:         initial?.imageUrl         ?? '',
    imageAlt:         initial?.imageAlt         ?? '',
    eventDate:        initial?.eventDate        ? toLocalInput(initial.eventDate) : '',
    eventEndDate:     initial?.eventEndDate     ? toLocalInput(initial.eventEndDate) : '',
    location:         initial?.location         ?? '',
    category:         initial?.category         ?? 'seminar',
    organizer:        initial?.organizer        ?? '',
    registrationLink: initial?.registrationLink ?? '',
    isPublished:      initial?.isPublished      ?? false,
  })
  const [uploading, setUploading] = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [err,       setErr]       = useState<string | null>(null)
  const [dropOn,    setDropOn]    = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(f: File) {
    setUploading(true); setErr(null)
    try {
      const fd = new FormData(); fd.append('file', f)
      const rsp = await fetch('/api/admin/events/upload-image', { method: 'POST', credentials: 'include', body: fd })
      if (!rsp.ok) throw new Error((await rsp.json().catch(() => ({} as { error?: string }))).error ?? `Upload failed (${rsp.status})`)
      const j = await rsp.json() as { url: string; thumb: string }
      setV((cur) => ({ ...cur, imageUrl: j.url }))
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)) }
    finally { setUploading(false) }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!v.title || !v.description || !v.imageUrl || !v.eventDate) {
      setErr('title, description, image, event date all required')
      return
    }
    setSaving(true); setErr(null)
    try {
      const body: Record<string, unknown> = {
        title:            v.title.trim(),
        description:      v.description.trim(),
        imageUrl:         v.imageUrl,
        imageAlt:         v.imageAlt?.trim() || null,
        eventDate:        new Date(v.eventDate).toISOString(),
        eventEndDate:     v.eventEndDate ? new Date(v.eventEndDate).toISOString() : null,
        location:         v.location?.trim() || null,
        category:         v.category,
        organizer:        v.organizer?.trim() || null,
        registrationLink: v.registrationLink?.trim() || null,
        isPublished:      v.isPublished,
      }
      if (v.id) {
        await adminApi.patch(`/admin/events/${v.id}`, body)
      } else {
        await adminApi.post('/admin/events', body)
      }
      router.push('/admin/events')
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)) }
    finally { setSaving(false) }
  }

  const ic = 'w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-kerala-700'

  return (
    <form onSubmit={submit} className="space-y-4 bg-white border border-gray-100 rounded-card p-5">
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-kerala-700 font-semibold mb-1">Title *</label>
        <input className={ic} value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} maxLength={300} required />
      </div>
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-kerala-700 font-semibold mb-1">Description *</label>
        <textarea className={ic + ' min-h-[120px]'} value={v.description} onChange={(e) => setV({ ...v, description: e.target.value })} maxLength={10000} required />
      </div>
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-kerala-700 font-semibold mb-1">Featured image *</label>
        <div
          onDragOver={(e) => { e.preventDefault(); setDropOn(true) }}
          onDragLeave={() => setDropOn(false)}
          onDrop={(e) => {
            e.preventDefault(); setDropOn(false)
            const f = e.dataTransfer.files[0]; if (f) handleFile(f)
          }}
          onClick={() => fileRef.current?.click()}
          className={`cursor-pointer border-2 border-dashed rounded-md p-4 text-center transition-colors ${dropOn ? 'border-kerala-600 bg-kerala-50' : 'border-gray-300 hover:border-kerala-400 hover:bg-cream/40'}`}
        >
          {uploading ? (
            <div className="inline-flex items-center gap-2 text-sm text-gray-700">
              <Loader2 className="w-4 h-4 animate-spin" /> Uploading + optimizing…
            </div>
          ) : v.imageUrl ? (
            <div className="space-y-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={v.imageUrl} alt="" className="mx-auto max-h-40 rounded" />
              <p className="text-xs text-gray-500">Click to replace</p>
            </div>
          ) : (
            <div className="text-sm text-gray-600">
              <ImagePlus className="w-6 h-6 mx-auto text-gray-400 mb-1" />
              Drop image here or click (JPG/PNG/WebP)
              <p className="text-[11px] text-gray-500 mt-1">Optimized to 1200×630 WebP</p>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
        </div>
        <input className={ic + ' mt-2'} placeholder="Image alt text" value={v.imageAlt ?? ''} onChange={(e) => setV({ ...v, imageAlt: e.target.value })} maxLength={300} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-kerala-700 font-semibold mb-1">Event date + time *</label>
          <input type="datetime-local" className={ic} value={v.eventDate} onChange={(e) => setV({ ...v, eventDate: e.target.value })} required />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-kerala-700 font-semibold mb-1">End date + time (optional)</label>
          <input type="datetime-local" className={ic} value={v.eventEndDate ?? ''} onChange={(e) => setV({ ...v, eventEndDate: e.target.value })} />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-kerala-700 font-semibold mb-1">Location</label>
          <input className={ic} value={v.location ?? ''} onChange={(e) => setV({ ...v, location: e.target.value })} placeholder="Kochi, Kerala or online" maxLength={300} />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-kerala-700 font-semibold mb-1">Category</label>
          <select className={ic} value={v.category} onChange={(e) => setV({ ...v, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-kerala-700 font-semibold mb-1">Organizer</label>
          <input className={ic} value={v.organizer ?? ''} onChange={(e) => setV({ ...v, organizer: e.target.value })} placeholder="AVS Kottakkal" maxLength={300} />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-kerala-700 font-semibold mb-1">Registration link</label>
          <input className={ic} type="url" value={v.registrationLink ?? ''} onChange={(e) => setV({ ...v, registrationLink: e.target.value })} placeholder="https://…" maxLength={500} />
        </div>
      </div>

      <label className="inline-flex items-center gap-2 text-sm">
        <input type="checkbox" checked={v.isPublished} onChange={(e) => setV({ ...v, isPublished: e.target.checked })} />
        Publish now (visible on public /events)
      </label>

      {err && <div className="p-3 rounded bg-red-50 border border-red-100 text-sm text-red-800">{err}</div>}

      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => router.push('/admin/events')} className="px-4 py-2 border border-gray-200 rounded text-sm hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={saving || uploading} className="inline-flex items-center gap-2 px-5 py-2 bg-kerala-700 hover:bg-kerala-800 disabled:opacity-50 text-white rounded text-sm font-semibold">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {saving ? 'Saving…' : (v.id ? 'Save changes' : 'Create event')}
        </button>
      </div>
    </form>
  )
}
