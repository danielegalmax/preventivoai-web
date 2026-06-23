'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getProdottiUtente } from '@/lib/prodotti'
import { DashboardLayout } from '@/components/DashboardLayout'
import { FileText } from 'lucide-react'

interface Preventivo {
  id: string
  nome_cliente: string | null
  importo_totale: number | null
  stato: string
  created_at: string
}

export default function Dashboard() {
  const [nomeAzienda, setNomeAzienda] = useState('')
  const [totalePreventivi, setTotalePreventivi] = useState(0)
  const [ultimiPreventivi, setUltimiPreventivi] = useState<Preventivo[]>([])
  const [prodottiAttivi, setProdottiAttivi] = useState(0)
  const [totaleVendite, setTotaleVendite] = useState(0)
  const [loading, setLoading] = useState(true)

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

    const { count: countPreventivi } = await supabase
      .from('preventivi')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
    setTotalePreventivi(countPreventivi ?? 0)

    const { data: prevs } = await supabase
      .from('preventivi')
      .select('id, nome_cliente, importo_totale, stato, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)
    if (prevs) setUltimiPreventivi(prevs)

    const prodotti = await getProdottiUtente(user.id)
    setProdottiAttivi(prodotti.filter((p) => p.attivo).length)

    const productIds = prodotti.map((p) => p.id)
    if (productIds.length > 0) {
      const { count: countVendite } = await supabase
        .from('acquisti_prodotti')
        .select('*', { count: 'exact', head: true })
        .in('prodotto_id', productIds)
        .eq('pagato', true)
      setTotaleVendite(countVendite ?? 0)
    }

    setLoading(false)
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
      activeRoute="/dashboard"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-[#0D1B2A] tracking-tight">
          Panoramica
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Riepilogo della tua attività su PreventivoAI
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="text-2xl font-semibold text-[#0D1B2A]">
            {totalePreventivi}
          </div>
          <div className="text-xs text-gray-500 mt-1">Preventivi creati</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="text-2xl font-semibold text-[#0E9F8E]">
            {prodottiAttivi}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Prodotti digitali attivi
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="text-2xl font-semibold text-[#0D1B2A]">
            {totaleVendite}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Vendite prodotti digitali
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
          <FileText size={15} className="text-gray-400" />
          <span className="text-sm font-medium text-[#0D1B2A]">
            Ultimi preventivi
          </span>
        </div>

        {ultimiPreventivi.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-gray-400">
            Nessun preventivo ancora.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-50">
                  <th className="px-5 py-3 font-medium">Cliente</th>
                  <th className="px-5 py-3 font-medium">Importo</th>
                  <th className="px-5 py-3 font-medium">Stato</th>
                  <th className="px-5 py-3 font-medium">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {ultimiPreventivi.map((p) => (
                  <tr key={p.id}>
                    <td className="px-5 py-3.5 font-medium text-[#0D1B2A]">
                      {p.nome_cliente || 'Cliente'}
                    </td>
                    <td className="px-5 py-3.5 text-[#0D1B2A]">
                      {p.importo_totale ? `€${p.importo_totale}` : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`text-xs font-medium ${
                          p.stato === 'inviato'
                            ? 'text-[#0E9F8E]'
                            : 'text-gray-500'
                        }`}
                      >
                        {p.stato}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-400">
                      {new Date(p.created_at).toLocaleDateString('it-IT')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
