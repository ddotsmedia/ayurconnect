'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { trackPageView } from '../lib/track'

// Renders nothing. Fires a `page_view` event on every route change so we can
// see traffic patterns in the admin analytics dashboard.
export function PageViewTracker() {
  const pathname = usePathname()
  const search = useSearchParams()

  useEffect(() => {
    if (!pathname) return
    // Skip admin/dashboard pages from public analytics — they're internal
    if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard')) return
    trackPageView()
  }, [pathname, search])

  return null
}
