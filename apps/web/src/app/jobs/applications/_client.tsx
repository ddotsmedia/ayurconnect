'use client'

import { useRouter } from 'next/navigation'

export function WithdrawButton({ id }: { id: string }) {
  const router = useRouter()
  async function withdraw() {
    if (!confirm('Withdraw this application?')) return
    await fetch(`/api/jobs-portal/applications/${id}/withdraw`, { method: 'POST', credentials: 'include' })
    router.refresh()
  }
  return <button onClick={withdraw} className="text-[10px] text-red-600 hover:underline">Withdraw</button>
}
