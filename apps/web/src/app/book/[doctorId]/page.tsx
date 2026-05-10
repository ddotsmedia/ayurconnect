'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { use } from 'react'
import { GradientHero } from '@ayurconnect/ui'
import { Video, MapPin, Calendar, ChevronLeft, IndianRupee, ShieldCheck } from 'lucide-react'

type Doctor = {
  id: string
  name: string
  specialization: string
  qualification: string | null
  district: string
  ccimVerified: boolean
  consultationFee: number | null
  availableForOnline: boolean
  availableDays: string[]
}

type RazorpayConfig = { enabled: boolean; keyId: string | null }

declare global {
  interface Window {
    Razorpay?: new (opts: Record<string, unknown>) => { open: () => void }
  }
}

export default function BookPage({ params }: { params: Promise<{ doctorId: string }> }) {
  const { doctorId } = use(params)
  const router = useRouter()

  const [doctor, setDoctor]     = useState<Doctor | null>(null)
  const [rzConfig, setRzConfig] = useState<RazorpayConfig>({ enabled: false, keyId: null })
  const [loading, setLoading]   = useState(true)
  const [step, setStep]         = useState<1 | 2 | 3 | 4>(1)
  const [error, setError]       = useState<string | null>(null)
  const [busy, setBusy]         = useState(false)
  const [createdId, setCreatedId] = useState<string | null>(null)

  const [form, setForm] = useState({
    type: 'consultation-video',
    date: '',
    time: '10:00',
    chiefComplaint: '',
    duration: '1-4 weeks',
  })

  useEffect(() => {
    Promise.all([
      fetch(`/api/doctors/${doctorId}`).then((r) => r.json()),
      fetch('/api/payments/config').then((r) => r.json()),
    ]).then(([d, c]) => {
      setDoctor(d as Doctor)
      setRzConfig(c as RazorpayConfig)
    }).catch((e) => setError(String(e))).finally(() => setLoading(false))
  }, [doctorId])

  async function createAppointment(): Promise<string | null> {
    setBusy(true); setError(null)
    try {
      const dateTime = new Date(`${form.date}T${form.time}:00`).toISOString()
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          doctorId,
          dateTime,
          type: form.type,
          chiefComplaint: form.chiefComplaint,
          duration: form.duration,
        }),
      })
      if (res.status === 401) { router.push(`/sign-in?next=/book/${doctorId}`); return null }
      if (!res.ok) { setError(`booking failed (${res.status})`); return null }
      const data = (await res.json()) as { id: string }
      setCreatedId(data.id)
      return data.id
    } catch (e) { setError(String(e)); return null } finally { setBusy(false) }
  }

  async function payWithRazorpay(appointmentId: string) {
    if (!rzConfig.enabled) {
      // No payment configured — just go to confirmation
      router.push(`/dashboard/appointments`)
      return
    }
    // Load Razorpay script if not present
    if (!window.Razorpay) {
      await new Promise<void>((resolve, reject) => {
        const s = document.createElement('script')
        s.src = 'https://checkout.razorpay.com/v1/checkout.js'
        s.onload = () => resolve()
        s.onerror = () => reject(new Error('failed to load razorpay'))
        document.head.appendChild(s)
      })
    }

    const orderRes = await fetch('/api/payments/order', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ appointmentId }),
    })
    if (!orderRes.ok) { setError(`order create failed (${orderRes.status})`); return }
    const order = await orderRes.json() as { orderId: string; amount: number; currency: string; keyId: string }

    const rz = new window.Razorpay!({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      order_id: order.orderId,
      name: 'AyurConnect',
      description: `Consultation with ${doctor?.name}`,
      handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
        const verifyRes = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ ...response, appointmentId }),
        })
        if (verifyRes.ok) router.push('/dashboard/appointments')
        else setError('payment verify failed; check appointments page')
      },
    })
    rz.open()
  }

  if (loading)  return <p className="container mx-auto px-4 py-20 text-center text-muted">Loading…</p>
  if (!doctor)  return <p className="container mx-auto px-4 py-20 text-center text-red-700">Doctor not found.</p>

  return (
    <>
      <GradientHero variant="green" size="md">
        <Link href={`/doctors/${doctor.id}`} className="inline-flex items-center gap-1 text-sm text-white/70 hover:text-white mb-3">
          <ChevronLeft className="w-4 h-4" /> Back to profile
        </Link>
        <h1 className="text-2xl md:text-4xl text-white">Book consultation with {doctor.name}</h1>
        <div className="mt-2 flex flex-wrap gap-3 text-sm text-white/70">
          <span>{doctor.qualification ?? doctor.specialization} · {doctor.district}</span>
          {doctor.ccimVerified && <span className="inline-flex items-center gap-1 text-gold-300"><ShieldCheck className="w-3.5 h-3.5" /> CCIM verified</span>}
          {doctor.consultationFee && <span className="inline-flex items-center gap-1 text-gold-300"><IndianRupee className="w-3.5 h-3.5" /> {doctor.consultationFee}</span>}
        </div>
      </GradientHero>

      <div className="container mx-auto px-4 py-10 max-w-2xl">
        {/* steps */}
        <div className="flex items-center gap-2 mb-8 text-xs text-muted">
          {[1,2,3,4].map((n) => (
            <div key={n} className="flex items-center gap-2">
              <span className={n <= step ? 'w-7 h-7 rounded-full bg-kerala-600 text-white flex items-center justify-center font-semibold' : 'w-7 h-7 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center'}>{n}</span>
              {n < 4 && <span className={n < step ? 'w-8 h-px bg-kerala-600' : 'w-8 h-px bg-gray-200'} />}
            </div>
          ))}
          <span className="ml-2">{['Type','Schedule','Intake','Pay'][step-1]}</span>
        </div>

        {error && <div className="p-3 mb-4 rounded bg-red-50 text-red-800 text-sm">{error}</div>}

        <div className="bg-white rounded-card border border-gray-100 shadow-card p-6">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl text-kerala-700 mb-2">Consultation type</h2>
              <button
                type="button"
                onClick={() => { setForm({ ...form, type: 'consultation-video' }); setStep(2) }}
                disabled={!doctor.availableForOnline}
                className="w-full text-left p-4 border-2 border-gray-200 rounded-card hover:border-kerala-300 disabled:opacity-50 flex items-start gap-3"
              >
                <Video className="w-5 h-5 text-kerala-700 mt-1" />
                <div>
                  <div className="font-semibold">Video consultation</div>
                  <div className="text-sm text-muted">Secure video call. Best for follow-ups, dosha analysis, lifestyle advice. {!doctor.availableForOnline && '(this doctor is in-person only)'}</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => { setForm({ ...form, type: 'consultation-in-person' }); setStep(2) }}
                className="w-full text-left p-4 border-2 border-gray-200 rounded-card hover:border-kerala-300 flex items-start gap-3"
              >
                <MapPin className="w-5 h-5 text-kerala-700 mt-1" />
                <div>
                  <div className="font-semibold">In-person visit</div>
                  <div className="text-sm text-muted">Visit the doctor at their clinic in {doctor.district}. Required for Panchakarma, Nadi pariksha.</div>
                </div>
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl text-kerala-700 mb-2">Pick date and time</h2>
              <p className="text-xs text-muted">Doctor available: {doctor.availableDays.join(', ') || 'on request'}.</p>
              <label className="block">
                <span className="block text-xs font-medium text-gray-700 mb-1.5">Date</span>
                <input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} min={new Date().toISOString().split('T')[0]} className="w-full border rounded-md px-3 py-2 text-sm" />
              </label>
              <label className="block">
                <span className="block text-xs font-medium text-gray-700 mb-1.5">Time</span>
                <input type="time" required value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm" />
              </label>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setStep(1)} className="flex-1 px-4 py-2 border border-gray-200 rounded-md text-sm hover:bg-gray-50">Back</button>
                <button onClick={() => setStep(3)} disabled={!form.date} className="flex-1 px-4 py-2 bg-kerala-600 text-white rounded-md text-sm font-semibold hover:bg-kerala-700 disabled:opacity-50">Next</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl text-kerala-700 mb-2">Health intake</h2>
              <label className="block">
                <span className="block text-xs font-medium text-gray-700 mb-1.5">Chief complaint *</span>
                <textarea required rows={4} value={form.chiefComplaint} onChange={(e) => setForm({ ...form, chiefComplaint: e.target.value })} placeholder="Describe symptoms, when they started, what aggravates them..." className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-kerala-600" />
              </label>
              <label className="block">
                <span className="block text-xs font-medium text-gray-700 mb-1.5">How long have you had this concern?</span>
                <select value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm bg-white">
                  <option value="less than a week">Less than a week</option>
                  <option value="1-4 weeks">1-4 weeks</option>
                  <option value="1-6 months">1-6 months</option>
                  <option value="more than 6 months">More than 6 months</option>
                </select>
              </label>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setStep(2)} className="flex-1 px-4 py-2 border border-gray-200 rounded-md text-sm hover:bg-gray-50">Back</button>
                <button
                  onClick={async () => { const id = await createAppointment(); if (id) setStep(4) }}
                  disabled={busy || !form.chiefComplaint.trim()}
                  className="flex-1 px-4 py-2 bg-kerala-600 text-white rounded-md text-sm font-semibold hover:bg-kerala-700 disabled:opacity-50"
                >
                  {busy ? 'Saving…' : 'Continue to payment'}
                </button>
              </div>
            </div>
          )}

          {step === 4 && createdId && (
            <div className="space-y-4">
              <h2 className="text-xl text-kerala-700 mb-2">Pay & confirm</h2>
              <div className="p-4 rounded bg-cream border border-gray-100 text-sm">
                <div className="flex justify-between mb-2"><span className="text-muted">Doctor</span><span className="font-medium">{doctor.name}</span></div>
                <div className="flex justify-between mb-2"><span className="text-muted">Type</span><span className="font-medium">{form.type.replace(/-/g,' ')}</span></div>
                <div className="flex justify-between mb-2"><span className="text-muted">Date</span><span className="font-medium">{form.date} · {form.time}</span></div>
                <div className="flex justify-between pt-2 mt-2 border-t"><span>Total</span><span className="text-lg font-bold text-kerala-700">₹{doctor.consultationFee ?? 0}</span></div>
              </div>

              {!rzConfig.enabled ? (
                <div className="p-4 rounded bg-amber-50 border border-amber-100 text-sm text-amber-900">
                  <strong>Payment not yet enabled.</strong> Razorpay keys aren&apos;t set on the server. Your appointment is saved as <strong>scheduled (payment pending)</strong>; you can pay at the clinic or once we add Razorpay credentials. View it in <Link href="/dashboard/appointments" className="underline">your appointments</Link>.
                </div>
              ) : null}

              <div className="flex gap-2">
                <button
                  onClick={() => router.push('/dashboard/appointments')}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-md text-sm hover:bg-gray-50"
                >
                  Skip & view appointments
                </button>
                <button
                  onClick={() => payWithRazorpay(createdId)}
                  disabled={!rzConfig.enabled}
                  className="flex-1 px-4 py-2 bg-gold-500 text-white rounded-md text-sm font-semibold hover:bg-gold-600 disabled:opacity-50"
                >
                  {rzConfig.enabled ? `Pay ₹${doctor.consultationFee ?? 0} with Razorpay` : 'Pay (disabled)'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
