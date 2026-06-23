'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const TERMINI_PLACEHOLDER = `
TERMINI E CONDIZIONI DI UTILIZZO — PreventivoAI

1. Oggetto del servizio
PreventivoAI fornisce strumenti digitali per la creazione, gestione e invio di preventivi
destinati a professionisti e piccole imprese.

2. Registrazione e account
L'utente è responsabile della veridicità dei dati forniti in fase di registrazione e della
custodia delle proprie credenziali di accesso.

3. Utilizzo consentito
È vietato utilizzare il servizio per scopi illeciti, per inviare contenuti fraudolenti o per
tentare di compromettere la sicurezza della piattaforma.

4. Proprietà intellettuale
Il software, il marchio e i contenuti della piattaforma restano di proprietà di PreventivoAI.
I contenuti inseriti dall'utente restano di proprietà dell'utente.

5. Limitazione di responsabilità
PreventivoAI non è responsabile per danni indiretti derivanti dall'uso del servizio, né per
errori nei preventivi generati o inviati dall'utente.

6. Modifiche
Ci riserviamo il diritto di aggiornare questi termini. Le modifiche saranno comunicate
tramite la piattaforma o via email.

7. Legge applicabile
Per ogni controversia si applica la legge italiana. Foro competente: Italia.

Per maggiori dettagli consulta anche la Privacy Policy.
`.trim()

export default function BenvenutoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    void verificaAccesso()
  }, [])

  async function verificaAccesso() {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      window.location.href = '/login'
      return
    }

    const { data: prof } = await supabase
      .from('profiles')
      .select('termini_accettati')
      .eq('id', user.id)
      .single()

    if (prof?.termini_accettati) {
      router.replace('/dashboard')
      return
    }

    setLoading(false)
  }

  async function handleContinua() {
    if (!accepted) return
    setError('')
    setSubmitting(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      window.location.href = '/login'
      return
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        termini_accettati: true,
        termini_accettati_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      setError('Impossibile salvare l\'accettazione. Riprova.')
      setSubmitting(false)
      return
    }

    router.push('/scarica')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-[#0E9F8E]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col">
      <header className="bg-[#0D1B2A] px-6 py-4">
        <span className="text-lg font-semibold text-white tracking-tight">
          Preventivo<span className="text-[#2DD4BF]">AI</span>
        </span>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 py-10">
        <div className="w-full max-w-lg">
          <h1 className="text-2xl font-semibold text-[#0D1B2A] text-center">
            Benvenuto su PreventivoAI 👋
          </h1>
          <p className="text-sm text-gray-500 text-center mt-2 mb-6">
            Prima di continuare, leggi e accetta i termini
          </p>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="h-64 overflow-y-auto px-6 py-5 text-sm text-gray-600 leading-relaxed whitespace-pre-line border-b border-gray-100">
              {TERMINI_PLACEHOLDER}
            </div>

            <div className="px-6 py-5 flex flex-col gap-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#0E9F8E] focus:ring-[#0E9F8E]"
                />
                <span className="text-sm text-gray-700">
                  Ho letto e accetto i{' '}
                  <Link
                    href="/termini"
                    target="_blank"
                    className="text-[#0E9F8E] font-medium hover:underline underline-offset-2"
                  >
                    Termini e Condizioni
                  </Link>{' '}
                  e la{' '}
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="text-[#0E9F8E] font-medium hover:underline underline-offset-2"
                  >
                    Privacy Policy
                  </Link>
                </span>
              </label>

              {error && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={() => void handleContinua()}
                disabled={!accepted || submitting}
                className="w-full py-2.5 bg-[#0D1B2A] text-white rounded-xl text-sm font-semibold hover:bg-[#162540] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 size={15} className="animate-spin" />}
                Continua
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
