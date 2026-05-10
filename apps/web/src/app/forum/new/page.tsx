'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { GradientHero } from '@ayurconnect/ui'

const CATEGORIES = [
  { id: 'patient-forum',     label: 'Patient question / discussion' },
  { id: 'doctor-discussion', label: 'Doctor case / professional discussion' },
  { id: 'research',          label: 'Research note / paper' },
  { id: 'webinar',           label: 'Webinar / event announcement' },
]

export default function NewPostPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('patient-forum')
  const [language, setLanguage] = useState('en')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [needSignIn, setNeedSignIn] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setError(null); setNeedSignIn(false)
    try {
      const res = await fetch('/api/forum/posts', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title, content, category, language }),
      })
      if (res.status === 401) { setNeedSignIn(true); return }
      if (!res.ok) { setError(`post failed (${res.status})`); return }
      const data = (await res.json()) as { id: string }
      router.push(`/forum/${data.id}`)
    } catch (e) { setError(String(e)) } finally { setBusy(false) }
  }

  return (
    <>
      <GradientHero variant="forum" size="md">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-4xl text-white">New post</h1>
          <p className="text-white/70 mt-2 text-sm">Be specific. Include your dosha, symptoms, treatments tried, classical references — whatever helps.</p>
        </div>
      </GradientHero>

      <div className="container mx-auto px-4 py-10 max-w-3xl">
        {needSignIn ? (
          <div className="p-8 bg-white rounded-card border border-gray-100 shadow-card text-center">
            <p className="text-lg font-semibold text-ink">Sign in to post</p>
            <p className="text-sm text-muted mt-2 mb-5">Posting requires an account.</p>
            <Link href="/sign-in?next=/forum/new" className="inline-block px-5 py-2 bg-kerala-600 text-white rounded-md font-semibold hover:bg-kerala-700">
              Sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="bg-white rounded-card border border-gray-100 shadow-card p-6 space-y-5">
            <label className="block">
              <span className="block text-xs font-medium text-gray-700 mb-1.5">Title *</span>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Chronic migraine — Karkidaka protocol questions"
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-kerala-600"
              />
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="block">
                <span className="block text-xs font-medium text-gray-700 mb-1.5">Category *</span>
                <select required value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm bg-white">
                  {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="block text-xs font-medium text-gray-700 mb-1.5">Language</span>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm bg-white">
                  <option value="en">English</option>
                  <option value="ml">Malayalam</option>
                </select>
              </label>
            </div>

            <label className="block">
              <span className="block text-xs font-medium text-gray-700 mb-1.5">Content (Markdown OK) *</span>
              <textarea
                required
                rows={10}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Be specific..."
                className="w-full border rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-kerala-600 resize-y"
              />
            </label>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex items-center justify-between pt-2">
              <Link href="/forum" className="text-sm text-muted hover:text-gray-800">← Cancel</Link>
              <button
                type="submit"
                disabled={busy || !title.trim() || !content.trim()}
                className="px-5 py-2 bg-kerala-600 text-white rounded-md font-semibold hover:bg-kerala-700 disabled:opacity-50"
              >
                {busy ? 'Posting…' : 'Post'}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  )
}
