// AyurConnect service worker — basic offline shell.
//
// Strategy:
//   - precache: a tiny shell of static assets the moment the worker installs
//   - GET /api/* requests: network-first, no cache (always fresh data)
//   - GET HTML pages:      network-first with cache fallback (offline page works)
//   - GET static assets:   cache-first (icons, fonts, images), 7-day TTL
//
// Bumping CACHE_VERSION evicts old caches on next activation.

const CACHE_VERSION = 'ayurconnect-v3'
const PRECACHE = [
  '/',
  '/herbs',
  '/icon.svg',
  '/manifest.webmanifest',
  '/offline',
]

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_VERSION)
    // Best-effort precache; ignore individual failures.
    await Promise.all(PRECACHE.map((url) => cache.add(url).catch(() => null)))
    self.skipWaiting()
  })())
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return

  const url = new URL(req.url)
  // Don't intercept cross-origin (Cloudflare assets, Gemini, etc.)
  if (url.origin !== self.location.origin) return

  // API requests: network only, never cache
  if (url.pathname.startsWith('/api/')) return

  // SSE streams (notifications, AyurBot streaming): never cache, never intercept.
  if (req.headers.get('accept') === 'text/event-stream') return

  // HTML / pages: network-first, fallback to cache, fallback to offline page
  if (req.headers.get('accept')?.includes('text/html')) {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req)
        const cache = await caches.open(CACHE_VERSION)
        cache.put(req, fresh.clone()).catch(() => null)
        return fresh
      } catch {
        const cached = await caches.match(req)
        if (cached) return cached
        const offline = await caches.match('/offline')
        if (offline) return offline
        return new Response('Offline', { status: 503, headers: { 'content-type': 'text/plain' } })
      }
    })())
    return
  }

  // Static assets (images, fonts, JS/CSS chunks): cache-first
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_VERSION)
    const cached = await cache.match(req)
    if (cached) {
      // Refresh in the background
      fetch(req).then((r) => cache.put(req, r.clone())).catch(() => null)
      return cached
    }
    try {
      const fresh = await fetch(req)
      cache.put(req, fresh.clone()).catch(() => null)
      return fresh
    } catch {
      return new Response('Offline', { status: 503 })
    }
  })())
})
