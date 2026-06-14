import { portalFetch } from '../_fetch'
import { MarketingClient, type Promotion, type HospitalRef } from './_client'

export default async function MarketingPage() {
  const [me, promos] = await Promise.all([
    portalFetch<{ hospital: HospitalRef }>('/api/hospital/me'),
    portalFetch<Promotion[]>('/api/hospital/promotions'),
  ])
  if (!me?.hospital) return <p className="text-sm text-gray-600">No hospital linked.</p>
  return <MarketingClient hospital={me.hospital} initial={promos ?? []} />
}
