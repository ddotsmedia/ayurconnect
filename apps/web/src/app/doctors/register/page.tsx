import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Register as Ayurveda Doctor — Kerala’s Comprehensive Directory',
  description: 'Join Kerala’s most comprehensive Ayurveda doctor directory. Free, verified. For Kerala-trained doctors practicing anywhere in the world — Kerala, Gulf, UK, US, Europe, APAC.',
  openGraph: {
    title:       'Register as an Ayurveda Doctor — Join Kerala’s Comprehensive Directory',
    description: 'Free profile. Verified credentials. Kerala-trained doctors in 15+ countries.',
    type:        'website',
  },
  alternates: { canonical: '/doctors/register' },
}

export default async function DoctorsRegisterAlias({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams
  const qs = new URLSearchParams()
  if (sp.country)  qs.set('country',  sp.country)
  if (sp.ref)      qs.set('ref',      sp.ref)
  const tail = qs.toString()
  redirect(`/register/doctor${tail ? `?${tail}` : ''}`)
}
