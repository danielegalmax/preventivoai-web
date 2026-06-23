'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  getProdottiUtente,
  eliminaProdotto,
  type ProdottoDigitale,
} from '@/lib/prodotti'
import { formatEuro } from '@/lib/formatEuro'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Plus, Copy, Pencil, Trash2, Package, Link2 } from 'lucide-react'

type ProdottoConVendite = ProdottoDigitale & { vendite: number }

export default function ProdottiPage() {
  const [nomeAzienda, setNomeAzienda] = useState('')
  const [prodotti, setProdotti] = useState<ProdottoConVendite[]>([])
  const [loading, setLoading] = useState(true)
  const [copiato, setCopiato] = useState<string | null>(null)
  const [mostraBannerStripe, setMostraBannerStripe] = useState(false)

  useEffect(() => {
    void carica()
  }, [])

  async function carica() {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      window.location.href = '/login'
      return
    }

    const { data: prof } = await supabase
      .from('profiles')
      .select('nome_azienda, stripe_account_id, stripe_charges_enabled')
      .eq('id', user.id)
      .single()
    if (prof?.nome_azienda) setNomeAzienda(prof.nome_azienda)
    setMostraBannerStripe(prof?.stripe_charges_enabled !== true)

    try {
      const lista = await getProdottiUtente(user.id)
      const conVendite: ProdottoConVendite[] = await Promise.all(
        lista.map(async (p) => {
          const { count } = await supabase
            .from('acquisti_prodotti')
            .select('*', { count: 'exact', head: true })
            .eq('prodotto_id', p.id)
            .eq('pagato', true)
          return { ...p, vendite: count ?? 0 }
        })
      )
      setProdotti(conVendite)
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
    <DashboardLayout
      nomeAzienda={nomeAzienda || 'Artigiano'}
      activeRoute="/dashboard/prodotti"
    >
      <div className="-mx-4 -mt-8 px-4 pt-8 pb-10 min-h-[calc(100vh-120px)] bg-gradient-to-b from-[#F0FDFB] to-[#F7F8FA]">
        {mostraBannerStripe && (
          <div className="mb-6 rounded-xl border border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 text-sm text-amber-900 shadow-sm">
            ⚠️ Collega il tuo account Stripe per ricevere i pagamenti dei tuoi
            prodotti digitali. I pagamenti verranno gestiti dalla piattaforma
            fino alla connessione.
          </div>
        )}

        <div className="flex items-start gap-4 mb-2">
          <div className="w-14 h-14 rounded-2xl bg-[#E1F5EE] flex items-center justify-center shrink-0">
            <Package size={28} className="text-[#0E9F8E]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-[#0D1B2A] tracking-tight">
                Prodotti digitali
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#0D1B2A] text-[#2DD4BF] px-2 py-0.5 rounded-full">
                BETA
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1 max-w-lg">
              Crea e vendi i tuoi contenuti digitali direttamente ai clienti
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => (window.location.href = '/dashboard/prodotti/nuovo')}
          className="w-full mt-8 mb-6 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-[#0E9F8E] rounded-2xl py-10 px-6 bg-white/60 hover:bg-white hover:border-[#0b8a7a] transition-all group"
        >
          <div className="w-12 h-12 rounded-full bg-[#E1F5EE] flex items-center justify-center group-hover:scale-105 transition-transform">
            <Plus size={24} className="text-[#0E9F8E]" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-[#0D1B2A]">
              {prodotti.length === 0
                ? 'Crea il tuo primo prodotto'
                : 'Nuovo prodotto'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Guide, template, file e contenuti scaricabili
            </p>
          </div>
        </button>

        {prodotti.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center shadow-sm">
            <Package size={36} className="text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">
              Nessun prodotto ancora. Inizia dal pulsante sopra.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {prodotti.map((p) => (
              <div
                key={p.id}
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h3 className="text-lg font-bold text-[#0D1B2A]">
                        {p.titolo}
                      </h3>
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          p.attivo
                            ? 'bg-[#E1F5EE] text-[#085041]'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {p.attivo ? 'Attivo' : 'Inattivo'}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-[#0E9F8E]">
                      {formatEuro(p.prezzo)}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      <span className="font-semibold text-[#0D1B2A]">
                        {p.vendite}
                      </span>{' '}
                      {p.vendite === 1 ? 'vendita' : 'vendite'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 p-3 bg-[#F7F8FA] rounded-xl border border-gray-100">
                  <Link2 size={14} className="text-gray-400 shrink-0" />
                  <span className="text-xs font-mono text-gray-500 truncate flex-1">
                    /store/{p.slug}
                  </span>
                  <button
                    type="button"
                    onClick={() => copiaLink(p.slug)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#0E9F8E] hover:bg-[#E1F5EE] rounded-lg transition-colors shrink-0"
                  >
                    <Copy size={12} />
                    {copiato === p.slug ? 'Copiato!' : 'Copia'}
                  </button>
                </div>

                <div className="flex items-center gap-2 mt-4 flex-wrap">
                  <button
                    type="button"
                    onClick={() =>
                      (window.location.href = `/dashboard/prodotti/${p.id}`)
                    }
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-[#0D1B2A] text-white rounded-xl hover:bg-[#162540] transition-all"
                  >
                    <Pencil size={14} />
                    Modifica
                  </button>
                  <button
                    type="button"
                    onClick={() => handleElimina(p.id, p.titolo)}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-red-200 text-red-500 rounded-xl hover:bg-red-50 transition-all"
                  >
                    <Trash2 size={14} />
                    Elimina
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
