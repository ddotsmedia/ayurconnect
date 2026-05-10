import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AyurConnect — Kerala's #1 Ayurveda Platform",
    short_name: 'AyurConnect',
    description: 'CCIM-verified Ayurveda doctors, classical Panchakarma centres, 150+ herbs, AyurBot AI.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#155228',
    orientation: 'portrait',
    categories: ['health', 'medical', 'lifestyle'],
    lang: 'en-IN',
    icons: [
      { src: '/icon.svg',                            sizes: 'any',      type: 'image/svg+xml', purpose: 'any' },
      { src: '/icon.svg',                            sizes: '192x192',  type: 'image/svg+xml' },
      { src: '/icon.svg',                            sizes: '512x512',  type: 'image/svg+xml', purpose: 'maskable' },
    ],
    screenshots: [
      { src: '/opengraph-image', sizes: '1200x630', type: 'image/png', form_factor: 'wide', label: 'AyurConnect home' },
    ],
  }
}
