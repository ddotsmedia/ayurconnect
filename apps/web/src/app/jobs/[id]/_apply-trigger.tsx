'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import { ApplyModal } from '../../../components/jobs/ApplyModal'

export function ApplyTrigger({ jobId, jobTitle, clinic }: { jobId: string; jobTitle: string; clinic: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-kerala-700 hover:bg-kerala-800 text-white rounded-md text-sm font-semibold">
        <Send className="w-4 h-4" /> Apply for this job
      </button>
      {open && <ApplyModal jobId={jobId} jobTitle={jobTitle} clinic={clinic} onClose={() => setOpen(false)} />}
    </>
  )
}
