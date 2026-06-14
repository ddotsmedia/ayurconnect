'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Copy, MessageCircle, Send, Sparkles, ArrowRight, Plus, X } from 'lucide-react'

type Me = { doctor: { id: string; name: string; referralCode: string | null; ccimVerified: boolean } | null }

export function WelcomeClient() {
  const [me, setMe] = useState<Me | null>(null)
  const [copied, setCopied] = useState(false)
  const [invites, setInvites] = useState<{ name: string; email: string; phone: string }[]>([{ name: '', email: '', phone: '' }, { name: '', email: '', phone: '' }, { name: '', email: '', phone: '' }])
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    fetch('/api/doctor-viral/me', { credentials: 'include' }).then((r) => r.ok ? r.json() : null).then(setMe).catch(() => setMe(null))
  }, [])

  const referralCode = me?.doctor?.referralCode
  const referralUrl  = referralCode ? `https://ayurconnect.com/doctors/register?ref=${referralCode}` : 'https://ayurconnect.com/doctors/register'

  const waMsgMl = `ഞാൻ AyurConnect-ൽ രജിസ്റ്റർ ചെയ്തു! കേരളത്തിലെ ഏറ്റവും വലിയ ആയുർവേദ ഡോക്ടർ ഡയറക്ടറി. നിങ്ങളും ചേരൂ → ${referralUrl}`
  const waMsgEn = `I just registered on AyurConnect — Kerala's largest verified Ayurveda doctor directory. Join me → ${referralUrl}`

  function copy() { navigator.clipboard?.writeText(referralUrl); setCopied(true); window.setTimeout(() => setCopied(false), 1500) }

  async function sendInvites() {
    setBusy(true)
    try {
      for (const i of invites) {
        if (!i.name.trim() || (!i.email.trim() && !i.phone.trim())) continue
        await fetch('/api/doctor-viral/invites', {
          method: 'POST', credentials: 'include',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ name: i.name, email: i.email, phone: i.phone, source: 'manual' }),
        }).catch(() => {})
      }
      setSent(true)
    } finally { setBusy(false) }
  }

  return (
    <div className="space-y-5">
      <article className="bg-emerald-50 border border-emerald-200 rounded-card p-5 shadow-card">
        <h2 className="font-serif text-xl text-emerald-900 inline-flex items-center gap-2"><Sparkles className="w-5 h-5 text-amber-500" /> Share your achievement</h2>
        <p className="text-sm text-emerald-900 mt-1">Your colleagues should know — and your referral link tracks every doctor who joins through you.</p>
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <code className="flex-1 min-w-[200px] px-3 py-2 bg-white border border-emerald-200 rounded text-xs break-all">{referralUrl}</code>
          <button onClick={copy} className="inline-flex items-center gap-1 px-3 py-2 border border-emerald-300 hover:bg-emerald-100 rounded text-xs"><Copy className="w-3.5 h-3.5" /> {copied ? 'Copied!' : 'Copy'}</button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <a href={`https://wa.me/?text=${encodeURIComponent(waMsgMl)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-3 py-2 bg-[#25d366] text-white rounded text-xs font-semibold"><MessageCircle className="w-3.5 h-3.5" /> WhatsApp (മലയാളം)</a>
          <a href={`https://wa.me/?text=${encodeURIComponent(waMsgEn)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-3 py-2 bg-[#25d366]/90 text-white rounded text-xs font-semibold"><MessageCircle className="w-3.5 h-3.5" /> WhatsApp (English)</a>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-3 py-2 bg-[#1877f2] text-white rounded text-xs font-semibold">Facebook</a>
        </div>
      </article>

      <article className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
        <h2 className="font-serif text-lg text-ink">Invite 3 colleagues</h2>
        <p className="text-xs text-gray-600 mt-1">A complete profile + 3 colleagues unlocks the Referrer badge.</p>
        {sent ? (
          <div className="mt-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 p-3 rounded inline-flex items-center gap-2"><Sparkles className="w-4 h-4" /> Invites logged. We&apos;ll credit you when they verify.</div>
        ) : (
          <>
            <div className="mt-3 space-y-2">
              {invites.map((inv, i) => (
                <div key={i} className="grid grid-cols-3 gap-2">
                  <input value={inv.name}  onChange={(e) => setInvites((x) => x.map((y, j) => j === i ? { ...y, name: e.target.value } : y))}  placeholder={`Colleague ${i + 1} name`} className="border border-gray-200 rounded px-2.5 py-1.5 text-sm" />
                  <input value={inv.email} onChange={(e) => setInvites((x) => x.map((y, j) => j === i ? { ...y, email: e.target.value } : y))} placeholder="Email"  type="email" className="border border-gray-200 rounded px-2.5 py-1.5 text-sm" />
                  <input value={inv.phone} onChange={(e) => setInvites((x) => x.map((y, j) => j === i ? { ...y, phone: e.target.value } : y))} placeholder="WhatsApp" className="border border-gray-200 rounded px-2.5 py-1.5 text-sm" />
                </div>
              ))}
            </div>
            <button onClick={sendInvites} disabled={busy} className="mt-3 inline-flex items-center gap-1 px-4 py-2 bg-kerala-700 hover:bg-kerala-800 text-white rounded text-sm font-semibold disabled:opacity-50">
              <Send className="w-4 h-4" /> {busy ? 'Sending…' : 'Send invites'}
            </button>
          </>
        )}
      </article>

      <article className="bg-cream border border-kerala-100 rounded-card p-5">
        <h2 className="font-serif text-lg text-ink">What next?</h2>
        <ul className="mt-2 space-y-2 text-sm">
          <li><Link href="/dashboard/profile" className="text-kerala-700 hover:underline inline-flex items-center gap-1">Complete your profile to 100% <ArrowRight className="w-3.5 h-3.5" /></Link></li>
          <li><Link href="/doctor/share" className="text-kerala-700 hover:underline inline-flex items-center gap-1">Get more share tools <ArrowRight className="w-3.5 h-3.5" /></Link></li>
          <li><Link href="/doctors/leaderboard" className="text-kerala-700 hover:underline inline-flex items-center gap-1">See where you rank <ArrowRight className="w-3.5 h-3.5" /></Link></li>
          <li><Link href="/dashboard" className="text-kerala-700 hover:underline inline-flex items-center gap-1">Go to dashboard <ArrowRight className="w-3.5 h-3.5" /></Link></li>
        </ul>
      </article>
    </div>
  )
}
