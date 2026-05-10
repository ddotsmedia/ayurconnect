'use client'

import { useEffect, useState } from 'react'
import type { Lang } from './i18n'

function readCookie(): Lang {
  if (typeof document === 'undefined') return 'en'
  const m = document.cookie.match(/(?:^|;\s*)lang=(en|ml)/)
  return (m?.[1] as Lang) ?? 'en'
}

export function LangToggle({ className = '' }: { className?: string }) {
  const [lang, setLang] = useState<Lang>('en')
  useEffect(() => { setLang(readCookie()) }, [])

  function set(next: Lang) {
    document.cookie = `lang=${next}; path=/; max-age=${60 * 60 * 24 * 365}`
    setLang(next)
    // Force a server re-render so server components pick up the new cookie.
    if (typeof window !== 'undefined') window.location.reload()
  }

  return (
    <div className={`inline-flex items-center text-xs font-medium border border-gray-200 rounded-full overflow-hidden ${className}`} role="group" aria-label="Language">
      <button
        type="button"
        onClick={() => set('en')}
        className={lang === 'en' ? 'px-2.5 py-1 bg-kerala-700 text-white' : 'px-2.5 py-1 text-gray-600 hover:bg-gray-50'}
        aria-pressed={lang === 'en'}
      >EN</button>
      <button
        type="button"
        onClick={() => set('ml')}
        className={lang === 'ml' ? 'px-2.5 py-1 bg-kerala-700 text-white' : 'px-2.5 py-1 text-gray-600 hover:bg-gray-50'}
        aria-pressed={lang === 'ml'}
      >ML</button>
    </div>
  )
}
