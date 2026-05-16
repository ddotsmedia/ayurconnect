'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MessageCircleQuestion, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react'

const CATEGORIES = [
  { id: 'general',        label: 'General' },
  { id: 'panchakarma',    label: 'Panchakarma' },
  { id: 'womens-health',  label: "Women's health (PCOS, fertility, menopause)" },
  { id: 'stress',         label: 'Stress, anxiety, depression' },
  { id: 'sleep',          label: 'Sleep disorders' },
  { id: 'diabetes',       label: 'Diabetes, thyroid, metabolic' },
  { id: 'skin',           label: 'Skin & hair' },
  { id: 'pediatric',      label: 'Child health' },
  { id: 'joint',          label: 'Joint pain, arthritis, back' },
  { id: 'digestion',      label: 'Digestion, gut, acidity' },
]

export default function AskQuestionPage() {
  const [form, setForm] = useState({
    title: '', body: '', category: 'general',
    authorName: '', age: '', gender: '', country: 'IN',
  })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/qa', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          body:  form.body,
          category: form.category,
          authorName: form.authorName || 'Anonymous',
          age:    form.age ? Number(form.age) : undefined,
          gender: form.gender || undefined,
          country: form.country || undefined,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(data.error ?? `HTTP ${res.status}`)
      }
      setDone(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally { setLoading(false) }
  }

  if (done) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
        <CheckCircle2 className="w-16 h-16 text-kerala-600 mx-auto mb-4" />
        <h1 className="font-serif text-3xl text-kerala-800">Question submitted</h1>
        <p className="text-muted mt-3 leading-relaxed">
          A verified doctor will review and answer within 48 hours.
          Approved questions are published anonymously to help other patients searching for the same thing.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/qa" className="inline-flex items-center gap-2 px-5 py-2.5 bg-kerala-700 hover:bg-kerala-800 text-white rounded-md text-sm font-semibold">
            Browse other questions
          </Link>
          <Link href="/online-consultation" className="inline-flex items-center gap-2 px-5 py-2.5 border border-kerala-600 text-kerala-700 hover:bg-kerala-50 rounded-md text-sm font-semibold">
            Book a private consult
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-kerala-50 border-b border-kerala-100">
        <div className="container mx-auto px-4 py-3 text-sm">
          <Link href="/qa" className="inline-flex items-center gap-1.5 text-kerala-700 hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Q&A
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <header className="text-center mb-8">
          <MessageCircleQuestion className="w-10 h-10 text-kerala-700 mx-auto mb-3" />
          <h1 className="font-serif text-3xl text-ink">Ask an Ayurveda question</h1>
          <p className="text-sm text-muted mt-2 max-w-lg mx-auto">
            Free. Anonymous publishing. verified doctors answer within 48 hours.
            For private detailed guidance, <Link href="/online-consultation" className="text-kerala-700 hover:underline">book a video consultation</Link>.
          </p>
        </header>

        <form onSubmit={submit} className="bg-white border border-gray-100 rounded-card p-6 shadow-card space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700 mb-1 block">Your question *</span>
            <input
              required minLength={10} maxLength={200}
              value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. What is the best Ayurvedic medicine for chronic knee pain?"
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-base focus:outline-none focus:ring-1 focus:ring-kerala-700"
            />
            <p className="text-[10px] text-gray-400 mt-1">10–200 characters. Be specific.</p>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700 mb-1 block">Details *</span>
            <textarea
              required minLength={20} maxLength={4000} rows={6}
              value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="Describe your situation: how long you've had the issue, what you've tried, any relevant medical history, current medications, age + lifestyle if relevant."
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-kerala-700"
            />
            <p className="text-[10px] text-gray-400 mt-1">20–4,000 characters. The more context, the more useful the answer.</p>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700 mb-1 block">Category</span>
            <select
              value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-kerala-700"
            >
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </label>

          <fieldset className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-gray-100">
            <legend className="text-xs text-gray-500 px-2">Optional — helps the doctor answer better</legend>
            <label className="block">
              <span className="text-xs font-medium text-gray-700 mb-1 block">Display name</span>
              <input
                value={form.authorName} onChange={(e) => setForm({ ...form, authorName: e.target.value })}
                placeholder="e.g. R.M. (or leave blank for Anonymous)"
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-gray-700 mb-1 block">Age</span>
              <input
                type="number" min="1" max="120"
                value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-gray-700 mb-1 block">Gender</span>
              <select
                value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white"
              >
                <option value="">—</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </label>
          </fieldset>

          {error && (
            <div className="p-3 rounded bg-red-50 border border-red-100 text-red-800 text-sm" role="alert">
              {error}
            </div>
          )}

          <div className="pt-3 border-t border-gray-100 flex flex-col gap-3">
            <button
              type="submit"
              disabled={loading || form.title.length < 10 || form.body.length < 20}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-kerala-700 hover:bg-kerala-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-md"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Submit question
            </button>
            <p className="text-[10px] text-gray-400 text-center">
              By submitting you agree the question may be published anonymously to help other patients searching for similar issues.
              For private medical advice, book a video consultation instead.
            </p>
          </div>
        </form>
      </div>
    </>
  )
}
