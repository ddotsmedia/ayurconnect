// Client-side analytics: posts to /api/events (in-DB) AND optionally to PostHog
// (when NEXT_PUBLIC_POSTHOG_KEY is set). Fire-and-forget, never throws, never
// blocks UI. Anonymous users get a stable random sessionId stored in localStorage.
//
// Respects the cookie-consent banner. If the user hasn't accepted non-essential
// cookies, only "essential" events fire (auth, billing); analytics events skip.

import { capture } from './analytics'
import { hasCookieConsent } from '@ayurconnect/ui'

const SESSION_KEY = 'ayur_session_id'

// Events we'll track even without consent — purely operational, no user
// behavior profile is built from these.
const ESSENTIAL_EVENTS = new Set(['signup_completed', 'booking_completed'])

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let id = window.localStorage.getItem(SESSION_KEY)
  if (!id) {
    id = (window.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)) + '.' + Date.now().toString(36)
    try { window.localStorage.setItem(SESSION_KEY, id) } catch { /* ignore */ }
  }
  return id
}

export function track(name: string, props?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return
  // Gate non-essential analytics on user consent
  if (!ESSENTIAL_EVENTS.has(name) && !hasCookieConsent()) return

  const path = window.location.pathname + window.location.search
  void fetch('/api/events', {
    method: 'POST',
    keepalive: true,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name, props, path, sessionId: getSessionId() }),
    credentials: 'include',
  }).catch(() => null)
  void capture(name, { ...props, path }).catch(() => null)
}

// Auto page-view tracker — call once on app mount + on every route change.
export function trackPageView(): void {
  track('page_view')
}
