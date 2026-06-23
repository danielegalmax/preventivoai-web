'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getProdottoBySlug, type ProdottoPubblico } from '@/lib/prodotti'
import { formatEuro } from '@/lib/formatEuro'
import { Loader2, ExternalLink, ShoppingCart } from 'lucide-react'

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
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-[#0E9F8E]" />
      </div>
    )
  }

  if (!prodotto) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center px-4">
        <div className="text-center">
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

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <header className="bg-[#0D1B2A] px-6 py-5">
        <h1 className="text-lg font-semibold text-white tracking-tight text-center">
          Preventivo<span className="text-[#2DD4BF]">AI</span>
          <span className="text-gray-400 font-normal text-sm ml-2">Store</span>
        </h1>
      </header>

      <main className="max-w-lg mx-auto px-4 py-10">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-[#0D1B2A] px-6 py-8 text-center">
            <h2 className="text-xl font-semibold text-white leading-snug">
              {prodotto.titolo}
            </h2>
            {prezzoFormatted && (
              <div className="text-3xl font-bold text-[#2DD4BF] mt-3">
                {prezzoFormatted}
              </div>
            )}
          </div>

          <div className="p-6">
            {prodotto.descrizione && (
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap mb-6">
                {prodotto.descrizione}
              </p>
            )}

            {prodotto.link_preview && (
              <a
                href={prodotto.link_preview}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 mb-6 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-[#0E9F8E] hover:text-[#0E9F8E] transition-all"
              >
                <ExternalLink size={16} />
                Guarda anteprima
              </a>
            )}

            {!prodotto.attivo ? (
              <div className="text-center py-4 text-sm text-gray-500 bg-gray-50 rounded-xl">
                Questo prodotto non è al momento disponibile.
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    La tua email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nome@email.com"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-[#F7F8FA] focus:bg-white focus:border-[#0E9F8E] outline-none"
                  />
                  <p className="text-xs text-gray-400 mt-1.5">
                    Riceverai il link download a questa email dopo il pagamento
                  </p>
                </div>

                {errore && (
                  <p className="text-sm text-red-500 mb-4 text-center">{errore}</p>
                )}

                <button
                  onClick={acquista}
                  disabled={checkoutLoading || !email.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#0E9F8E] text-white rounded-xl font-semibold text-sm hover:bg-[#0b8a7a] transition-all disabled:opacity-50"
                >
                  {checkoutLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <ShoppingCart size={18} />
                      Acquista
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-400 text-center mt-4">
                  Pagamento sicuro con Stripe
                </p>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
