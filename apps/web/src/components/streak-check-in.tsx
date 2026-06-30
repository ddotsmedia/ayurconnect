'use client'

import { useEffect } from 'react'

// Fire-and-forget daily check-in. Server figures out idempotency for the day;
// this only prevents repeat calls within the same browser session.
const KEY = 'streak-checkin-done'

export function StreakCheckIn({ enabled }: { enabled: boolean }) {
  useEffect(() => {
    if (!enabled) return
    try {
      if (window.sessionStorage.getItem(KEY) === '1') return
      void fetch('/api/streak/checkin', { method: 'POST', credentials: 'include' })
        .then(() => { try { window.sessionStorage.setItem(KEY, '1') } catch {} })
        .catch(() => {})
    } catch {}
  }, [enabled])
  return null
}
