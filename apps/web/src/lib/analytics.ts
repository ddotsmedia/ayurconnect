// PostHog analytics helper. No-op until NEXT_PUBLIC_POSTHOG_KEY is set.
//
// Usage:
//   import { capture } from '@/lib/analytics'
//   capture('doctor_search', { district: 'Ernakulam', specialization: 'Panchakarma' })
//
// Initialised lazily on first call so SSR isn't affected.

type PostHog = {
  init: (key: string, opts: { api_host: string; capture_pageview: boolean }) => void
  capture: (event: string, props?: Record<string, unknown>) => void
  identify: (id: string, props?: Record<string, unknown>) => void
}

let ph: PostHog | null = null
let initOnce = false

const KEY  = process.env.NEXT_PUBLIC_POSTHOG_KEY
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com'

async function ensure(): Promise<PostHog | null> {
  if (typeof window === 'undefined') return null
  if (!KEY) return null
  if (ph) return ph
  if (initOnce) return null
  initOnce = true
  try {
    // Indirect dynamic import so TypeScript doesn't try to resolve types for an
    // optional dependency that may not be installed.
    const dynImport = new Function('m', 'return import(m)') as (m: string) => Promise<{ default: PostHog }>
    const mod = await dynImport('posthog-js').catch(() => null)
    if (!mod) return null
    mod.default.init(KEY, { api_host: HOST, capture_pageview: false })
    ph = mod.default
    return ph
  } catch {
    return null
  }
}

export async function capture(event: string, props?: Record<string, unknown>): Promise<void> {
  const c = await ensure()
  if (!c) return
  c.capture(event, props)
}

export async function identify(id: string, props?: Record<string, unknown>): Promise<void> {
  const c = await ensure()
  if (!c) return
  c.identify(id, props)
}

export const analyticsEnabled = () => !!KEY
