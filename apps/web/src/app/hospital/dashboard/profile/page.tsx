import { portalFetch } from '../_fetch'
import { ProfileEditor } from './_editor'

type Hospital = {
  id: string; name: string; nameMl: string | null; type: string; district: string; state: string | null; country: string; pincode: string | null
  profile: string | null; profileMl: string | null; establishedYear: number | null
  contact: string | null; whatsapp: string | null; email: string | null; address: string | null
  latitude: number | null; longitude: number | null
  services: string[]; treatments: string[]; facilities: string[]; photos: string[]; languages: string[]; paymentMethods: string[]
  ayushCertified: boolean; nabh: boolean; panchakarma: boolean; tourismClass: string | null; iso: string | null
  operatingHours: Record<string, { open: string; close: string; closed: boolean }> | null
}

export default async function HospitalProfileEdit() {
  const data = await portalFetch<{ hospital: Hospital; completeness: number }>('/api/hospital/me')
  if (!data?.hospital) return <p className="text-sm text-gray-600">No hospital linked.</p>
  return <ProfileEditor initial={data.hospital} completeness={data.completeness} />
}
