'use client'

import { useEffect, useState } from 'react'
import { Users, ShieldCheck, MessageCircle } from 'lucide-react'

type Batchmate = { id: string; name: string; specialization: string; district: string; batchYear: number | null; ccimVerified: boolean; photoUrl: string | null }

export function BatchmatesFinder({ collegeSlug, batchYear }: { collegeSlug: string | null; batchYear: number | null }) {
  const [items, setItems] = useState<Batchmate[] | null>(null)

  useEffect(() => {
    if (!collegeSlug) { setItems(null); return }
    const url = `/api/doctor-viral/batchmates?collegeSlug=${encodeURIComponent(collegeSlug)}${batchYear ? `&batchYear=${batchYear}` : ''}`
    fetch(url).then((r) => r.ok ? r.json() : []).then(setItems).catch(() => setItems([]))
  }, [collegeSlug, batchYear])

  if (!collegeSlug || items === null) return null
  if (items.length === 0) return (
    <div className="bg-amber-50 border border-amber-200 rounded p-3 text-sm text-amber-900">
      <Users className="w-4 h-4 inline mr-1" />
      <strong>Be the first from your batch on AyurConnect!</strong> Invite your classmates after you register.
    </div>
  )

  return (
    <div className="bg-kerala-50 border border-kerala-200 rounded p-3">
      <p className="text-sm text-kerala-900 mb-2 inline-flex items-center gap-1.5"><Users className="w-4 h-4" /> <strong>{items.length}</strong> of your batchmates are already on AyurConnect</p>
      <ul className="flex flex-wrap gap-2 mt-2">
        {items.slice(0, 8).map((d) => (
          <li key={d.id} className="inline-flex items-center gap-1.5 bg-white border border-kerala-100 rounded-full pl-1 pr-2.5 py-0.5 text-xs">
            <span className="w-5 h-5 rounded-full bg-kerala-100 text-kerala-700 flex items-center justify-center font-bold text-[10px] overflow-hidden">
              {d.photoUrl ? /* eslint-disable-next-line @next/next/no-img-element */
                <img src={d.photoUrl} alt="" className="w-full h-full object-cover" />
                : d.name.split(' ').map((s) => s[0]).slice(0, 2).join('')}
            </span>
            <span className="font-semibold text-gray-800">{d.name}</span>
            {d.batchYear && <span className="text-gray-500">·{d.batchYear}</span>}
            {d.ccimVerified && <ShieldCheck className="w-3 h-3 text-emerald-600" />}
          </li>
        ))}
      </ul>
      <p className="text-[11px] text-kerala-800 mt-2 inline-flex items-center gap-1">
        <MessageCircle className="w-3 h-3" /> After you register, share the alumni page with your batch group.
      </p>
    </div>
  )
}
