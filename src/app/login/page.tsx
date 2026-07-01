'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getPostLoginPath } from '@/lib/postLogin'
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'

/** Imposta `true` per riattivare tab e form di registrazione. */
const BETA_REGISTRAZIONE_APERTA = false

function LoginContent() {
  const router = useRouter()
  const params = useSearchParams()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (mode === 'register' && BETA_REGISTRAZIONE_APERTA) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/dashboard` }
      })
      if (error) setError(error.message)
      else setSuccess('Controlla la tua email per confermare la registrazione.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError('Email o password non corretti.')
      else {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          const redirectPath = await getPostLoginPath(
            supabase,
            params.get('next') ?? '/dashboard'
          )
          router.push(redirectPath)
          router.refresh()
        }
      }
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col items-center justify-center px-4">

      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-[#0D1B2A] tracking-tight">
          Previ<span className="text-[#0E9F8E]">Cloud</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {mode === 'register' && BETA_REGISTRAZIONE_APERTA ? 'Crea il tuo account gratuito' : 'Bentornato'}
        </p>
      </div>

      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">

        {BETA_REGISTRAZIONE_APERTA ? (
          <div className="flex bg-[#F7F8FA] rounded-xl p-1 mb-6">
            <button
              onClick={() => { setMode('login'); setError(''); setSuccess('') }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'login'
                  ? 'bg-white text-[#0D1B2A] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Accedi
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); setSuccess('') }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'register'
                  ? 'bg-white text-[#0D1B2A] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Registrati
            </button>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">

          <div className="relative">
            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-[#F7F8FA] focus:bg-white focus:border-[#0E9F8E] outline-none transition-all"
            />
          </div>

          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm bg-[#F7F8FA] focus:bg-white focus:border-[#0E9F8E] outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {error}
            </div>
          )}

          {success && (
            <div className="text-xs text-green-700 bg-green-50 border border-green-100 rounded-xl px-3 py-2">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#0D1B2A] text-white rounded-xl text-sm font-semibold hover:bg-[#162540] transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-1"
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            {mode === 'login' || !BETA_REGISTRAZIONE_APERTA ? 'Accedi' : 'Crea account'}
          </button>

        </form>

        {mode === 'login' && (
          <p className="text-center text-xs text-gray-400 mt-4">
            <a href="/reset-password" className="hover:text-[#0D1B2A] underline underline-offset-2">
              Password dimenticata?
            </a>
          </p>
        )}

      </div>

      <p className="text-xs text-gray-400 mt-6 text-center">
        Continuando accetti i nostri{' '}
        <a href="/termini" className="underline underline-offset-2 hover:text-gray-600">Termini</a>
        {' '}e la{' '}
        <a href="/privacy" className="underline underline-offset-2 hover:text-gray-600">Privacy Policy</a>
      </p>

    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F7F8FA]" />}>
      <LoginContent />
    </Suspense>
  )
}