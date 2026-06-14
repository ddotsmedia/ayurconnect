import { portalFetch } from '../_fetch'
import { InquiriesClient, type Inquiry } from './_client'

export default async function InquiriesPage() {
  const items = await portalFetch<Inquiry[]>('/api/hospital/inquiries')
  return <InquiriesClient initial={items ?? []} />
}
