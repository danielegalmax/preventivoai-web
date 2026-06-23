'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getProdottiUtente } from '@/lib/prodotti'
import { formatEuro } from '@/lib/formatEuro'
import { DashboardLayout } from '@/components/DashboardLayout'
import {
  PreventiviTable,
  salutoOrario,
  dataItalianaMaiuscola,
  type PreventivoRow,
} from '@/components/PreventiviTable'
import {
  FileText,
  CreditCard,
  ShoppingBag,
  Smartphone,
  Package,
  ArrowRight,
} from 'lucide-react'

const PREVENTIVI_SELECT = `
  id, nome_cliente, importo_totale, stato, created_at, pdf_url, numero_preventivo, titolo, pagato,
  preventivo_invii ( link_token, revocato_at, scade_at, inviato_at )
`

export default function Dashboard() {
  const [nomeAzienda, setNomeAzienda] = useState('')
  const [totalePreventivi, setTotalePreventivi] = useState(0)
  const [incassatoTotale, setIncassatoTotale] = useState(0)
  const [totaleVendite, setTotaleVendite] = useState(0)
  const [ultimiPreventivi, setUltimiPreventivi] = useState<PreventivoRow[]>([])
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

    const { data: pagati } = await supabase
      .from('preventivi')
      .select('importo_totale')
      .eq('user_id', user.id)
      .eq('pagato', true)
    setIncassatoTotale(
      pagati?.reduce((acc, r) => acc + (r.importo_totale || 0), 0) ?? 0
    )

    const { data: prevs } = await supabase
      .from('preventivi')
      .select(PREVENTIVI_SELECT)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)
    if (prevs) setUltimiPreventivi(prevs as PreventivoRow[])

    const prodotti = await getProdottiUtente(user.id)
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

  const nomeDisplay = nomeAzienda || 'Artigiano'
  const incassatoLabel = formatEuro(incassatoTotale) ?? '€0,00'

  return (
    <DashboardLayout nomeAzienda={nomeDisplay} activeRoute="/dashboard">
      <div className="mb-8">
        <p className="text-xs font-medium text-gray-400 tracking-wide">
          {dataItalianaMaiuscola()}
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0D1B2A] tracking-tight mt-1">
          Buon {salutoOrario()}, {nomeDisplay}! 👋
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Panoramica della tua attività su PreventivoAI
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs text-gray-500">Preventivi creati</p>
            <p className="text-3xl font-bold text-[#0D1B2A] mt-1">
              {totalePreventivi}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#F7F8FA] flex items-center justify-center">
            <FileText size={20} className="text-gray-400" />
          </div>
        </div>

        <div className="bg-[#0D1B2A] border border-[#0D1B2A] rounded-2xl p-5 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs text-gray-400">Incassato totale</p>
            <p className="text-3xl font-bold text-white mt-1">{incassatoLabel}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <CreditCard size={20} className="text-[#2DD4BF]" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs text-gray-500">Vendite prodotti digitali</p>
            <p className="text-3xl font-bold text-[#0E9F8E] mt-1">
              {totaleVendite}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] flex items-center justify-center">
            <ShoppingBag size={20} className="text-[#0E9F8E]" />
          </div>
        </div>
      </div>

      <div className="bg-[#0D1B2A] border-2 border-[#0E9F8E] rounded-2xl p-6 sm:p-8 mb-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="max-w-xl">
          <h2 className="text-lg font-semibold text-white">
            Gestisci i tuoi preventivi dall&apos;app
          </h2>
          <p className="text-sm text-gray-400 mt-2 leading-relaxed">
            Crea preventivi con AI, gestisci clienti, piani di pagamento e
            molto altro dall&apos;app mobile o desktop.
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            <a
              href="#"
              className="px-4 py-2 text-sm font-medium text-white border border-white/40 rounded-xl hover:bg-white/10 transition-colors"
            >
              Scarica app Android
            </a>
            <a
              href="#"
              className="px-4 py-2 text-sm font-medium text-white border border-white/40 rounded-xl hover:bg-white/10 transition-colors"
            >
              Scarica app Windows
            </a>
          </div>
        </div>
        <Smartphone
          size={72}
          className="text-[#0E9F8E]/40 shrink-0 hidden sm:block"
          strokeWidth={1.25}
        />
      </div>

      <Link
        href="/dashboard/prodotti"
        className="flex items-center justify-between gap-4 bg-[#0E9F8E] text-white rounded-xl p-6 mb-8 shadow-sm hover:bg-[#0b8a7a] transition-colors group"
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <Package size={24} />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-lg">I tuoi prodotti digitali</p>
            <p className="text-sm text-white/80 mt-0.5">
              Vendi guide, template e file ai tuoi clienti
            </p>
          </div>
        </div>
        <ArrowRight
          size={22}
          className="shrink-0 group-hover:translate-x-0.5 transition-transform"
        />
      </Link>

      <PreventiviTable
        preventivi={ultimiPreventivi}
        showHeaderLink
        title="Storico preventivi"
        subtitle="Ultimi 5 preventivi"
      />
    </DashboardLayout>
  )
}
