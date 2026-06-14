import { portalFetch } from '../_fetch'
import { PackagesClient, type Package } from './_client'

export default async function PackagesPage() {
  const data = await portalFetch<Package[]>('/api/hospital/packages')
  return <PackagesClient initial={data ?? []} />
}
