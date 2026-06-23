'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { DashboardLayout } from '@/components/DashboardLayout'
import {
  PreventiviTable,
  type PreventivoRow,
} from '@/components/PreventiviTable'
import { FileText, ChevronLeft, ChevronRight } from 'lucide-react'

const PAGE_SIZE = 10

const PREVENTIVI_SELECT = `
  id, nome_cliente, importo_totale, stato, created_at, pdf_url, numero_preventivo, titolo, pagato,
  preventivo_invii ( link_token, revocato_at, scade_at, inviato_at )
`

export default function Storico() {
  const [nomeAzienda, setNomeAzienda] = useState('')
  const [preventivi, setPreventivi] = useState<PreventivoRow[]>([])
  const [loading, setLoading] = useState(true)
  const [pagina, setPagina] = useState(0)

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
      .select('nome_azienda')
      .eq('id', user.id)
      .single()
    if (prof?.nome_azienda) setNomeAzienda(prof.nome_azienda)

    const { data } = await supabase
      .from('preventivi')
      .select(PREVENTIVI_SELECT)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (data) setPreventivi(data as PreventivoRow[])
    setLoading(false)
  }

  const totalePagine = Math.max(1, Math.ceil(preventivi.length / PAGE_SIZE))
  const paginaCorrente = Math.min(pagina, totalePagine - 1)
  const slice = preventivi.slice(
    paginaCorrente * PAGE_SIZE,
    paginaCorrente * PAGE_SIZE + PAGE_SIZE
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#0E9F8E] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <DashboardLayout nomeAzienda={nomeAzienda || 'Artigiano'}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0D1B2A] tracking-tight">
          Storico preventivi
        </h1>
        <p className="text-sm text-gray-500 mt-1">Tutti i tuoi preventivi</p>
      </div>

      {preventivi.length === 0 ? (
        <div className="text-center mt-16 bg-white border border-gray-200 rounded-2xl py-16 shadow-sm">
          <FileText size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Nessun preventivo salvato.</p>
        </div>
      ) : (
        <>
          <PreventiviTable
            preventivi={slice}
            title="Elenco preventivi"
            subtitle={`${preventivi.length} preventivi totali`}
          />

          {totalePagine > 1 && (
            <div className="flex items-center justify-between mt-4">
              <button
                type="button"
                onClick={() => setPagina((p) => Math.max(0, p - 1))}
                disabled={paginaCorrente === 0}
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl text-gray-600 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
                Precedente
              </button>
              <span className="text-sm text-gray-500">
                Pagina {paginaCorrente + 1} di {totalePagine}
              </span>
              <button
                type="button"
                onClick={() =>
                  setPagina((p) => Math.min(totalePagine - 1, p + 1))
                }
                disabled={paginaCorrente >= totalePagine - 1}
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl text-gray-600 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Successivo
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  )
}
