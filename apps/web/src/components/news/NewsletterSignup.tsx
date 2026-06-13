'use client'

import { useState, useEffect } from 'react'
import { Mail, CheckCircle2 } from 'lucide-react'

export function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [freq, setFreq]   = useState<'Daily' | 'Weekly' | 'Monthly'>('Weekly')
  const [done, setDone]   = useState(false)

  useEffect(() => {
    try { if (localStorage.getItem('ayur_newsletter')) setDone(true) } catch { /* ignore */ }
  }, [])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.includes('@')) return
    try { localStorage.setItem('ayur_newsletter', JSON.stringify({ email, frequency: freq, savedAt: new Date().toISOString() })) } catch { /* ignore */ }
    setDone(true)
  }

  return (
    <section className="my-8 bg-gradient-to-br from-kerala-700 via-kerala-800 to-amber-700 rounded-card p-6 md:p-8 text-white shadow-cardLg">
      <div className="max-w-2xl mx-auto text-center">
        <Mail className="w-9 h-9 mx-auto mb-3" />
        {done ? (
          <>
            <CheckCircle2 className="w-8 h-8 text-amber-300 mx-auto mb-2" />
            <h3 className="font-serif text-xl md:text-2xl">You&apos;re subscribed</h3>
            <p className="text-sm text-white/80 mt-1">Get Ayurveda news in your inbox.</p>
          </>
        ) : (
          <>
            <h3 className="font-serif text-xl md:text-2xl">Get Ayurveda news in your inbox</h3>
            <p className="text-sm text-white/80 mt-1">Curated Kerala Ayurveda industry, research + community updates.</p>
            <form onSubmit={submit} className="mt-4 flex flex-col sm:flex-row gap-2 max-w-lg mx-auto">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="flex-1 px-3 py-2 rounded text-ink text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
              <select value={freq} onChange={(e) => setFreq(e.target.value as typeof freq)} className="px-3 py-2 rounded text-ink text-sm">
                <option>Daily</option><option>Weekly</option><option>Monthly</option>
              </select>
              <button type="submit" className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-kerala-900 rounded text-sm font-semibold">Subscribe</button>
            </form>
          </>
        )}
      </div>
    </section>
  )
}
