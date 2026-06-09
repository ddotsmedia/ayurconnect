'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

export function VerifyForm() {
  const router = useRouter()
  const [code, setCode] = useState('')

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const c = code.trim()
        if (c) router.push(`/verify/${encodeURIComponent(c)}`)
      }}
      className="rounded-2xl border border-kerala-100 bg-white p-5 shadow-card flex flex-col sm:flex-row gap-3"
    >
      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Batch code, e.g. KTL-MNT-2406"
        className="flex-1 rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-kerala-300 uppercase"
        autoCapitalize="characters"
      />
      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 bg-kerala-700 text-white font-semibold px-5 py-3 rounded-xl hover:bg-kerala-800"
      >
        <Search className="w-4 h-4" /> Verify
      </button>
    </form>
  )
}
