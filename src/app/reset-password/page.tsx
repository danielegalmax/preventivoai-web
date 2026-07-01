'use client'

import { FormEvent, useEffect, useState } from 'react'
import { CheckCircle2, Loader2, Lock, ShieldAlert } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type StatoLink = 'checking' | 'valid' | 'invalid' | 'success'

export default function ResetPasswordPage() {
  const [statoLink, setStatoLink] = useState<StatoLink>('checking')
  const [password, setPassword] = useState('')
  const [confermaPassword, setConfermaPassword] = useState('')
  const [errore, setErrore] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function preparaRecovery() {
      const code = new URLSearchParams(window.location.search).get('code')
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
      const accessToken = hash.get('access_token')
      const refreshToken = hash.get('refresh_token')
      const type = hash.get('type')

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        setStatoLink(error ? 'invalid' : 'valid')
        return
      }

      if (accessToken && refreshToken && type === 'recovery') {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

        setStatoLink(error ? 'invalid' : 'valid')
        return
      }

      const { data } = await supabase.auth.getSession()
      setStatoLink(data.session ? 'valid' : 'invalid')
    }

    preparaRecovery()
  }, [])

  async function aggiornaPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrore('')

    if (password.length < 6) {
      setErrore('La password deve contenere almeno 6 caratteri.')
      return
    }

    if (password !== confermaPassword) {
      setErrore('Le password non corrispondono.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) {
      setErrore(error.message)
      return
    }

    await supabase.auth.signOut()
    setStatoLink('success')
  }

  return (
    <main className="min-h-screen bg-[#F7F8FA] flex items-center justify-center px-4 py-10">
      <section className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-[#0D1B2A] tracking-tight">
            Previ<span className="text-[#0E9F8E]">Cloud</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">Reimposta la password</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          {statoLink === 'checking' && (
            <div className="flex flex-col items-center gap-3 text-center">
              <Loader2 size={22} className="animate-spin text-[#0E9F8E]" />
              <p className="text-sm text-gray-500">Verifica del link in corso...</p>
            </div>
          )}

          {statoLink === 'invalid' && (
            <div className="flex flex-col items-center gap-3 text-center">
              <ShieldAlert size={28} className="text-red-500" />
              <h2 className="text-lg font-semibold text-[#0D1B2A]">Link non valido o scaduto</h2>
              <p className="text-sm leading-6 text-gray-500">
                Richiedi un nuovo link dalla schermata di login dell&apos;app e riprova.
              </p>
            </div>
          )}

          {statoLink === 'success' && (
            <div className="flex flex-col items-center gap-3 text-center">
              <CheckCircle2 size={30} className="text-[#0E9F8E]" />
              <h2 className="text-lg font-semibold text-[#0D1B2A]">Password aggiornata</h2>
              <p className="text-sm leading-6 text-gray-500">
                Ora puoi tornare nell&apos;app e accedere con la nuova password.
              </p>
            </div>
          )}

          {statoLink === 'valid' && (
            <form onSubmit={aggiornaPassword} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-xs font-semibold text-gray-400 tracking-wide">
                  NUOVA PASSWORD
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    minLength={6}
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-[#F7F8FA] focus:bg-white focus:border-[#0E9F8E] outline-none transition-all"
                    placeholder="Minimo 6 caratteri"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="conferma-password" className="text-xs font-semibold text-gray-400 tracking-wide">
                  CONFERMA PASSWORD
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="conferma-password"
                    type="password"
                    value={confermaPassword}
                    onChange={(event) => setConfermaPassword(event.target.value)}
                    minLength={6}
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-[#F7F8FA] focus:bg-white focus:border-[#0E9F8E] outline-none transition-all"
                    placeholder="Ripeti la nuova password"
                  />
                </div>
              </div>

              {errore && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                  {errore}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#0D1B2A] text-white rounded-xl text-sm font-semibold hover:bg-[#162540] transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-1"
              >
                {loading && <Loader2 size={15} className="animate-spin" />}
                Aggiorna password
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  )
}
