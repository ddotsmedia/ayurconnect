import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AyurConnect — Kerala's #1 Ayurveda Platform",
    short_name: 'AyurConnect',
    description: 'verified Ayurveda doctors, classical Panchakarma centres, 150+ herbs, AyurBot AI.',
    start_url: '/?utm_source=pwa&utm_medium=manifest',
    id: '/',
    scope: '/',
    display: 'standalone',
    display_override: ['window-controls-overlay', 'standalone', 'minimal-ui', 'browser'],
    background_color: '#ffffff',
    theme_color: '#155228',
    orientation: 'portrait',
    categories: ['health', 'medical', 'lifestyle', 'wellness', 'education'],
    lang: 'en-IN',
    dir: 'ltr',
    prefer_related_applications: false,
    icons: [
      { src: '/icon.svg',                            sizes: 'any',      type: 'image/svg+xml', purpose: 'any' },
      { src: '/icon.svg',                            sizes: '192x192',  type: 'image/svg+xml' },
      { src: '/icon.svg',                            sizes: '512x512',  type: 'image/svg+xml', purpose: 'maskable' },
    ],
    screenshots: [
      { src: '/opengraph-image', sizes: '1200x630', type: 'image/png', form_factor: 'wide',   label: 'AyurConnect home' },
      { src: '/opengraph-image', sizes: '750x1334', type: 'image/png', form_factor: 'narrow', label: 'AyurConnect mobile' },
    ],
    // Native-feeling shortcuts shown when long-pressing the installed-PWA
    // icon on Android / right-clicking on Windows. Drives quick re-engagement.
    shortcuts: [
      { name: 'Find a Doctor',        short_name: 'Doctors',   description: 'Browse verified Ayurveda doctors', url: '/doctors?utm_source=pwa_shortcut', icons: [{ src: '/icon.svg', sizes: '192x192' }] },
      { name: 'Ask AyurBot',          short_name: 'AyurBot',   description: 'Personalised Ayurveda AI assistant', url: '/ayurbot?utm_source=pwa_shortcut', icons: [{ src: '/icon.svg', sizes: '192x192' }] },
      { name: 'Prakriti Quiz',        short_name: 'Quiz',      description: 'Discover your dosha in 30 seconds',  url: '/prakriti-quiz?utm_source=pwa_shortcut', icons: [{ src: '/icon.svg', sizes: '192x192' }] },
      { name: 'Online Consultation',  short_name: 'Consult',   description: 'Book a video consult with a doctor', url: '/online-consultation?utm_source=pwa_shortcut', icons: [{ src: '/icon.svg', sizes: '192x192' }] },
    ],
    // share_target — when users invoke Android's native share-sheet from any
    // other app, AyurConnect can receive shared text/URLs (search them).
    share_target: {
      action: '/search',
      method: 'GET',
      enctype: 'application/x-www-form-urlencoded',
      params: {
        title: 'q',
        text:  'q',
        url:   'url',
      },
    },
    // Protocol handler — register ourselves for ayurconnect:// links so QR
    // codes and emails can open the app directly.
    protocol_handlers: [
      { protocol: 'web+ayurconnect', url: '/?path=%s' },
    ],
    related_applications: [],
    edge_side_panel: { preferred_width: 480 },
    launch_handler: { client_mode: ['focus-existing', 'auto'] },
  } as MetadataRoute.Manifest
}
