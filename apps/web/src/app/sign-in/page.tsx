'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signIn, signUp } from '../../lib/auth-client'

function SignInForm() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') || '/'

  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const result = mode === 'sign-up'
        ? await signUp.email({ email, password, name: name || email.split('@')[0] })
        : await signIn.email({ email, password })

      if ((result as { error?: { message?: string } }).error) {
        setError((result as { error: { message?: string } }).error.message ?? 'Auth failed')
      } else {
        router.push(next)
        router.refresh()
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-lg border space-y-5">
      <div className="text-center">
        <Link href="/" className="text-2xl font-bold text-green-800">AyurConnect</Link>
        <p className="text-sm text-gray-500 mt-1">{mode === 'sign-up' ? 'Create your account' : 'Sign in to continue'}</p>
      </div>

      <div className="flex bg-gray-100 rounded p-0.5">
        <button
          onClick={() => setMode('sign-in')}
          className={`flex-1 py-1.5 text-sm rounded ${mode === 'sign-in' ? 'bg-white shadow' : 'text-gray-600'}`}
          type="button"
        >Sign in</button>
        <button
          onClick={() => setMode('sign-up')}
          className={`flex-1 py-1.5 text-sm rounded ${mode === 'sign-up' ? 'bg-white shadow' : 'text-gray-600'}`}
          type="button"
        >Sign up</button>
      </div>

      <form onSubmit={submit} className="space-y-3">
        {mode === 'sign-up' && (
          <label className="block">
            <span className="block text-xs font-medium text-gray-700 mb-1">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-600"
              placeholder="Your name"
            />
          </label>
        )}
        <label className="block">
          <span className="block text-xs font-medium text-gray-700 mb-1">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-600"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </label>
        <label className="block">
          <span className="block text-xs font-medium text-gray-700 mb-1">Password</span>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-600"
            placeholder="At least 8 characters"
            autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
          />
        </label>

        {error && <div className="p-2 rounded bg-red-50 text-red-700 text-sm">{error}</div>}

        <button
          type="submit"
          disabled={busy}
          className="w-full py-2 bg-green-700 text-white rounded font-medium hover:bg-green-800 disabled:opacity-50"
        >
          {busy ? '…' : mode === 'sign-up' ? 'Create account' : 'Sign in'}
        </button>
      </form>

      <div className="text-center text-xs text-gray-500 space-y-1">
        <div>
          New to AyurConnect? <Link href="/register" className="text-green-700 hover:underline font-medium">Choose your role to register</Link>
        </div>
        <div>
          <Link href="/" className="hover:underline">← back to site</Link>
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Suspense fallback={<div className="text-gray-500">Loading…</div>}>
        <SignInForm />
      </Suspense>
    </div>
  )
}
