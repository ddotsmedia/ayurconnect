import { redirect } from 'next/navigation'
import { headers as nextHeaders } from 'next/headers'
import { getServerSession } from '../../../../lib/auth'
import { API_INTERNAL } from '../../../../lib/server-fetch'
import { VerificationClient, type Employer } from './_client'

export const metadata = { title: 'Job Portal Verification | Admin', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

async function fetchEmployers(status: string): Promise<Employer[]> {
  const h = await nextHeaders(); const cookie = h.get('cookie') ?? ''
  try {
    const r = await fetch(`${API_INTERNAL}/jobs-portal/admin/employers?status=${status}`, { headers: { cookie }, cache: 'no-store' })
    if (!r.ok) return []
    return r.json() as Promise<Employer[]>
  } catch { return [] }
}

export default async function VerificationPage() {
  const sess = await getServerSession()
  if (!sess) redirect('/sign-in')
  if (sess.user.role !== 'ADMIN') redirect('/dashboard')
  const [pending, verified] = await Promise.all([fetchEmployers('pending'), fetchEmployers('verified')])
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="font-serif text-2xl text-ink">Verification queue</h1>
      <VerificationClient pending={pending} verified={verified} />
    </div>
  )
}
