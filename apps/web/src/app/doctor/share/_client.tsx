'use client'

import { useMemo, useState } from 'react'
import { Copy, MessageCircle, CheckCircle2, AlertCircle, Send, Loader2, Sparkles, UserPlus } from 'lucide-react'

type Doctor = {
  id: string; name: string; profileCompleteness?: number | null
  ksmcRegNumber?: string | null; homeDistrict?: string | null; college?: string | null
  aboutMl?: string | null; bio?: string | null; specialTreatmentsOffered?: string[] | null
  ccimVerified: boolean
} | null

const PROMPTS: Array<{ key: keyof NonNullable<Doctor>; label: string }> = [
  { key: 'aboutMl',                  label: 'Add your Malayalam bio (മലയാളം) to reach Malayali patients' },
  { key: 'homeDistrict',             label: 'Add your home Kerala district' },
  { key: 'college',                  label: 'Add your BAMS college + batch year' },
  { key: 'ksmcRegNumber',            label: 'Add your KSMC registration number for faster verification' },
  { key: 'specialTreatmentsOffered', label: 'List the classical treatments you offer (Pizhichil, Panchakarma, etc.)' },
  { key: 'bio',                      label: 'Write a 2–3 sentence English bio' },
]

export function DoctorShareClient({ doctor }: { doctor: Doctor }) {
  const [tab, setTab] = useState<'share' | 'invite'>('share')
  const [copied, setCopied] = useState(false)
  const [invite, setInvite] = useState({ name: '', email: '', phone: '', note: '' })
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const profileUrl = useMemo(() => doctor ? `https://ayurconnect.com/doctors/${doctor.id}` : 'https://ayurconnect.com/doctors', [doctor])
  const inviteUrl  = doctor ? `https://ayurconnect.com/doctors/register?ref=${doctor.id}` : 'https://ayurconnect.com/doctors/register'
  const completeness = doctor?.profileCompleteness ?? 0

  const missing = doctor ? PROMPTS.filter((p) => {
    const v = (doctor as Record<string, unknown>)[p.key as string]
    return v == null || (typeof v === 'string' && v.trim() === '') || (Array.isArray(v) && v.length === 0)
  }) : []

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!invite.name.trim() || (!invite.email.trim() && !invite.phone.trim())) {
      setErr('Name + (email OR phone) required.'); return
    }
    setBusy(true); setErr(null)
    try {
      const message = `Referred by Dr ${doctor?.name ?? 'AyurConnect doctor'} (ref=${doctor?.id ?? ''}).\nColleague: ${invite.name}\nContact: ${invite.email || invite.phone}\nNote: ${invite.note}\nInvite link: ${inviteUrl}`
      const r = await fetch('/api/leads', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          kind: 'doctor_colleague_invite',
          name: invite.name.trim(),
          email: invite.email.trim() || 'colleague@invite.local',
          phone: invite.phone.trim() || undefined,
          message: message.slice(0, 4000),
        }),
      })
      if (!r.ok) {
        const j = await r.json().catch(() => ({})) as { error?: string }
        if (r.status === 429) throw new Error('Too many invites — try again in an hour.')
        throw new Error(j.error ?? `HTTP ${r.status}`)
      }
      setSent(true)
    } catch (e2) { setErr(e2 instanceof Error ? e2.message : String(e2)) } finally { setBusy(false) }
  }

  function copyLink() {
    void navigator.clipboard.writeText(profileUrl).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    })
  }

  const waShare = doctor
    ? `https://wa.me/?text=${encodeURIComponent(`Find me on AyurConnect — Kerala's verified Ayurveda directory:\n${profileUrl}`)}`
    : '#'
  const waInvite = `https://wa.me/?text=${encodeURIComponent(`I'm listed on AyurConnect — Kerala's most comprehensive Ayurveda doctor directory. Join (free): ${inviteUrl}`)}`

  return (
    <div className="space-y-6">
      {doctor && (
        <section className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
          <header className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h2 className="font-serif text-xl text-ink">Profile completeness</h2>
              <p className="text-xs text-muted">A complete profile ranks better in directory search and earns more enquiries.</p>
            </div>
            <span className={'text-2xl font-bold ' + (completeness >= 80 ? 'text-emerald-700' : completeness >= 50 ? 'text-amber-700' : 'text-red-700')}>{completeness}%</span>
          </header>
          <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className={'h-full ' + (completeness >= 80 ? 'bg-emerald-600' : completeness >= 50 ? 'bg-amber-500' : 'bg-red-500')} style={{ width: `${completeness}%` }} />
          </div>
          {missing.length > 0 && (
            <ul className="mt-4 space-y-1.5 text-sm">
              {missing.slice(0, 4).map((p) => (
                <li key={p.key as string} className="inline-flex items-start gap-2 text-gray-700">
                  <Sparkles className="w-3.5 h-3.5 text-kerala-700 mt-1 flex-shrink-0" /> <span>{p.label}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-xs">
            <a href="/dashboard/profile" className="text-kerala-700 hover:underline font-semibold">Edit profile →</a>
          </p>
        </section>
      )}

      <nav className="inline-flex bg-gray-100 rounded-md p-1 text-sm">
        <button onClick={() => setTab('share')}  className={'px-3 py-1.5 rounded ' + (tab === 'share'  ? 'bg-white shadow-sm font-semibold' : 'text-gray-600')}>Share your profile</button>
        <button onClick={() => setTab('invite')} className={'px-3 py-1.5 rounded ' + (tab === 'invite' ? 'bg-white shadow-sm font-semibold' : 'text-gray-600')}>Invite a colleague</button>
      </nav>

      {tab === 'share' && (
        <section className="bg-white border border-gray-100 rounded-card p-5 shadow-card space-y-3">
          <p className="text-sm text-gray-700">Public link to your AyurConnect profile:</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded text-xs break-all">{profileUrl}</code>
            <button onClick={copyLink} className="inline-flex items-center gap-1 px-3 py-2 border border-gray-200 rounded text-xs hover:bg-gray-50">
              {copied ? <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
            </button>
          </div>
          <a href={waShare} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#25d366] hover:opacity-90 text-white rounded text-sm font-semibold">
            <MessageCircle className="w-4 h-4" /> Share on WhatsApp
          </a>
          {!doctor?.ccimVerified && (
            <p className="text-xs text-amber-700 inline-flex items-start gap-1">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5" /> Your profile is pending verification — sharing is fine, but the &quot;Verified&quot; badge appears only after admin review.
            </p>
          )}
        </section>
      )}

      {tab === 'invite' && (
        sent ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-card p-5 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-700 mx-auto mb-2" />
            <p className="font-semibold text-emerald-900">Invite sent</p>
            <p className="text-sm text-emerald-800 mt-1">Your colleague will receive an email with your referral. You&apos;ll appear as the referrer on their dashboard.</p>
            <button onClick={() => { setSent(false); setInvite({ name: '', email: '', phone: '', note: '' }) }} className="mt-3 text-xs text-emerald-700 hover:underline">Invite another colleague</button>
          </div>
        ) : (
          <form onSubmit={sendInvite} className="bg-white border border-gray-100 rounded-card p-5 shadow-card space-y-3">
            <h3 className="font-serif text-lg text-ink inline-flex items-center gap-2"><UserPlus className="w-5 h-5 text-kerala-700" /> Invite a colleague</h3>
            <p className="text-xs text-muted">Help grow Kerala&apos;s directory. They&apos;ll see you as referrer and you&apos;ll be credited in their profile.</p>
            {err && (
              <div className="p-3 rounded bg-red-50 border border-red-100 text-sm text-red-800 inline-flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5" /> {err}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input className="w-full px-3 py-2 border border-gray-200 rounded text-sm" placeholder="Colleague name *"     value={invite.name}  onChange={(e) => setInvite({ ...invite, name: e.target.value })} required />
              <input className="w-full px-3 py-2 border border-gray-200 rounded text-sm" placeholder="Their email"          type="email" value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })} />
              <input className="w-full px-3 py-2 border border-gray-200 rounded text-sm" placeholder="Their WhatsApp / phone" value={invite.phone} onChange={(e) => setInvite({ ...invite, phone: e.target.value })} />
            </div>
            <textarea className="w-full px-3 py-2 border border-gray-200 rounded text-sm min-h-[70px]" placeholder="Note (optional)" maxLength={500} value={invite.note} onChange={(e) => setInvite({ ...invite, note: e.target.value })} />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <a href={waInvite} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded text-xs hover:bg-gray-50">
                <MessageCircle className="w-3.5 h-3.5 text-[#25d366]" /> Share invite via WhatsApp
              </a>
              <button type="submit" disabled={busy} className="inline-flex items-center gap-1 px-5 py-2 bg-kerala-700 hover:bg-kerala-800 disabled:opacity-60 text-white rounded text-sm font-semibold">
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send invite
              </button>
            </div>
          </form>
        )
      )}
    </div>
  )
}
