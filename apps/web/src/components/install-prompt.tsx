'use client'

import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }

const VISIT_KEY = 'install-visits'
const DISMISSED_KEY = 'install-dismissed'

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null)
  const [show, setShow] = useState(false)
  const [iosHint, setIosHint] = useState(false)

  useEffect(() => {
    try {
      if (window.localStorage.getItem(DISMISSED_KEY) === '1') return
      const n = parseInt(window.localStorage.getItem(VISIT_KEY) ?? '0', 10) + 1
      window.localStorage.setItem(VISIT_KEY, String(n))
      if (n < 2) return
      if (window.matchMedia('(display-mode: standalone)').matches) return
      if (window.innerWidth >= 768) return

      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)
      const isStandalone = (window.navigator as { standalone?: boolean }).standalone === true
      if (isIOS && !isStandalone) { setIosHint(true); setShow(true); return }

      const onBIP = (e: Event) => {
        e.preventDefault()
        setDeferred(e as BIPEvent)
        setShow(true)
      }
      window.addEventListener('beforeinstallprompt', onBIP)
      return () => window.removeEventListener('beforeinstallprompt', onBIP)
    } catch {}
  }, [])

  function dismiss() {
    try { window.localStorage.setItem(DISMISSED_KEY, '1') } catch {}
    setShow(false)
  }
  function install() {
    if (!deferred) return
    void deferred.prompt().then(() => deferred.userChoice).then(() => dismiss()).catch(() => {})
  }

  if (!show) return null

  return (
    <div className="fixed bottom-20 left-3 right-3 md:hidden z-40 bg-white border border-kerala-200 shadow-cardLg rounded-card p-3 flex items-center gap-3">
      <span className="w-10 h-10 rounded-lg bg-kerala-100 text-kerala-700 flex items-center justify-center flex-shrink-0"><Download className="w-5 h-5" /></span>
      <div className="flex-1 min-w-0 text-sm">
        <p className="font-semibold text-ink leading-tight">Add AyurConnect to Home Screen</p>
        {iosHint
          ? <p className="text-xs text-gray-600 mt-0.5">Tap <span className="font-mono">Share</span> → <span className="font-mono">Add to Home Screen</span></p>
          : <p className="text-xs text-gray-600 mt-0.5">Open like an app — no app store needed.</p>}
      </div>
      {!iosHint && <button onClick={install} className="px-3 py-1.5 bg-kerala-700 text-white text-xs font-semibold rounded">Install</button>}
      <button onClick={dismiss} aria-label="Dismiss" className="text-gray-400 hover:text-gray-700"><X className="w-4 h-4" /></button>
    </div>
  )
}
