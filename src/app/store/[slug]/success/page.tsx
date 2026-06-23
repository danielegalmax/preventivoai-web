'use client'

import { useEffect, useState, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { getProdottoBySlug } from '@/lib/prodotti'
import { Loader2, Mail, XCircle } from 'lucide-react'

function SuccessContent() {
  const params = useParams()
  const slug = params.slug as string
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const email = searchParams.get('email') || ''

  const [stato, setStato] = useState<'loading' | 'ok' | 'errore'>('loading')
  const [titolo, setTitolo] = useState('il prodotto')
  const [messaggio, setMessaggio] = useState('')

  useEffect(() => {
    if (!sessionId) {
      setStato('errore')
      setMessaggio('Sessione di pagamento non trovata')
      return
    }

    void (async () => {
      try {
        const prodotto = await getProdottoBySlug(slug)
        if (prodotto?.titolo) setTitolo(prodotto.titolo)

        const res = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId }),
        })
        const data = await res.json()

        if (res.ok && data.pagato) {
          setStato('ok')
        } else {
          setStato('errore')
          setMessaggio(data.error || 'Pagamento non verificato')
        }
      } catch {
        setStato('errore')
        setMessaggio('Errore nella verifica del pagamento')
      }
    })()
  }, [sessionId, slug])

  if (stato === 'loading') {
    return (
      <div className="flex flex-col items-center py-16 px-6 text-center">
        <Loader2 size={36} className="animate-spin text-[#0E9F8E] mb-4" />
        <p className="text-sm text-gray-500">Verifica pagamento in corso...</p>
      </div>
    )
  }

  if (stato === 'errore') {
    return (
      <div className="flex flex-col items-center py-16 px-6 text-center">
        <XCircle size={56} className="text-red-400 mb-4" />
        <h2 className="text-lg font-semibold text-[#0D1B2A] mb-2">
          Qualcosa è andato storto
        </h2>
        <p className="text-sm text-gray-500">{messaggio}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center py-16 px-6 text-center">
      <h1 className="text-2xl sm:text-3xl font-bold text-[#0D1B2A] mb-6">
        Pagamento completato!
      </h1>
      <div className="w-20 h-20 rounded-full bg-[#E1F5EE] flex items-center justify-center mb-8">
        <Mail size={40} className="text-[#0E9F8E]" />
      </div>
      <p className="text-base text-[#0D1B2A] leading-relaxed max-w-md mb-3">
        Abbiamo inviato il link per scaricare{' '}
        <strong>{titolo}</strong>
        {email ? (
          <>
            {' '}
            all&apos;indirizzo <strong>{email}</strong>.
          </>
        ) : (
          '.'
        )}
      </p>
      <p className="text-sm text-gray-500 max-w-sm">
        Controlla la tua casella email (e la cartella spam).
      </p>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D1B2A] to-[#1a2f45] flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
          <Suspense
            fallback={
              <div className="flex flex-col items-center py-16">
                <Loader2 size={36} className="animate-spin text-[#0E9F8E]" />
              </div>
            }
          >
            <SuccessContent />
          </Suspense>
        </div>
      </main>
      <footer className="pb-8 text-center">
        <p className="text-sm text-white/50">
          Preventivo<span className="text-[#2DD4BF]">AI</span>
        </p>
      </footer>
    </div>
  )
}
