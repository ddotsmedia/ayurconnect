'use client'

import { useEffect } from 'react'

// Fires once per video per browser session. We dedupe via sessionStorage so a
// refresh doesn't double-count. The endpoint itself is rate-limited at the
// gateway; this is just a UX-level dedupe.
export function VideoViewBeacon({ id }: { id: string }) {
  useEffect(() => {
    if (typeof window === 'undefined') return
    const key = `vid:view:${id}`
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')
    fetch(`/api/videos/${id}/view`, { method: 'POST', credentials: 'include' }).catch(() => { /* non-fatal */ })
  }, [id])
  return null
}
