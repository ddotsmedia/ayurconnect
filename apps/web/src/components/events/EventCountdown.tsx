'use client'

import { useEffect, useState } from 'react'

export function EventCountdown({ targetIso }: { targetIso: string }) {
  const [now, setNow] = useState<number>(() => Date.now())
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(t)
  }, [])
  const diff = Math.max(0, new Date(targetIso).getTime() - now)
  if (diff === 0) return null
  const days = Math.floor(diff / 86_400_000)
  const hrs  = Math.floor((diff % 86_400_000) / 3_600_000)
  const mins = Math.floor((diff % 3_600_000) / 60_000)
  const secs = Math.floor((diff % 60_000) / 1000)
  if (days > 30) return null
  return (
    <div className="inline-flex gap-2 mt-3" aria-label="Countdown to event">
      {[{ l: 'Days', v: days }, { l: 'Hours', v: hrs }, { l: 'Min', v: mins }, { l: 'Sec', v: secs }].map((b) => (
        <div key={b.l} className="bg-white/95 backdrop-blur rounded-card px-3 py-2 text-center min-w-[60px]">
          <p className="text-2xl font-bold text-kerala-800">{String(b.v).padStart(2, '0')}</p>
          <p className="text-[9px] uppercase tracking-wider text-gray-600">{b.l}</p>
        </div>
      ))}
    </div>
  )
}
