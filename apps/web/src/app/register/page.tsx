import Link from 'next/link'
import type { Metadata } from 'next'
import { User, Stethoscope, Building2, ShieldCheck, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Join AyurConnect',
  description: 'Register as a patient, doctor, or hospital — get the right tools for your role.',
}

const ROLES = [
  {
    href: '/register/patient',
    icon: User,
    title: 'I am a Patient',
    color: 'bg-kerala-50 text-kerala-700 ring-kerala-200',
    perks: [
      'Book consultations with CCIM-verified doctors',
      'Save favourite doctors, track appointments',
      'Free AyurBot AI for daily health questions',
      'Patient forum + Health Tips',
    ],
    cta: 'Sign up as a patient',
  },
  {
    href: '/register/doctor',
    icon: Stethoscope,
    title: 'I am a Doctor',
    color: 'bg-amber-50 text-amber-700 ring-amber-200',
    perks: [
      'Get a public doctor profile (post CCIM verification)',
      'Manage availability, fees, languages, photo',
      'Receive online + in-person bookings',
      'Doctor-only forum, case discussions',
    ],
    cta: 'Sign up as a doctor',
    badge: 'CCIM verification required',
  },
  {
    href: '/register/hospital',
    icon: Building2,
    title: 'I represent a Hospital / Centre',
    color: 'bg-blue-50 text-blue-700 ring-blue-200',
    perks: [
      'List your hospital, Panchakarma resort, or clinic',
      'Showcase services, certifications, location',
      'Manage profile (post AYUSH verification)',
      'Appear in public hospital directory',
    ],
    cta: 'Register a hospital',
    badge: 'AYUSH/CCIM verification required',
  },
] as const

export default function RegisterLandingPage() {
  return (
    <div className="min-h-screen bg-cream py-16">
      <div className="container mx-auto px-4 max-w-5xl">
        <header className="text-center mb-10">
          <h1 className="font-serif text-4xl md:text-5xl text-kerala-700">Join AyurConnect</h1>
          <p className="mt-3 text-muted max-w-xl mx-auto">
            Choose how you&apos;d like to use AyurConnect. You can always change later — but each role gets the right tools from day one.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Already have an account? <Link href="/sign-in" className="text-kerala-700 font-medium hover:underline">Sign in</Link>.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {ROLES.map((r) => {
            const Icon = r.icon
            return (
              <Link
                key={r.href}
                href={r.href}
                className="group bg-white rounded-card border border-gray-100 shadow-card hover:shadow-cardLg p-6 flex flex-col transition-shadow"
              >
                <span className={`w-12 h-12 rounded-full ring-4 inline-flex items-center justify-center mb-4 ${r.color}`}>
                  <Icon className="w-6 h-6" />
                </span>
                <h2 className="font-serif text-xl text-kerala-700">{r.title}</h2>
                {'badge' in r && r.badge && (
                  <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 bg-amber-50 text-amber-800 rounded-full self-start">
                    <ShieldCheck className="w-3 h-3" /> {r.badge}
                  </span>
                )}
                <ul className="mt-4 space-y-1.5 text-sm text-gray-700 flex-1">
                  {r.perks.map((p) => <li key={p} className="flex gap-2"><span className="text-kerala-700">✓</span><span>{p}</span></li>)}
                </ul>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-kerala-700 group-hover:gap-2 transition-all">
                  {r.cta} <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            )
          })}
        </div>

        <div className="text-center mt-10">
          <Link href="/" className="text-sm text-gray-500 hover:underline">← back to home</Link>
        </div>
      </div>
    </div>
  )
}
