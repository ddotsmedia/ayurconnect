import Link from 'next/link'
import { WifiOff } from 'lucide-react'

export const metadata = {
  title: 'Offline',
  description: 'You are currently offline.',
  robots: { index: false, follow: false },
}

export default function OfflinePage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 text-amber-700 mb-4">
          <WifiOff className="w-8 h-8" />
        </span>
        <h1 className="font-serif text-3xl text-kerala-700">You&apos;re offline</h1>
        <p className="text-muted mt-2">
          AyurConnect needs an internet connection for live data. Cached pages you&apos;ve already visited
          (like the home page and herb encyclopedia) should still load.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/" className="px-5 py-2 bg-kerala-700 text-white rounded-md hover:bg-kerala-800 text-sm font-semibold">Try home</Link>
          <Link href="/herbs" className="px-5 py-2 border border-kerala-600 text-kerala-700 rounded-md hover:bg-kerala-50 text-sm font-semibold">Open herbs</Link>
        </div>
      </div>
    </div>
  )
}
