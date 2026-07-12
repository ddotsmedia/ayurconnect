'use client'

import { useMemo, useState } from 'react'
import { Search, ExternalLink, BookOpen } from 'lucide-react'
import { EXTERNAL_CATEGORIES, EXTERNAL_LANGUAGES, type ExternalBook } from './_external'

const CAT_TONE: Record<string, string> = {
  'Samhitas':         'bg-kerala-50 text-kerala-800 border-kerala-200',
  'Bhavaprakash':     'bg-amber-50 text-amber-800 border-amber-200',
  'Nighantus':        'bg-emerald-50 text-emerald-800 border-emerald-200',
  'Rasashastra':      'bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200',
  'Surgery':          'bg-rose-50 text-rose-800 border-rose-200',
  'Modern Ayurveda':  'bg-blue-50 text-blue-800 border-blue-200',
  'Other Languages':  'bg-purple-50 text-purple-800 border-purple-200',
  'Other':            'bg-gray-100 text-gray-700 border-gray-200',
}

export function EbooksLibraryClient({ books }: { books: ExternalBook[] }) {
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<string>('All')
  const [lang, setLang] = useState<string>('All')

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return books.filter((b) => {
      if (cat  !== 'All' && b.category !== cat)  return false
      if (lang !== 'All' && b.language !== lang) return false
      if (needle && !b.title.toLowerCase().includes(needle)) return false
      return true
    })
  }, [books, q, cat, lang])

  return (
    <div>
      {/* Search bar */}
      <div className="relative mb-3">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search books by title…"
          className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-kerala-300 bg-white"
        />
      </div>

      {/* Category chips + language dropdown */}
      <div className="flex flex-wrap items-center gap-1.5 mb-4">
        {EXTERNAL_CATEGORIES.map((c) => {
          const active = c === cat
          return (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`text-xs px-2.5 py-1 rounded-full border ${active ? 'bg-kerala-700 text-white border-kerala-700' : 'bg-white text-gray-700 border-gray-200 hover:border-kerala-300'}`}
            >
              {c}
            </button>
          )
        })}
        <div className="ml-auto">
          <select value={lang} onChange={(e) => setLang(e.target.value)} className="text-xs border border-gray-200 rounded-full px-3 py-1 bg-white">
            {EXTERNAL_LANGUAGES.map((l) => <option key={l} value={l}>{l === 'All' ? 'All languages' : l}</option>)}
          </select>
        </div>
      </div>

      <p className="text-xs text-gray-600 mb-3">
        Showing <strong className="text-ink">{filtered.length}</strong> of <strong className="text-ink">{books.length}</strong> books
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-card p-6 text-center text-sm text-amber-900">No books match your search.</div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((b) => (
            <li key={b.url}>
              <article className="bg-white border border-gray-100 rounded-card p-4 h-full flex flex-col hover:border-kerala-300 transition-colors">
                <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                  <span className={`text-[10px] px-1.5 py-0.5 border rounded ${CAT_TONE[b.category] ?? CAT_TONE.Other}`}>{b.category}</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded">{b.language}</span>
                </div>
                <p className="font-serif text-base text-ink leading-snug inline-flex items-start gap-2 flex-1">
                  <BookOpen className="w-4 h-4 text-kerala-700 mt-1 flex-shrink-0" /> {b.title}
                </p>
                <a
                  href={b.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#25a75a] hover:bg-[#1f8f4a] text-white text-xs font-semibold rounded"
                >
                  Download PDF <ExternalLink className="w-3 h-3" />
                </a>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
