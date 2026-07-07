import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Building2, LayoutDashboard, Stethoscope, MessageSquare, Star, BarChart3, Megaphone, Package, ListChecks } from 'lucide-react'
import { getServerSession } from '../../../lib/auth'

export const dynamic = 'force-dynamic'

// Whole /hospital/dashboard/* subtree — auth-gated, never index.
export const metadata = { robots: { index: false, follow: false } }

const NAV = [
  { href: '/hospital/dashboard',           label: 'Overview',      icon: LayoutDashboard },
  { href: '/hospital/dashboard/profile',   label: 'Profile',       icon: Building2 },
  { href: '/hospital/dashboard/packages',  label: 'Packages',      icon: Package },
  { href: '/hospital/dashboard/doctors',   label: 'Doctor team',   icon: Stethoscope },
  { href: '/hospital/dashboard/inquiries', label: 'Inquiries',     icon: MessageSquare },
  { href: '/hospital/dashboard/reviews',   label: 'Reviews',       icon: Star },
  { href: '/hospital/dashboard/analytics', label: 'Analytics',     icon: BarChart3 },
  { href: '/hospital/dashboard/marketing', label: 'Marketing',     icon: Megaphone },
]

export default async function HospitalDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession()
  if (!session) redirect('/sign-in?next=/hospital/dashboard')
  if (!['HOSPITAL', 'HOSPITAL_PENDING', 'ADMIN'].includes(session.user.role)) {
    redirect('/hospitals/register')
  }
  return (
    <div className="min-h-screen bg-cream">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
          <aside className="lg:sticky lg:top-20 self-start">
            <div className="bg-white border border-gray-100 rounded-card shadow-card p-3">
              <div className="px-2 py-1.5 mb-2 flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-kerala-700" />
                <span className="font-semibold text-sm text-ink">Hospital Portal</span>
              </div>
              <nav className="space-y-0.5">
                {NAV.map((n) => {
                  const Icon = n.icon
                  return (
                    <Link key={n.href} href={n.href} className="flex items-center gap-2 px-2.5 py-2 rounded text-sm text-gray-700 hover:bg-kerala-50 hover:text-kerala-700">
                      <Icon className="w-4 h-4" /> {n.label}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </aside>
          <main>{children}</main>
        </div>
      </div>
    </div>
  )
}
