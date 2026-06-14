'use client'

import { useEffect } from 'react'

export function HospitalViewBeacon({ hospitalId }: { hospitalId: string }) {
  useEffect(() => {
    const sent = sessionStorage.getItem('hv_' + hospitalId)
    if (sent) return
    sessionStorage.setItem('hv_' + hospitalId, '1')
    void fetch(`/api/hospitals-public/${hospitalId}/view`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ path: typeof window !== 'undefined' ? window.location.pathname : null }),
    }).catch(() => {})
  }, [hospitalId])
  return null
}
