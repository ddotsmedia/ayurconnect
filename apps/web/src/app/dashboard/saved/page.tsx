'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShieldCheck, MapPin, Star, Heart } from 'lucide-react'

type Saved = {
  id: string
  savedAt: string
  doctor: {
    id: string
    name: string
    specialization: string
    district: string
    ccimVerified: boolean
    qualification?: string | null
    averageRating?: number | null
    reviewsCount?: number | null
  }
}

export default function SavedDoctorsPage() {
  const [items, setItems] = useState<Saved[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/saved-doctors', { credentials: 'include' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setItems((await res.json()) as Saved[])
    } catch (e) { setError(String(e)) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  async function remove(doctorId: string) {
    if (!confirm('Remove this doctor from your saved list?')) return
    try {
      await fetch(`/api/saved-doctors/${doctorId}`, { method: 'DELETE', credentials: 'include' })
      setItems((x) => x.filter((s) => s.doctor.id !== doctorId))
    } catch (e) { alert(String(e)) }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl text-kerala-700">Saved doctors</h1>
        <p className="text-muted mt-1">Your bookmarked practitioners.</p>
      </header>

      {error && <div className="p-3 rounded bg-red-50 text-red-800 text-sm">{error}</div>}

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-100 rounded-card">
          <Heart className="mx-auto h-10 w-10 text-gray-300 mb-3" />
          <p className="text-muted">You haven&apos;t saved any doctors yet.</p>
          <Link href="/doctors" className="inline-block mt-3 px-4 py-2 bg-kerala-600 text-white rounded-md text-sm font-semibold hover:bg-kerala-700">
            Browse the directory →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((s) => (
            <article key={s.id} className="bg-white rounded-card border border-gray-100 shadow-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <Link href={`/doctors/${s.doctor.id}`} className="font-semibold text-ink hover:text-kerala-700 truncate block">
                    {s.doctor.name}
                  </Link>
                  <p className="text-xs text-muted truncate">{s.doctor.qualification ?? s.doctor.specialization}</p>
                </div>
                {s.doctor.ccimVerified && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-kerala-700 bg-kerala-50 px-2 py-1 rounded-full">
                    <ShieldCheck className="w-3 h-3" /> CCIM
                  </span>
                )}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-gray-400" /> {s.doctor.district}</span>
                {s.doctor.averageRating != null && (
                  <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 fill-gold-400 text-gold-400" /> {s.doctor.averageRating}</span>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-muted">Saved {new Date(s.savedAt).toLocaleDateString()}</span>
                <div className="flex gap-3">
                  <Link href={`/doctors/${s.doctor.id}`} className="text-kerala-700 hover:underline">View</Link>
                  <button onClick={() => remove(s.doctor.id)} className="text-red-600 hover:underline">Remove</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
