'use client'

import { use, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Video, Mic, MicOff, VideoOff, ChevronLeft, ShieldCheck, AlertCircle,
  Stethoscope, Pill, ListChecks, Sparkles, FileText, CheckCircle2,
  Loader2, Clock, Save, ExternalLink, MessageSquare,
} from 'lucide-react'

type Role = 'doctor' | 'patient'

type Consultation = {
  id: string
  status: string
  type: string
  dateTime: string
  chiefComplaint: string | null
  duration: string | null
  consultationStartedAt: string | null
  consultationEndedAt: string | null
  consultationSummary: string | null
  prescription: string | null
  treatmentPlan: string | null
  followUpRecommended: boolean
  followUpAfterWeeks: number | null
  doctor: { id: string; name: string; specialization: string; qualification: string | null; photoUrl: string | null } | null
  user: { id: string; name: string | null; email: string }
  videoUrl: string | null
  videoEnabled: boolean
  role: Role
  doctorPrivateNotes?: string | null
}

type Mode = 'lobby' | 'live' | 'post'
type ErrorKind = 'not-found' | 'forbidden' | 'fetch-failed' | null

export default function ConsultationPage({ params }: { params: Promise<{ appointmentId: string }> }) {
  const { appointmentId } = use(params)
  const router = useRouter()

  const [data, setData]     = useState<Consultation | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorKind, setErrorKind] = useState<ErrorKind>(null)
  const [errorDetail, setErrorDetail] = useState<string | null>(null)
  // In-session warning (camera/mic permission, missing video URL) — shown inline,
  // does NOT replace the whole page like a load-failure does.
  const [liveWarn, setLiveWarn] = useState<string | null>(null)
  const [mode, setMode]     = useState<Mode>('lobby')
  const iframeRef = useRef<HTMLIFrameElement | null>(null)

  // Pre-call device check
  const [devicesChecked, setDevicesChecked] = useState(false)
  const [camOk, setCamOk] = useState<boolean | null>(null)
  const [micOk, setMicOk] = useState<boolean | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const previewStreamRef = useRef<MediaStream | null>(null)

  async function load() {
    setLoading(true); setErrorKind(null); setErrorDetail(null)
    try {
      const res = await fetch(`/api/appointments/${appointmentId}/consultation`, { credentials: 'include' })
      if (res.status === 401) { router.push(`/sign-in?next=/consult/${appointmentId}`); return }
      if (res.status === 403) { setErrorKind('forbidden'); return }
      if (res.status === 404) { setErrorKind('not-found'); return }
      if (!res.ok) { setErrorKind('fetch-failed'); setErrorDetail(`HTTP ${res.status}`); return }
      const d = (await res.json()) as Consultation
      setData(d)
      // Decide mode from state
      const now = Date.now()
      const start = new Date(d.dateTime).getTime()
      const isPast = now > start + 90 * 60_000 || Boolean(d.consultationEndedAt) || d.status === 'completed'
      if (isPast) setMode('post')
      else setMode('lobby')
    } catch (e) { setErrorKind('fetch-failed'); setErrorDetail(String(e)) } finally { setLoading(false) }
  }
  useEffect(() => { load() /* eslint-disable-next-line */ }, [appointmentId])

  // Cleanup preview stream on unmount or mode change
  useEffect(() => {
    return () => {
      previewStreamRef.current?.getTracks().forEach((t) => t.stop())
      previewStreamRef.current = null
    }
  }, [])

  async function runDeviceCheck() {
    setDevicesChecked(false); setCamOk(null); setMicOk(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      previewStreamRef.current = stream
      setCamOk(stream.getVideoTracks().length > 0 && stream.getVideoTracks()[0].enabled)
      setMicOk(stream.getAudioTracks().length > 0 && stream.getAudioTracks()[0].enabled)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play().catch(() => undefined)
      }
      setDevicesChecked(true)
    } catch (e) {
      setLiveWarn('Could not access camera/microphone. Check browser permissions and reload.')
      setCamOk(false); setMicOk(false); setDevicesChecked(true)
    }
  }

  async function startCall() {
    if (!data?.videoUrl) { setLiveWarn('Video room not configured for this appointment.'); return }
    // Stop the preview to release camera before iframe takes over
    previewStreamRef.current?.getTracks().forEach((t) => t.stop())
    previewStreamRef.current = null
    // Tell the API the consultation has started (idempotent)
    void fetch(`/api/appointments/${appointmentId}/start`, { method: 'PATCH', credentials: 'include' })
    setMode('live')
  }

  function endCall() {
    setMode('post')
    // Doctor flow: clinical notes form is shown in post-call.
    // Patient flow: summary view (may not be filled yet — shows "doctor will share notes shortly").
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-muted">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3" />
        Loading consultation…
      </div>
    )
  }
  if (errorKind || !data) {
    return <ConsultationErrorState kind={errorKind ?? 'not-found'} detail={errorDetail} appointmentId={appointmentId} />
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link href="/dashboard/appointments" className="inline-flex items-center gap-1 text-sm text-muted hover:text-kerala-700">
            <ChevronLeft className="w-4 h-4" /> Back
          </Link>
          <div className="text-sm flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-kerala-700" />
            <span className="font-medium">Consultation</span>
            <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${
              mode === 'live'  ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse' :
              mode === 'post'  ? 'bg-gray-100 text-gray-700 border-gray-200' :
                                 'bg-kerala-50 text-kerala-700 border-kerala-200'
            }`}>{mode}</span>
          </div>
          <div className="text-xs text-muted">
            {new Date(data.dateTime).toLocaleString()}
          </div>
        </div>
      </header>

      {liveWarn && (
        <div className="container mx-auto px-4 pt-4">
          <div className="p-3 rounded-md bg-amber-50 border border-amber-200 text-sm text-amber-900 flex justify-between items-center gap-3">
            <span><AlertCircle className="w-4 h-4 inline mr-1.5" />{liveWarn}</span>
            <button onClick={() => setLiveWarn(null)} className="text-amber-800 hover:text-amber-900 text-xs underline">dismiss</button>
          </div>
        </div>
      )}
      {mode === 'lobby'  && <Lobby data={data} devicesChecked={devicesChecked} camOk={camOk} micOk={micOk} runDeviceCheck={runDeviceCheck} videoRef={videoRef} startCall={startCall} />}
      {mode === 'live'   && <Live data={data} iframeRef={iframeRef} endCall={endCall} />}
      {mode === 'post'   && <PostCall data={data} reload={load} />}
    </div>
  )
}

// ─── Lobby (pre-call) ─────────────────────────────────────────────────────
function Lobby(props: {
  data: Consultation
  devicesChecked: boolean
  camOk: boolean | null
  micOk: boolean | null
  runDeviceCheck: () => void
  videoRef: React.MutableRefObject<HTMLVideoElement | null>
  startCall: () => void
}) {
  const { data, devicesChecked, camOk, micOk, runDeviceCheck, videoRef, startCall } = props
  const start = new Date(data.dateTime).getTime()
  const now = Date.now()
  const minutesUntil = Math.round((start - now) / 60_000)
  const tooEarly = minutesUntil > 15
  const tooLate = minutesUntil < -90

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
        {/* Camera preview + start */}
        <div className="space-y-4">
          <div className="bg-gray-900 rounded-card aspect-video relative overflow-hidden">
            <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
            {!devicesChecked && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/80 text-center px-6">
                <Video className="w-12 h-12 text-white/50 mb-3" />
                <p className="text-sm">Camera off — run a device check to preview before joining.</p>
                <button onClick={runDeviceCheck} className="mt-4 px-5 py-2 bg-white/15 hover:bg-white/25 backdrop-blur text-white rounded-md text-sm font-semibold">
                  Test camera + mic
                </button>
              </div>
            )}
            {/* Mic + cam status badges */}
            {devicesChecked && (
              <div className="absolute bottom-3 left-3 flex gap-2">
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${camOk ? 'bg-emerald-600/90 text-white' : 'bg-rose-600/90 text-white'}`}>
                  {camOk ? <Video className="w-3 h-3" /> : <VideoOff className="w-3 h-3" />}
                  {camOk ? 'Camera OK' : 'No camera'}
                </span>
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${micOk ? 'bg-emerald-600/90 text-white' : 'bg-rose-600/90 text-white'}`}>
                  {micOk ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
                  {micOk ? 'Mic OK' : 'No mic'}
                </span>
              </div>
            )}
          </div>

          {/* Status + Join button */}
          <div className="p-5 bg-white rounded-card border border-gray-100 shadow-card">
            {tooEarly && (
              <p className="text-sm text-amber-800 mb-3">
                <Clock className="w-4 h-4 inline mr-1" />
                Your consultation begins in <strong>{minutesUntil} min</strong>. You can join up to 15 minutes early.
              </p>
            )}
            {tooLate && (
              <p className="text-sm text-rose-800 mb-3">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                This consultation window has passed.
              </p>
            )}
            {!tooEarly && !tooLate && (
              <p className="text-sm text-kerala-800 mb-3">
                <CheckCircle2 className="w-4 h-4 inline mr-1" />
                The room is open. Test your devices, then join when you&apos;re ready.
              </p>
            )}
            {!data.videoEnabled && data.type.includes('video') && (
              <p className="text-sm text-amber-800 mb-3">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                Video infra (Daily.co) isn&apos;t configured on this server. Contact admin to set <code>DAILY_API_KEY</code>.
              </p>
            )}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={startCall}
                disabled={tooLate || !data.videoUrl}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-kerala-600 hover:bg-kerala-700 text-white font-semibold rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Video className="w-4 h-4" /> Join consultation
              </button>
              {data.videoUrl && (
                <a
                  href={data.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-3 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-md text-sm"
                  title="Open Daily.co room in a new window"
                >
                  <ExternalLink className="w-4 h-4" /> New tab
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Right: appointment context */}
        <aside className="space-y-4">
          {/* Other party card */}
          <div className="p-5 bg-white rounded-card border border-gray-100 shadow-card">
            {data.role === 'patient' && data.doctor ? (
              <>
                <div className="flex items-center gap-3">
                  {data.doctor.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={data.doctor.photoUrl} alt={data.doctor.name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-kerala-50 text-kerala-700 flex items-center justify-center font-semibold">
                      {data.doctor.name.replace(/^Dr\.?\s*/i, '').split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-ink">{data.doctor.name}</h3>
                    <p className="text-xs text-muted">{data.doctor.qualification ?? data.doctor.specialization}</p>
                  </div>
                </div>
                <Link href={`/doctors/${data.doctor.id}`} className="text-xs text-kerala-700 hover:underline mt-3 inline-block">
                  View full profile →
                </Link>
              </>
            ) : (
              <>
                <h3 className="font-semibold text-ink">Patient: {data.user.name ?? data.user.email}</h3>
                <p className="text-xs text-muted mt-1">{data.user.email}</p>
              </>
            )}
          </div>

          {/* Intake summary */}
          <div className="p-5 bg-white rounded-card border border-gray-100 shadow-card">
            <h3 className="font-semibold text-sm text-kerala-700 mb-3 inline-flex items-center gap-2">
              <FileText className="w-4 h-4" /> Intake summary
            </h3>
            <dl className="text-sm space-y-2">
              <div>
                <dt className="text-xs uppercase tracking-wider text-gray-500">Type</dt>
                <dd className="text-gray-800 capitalize">{data.type.replace(/-/g, ' ')}</dd>
              </div>
              {data.chiefComplaint && (
                <div>
                  <dt className="text-xs uppercase tracking-wider text-gray-500">Chief complaint</dt>
                  <dd className="text-gray-800 whitespace-pre-line">{data.chiefComplaint}</dd>
                </div>
              )}
              {data.duration && (
                <div>
                  <dt className="text-xs uppercase tracking-wider text-gray-500">Duration</dt>
                  <dd className="text-gray-800">{data.duration}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Quality + privacy */}
          <div className="p-4 rounded-card bg-kerala-50 border border-kerala-100 text-xs text-kerala-900 leading-relaxed">
            <ShieldCheck className="w-4 h-4 inline mr-1" />
            End-to-end encrypted via Daily.co. The video room only accepts the assigned patient and doctor during the booking window. Chat + screen-share are available inside the call.
          </div>
        </aside>
      </div>
    </div>
  )
}

// ─── Live call ────────────────────────────────────────────────────────────
function Live(props: {
  data: Consultation
  iframeRef: React.MutableRefObject<HTMLIFrameElement | null>
  endCall: () => void
}) {
  const { data, iframeRef, endCall } = props
  return (
    <div className="container mx-auto px-4 py-4 max-w-7xl">
      <div className="grid lg:grid-cols-[1fr_360px] gap-4">
        {/* Daily.co iframe — Prebuilt UI with chat + screenshare enabled at room creation */}
        <div className="bg-gray-900 rounded-card aspect-video overflow-hidden relative">
          {data.videoUrl ? (
            <iframe
              ref={iframeRef}
              src={`${data.videoUrl}?leaveButton=false`}
              allow="camera; microphone; fullscreen; display-capture; autoplay"
              className="w-full h-full border-0"
              title="Consultation video"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white/80">
              <p>No video room URL.</p>
            </div>
          )}
        </div>

        {/* Side panel */}
        <aside className="space-y-3">
          {data.role === 'doctor' ? (
            <DoctorNotesPad data={data} />
          ) : (
            <PatientLiveSidebar data={data} />
          )}
          <button
            onClick={endCall}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-sm font-semibold"
          >
            End consultation
          </button>
          <p className="text-[11px] text-muted text-center">
            Ends the in-page session. Doctor can still re-open notes afterwards from <Link href="/dashboard/appointments" className="underline">appointments</Link>.
          </p>
        </aside>
      </div>
    </div>
  )
}

function DoctorNotesPad({ data }: { data: Consultation }) {
  const [privateNotes, setPrivateNotes] = useState(data.doctorPrivateNotes ?? '')
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)

  async function save() {
    setSaving(true)
    try {
      const res = await fetch(`/api/appointments/${data.id}/clinical-notes`, {
        method: 'PATCH', credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ doctorPrivateNotes: privateNotes }),
      })
      if (res.ok) setSavedAt(Date.now())
    } finally { setSaving(false) }
  }

  return (
    <div className="p-4 bg-white rounded-card border border-gray-100 shadow-card space-y-3">
      <h3 className="font-semibold text-sm text-kerala-700 inline-flex items-center gap-2">
        <FileText className="w-4 h-4" /> Quick notes
      </h3>
      <textarea
        rows={10}
        value={privateNotes}
        onChange={(e) => setPrivateNotes(e.target.value)}
        placeholder="Observations during the call — Nadi pulse, dosha tilt, lifestyle factors, herbs to prescribe…"
        className="w-full border border-gray-200 rounded-md p-3 text-sm font-mono"
      />
      <div className="flex items-center justify-between gap-2">
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-kerala-600 hover:bg-kerala-700 text-white rounded text-xs font-semibold disabled:opacity-50">
          <Save className="w-3 h-3" /> {saving ? 'Saving…' : 'Save'}
        </button>
        {savedAt && <span className="text-xs text-muted">Saved {new Date(savedAt).toLocaleTimeString()}</span>}
      </div>
      <p className="text-[11px] text-muted">Private to you. Full prescription + treatment plan are entered after the call.</p>
    </div>
  )
}

function PatientLiveSidebar({ data }: { data: Consultation }) {
  return (
    <div className="p-4 bg-white rounded-card border border-gray-100 shadow-card space-y-3 text-sm">
      <h3 className="font-semibold text-kerala-700 inline-flex items-center gap-2">
        <Stethoscope className="w-4 h-4" /> Your consultation
      </h3>
      <p className="text-xs text-muted">
        Speak openly. The doctor will share a written summary + prescription after the call — you&apos;ll see it on this page automatically.
      </p>
      <ul className="text-xs text-gray-700 space-y-1.5 pl-4 list-disc">
        <li>Chief complaint: {data.chiefComplaint || '—'}</li>
        <li>Type: {data.type.replace(/-/g, ' ')}</li>
        <li>Duration: {data.duration || '—'}</li>
      </ul>
      <p className="text-[11px] text-muted flex gap-1.5 pt-2 border-t border-gray-100">
        <MessageSquare className="w-3 h-3 mt-0.5" />
        Use the chat icon inside the video for text messages with the doctor.
      </p>
    </div>
  )
}

// ─── Post-call ────────────────────────────────────────────────────────────
function PostCall({ data, reload }: { data: Consultation; reload: () => Promise<void> }) {
  if (data.role === 'doctor') return <DoctorPostCall data={data} reload={reload} />
  return <PatientPostCall data={data} />
}

function DoctorPostCall({ data, reload }: { data: Consultation; reload: () => Promise<void> }) {
  const [summary, setSummary] = useState(data.consultationSummary ?? '')
  const [prescription, setPrescription] = useState(data.prescription ?? '')
  const [plan, setPlan] = useState(data.treatmentPlan ?? '')
  const [privateNotes, setPrivateNotes] = useState(data.doctorPrivateNotes ?? '')
  const [followUp, setFollowUp] = useState(data.followUpRecommended)
  const [followUpWeeks, setFollowUpWeeks] = useState(data.followUpAfterWeeks ?? 4)
  const [saving, setSaving] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<number | null>(null)

  async function save() {
    setSaving(true); setErr(null)
    try {
      const res = await fetch(`/api/appointments/${data.id}/clinical-notes`, {
        method: 'PATCH', credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          consultationSummary: summary, prescription, treatmentPlan: plan,
          doctorPrivateNotes: privateNotes,
          followUpRecommended: followUp,
          followUpAfterWeeks: followUp ? followUpWeeks : null,
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setSavedAt(Date.now())
    } catch (e) { setErr(String(e)) } finally { setSaving(false) }
  }
  async function completeAndShare() {
    await save()
    setCompleting(true)
    try {
      const res = await fetch(`/api/appointments/${data.id}/complete`, { method: 'PATCH', credentials: 'include' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await reload()
    } catch (e) { setErr(String(e)) } finally { setCompleting(false) }
  }

  const filledScore =
    (summary.trim() ? 1 : 0) +
    (prescription.trim() ? 1 : 0) +
    (plan.trim() ? 1 : 0)

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <header className="mb-6">
        <h1 className="font-serif text-3xl text-kerala-700">Consultation summary</h1>
        <p className="text-muted mt-1">Fill what the patient should see in their post-call view. Auto-saves on each &ldquo;Save&rdquo; click.</p>
        <div className="mt-3 flex items-center gap-2 text-xs">
          <span className="text-muted">Completeness:</span>
          <div className="flex gap-0.5">
            {[1, 2, 3].map((n) => (
              <span key={n} className={`w-12 h-1.5 rounded-full ${n <= filledScore ? 'bg-kerala-600' : 'bg-gray-200'}`} />
            ))}
          </div>
          <span className="text-muted">{filledScore}/3</span>
        </div>
      </header>

      <div className="space-y-5">
        <Section icon={Sparkles} title="Observations & diagnosis" hint="Visible to patient">
          <textarea rows={4} value={summary} onChange={(e) => setSummary(e.target.value)}
            placeholder="e.g. Vata-Pitta vitiation with sleep disturbance. Tongue: dry, slight yellow coat at root. Nadi: thin, irregular. Likely Anidra with Vata predominance…"
            className="w-full border border-gray-200 rounded-md p-3 text-sm" />
        </Section>

        <Section icon={Pill} title="Prescription" hint="Visible to patient">
          <textarea rows={5} value={prescription} onChange={(e) => setPrescription(e.target.value)}
            placeholder={`e.g.\n• Saraswatarishtam 15 ml twice daily after meals — 14 days\n• Brahmi Ghrita 1/2 tsp morning empty stomach — 21 days\n• Ashwagandha 500 mg twice daily — 30 days`}
            className="w-full border border-gray-200 rounded-md p-3 text-sm font-mono" />
        </Section>

        <Section icon={ListChecks} title="Treatment plan & lifestyle" hint="Visible to patient">
          <textarea rows={4} value={plan} onChange={(e) => setPlan(e.target.value)}
            placeholder={`e.g.\n• Daily Padabhyanga (foot oil massage) before bed\n• Phone off 1h before sleep — non-negotiable\n• 7-session Shirodhara course at a nearby centre\n• Avoid caffeine after 11am`}
            className="w-full border border-gray-200 rounded-md p-3 text-sm" />
        </Section>

        <Section icon={Clock} title="Follow-up" hint="Visible to patient">
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={followUp} onChange={(e) => setFollowUp(e.target.checked)} />
            Recommend a follow-up visit
          </label>
          {followUp && (
            <div className="mt-2 flex items-center gap-2 text-sm">
              <span>after</span>
              <input type="number" min={1} max={52} value={followUpWeeks} onChange={(e) => setFollowUpWeeks(Math.max(1, Math.min(52, Number(e.target.value) || 4)))} className="w-16 border border-gray-200 rounded px-2 py-1" />
              <span>weeks</span>
            </div>
          )}
        </Section>

        <Section icon={FileText} title="Private clinical notes" hint="Not shared with patient">
          <textarea rows={3} value={privateNotes} onChange={(e) => setPrivateNotes(e.target.value)}
            placeholder="Differential diagnosis considered, family history, allergies, things to monitor next visit — for your records only."
            className="w-full border border-gray-200 rounded-md p-3 text-sm font-mono bg-gray-50" />
        </Section>

        {err && <div className="p-3 rounded bg-red-50 text-red-800 text-sm">{err}</div>}

        <div className="sticky bottom-4 bg-white border border-gray-200 rounded-card shadow-cardLg p-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="text-xs text-muted">
            {savedAt ? `Saved ${new Date(savedAt).toLocaleTimeString()}` : 'Not yet saved'}
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 px-4 py-2 border border-kerala-600 text-kerala-700 hover:bg-kerala-50 rounded text-sm font-semibold disabled:opacity-50">
              <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save draft'}
            </button>
            <button onClick={completeAndShare} disabled={completing || filledScore === 0} className="inline-flex items-center gap-1.5 px-4 py-2 bg-kerala-600 hover:bg-kerala-700 text-white rounded text-sm font-semibold disabled:opacity-50">
              <CheckCircle2 className="w-4 h-4" /> {completing ? 'Sharing…' : 'Save & share with patient'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function PatientPostCall({ data }: { data: Consultation }) {
  const hasNotes = data.consultationSummary || data.prescription || data.treatmentPlan
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <header className="mb-6 text-center">
        <CheckCircle2 className="w-12 h-12 text-kerala-600 mx-auto mb-3" />
        <h1 className="font-serif text-3xl text-kerala-700">Consultation complete</h1>
        <p className="text-muted mt-2">
          {hasNotes ? `${data.doctor?.name ?? 'Your doctor'} has shared the following:` : `${data.doctor?.name ?? 'Your doctor'} will share your prescription + treatment plan here shortly. Refresh this page in a few minutes.`}
        </p>
      </header>

      <div className="space-y-4">
        {data.consultationSummary && (
          <Section icon={Sparkles} title="Observations & diagnosis" hint="">
            <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">{data.consultationSummary}</p>
          </Section>
        )}
        {data.prescription && (
          <Section icon={Pill} title="Prescription" hint="">
            <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">{data.prescription}</pre>
          </Section>
        )}
        {data.treatmentPlan && (
          <Section icon={ListChecks} title="Treatment plan & lifestyle" hint="">
            <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">{data.treatmentPlan}</p>
          </Section>
        )}
        {data.followUpRecommended && data.followUpAfterWeeks && (
          <Section icon={Clock} title="Follow-up suggested" hint="">
            <p className="text-sm text-gray-800">
              {data.doctor?.name ?? 'Your doctor'} recommends a follow-up visit in <strong>{data.followUpAfterWeeks} week{data.followUpAfterWeeks === 1 ? '' : 's'}</strong>.
            </p>
            {data.doctor && (
              <Link href={`/book/${data.doctor.id}`} className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 bg-kerala-600 hover:bg-kerala-700 text-white rounded text-xs font-semibold">
                Book follow-up →
              </Link>
            )}
          </Section>
        )}
        {!hasNotes && (
          <div className="p-5 bg-amber-50 border border-amber-100 rounded-card text-sm text-amber-900 flex gap-3">
            <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>Your doctor is writing up your summary. You&apos;ll receive an email and notification as soon as it&apos;s ready — usually within 1-2 hours of the call.</p>
          </div>
        )}

        <div className="p-5 bg-white rounded-card border border-gray-100 shadow-card mt-6 flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm text-muted">Have feedback for {data.doctor?.name ?? 'your doctor'}?</p>
          {data.doctor && (
            <Link href={`/doctors/${data.doctor.id}?review=1`} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gold-400 text-gold-700 hover:bg-gold-50 rounded text-xs font-semibold">
              Leave a review →
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Reusable section card ────────────────────────────────────────────────
function Section({ icon: Icon, title, hint, children }: { icon: typeof FileText; title: string; hint: string; children: React.ReactNode }) {
  return (
    <section className="p-5 bg-white rounded-card border border-gray-100 shadow-card">
      <header className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-kerala-700 inline-flex items-center gap-2">
          <Icon className="w-4 h-4" /> {title}
        </h2>
        {hint && <span className="text-[10px] uppercase tracking-wider text-gold-600 font-semibold">{hint}</span>}
      </header>
      {children}
    </section>
  )
}

// ─── Friendly empty/error state ───────────────────────────────────────────
// The consultation page receives an ID via URL. If it's wrong (typed, stale,
// or visited speculatively) we show this rather than a terse "not found".
function ConsultationErrorState({ kind, detail, appointmentId }: { kind: 'not-found' | 'forbidden' | 'fetch-failed'; detail: string | null; appointmentId: string }) {
  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard/appointments" className="inline-flex items-center gap-1 text-sm text-muted hover:text-kerala-700">
            <ChevronLeft className="w-4 h-4" /> Back to appointments
          </Link>
          <span className="text-sm font-medium inline-flex items-center gap-2"><Stethoscope className="w-4 h-4 text-kerala-700" /> Consultation</span>
          <span />
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 max-w-xl">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          {kind === 'not-found' && <>
            <h1 className="font-serif text-2xl md:text-3xl text-kerala-700">We couldn&apos;t find this consultation</h1>
            <p className="text-muted mt-3 text-sm leading-relaxed">
              No appointment matches the ID <code className="px-1.5 py-0.5 bg-gray-100 rounded text-[11px] tabular-nums">{appointmentId.slice(0, 12)}{appointmentId.length > 12 ? '…' : ''}</code>.
              This usually means one of three things:
            </p>
          </>}
          {kind === 'forbidden' && <>
            <h1 className="font-serif text-2xl md:text-3xl text-kerala-700">This consultation isn&apos;t yours</h1>
            <p className="text-muted mt-3 text-sm leading-relaxed">
              You&apos;re signed in, but the consultation room belongs to a different patient or doctor. Only the assigned patient and doctor can join.
            </p>
          </>}
          {kind === 'fetch-failed' && <>
            <h1 className="font-serif text-2xl md:text-3xl text-kerala-700">Couldn&apos;t load the consultation</h1>
            <p className="text-muted mt-3 text-sm leading-relaxed">
              The server isn&apos;t responding. Try again in a moment, or contact support if this keeps happening.
              {detail && <span className="block mt-2 font-mono text-xs text-gray-400">({detail})</span>}
            </p>
          </>}
        </div>

        {kind === 'not-found' && (
          <div className="space-y-3">
            <div className="p-4 bg-white rounded-card border border-gray-100">
              <h3 className="font-semibold text-sm text-kerala-700">1 · You haven&apos;t booked a consultation yet</h3>
              <p className="text-sm text-gray-700 mt-1.5">Find a CCIM-verified doctor and book a video appointment — the consultation link arrives in your appointments dashboard.</p>
              <Link href="/doctors" className="mt-3 inline-flex items-center gap-1.5 text-sm text-kerala-700 hover:underline font-semibold">
                Browse doctors →
              </Link>
            </div>
            <div className="p-4 bg-white rounded-card border border-gray-100">
              <h3 className="font-semibold text-sm text-kerala-700">2 · You followed an old or copy-pasted link</h3>
              <p className="text-sm text-gray-700 mt-1.5">Open your appointments dashboard — click &ldquo;Open consultation room&rdquo; on the booking you want to join. The ID in the URL must match a real appointment.</p>
              <Link href="/dashboard/appointments" className="mt-3 inline-flex items-center gap-1.5 text-sm text-kerala-700 hover:underline font-semibold">
                My appointments →
              </Link>
            </div>
            <div className="p-4 bg-white rounded-card border border-gray-100">
              <h3 className="font-semibold text-sm text-kerala-700">3 · The appointment was cancelled or declined</h3>
              <p className="text-sm text-gray-700 mt-1.5">Cancelled or declined bookings don&apos;t have an active consultation room. Re-book with the same doctor or pick another one.</p>
              <Link href="/doctors" className="mt-3 inline-flex items-center gap-1.5 text-sm text-kerala-700 hover:underline font-semibold">
                Find a doctor →
              </Link>
            </div>
          </div>
        )}

        {kind === 'forbidden' && (
          <div className="p-4 bg-white rounded-card border border-gray-100 text-sm">
            <p className="text-gray-700">If this is your appointment, you may be signed in with the wrong account.</p>
            <div className="mt-4 flex gap-2 flex-wrap">
              <Link href="/dashboard/appointments" className="inline-flex items-center gap-1.5 px-4 py-2 bg-kerala-600 hover:bg-kerala-700 text-white rounded text-sm font-semibold">
                Open my appointments
              </Link>
              <Link href="/sign-in" className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded text-sm">
                Switch account
              </Link>
            </div>
          </div>
        )}

        {kind === 'fetch-failed' && (
          <div className="p-4 bg-white rounded-card border border-gray-100 text-sm">
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => window.location.reload()} className="inline-flex items-center gap-1.5 px-4 py-2 bg-kerala-600 hover:bg-kerala-700 text-white rounded text-sm font-semibold">
                Retry
              </button>
              <Link href="/contact" className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded text-sm">
                Contact support
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
