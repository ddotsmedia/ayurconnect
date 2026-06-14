import { portalFetch } from '../_fetch'
import { ReviewsClient, type ReviewRow } from './_client'

export default async function ReviewsPage() {
  const items = await portalFetch<ReviewRow[]>('/api/hospital/reviews')
  return <ReviewsClient initial={items ?? []} />
}
