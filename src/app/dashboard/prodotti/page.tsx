'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  getProdottiUtente,
  eliminaProdotto,
  type ProdottoDigitale,
} from '@/lib/prodotti'
import { formatEuro } from '@/lib/formatEuro'
import {
  ArrowLeft,
  Plus,
  Copy,
  Pencil,
  Trash2,
  Package,
  ExternalLink,
} from 'lucide-react'

export default function ProdottiPage() {
  const [prodotti, setProdotti] = useState<ProdottoDigitale[]>([])
  const [loading, setLoading] = useState(true)
  const [copiato, setCopiato] = useState<string | null>(null)

  useEffect(() => {
    carica()
  }, [])

  async function carica() {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      window.location.href = '/login'
      return
    }

    try {
      const lista = await getProdottiUtente(user.id)
      setProdotti(lista)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  async function handleElimina(id: string, titolo: string) {
    if (!confirm(`Eliminare "${titolo}"?`)) return
    try {
      await eliminaProdotto(id)
      setProdotti((p) => p.filter((x) => x.id !== id))
    } catch (err) {
      console.error(err)
      alert('Errore durante l\'eliminazione')
    }
  }

  function copiaLink(slug: string) {
    const url = `${window.location.origin}/store/${slug}`
    navigator.clipboard.writeText(url)
    setCopiato(slug)
    setTimeout(() => setCopiato(null), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#0E9F8E] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <header className="bg-[#0D1B2A] px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => (window.location.href = '/dashboard')}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-base font-semibold text-white tracking-tight">
          Preventivo<span className="text-[#2DD4BF]">AI</span>
          <span className="text-gray-400 font-normal ml-2">— Prodotti digitali</span>
        </h1>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-[#0D1B2A] tracking-tight">
              I tuoi prodotti
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Vendi guide, template e file digitali ai tuoi clienti
            </p>
          </div>
        </div>

        <button
          onClick={() => (window.location.href = '/dashboard/prodotti/nuovo')}
          className="w-full flex items-center gap-4 bg-[#0D1B2A] text-white rounded-2xl p-5 mb-6 hover:bg-[#162540] transition-all"
        >
          <div className="w-11 h-11 bg-[#0E9F8E] rounded-xl flex items-center justify-center flex-shrink-0">
            <Plus size={20} />
          </div>
          <div className="text-left">
            <div className="font-semibold text-base">Nuovo prodotto</div>
            <div className="text-sm text-gray-400 mt-0.5">
              Crea un prodotto digitale da vendere online
            </div>
          </div>
        </button>

        {prodotti.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center shadow-sm">
            <Package size={36} className="text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">Nessun prodotto ancora.</p>
            <p className="text-xs text-gray-300 mt-1">
              Creane uno per iniziare a vendere.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {prodotti.map((p) => (
              <div
                key={p.id}
                className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-[#0D1B2A] truncate">
                        {p.titolo}
                      </h3>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          p.attivo
                            ? 'bg-[#E1F5EE] text-[#085041]'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {p.attivo ? 'Attivo' : 'Inattivo'}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-[#0E9F8E] mt-1">
                      {formatEuro(p.prezzo)}
                    </div>
                    <div className="text-xs text-gray-400 mt-1 font-mono truncate">
                      /store/{p.slug}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 flex-wrap">
                  <button
                    onClick={() => copiaLink(p.slug)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-gray-200 rounded-xl text-gray-600 hover:border-[#0E9F8E] hover:text-[#0E9F8E] transition-all"
                  >
                    <Copy size={13} />
                    {copiato === p.slug ? 'Copiato!' : 'Copia link'}
                  </button>
                  <a
                    href={`/store/${p.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-gray-200 rounded-xl text-gray-600 hover:border-gray-400 transition-all"
                  >
                    <ExternalLink size={13} />
                    Anteprima
                  </a>
                  <button
                    onClick={() =>
                      (window.location.href = `/dashboard/prodotti/${p.id}`)
                    }
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-gray-200 rounded-xl text-gray-600 hover:border-gray-400 transition-all"
                  >
                    <Pencil size={13} />
                    Modifica
                  </button>
                  <button
                    onClick={() => handleElimina(p.id, p.titolo)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-gray-200 rounded-xl text-red-500 hover:border-red-300 hover:bg-red-50 transition-all ml-auto"
                  >
                    <Trash2 size={13} />
                    Elimina
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
