import { portalFetch } from '../_fetch'
import { DoctorsClient, type Link } from './_client'

export default async function HospitalDoctorsPage() {
  const items = await portalFetch<Link[]>('/api/hospital/doctors')
  return <DoctorsClient initial={items ?? []} />
}
