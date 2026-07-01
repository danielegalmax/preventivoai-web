'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  getProdottoBySlug,
  normalizzaLinkPreviewMultipli,
  type ProdottoPubblico,
} from '@/lib/prodotti'
import { formatEuro } from '@/lib/formatEuro'
import { Loader2, ExternalLink } from 'lucide-react'

export default function StorePage() {
  const params = useParams()
  const slug = params.slug as string

  const [prodotto, setProdotto] = useState<ProdottoPubblico | null>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [errore, setErrore] = useState('')

  useEffect(() => {
    getProdottoBySlug(slug)
      .then((p) => setProdotto(p))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [slug])

  async function acquista() {
    if (!email.trim() || !prodotto) return
    setCheckoutLoading(true)
    setErrore('')

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, email: email.trim() }),
      })
      const data = await res.json()

      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Errore durante il checkout')
      }

      window.location.href = data.url
    } catch (err) {
      setErrore(err instanceof Error ? err.message : 'Errore imprevisto')
      setCheckoutLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0D1B2A] to-[#1a2f45] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#2DD4BF]" />
      </div>
    )
  }

  if (!prodotto) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0D1B2A] to-[#1a2f45] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-md w-full shadow-xl">
          <h1 className="text-xl font-semibold text-[#0D1B2A]">
            Prodotto non trovato
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Il link potrebbe essere errato o il prodotto non è più disponibile.
          </p>
        </div>
      </div>
    )
  }

  const prezzoFormatted = formatEuro(prodotto.prezzo)
  const linkAnteprima = normalizzaLinkPreviewMultipli(
    prodotto.link_preview_multipli,
    prodotto.link_preview
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D1B2A] to-[#1a2f45] flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
          <div className="p-8">
            <span className="inline-block text-xs font-semibold uppercase tracking-wide text-[#0E9F8E] bg-[#E1F5EE] px-3 py-1 rounded-full mb-5">
              Prodotto digitale
            </span>

            <h1 className="text-2xl sm:text-3xl font-bold text-[#0D1B2A] leading-tight">
              {prodotto.titolo}
            </h1>

            {prodotto.descrizione && (
              <p className="text-sm text-gray-500 leading-relaxed mt-4 whitespace-pre-wrap">
                {prodotto.descrizione}
              </p>
            )}

            {prezzoFormatted && (
              <div className="text-4xl font-bold text-[#0E9F8E] mt-6">
                {prezzoFormatted}
              </div>
            )}

            {linkAnteprima.length > 0 && (
              <div
                className={`mt-6 flex gap-2 ${
                  linkAnteprima.length > 1
                    ? 'flex-col sm:flex-row sm:flex-wrap'
                    : 'flex-col'
                }`}
              >
                {linkAnteprima.map((url, index) => (
                  <a
                    key={`${url}-${index}`}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center gap-2 min-w-0 py-3 px-4 border border-[#0E9F8E] rounded-xl text-sm font-medium text-[#0E9F8E] hover:bg-[#E1F5EE] transition-all"
                  >
                    <ExternalLink size={16} className="shrink-0" />
                    {linkAnteprima.length === 1
                      ? 'Guarda anteprima'
                      : `Anteprima ${index + 1}`}
                  </a>
                ))}
              </div>
            )}

            <hr className="my-8 border-gray-100" />

            {!prodotto.attivo ? (
              <div className="text-center py-4 text-sm text-gray-500 bg-gray-50 rounded-xl">
                Questo prodotto non è al momento disponibile.
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#0D1B2A] mb-2">
                    La tua email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nome@email.com"
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm bg-[#F7F8FA] focus:bg-white focus:border-[#0E9F8E] outline-none transition-colors"
                  />
                </div>

                {errore && (
                  <p className="text-sm text-red-500 mb-4 text-center">{errore}</p>
                )}

                <button
                  onClick={acquista}
                  disabled={checkoutLoading || !email.trim()}
                  className="w-full py-4 bg-[#0E9F8E] text-white rounded-xl font-semibold text-base hover:bg-[#0b8a7a] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {checkoutLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    `Acquista ora — ${prezzoFormatted ?? ''}`
                  )}
                </button>

                <p className="text-xs text-gray-400 text-center mt-5">
                  Pagamento sicuro con Stripe • Ricevi il link via email
                </p>
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="pb-8 text-center">
        <p className="text-sm text-white/50">
          Previ<span className="text-[#2DD4BF]">Cloud</span>
        </p>
      </footer>
    </div>
  )
}
