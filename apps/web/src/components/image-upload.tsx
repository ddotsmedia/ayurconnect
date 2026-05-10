'use client'

import { useRef, useState } from 'react'
import { Upload, Loader2, Trash2 } from 'lucide-react'

type Props = {
  value: string | null
  onChange: (url: string | null) => void
  /** Hint to the API which bucket to use. Only 'profile' / 'tourism' / 'prescriptions' are allowed. */
  bucket?: 'profile' | 'tourism' | 'prescriptions'
  /** Square preview vs landscape. Default: square (avatars). */
  shape?: 'square' | 'landscape'
  className?: string
}

const MAX_BYTES = 5 * 1024 * 1024

export function ImageUpload({ value, onChange, bucket = 'profile', shape = 'square', className = '' }: Props) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  async function pick(file: File) {
    setErr(null)
    if (file.size > MAX_BYTES) { setErr(`File too large (${(file.size / 1e6).toFixed(1)} MB) — max 5 MB.`); return }
    if (!file.type.startsWith('image/')) { setErr(`Not an image (${file.type})`); return }
    setBusy(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch(`/api/uploads?bucket=${bucket}`, {
        method: 'POST',
        credentials: 'include',
        body: fd,
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`)
      if (!json.url) throw new Error('upload returned no url')
      onChange(json.url as string)
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const isSquare = shape === 'square'
  const previewBox = isSquare ? 'w-24 h-24 rounded-full' : 'w-40 h-24 rounded-md'

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className={`${previewBox} bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0`}>
        {value
          ? // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="upload preview" className="w-full h-full object-cover" />
          : <Upload className="w-6 h-6 text-gray-400" />
        }
      </div>
      <div className="flex flex-col gap-2 min-w-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {value ? 'Change' : 'Upload'}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              disabled={busy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded-md hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" /> Remove
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500">JPEG / PNG / WebP / GIF · max 5 MB.</p>
        {err && <p className="text-xs text-red-600">{err}</p>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) void pick(f) }}
      />
    </div>
  )
}
