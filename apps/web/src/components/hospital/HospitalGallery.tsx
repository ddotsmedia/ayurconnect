'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

export function HospitalGallery({ photos, alt }: { photos: string[]; alt: string }) {
  const [i, setI] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  if (!photos.length) return null

  return (
    <>
      <div className="bg-white border border-gray-100 rounded-card overflow-hidden shadow-card">
        <button onClick={() => setLightbox(true)} className="relative block w-full aspect-video bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photos[i]} alt={`${alt} photo ${i + 1}`} className="w-full h-full object-cover" />
          {photos.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); setI((i - 1 + photos.length) % photos.length) }} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-1.5"><ChevronLeft className="w-5 h-5" /></button>
              <button onClick={(e) => { e.stopPropagation(); setI((i + 1) % photos.length) }} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-1.5"><ChevronRight className="w-5 h-5" /></button>
            </>
          )}
        </button>
        {photos.length > 1 && (
          <div className="flex gap-1 p-2 overflow-x-auto">
            {photos.map((p, k) => (
              <button key={k} onClick={() => setI(k)} className={'w-16 h-12 flex-shrink-0 rounded overflow-hidden border-2 ' + (k === i ? 'border-kerala-700' : 'border-transparent')}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(false)}>
          <button className="absolute top-4 right-4 text-white"><X className="w-6 h-6" /></button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photos[i]} alt={`${alt} large view`} className="max-w-full max-h-full object-contain" />
        </div>
      )}
    </>
  )
}
