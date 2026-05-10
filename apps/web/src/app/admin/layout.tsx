import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerSession } from '../../lib/auth'

const NAV: Array<{ href: string; label: string; group?: string }> = [
  { href: '/admin',           label: 'Dashboard' },
  { href: '/admin/users',     label: 'Users',     group: 'people' },
  { href: '/admin/doctors',   label: 'Doctors',   group: 'directory' },
  { href: '/admin/verify',    label: 'CCIM queue', group: 'directory' },
  { href: '/admin/hospitals', label: 'Hospitals', group: 'directory' },
  { href: '/admin/herbs',     label: 'Herbs',     group: 'directory' },
  { href: '/admin/colleges',  label: 'Colleges',  group: 'directory' },
  { href: '/admin/tourism',   label: 'Tourism',   group: 'directory' },
  { href: '/admin/jobs',      label: 'Jobs',      group: 'directory' },
  { href: '/admin/articles',    label: 'Articles',     group: 'content' },
  { href: '/admin/health-tips', label: 'Health tips',  group: 'content' },
  { href: '/admin/forum',     label: 'Forum',     group: 'moderation' },
  { href: '/admin/reviews',   label: 'Reviews',   group: 'moderation' },
]

const GROUP_LABEL: Record<string, string> = {
  people: 'PEOPLE',
  directory: 'DIRECTORY',
  content: 'CONTENT',
  moderation: 'MODERATION',
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const sess = await getServerSession()
  if (!sess) redirect('/sign-in?next=/admin')
  if (sess.user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-md text-center space-y-3">
          <h1 className="text-2xl font-bold text-red-700">Forbidden</h1>
          <p className="text-gray-700">
            You&apos;re signed in as <strong>{sess.user.email}</strong> with role <code className="px-2 py-0.5 bg-gray-100 rounded">{sess.user.role}</code>.
            Only ADMIN users can access this area.
          </p>
          <p className="text-sm text-gray-500">
            To grant yourself admin: SSH into the VPS and run
            <code className="block mt-2 p-2 bg-gray-100 text-left text-xs rounded">
              docker exec -it ayurconnect-postgres psql -U ayurconnect -d ayurconnect{'\n'}
              UPDATE &quot;User&quot; SET role=&apos;ADMIN&quot; WHERE email=&apos;{sess.user.email}&apos;;
            </code>
          </p>
          <Link href="/" className="inline-block mt-4 text-green-700 hover:underline">← back to site</Link>
        </div>
      </div>
    )
  }

  const groups = NAV.reduce<Record<string, typeof NAV>>((acc, item) => {
    const k = item.group ?? '_top'
    ;(acc[k] ??= []).push(item)
    return acc
  }, {})

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-60 border-r bg-white py-6 px-4 sticky top-0 self-start h-screen overflow-y-auto">
        <Link href="/admin" className="block mb-6 text-lg font-bold text-green-800">
          AyurConnect <span className="text-gray-500 font-normal">/ admin</span>
        </Link>
        <nav className="space-y-5 text-sm">
          {groups._top?.map((it) => (
            <Link key={it.href} href={it.href} className="block px-2 py-1.5 rounded hover:bg-green-50 text-gray-800">
              {it.label}
            </Link>
          ))}
          {Object.entries(groups)
            .filter(([k]) => k !== '_top')
            .map(([k, items]) => (
              <div key={k}>
                <div className="px-2 mb-1.5 text-[11px] tracking-wider text-gray-400 font-semibold">{GROUP_LABEL[k] ?? k}</div>
                <div className="space-y-0.5">
                  {items.map((it) => (
                    <Link key={it.href} href={it.href} className="block px-2 py-1.5 rounded hover:bg-green-50 text-gray-800">
                      {it.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
        </nav>
        <div className="mt-8 pt-4 border-t text-xs text-gray-500 space-y-1">
          <div className="font-medium text-gray-800 truncate">{sess.user.name || sess.user.email}</div>
          <div className="truncate">{sess.user.email}</div>
          <div>role: <span className="text-green-700 font-mono">{sess.user.role}</span></div>
          <Link href="/" className="block mt-2 text-green-700 hover:underline">← public site</Link>
        </div>
      </aside>
      <main className="flex-1 p-8 max-w-6xl">{children}</main>
    </div>
  )
}
