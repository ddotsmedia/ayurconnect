'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'

const KEY = 'hideEarlyBanner'

export function EarlyAccessBanner() {
  const [show, setShow] = useState(false)
  useEffect(() => { try { if (window.localStorage.getItem(KEY) !== 'true') setShow(true) } catch {} }, [])
  if (!show) return null
  return (
    <div className="bg-amber-50 border-b border-amber-200 text-xs text-amber-800 py-2">
      <div className="container mx-auto px-4 flex items-center justify-center gap-3 relative">
        <span className="text-center">
          AyurConnect is in early access — we&rsquo;re adding verified doctors every week.{' '}
          <Link href="/feedback" className="underline font-medium hover:text-amber-900">Share feedback &rarr;</Link>
        </span>
        <button
          aria-label="Dismiss"
          onClick={() => { try { window.localStorage.setItem(KEY, 'true') } catch {}; setShow(false) }}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-amber-100 rounded"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
