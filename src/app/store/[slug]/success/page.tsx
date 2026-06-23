'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2, Download, CheckCircle, XCircle } from 'lucide-react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  const [stato, setStato] = useState<'loading' | 'ok' | 'errore'>('loading')
  const [linkDownload, setLinkDownload] = useState('')
  const [messaggio, setMessaggio] = useState('')

  useEffect(() => {
    if (!sessionId) {
      setStato('errore')
      setMessaggio('Sessione di pagamento non trovata')
      return
    }

    fetch('/api/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId }),
    })
      .then(async (res) => {
        const data = await res.json()
        if (res.ok && data.pagato && data.link_download) {
          setLinkDownload(data.link_download)
          setStato('ok')
        } else {
          setStato('errore')
          setMessaggio(data.error || 'Pagamento non verificato')
        }
      })
      .catch(() => {
        setStato('errore')
        setMessaggio('Errore nella verifica del pagamento')
      })
  }, [sessionId])

  if (stato === 'loading') {
    return (
      <div className="flex flex-col items-center py-12">
        <Loader2 size={32} className="animate-spin text-[#0E9F8E] mb-4" />
        <p className="text-sm text-gray-500">Verifica pagamento in corso...</p>
      </div>
    )
  }

  if (stato === 'errore') {
    return (
      <div className="flex flex-col items-center py-12 px-4 text-center">
        <XCircle size={48} className="text-red-400 mb-4" />
        <h2 className="text-lg font-semibold text-[#0D1B2A] mb-2">
          Qualcosa è andato storto
        </h2>
        <p className="text-sm text-gray-500">{messaggio}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center py-12 px-4 text-center">
      <CheckCircle size={48} className="text-[#0E9F8E] mb-4" />
      <h2 className="text-xl font-semibold text-[#0D1B2A] mb-2">
        Pagamento completato!
      </h2>
      <p className="text-sm text-gray-500 mb-8">
        Grazie per l&apos;acquisto. Ecco il tuo link download:
      </p>
      <a
        href={linkDownload}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-6 py-3.5 bg-[#0E9F8E] text-white rounded-xl font-semibold text-sm hover:bg-[#0b8a7a] transition-all"
      >
        <Download size={18} />
        Scarica il prodotto
      </a>
      <p className="text-xs text-gray-400 mt-6 max-w-xs">
        Salva questo link: potrai usarlo per scaricare il prodotto in qualsiasi
        momento.
      </p>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <header className="bg-[#0D1B2A] px-6 py-5">
        <h1 className="text-lg font-semibold text-white tracking-tight text-center">
          Preventivo<span className="text-[#2DD4BF]">AI</span>
          <span className="text-gray-400 font-normal text-sm ml-2">Store</span>
        </h1>
      </header>

      <main className="max-w-lg mx-auto px-4">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm mt-10">
          <Suspense
            fallback={
              <div className="flex flex-col items-center py-12">
                <Loader2 size={32} className="animate-spin text-[#0E9F8E]" />
              </div>
            }
          >
            <SuccessContent />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
