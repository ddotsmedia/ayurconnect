'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export function QuestionsClient({ questions, hasSolutions }: { questions: Array<{ q: string; marks: number; solution?: string }>; hasSolutions: boolean }) {
  const [showAll, setShowAll] = useState(false)
  const [open, setOpen] = useState<Set<number>>(new Set())
  function toggle(i: number) {
    setOpen((s) => {
      const ns = new Set(s)
      if (ns.has(i)) ns.delete(i); else ns.add(i)
      return ns
    })
  }
  return (
    <div className="space-y-4">
      {hasSolutions && (
        <button onClick={() => { setShowAll(!showAll); setOpen(showAll ? new Set() : new Set(questions.map((_, i) => i))) }} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold">
          {showAll ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />} {showAll ? 'Hide all solutions' : 'Show all solutions'}
        </button>
      )}
      <ol className="space-y-4 list-decimal list-outside ml-5">
        {questions.map((qq, i) => (
          <li key={i} className="bg-white border border-gray-100 rounded-card p-4 shadow-card">
            <p className="text-sm text-ink whitespace-pre-line"><strong>Q{i + 1}.</strong> {qq.q} <span className="text-[10px] text-gray-500 ml-1">[{qq.marks} marks]</span></p>
            {hasSolutions && qq.solution && (
              <div className="mt-2">
                {!open.has(i) ? (
                  <button onClick={() => toggle(i)} className="text-xs text-kerala-700 hover:underline inline-flex items-center gap-1"><Eye className="w-3 h-3" /> Show solution</button>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-200 rounded p-3 text-sm text-gray-800 whitespace-pre-line">{qq.solution}<br /><button onClick={() => toggle(i)} className="text-xs text-emerald-700 hover:underline inline-flex items-center gap-1 mt-2"><EyeOff className="w-3 h-3" /> Hide</button></div>
                )}
              </div>
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}
