'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'none' | 'login' | 'signup'>('none')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  async function handleLogin() {
    if (!email || !password) return
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Invalid email or password')
      setLoading(false)
    } else {
      router.push('/')
    }
  }

  async function handleSignup() {
    if (!email || !password) return
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess('Account created! You can now log in.')
      setMode('login')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-mono overflow-hidden relative">

      {/* Grid background */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Accent lines */}
      <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-orange-500/30 to-transparent" style={{ left: '10%' }} />
      <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-orange-500/10 to-transparent" style={{ left: '90%' }} />
      <div className="absolute top-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" style={{ top: '30%' }} />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-12 py-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
          <span className="text-xs tracking-[0.3em] uppercase text-white/60">IRPC</span>
          <span className="text-white/20 text-xs">|</span>
          <span className="text-xs tracking-[0.2em] uppercase text-white/30">Industrial Robot Payload Checker</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setMode('login'); setError(''); setSuccess('') }}
            className="px-4 py-1.5 text-xs tracking-wider border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition-all rounded"
          >
            LOGIN
          </button>
          <button
            onClick={() => { setMode('signup'); setError(''); setSuccess('') }}
            className="px-4 py-1.5 text-xs tracking-wider bg-orange-600 hover:bg-orange-500 text-white transition-all rounded"
          >
            SIGN UP
          </button>
        </div>
      </header>

      <main className="relative z-10 flex min-h-[calc(100vh-73px)]">

        {/* Left — Hero */}
        <div className="flex-1 flex flex-col justify-center px-12 py-16 max-w-2xl">

          {/* Tag */}
          <div className="flex items-center gap-2 mb-8">
            <div className="h-px w-8 bg-orange-500" />
            <span className="text-xs tracking-[0.3em] uppercase text-orange-500">v2.0 — now available</span>
          </div>

          {/* Title */}
          <h1 className="text-5xl font-bold tracking-tight leading-tight mb-6" style={{ fontFamily: 'Georgia, serif' }}>
            Payload analysis<br />
            <span className="text-orange-500">engineered</span> for<br />
            precision.
          </h1>

          <p className="text-sm text-white/40 leading-relaxed mb-10 max-w-md">
            Calculate static moments, inertias, and combined loads for industrial robots. 
            Verify payload compliance across J4, J5, and J6 axes with engineering-grade accuracy.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mb-10">
            {[
              { value: '27+', label: 'FANUC robots' },
              { value: '6', label: 'axes analyzed' },
              { value: '3', label: 'load categories' },
            ].map(({ value, label }) => (
              <div key={label} className="border border-white/5 p-4 rounded">
                <div className="text-2xl font-bold text-orange-500 mb-1">{value}</div>
                <div className="text-xs text-white/30 tracking-wider uppercase">{label}</div>
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="flex flex-col gap-2">
            {[
              'Moment & inertia calculation per axis',
              'Combined load analysis (J4, J5, J6)',
              'OK / WARN / OVER status with thresholds',
              'Multi-manufacturer robot database',
            ].map(f => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-1 h-1 bg-orange-500 rounded-full flex-shrink-0" />
                <span className="text-xs text-white/40">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Form */}
        <div className="w-[420px] flex items-center justify-center px-8 border-l border-white/5">
          {mode === 'none' ? (
            <div className="text-center">
              <div className="w-16 h-16 border border-orange-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="w-2 h-2 bg-orange-500 rounded-full" />
              </div>
              <p className="text-xs text-white/30 tracking-wider uppercase mb-6">Get started</p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setMode('signup')}
                  className="px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white text-xs tracking-wider uppercase transition-all rounded"
                >
                  Create Account
                </button>
                <button
                  onClick={() => setMode('login')}
                  className="px-8 py-3 border border-white/10 hover:border-white/30 text-white/50 hover:text-white text-xs tracking-wider uppercase transition-all rounded"
                >
                  Sign In
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="px-8 py-3 text-white/20 hover:text-white/40 text-xs tracking-wider uppercase transition-all"
                >
                  Continue without account →
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full">
              {/* Form header */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <button
                    onClick={() => setMode('login')}
                    className={`text-xs tracking-wider uppercase pb-2 border-b-2 transition-all ${mode === 'login' ? 'border-orange-500 text-white' : 'border-transparent text-white/30 hover:text-white/50'}`}
                  >
                    Login
                  </button>
                  <span className="text-white/10 mx-2">|</span>
                  <button
                    onClick={() => setMode('signup')}
                    className={`text-xs tracking-wider uppercase pb-2 border-b-2 transition-all ${mode === 'signup' ? 'border-orange-500 text-white' : 'border-transparent text-white/30 hover:text-white/50'}`}
                  >
                    Sign Up
                  </button>
                </div>
              </div>

              {error && (
                <div className="border border-red-500/30 bg-red-500/10 rounded p-3 mb-4">
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}

              {success && (
                <div className="border border-green-500/30 bg-green-500/10 rounded p-3 mb-4">
                  <p className="text-xs text-green-400">{success}</p>
                </div>
              )}

              <div className="flex flex-col gap-4 mb-6">
                <div>
                  <label className="text-xs tracking-wider uppercase text-white/30 mb-2 block">Email</label>
                  <input
                    type="email"
                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-orange-500/50"
                    placeholder="engineer@company.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (mode === 'login' ? handleLogin() : handleSignup())}
                  />
                </div>
                <div>
                  <label className="text-xs tracking-wider uppercase text-white/30 mb-2 block">Password</label>
                  <input
                    type="password"
                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-orange-500/50"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (mode === 'login' ? handleLogin() : handleSignup())}
                  />
                </div>
              </div>

              <button
                onClick={mode === 'login' ? handleLogin : handleSignup}
                disabled={loading}
                className="w-full py-3 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white text-xs tracking-wider uppercase transition-all rounded mb-4"
              >
                {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>

              <button
                onClick={() => router.push('/')}
                className="w-full text-center text-xs text-white/20 hover:text-white/40 transition-all"
              >
                Continue without account →
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-white/5 px-12 py-3 flex items-center justify-between">
        <span className="text-xs text-white/15 tracking-wider">IRPC — Industrial Robot Payload Checker</span>
        <span className="text-xs text-white/15 tracking-wider">v2.0</span>
      </div>
    </div>
  )
}