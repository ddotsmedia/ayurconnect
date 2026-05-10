// Client-side analytics: posts to /api/events (in-DB) AND optionally to PostHog
// (when NEXT_PUBLIC_POSTHOG_KEY is set). Fire-and-forget, never throws, never
// blocks UI. Anonymous users get a stable random sessionId stored in localStorage.

import { capture } from './analytics'

const SESSION_KEY = 'ayur_session_id'

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
  const path = window.location.pathname + window.location.search
  // 1. Fire-and-forget POST to our own /api/events
  void fetch('/api/events', {
    method: 'POST',
    keepalive: true,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name, props, path, sessionId: getSessionId() }),
    credentials: 'include',
  }).catch(() => null)
  // 2. Mirror to PostHog if configured (no-op when key absent)
  void capture(name, { ...props, path }).catch(() => null)
}

// Auto page-view tracker — call once on app mount + on every route change.
export function trackPageView(): void {
  track('page_view')
}
