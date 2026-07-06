'use client'

import { useEffect, useState } from 'react'
import { MessageCircle, X } from 'lucide-react'

// New key so returning visitors see the launch banner even if they'd
// previously dismissed the 'early access' variant.
const KEY = 'hideLaunchBanner-v2'

const SHARE_URL = 'https://wa.me/?text=' + encodeURIComponent(
  'Check out AyurConnect — free Ayurveda platform with study materials, job portal, and doctor directory: https://ayurconnect.com',
)

export function EarlyAccessBanner() {
  const [show, setShow] = useState(false)
  useEffect(() => { try { if (window.localStorage.getItem(KEY) !== 'true') setShow(true) } catch {} }, [])
  if (!show) return null
  return (
    <div className="bg-emerald-50 border-b border-emerald-200 text-xs text-emerald-900 py-2">
      <div className="container mx-auto px-4 flex items-center justify-center gap-3 relative">
        <span className="text-center">
          <strong>AyurConnect is live!</strong> 145+ herbs · 155 study resources · 10 licensing guides — all free.{' '}
          <a href={SHARE_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 underline font-semibold hover:text-emerald-950">
            <MessageCircle className="w-3 h-3" /> Share with a colleague &rarr;
          </a>
        </span>
        <button
          aria-label="Dismiss"
          onClick={() => { try { window.localStorage.setItem(KEY, 'true') } catch {}; setShow(false) }}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-emerald-100 rounded"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
