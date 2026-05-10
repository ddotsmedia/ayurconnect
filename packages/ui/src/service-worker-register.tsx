'use client'

import { useEffect } from 'react'

// Registers /sw.js exactly once after the page is interactive.
// Renders nothing.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return
    if (process.env.NODE_ENV !== 'production') return // skip in dev to avoid stale chunks

    const reg = async () => {
      try {
        await navigator.serviceWorker.register('/sw.js', { scope: '/' })
      } catch { /* ignore */ }
    }
    if (document.readyState === 'complete') reg()
    else window.addEventListener('load', reg, { once: true })
  }, [])
  return null
}
