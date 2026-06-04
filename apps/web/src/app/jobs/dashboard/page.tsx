import { redirect } from 'next/navigation'
import { getServerSession } from '../../../lib/auth'

export const metadata = { robots: { index: false, follow: false } }

export default async function JobsDashboardRedirect() {
  const sess = await getServerSession()
  if (sess?.user?.role === 'ADMIN') redirect('/admin/jobs')
  redirect('/jobs')
}
