'use client'

import { useEffect, useState } from 'react'
import { Cookie, X } from 'lucide-react'

const STORAGE_KEY = 'ayur_cookie_consent_v1'
type Choice = 'accepted' | 'declined'

// Renders a small, dismissible banner the first time a visitor lands on the site.
// Stores their choice in localStorage so it never reappears for that browser.
// Other parts of the app can call `hasCookieConsent()` to gate analytics tracking.
export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (!saved) setVisible(true)
    } catch { /* private mode etc. — show banner anyway */ setVisible(true) }
  }, [])

  function set(choice: Choice) {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ choice, at: new Date().toISOString() })) } catch { /* ignore */ }
    setVisible(false)
    // Notify any listeners (e.g. analytics) so they can flip on/off live
    window.dispatchEvent(new CustomEvent('ayur:consent', { detail: { choice } }))
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-[420px] z-50 bg-white border border-gray-200 rounded-card shadow-cardLg p-4 animate-slide-up"
    >
      <div className="flex items-start gap-3">
        <span className="w-9 h-9 rounded-full bg-kerala-50 text-kerala-700 flex items-center justify-center flex-shrink-0">
          <Cookie className="w-5 h-5" />
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm">We use cookies</h3>
          <p className="text-xs text-gray-600 mt-1 leading-relaxed">
            Essential cookies keep you logged in and the site working. With your permission, we also use
            non-essential cookies to understand how features are used (anonymous analytics). Read our{' '}
            <a href="/privacy" className="text-kerala-700 hover:underline">Privacy Policy</a>.
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <button
              type="button"
              onClick={() => set('accepted')}
              className="px-4 py-1.5 bg-kerala-700 text-white text-xs font-semibold rounded-md hover:bg-kerala-800"
            >Accept all</button>
            <button
              type="button"
              onClick={() => set('declined')}
              className="px-4 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-md hover:bg-gray-50"
            >Essential only</button>
          </div>
        </div>
        <button onClick={() => set('declined')} aria-label="Dismiss" className="text-gray-400 hover:text-gray-700 -mt-1 -mr-1 p-1">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// Public helper — read in client code to gate non-essential trackers.
export function hasCookieConsent(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (!saved) return false
    const parsed = JSON.parse(saved) as { choice?: Choice }
    return parsed.choice === 'accepted'
  } catch { return false }
}
