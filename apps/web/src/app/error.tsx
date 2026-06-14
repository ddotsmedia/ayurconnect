'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { LogoMark } from '@ayurconnect/ui'
import { Home, MessageCircle, RefreshCw } from 'lucide-react'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    if (typeof window !== 'undefined' && error?.digest) {
      // eslint-disable-next-line no-console
      console.warn('[error-boundary]', error.digest, error.message)
    }
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex w-16 h-16 rounded-full bg-kerala-50 text-kerala-700 ring-4 ring-kerala-100 items-center justify-center mb-4">
          <LogoMark className="w-10 h-10" />
        </div>
        <h1 className="font-serif text-3xl text-kerala-800">Something went wrong</h1>
        <p className="text-gray-700 mt-2 text-sm">Please refresh the page or try again in a moment.</p>
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          <button onClick={reset} className="inline-flex items-center gap-1.5 px-4 py-2 bg-kerala-700 hover:bg-kerala-800 text-white rounded text-sm font-semibold"><RefreshCw className="w-4 h-4" /> Try again</button>
          <Link href="/" className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded text-sm"><Home className="w-4 h-4" /> Go home</Link>
          <a href="https://wa.me/971509379212?text=Hi%20AyurConnect%2C%20the%20site%20showed%20an%20error" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#25d366] text-white rounded text-sm font-semibold"><MessageCircle className="w-4 h-4" /> WhatsApp us</a>
        </div>
      </div>
    </div>
  )
}
