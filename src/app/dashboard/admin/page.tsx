'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface StatoGenerale {
  totale_utenti: number
  utenti_attivi_7gg: number
  preventivi_totali: number
  preventivi_oggi: number
  token_input_totali: number
  token_output_totali: number
  costo_totale_euro: number
  costo_oggi_euro: number
}

interface EventoRaw {
  evento: string
  schermata: string | null
  user_id: string
}

interface EventoFrequente {
  evento: string
  count: number
  schermata: string | null
}

type FiltroPiattaforma = 'tutte' | 'mobile' | 'desktop'

interface UsaggioEndpoint {
  endpoint: string
  chiamate: number
  token_totali: number
  costo_euro: number
  latenza_media: number
}

interface UtenteAttivo {
  user_id: string
  email: string
  nome_azienda: string
  num_preventivi: number
  ultimo_accesso: string
  numero_sessioni: number
  costo_euro: number
}

interface FeatureAdoption {
  evento: string
  utenti_unici: number
  pct: number
}

interface VenditaProdottoRiga {
  prodotto_id: string
  titolo: string
  creator: string
  vendite: number
  incassato: number
}

interface VenditeSommario {
  totale_vendite: number
  totale_incassato: number
  commissioni: number
}

interface DettaglioUtente {
  schermate: { nome: string; count: number }[]
  feature: { nome: string; count: number }[]
  preventivi_count: number
  preventivi_importo: number
  prodotti_creati: number
  vendite_count: number
  vendite_incassato: number
  timeline: { evento: string; schermata: string | null; created_at: string }[]
}

type ProdottoDigitaleJoin = {
  titolo: string
  prezzo: number
  user_id: string
}

function parseProdottoJoin(raw: unknown): ProdottoDigitaleJoin | null {
  if (!raw || typeof raw !== 'object') return null
  const p = raw as ProdottoDigitaleJoin
  if (typeof p.titolo !== 'string' || typeof p.user_id !== 'string') return null
  return p
}

const NOMI_EVENTI: Record<string, string> = {
  firma_inviata: '✍️ Firma digitale',
  listino_foto: '📷 Listino da foto',
  listino_vocale: '🎙️ Listino vocale',
  listino_testo_ai: '🤖 Listino testo AI',
  servizio_manuale_aggiunto: '➕ Servizio manuale',
  abbonamento_creato: '📅 Piano pagamento',
  pagamento_registrato: '💰 Pagamento registrato',
  metodo_pagamento_selezionato: '💳 Metodo pagamento',
  pdf_generato: '📄 PDF generato',
  chat_messaggio: '💬 Chat AI',
  stripe_link_creato: '🔗 Link Stripe pagamento',
  schermata_aperta: '👁️ Visualizzazioni schermata',
  cliente_creato: '👤 Cliente creato',
  prodotto_venduto: '🛍️ Prodotto venduto',
  listino_smart: '🤖 Listino Smart AI',
  home_aperta: '🏠 Home aperta',
  storico_aperto: '📋 Storico aperto',
  clienti_aperti: '👥 Clienti aperti',
  cliente_dettaglio_aperto: '👤 Dettaglio cliente',
  chat_aperta: '💬 Chat aperta',
  builder_aperto: '🔨 Builder aperto',
  builder_pdf_generato: '📄 PDF da builder',
  preview_pdf_aperta: '👁️ Anteprima PDF',
  listino_aperto: '📝 Listino aperto',
  pdf_condiviso: '📤 PDF condiviso',
  prodotti_digitali_aperti: '🛍️ Prodotti digitali aperti',
}

const SCHERMATE_MOBILE = new Set([
  'home',
  'storico',
  'clienti',
  'builder',
  'preventivo_pdf',
  'cliente_dettaglio',
  'listino',
  'fiscale',
  'pagamenti',
])

const SCHERMATE_DESKTOP = new Set([
  'home',
  'storico',
  'clienti',
  'cliente_dettaglio',
  'listino',
  'fiscale',
  'pagamenti',
  'nuovo',
])

function filtraEventiPerPiattaforma(
  eventi: EventoRaw[],
  piattaforma: FiltroPiattaforma
): EventoRaw[] {
  if (piattaforma === 'tutte') return eventi
  const schermate =
    piattaforma === 'mobile' ? SCHERMATE_MOBILE : SCHERMATE_DESKTOP
  return eventi.filter((e) => e.schermata != null && schermate.has(e.schermata))
}

function calcolaEventiFrequenti(eventi: EventoRaw[]): EventoFrequente[] {
  const conteggioEventi: Record<string, number> = {}
  const schermatePerEvento: Record<string, Record<string, number>> = {}

  eventi.forEach((e) => {
    conteggioEventi[e.evento] = (conteggioEventi[e.evento] || 0) + 1
    if (e.schermata) {
      if (!schermatePerEvento[e.evento]) schermatePerEvento[e.evento] = {}
      schermatePerEvento[e.evento][e.schermata] =
        (schermatePerEvento[e.evento][e.schermata] || 0) + 1
    }
  })

  return Object.entries(conteggioEventi)
    .map(([evento, count]) => {
      const schermate = schermatePerEvento[evento]
      const schermata =
        schermate &&
        Object.entries(schermate).sort((a, b) => b[1] - a[1])[0]?.[0]
      return { evento, count, schermata: schermata ?? null }
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
}

function calcolaFeatureAdoption(
  eventi: EventoRaw[],
  totaleUtenti: number
): FeatureAdoption[] {
  const adoption: Record<string, Set<string>> = {}
  eventi.forEach((r) => {
    if (!adoption[r.evento]) adoption[r.evento] = new Set()
    adoption[r.evento].add(r.user_id)
  })
  return Object.entries(adoption)
    .map(([evento, users]) => ({
      evento,
      utenti_unici: users.size,
      pct: totaleUtenti > 0 ? Math.round((users.size / totaleUtenti) * 100) : 0,
    }))
    .sort((a, b) => b.utenti_unici - a.utenti_unici)
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [accesso, setAccesso] = useState(false)
  const [stato, setStato] = useState<StatoGenerale | null>(null)
  const [eventiCompleti, setEventiCompleti] = useState<EventoRaw[]>([])
  const [filtroPiattaforma, setFiltroPiattaforma] =
    useState<FiltroPiattaforma>('tutte')
  const [usaggioEndpoint, setUsaggioEndpoint] = useState<UsaggioEndpoint[]>([])
  const [utentiAttivi, setUtentiAttivi] = useState<UtenteAttivo[]>([])
  const [venditeSommario, setVenditeSommario] = useState<VenditeSommario | null>(null)
  const [venditeProdotti, setVenditeProdotti] = useState<VenditaProdottoRiga[]>([])
  const [utenteEspanso, setUtenteEspanso] = useState<string | null>(null)
  const [dettaglioUtente, setDettaglioUtente] = useState<DettaglioUtente | null>(null)
  const [dettaglioLoading, setDettaglioLoading] = useState(false)
  const [periodoGiorni, setPeriodoGiorni] = useState(7)

  const eventiFiltrati = useMemo(
    () => filtraEventiPerPiattaforma(eventiCompleti, filtroPiattaforma),
    [eventiCompleti, filtroPiattaforma]
  )
  const eventiFrequenti = useMemo(
    () => calcolaEventiFrequenti(eventiFiltrati),
    [eventiFiltrati]
  )
  const featureAdoption = useMemo(
    () => calcolaFeatureAdoption(eventiFiltrati, stato?.totale_utenti ?? 0),
    [eventiFiltrati, stato?.totale_utenti]
  )

  useEffect(() => { checkAdmin() }, [])
  useEffect(() => {
    if (accesso) {
      setUtenteEspanso(null)
      setDettaglioUtente(null)
      void caricaDati()
    }
  }, [accesso, periodoGiorni])

  async function checkAdmin() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/login'; return }
    const { data } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
    if (!data?.is_admin) { window.location.href = '/dashboard'; return }
    setAccesso(true)
    setLoading(false)
  }

  function getDataInizioStr() {
    const dataInizio = new Date()
    dataInizio.setDate(dataInizio.getDate() - periodoGiorni)
    return dataInizio.toISOString()
  }

  async function caricaDettaglioUtente(userId: string) {
    setDettaglioLoading(true)
    const inizio = getDataInizioStr()

    const [
      { data: eventi },
      { data: preventivi },
      { count: prodottiCount },
      { data: venditeUtente },
    ] = await Promise.all([
      supabase
        .from('eventi')
        .select('evento, schermata, created_at')
        .eq('user_id', userId)
        .gte('created_at', inizio)
        .order('created_at', { ascending: false }),
      supabase
        .from('preventivi')
        .select('importo_totale')
        .eq('user_id', userId)
        .gte('created_at', inizio),
      supabase
        .from('prodotti_digitali')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId),
      supabase
        .from('acquisti_prodotti')
        .select('prodotto_id, prodotti_digitali!inner(prezzo, user_id)')
        .eq('pagato', true)
        .eq('prodotti_digitali.user_id', userId)
        .gte('created_at', inizio),
    ])

    const schermateMap: Record<string, number> = {}
    const featureMap: Record<string, number> = {}
    eventi?.forEach((e) => {
      if (e.evento === 'schermata_aperta' && e.schermata) {
        schermateMap[e.schermata] = (schermateMap[e.schermata] || 0) + 1
      } else if (e.evento !== 'schermata_aperta') {
        featureMap[e.evento] = (featureMap[e.evento] || 0) + 1
      }
    })

    let venditeCount = 0
    let venditeIncassato = 0
    venditeUtente?.forEach((v) => {
      const pd = parseProdottoJoin(v.prodotti_digitali)
      if (!pd) return
      venditeCount++
      venditeIncassato += pd.prezzo || 0
    })

    setDettaglioUtente({
      schermate: Object.entries(schermateMap)
        .map(([nome, count]) => ({ nome, count }))
        .sort((a, b) => b.count - a.count),
      feature: Object.entries(featureMap)
        .map(([nome, count]) => ({ nome, count }))
        .sort((a, b) => b.count - a.count),
      preventivi_count: preventivi?.length || 0,
      preventivi_importo: preventivi?.reduce((a, p) => a + (p.importo_totale || 0), 0) || 0,
      prodotti_creati: prodottiCount || 0,
      vendite_count: venditeCount,
      vendite_incassato: venditeIncassato,
      timeline: (eventi || []).slice(0, 10).map((e) => ({
        evento: e.evento,
        schermata: e.schermata,
        created_at: e.created_at,
      })),
    })
    setDettaglioLoading(false)
  }

  function toggleUtente(userId: string) {
    if (utenteEspanso === userId) {
      setUtenteEspanso(null)
      setDettaglioUtente(null)
      return
    }
    setUtenteEspanso(userId)
    setDettaglioUtente(null)
    void caricaDettaglioUtente(userId)
  }

  async function caricaDati() {
    const dataInizioStr = getDataInizioStr()

    // Statistiche generali
    const [
      { count: totaleUtenti },
      { data: sessioniAttive },
      { count: preventiviTotali },
      { data: preventiviOggi },
      { data: aiUsage },
      { data: aiUsageOggi },
      { data: eventiRaw },
      { data: sessioniRaw },
      { data: vendite },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('sessioni').select('user_id').gte('ultimo_accesso', dataInizioStr),
      supabase.from('preventivi').select('*', { count: 'exact', head: true }),
      supabase.from('eventi').select('id').eq('evento', 'pdf_generato').gte('created_at', new Date().toISOString().split('T')[0]),
      supabase.from('ai_usage').select('token_input, token_output, costo_euro, endpoint, latenza_ms').gte('created_at', dataInizioStr),
      supabase.from('ai_usage').select('costo_euro').gte('created_at', new Date().toISOString().split('T')[0]),
      supabase.from('eventi').select('evento, schermata, user_id').gte('created_at', dataInizioStr),
      supabase.from('sessioni').select('user_id, ultimo_accesso, numero_sessioni').order('ultimo_accesso', { ascending: false }).limit(20),
      supabase
        .from('acquisti_prodotti')
        .select('prodotto_id, prodotti_digitali(titolo, prezzo, user_id), created_at')
        .eq('pagato', true)
        .gte('created_at', dataInizioStr),
    ])

    const tokenInput = aiUsage?.reduce((a, r) => a + (r.token_input || 0), 0) || 0
    const tokenOutput = aiUsage?.reduce((a, r) => a + (r.token_output || 0), 0) || 0
    const costoTotale = aiUsage?.reduce((a, r) => a + (r.costo_euro || 0), 0) || 0
    const costoOggi = aiUsageOggi?.reduce((a, r) => a + (r.costo_euro || 0), 0) || 0
    const totaleUtentiNum = totaleUtenti || 0

    setStato({
      totale_utenti: totaleUtentiNum,
      utenti_attivi_7gg: sessioniAttive?.length || 0,
      preventivi_totali: preventiviTotali || 0,
      preventivi_oggi: preventiviOggi?.length || 0,
      token_input_totali: tokenInput,
      token_output_totali: tokenOutput,
      costo_totale_euro: costoTotale,
      costo_oggi_euro: costoOggi,
    })

    setEventiCompleti((eventiRaw ?? []) as EventoRaw[])

    // Vendite prodotti digitali
    const venditePerProdotto: Record<string, { titolo: string; creatorId: string; vendite: number; incassato: number }> = {}
    let totaleVendite = 0
    let totaleIncassato = 0
    vendite?.forEach((v) => {
      const pd = parseProdottoJoin(v.prodotti_digitali)
      if (!pd) return
      totaleVendite++
      totaleIncassato += pd.prezzo || 0
      const key = v.prodotto_id as string
      if (!venditePerProdotto[key]) {
        venditePerProdotto[key] = { titolo: pd.titolo, creatorId: pd.user_id, vendite: 0, incassato: 0 }
      }
      venditePerProdotto[key].vendite++
      venditePerProdotto[key].incassato += pd.prezzo || 0
    })

    const creatorIds = [...new Set(Object.values(venditePerProdotto).map((p) => p.creatorId))]
    const { data: creatorProfiles } = creatorIds.length > 0
      ? await supabase.from('profiles').select('id, nome_azienda').in('id', creatorIds)
      : { data: [] as { id: string; nome_azienda: string | null }[] }

    setVenditeSommario({
      totale_vendite: totaleVendite,
      totale_incassato: totaleIncassato,
      commissioni: totaleIncassato * 0.01,
    })
    setVenditeProdotti(
      Object.entries(venditePerProdotto)
        .map(([prodotto_id, d]) => ({
          prodotto_id,
          titolo: d.titolo,
          creator: creatorProfiles?.find((p) => p.id === d.creatorId)?.nome_azienda || 'N/D',
          vendite: d.vendite,
          incassato: d.incassato,
        }))
        .sort((a, b) => b.vendite - a.vendite),
    )

    // Uso per endpoint
    const perEndpoint: Record<string, { chiamate: number; token: number; costo: number; latenza: number[] }> = {}
    aiUsage?.forEach(r => {
      if (!perEndpoint[r.endpoint]) perEndpoint[r.endpoint] = { chiamate: 0, token: 0, costo: 0, latenza: [] }
      perEndpoint[r.endpoint].chiamate++
      perEndpoint[r.endpoint].token += (r.token_input || 0) + (r.token_output || 0)
      perEndpoint[r.endpoint].costo += r.costo_euro || 0
      if (r.latenza_ms) perEndpoint[r.endpoint].latenza.push(r.latenza_ms)
    })
    setUsaggioEndpoint(Object.entries(perEndpoint).map(([endpoint, d]) => ({
      endpoint,
      chiamate: d.chiamate,
      token_totali: d.token,
      costo_euro: d.costo,
      latenza_media: d.latenza.length ? Math.round(d.latenza.reduce((a, b) => a + b, 0) / d.latenza.length) : 0
    })).sort((a, b) => b.chiamate - a.chiamate))

    // Utenti attivi con dati profilo
    if (sessioniRaw && sessioniRaw.length > 0) {
      const userIds = sessioniRaw.map(s => s.user_id)
      const { data: profili } = await supabase.from('profiles').select('id, nome_azienda').in('id', userIds)
      const { data: costiUtenti } = await supabase.from('ai_usage').select('user_id, costo_euro').in('user_id', userIds).gte('created_at', dataInizioStr)
      const { data: prevUtenti } = await supabase.from('preventivi').select('user_id').in('user_id', userIds)

      const costiPerUtente: Record<string, number> = {}
      costiUtenti?.forEach(r => { costiPerUtente[r.user_id] = (costiPerUtente[r.user_id] || 0) + (r.costo_euro || 0) })
      const prevPerUtente: Record<string, number> = {}
      prevUtenti?.forEach(r => { prevPerUtente[r.user_id] = (prevPerUtente[r.user_id] || 0) + 1 })

      setUtentiAttivi(sessioniRaw.map(s => {
        const profilo = profili?.find(p => p.id === s.user_id)
        return {
          user_id: s.user_id,
          email: s.user_id.slice(0, 8) + '...',
          nome_azienda: profilo?.nome_azienda || 'N/D',
          num_preventivi: prevPerUtente[s.user_id] || 0,
          ultimo_accesso: s.ultimo_accesso,
          numero_sessioni: s.numero_sessioni,
          costo_euro: costiPerUtente[s.user_id] || 0,
        }
      }))
    } else {
      setUtentiAttivi([])
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#0E9F8E] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!accesso) return null

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <header className="bg-[#0D1B2A] px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Admin Dashboard</h1>
          <p className="text-xs text-gray-400">PreventivoAI — solo tu vedi questa pagina</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={periodoGiorni}
            onChange={e => setPeriodoGiorni(Number(e.target.value))}
            className="text-xs bg-[#1a2d42] text-white border border-gray-600 rounded-lg px-3 py-1.5"
          >
            <option value={1}>Oggi</option>
            <option value={7}>Ultimi 7 giorni</option>
            <option value={30}>Ultimi 30 giorni</option>
            <option value={90}>Ultimi 90 giorni</option>
          </select>
          <button onClick={() => window.location.href = '/dashboard'} className="text-xs text-gray-400 hover:text-white">
            ← Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* Stats generali */}
        {stato && (
          <>
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Utenti</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Utenti totali', val: stato.totale_utenti, color: 'text-[#0D1B2A]' },
                  { label: `Attivi ${periodoGiorni}gg`, val: stato.utenti_attivi_7gg, color: 'text-[#0E9F8E]' },
                  { label: 'Preventivi totali', val: stato.preventivi_totali, color: 'text-[#0D1B2A]' },
                  { label: 'PDF oggi', val: stato.preventivi_oggi, color: 'text-[#0E9F8E]' },
                ].map(s => (
                  <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                    <div className={`text-2xl font-bold ${s.color}`}>{s.val}</div>
                    <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Costi AI</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: `Token input (${periodoGiorni}gg)`, val: stato.token_input_totali.toLocaleString(), color: 'text-[#0D1B2A]' },
                  { label: `Token output (${periodoGiorni}gg)`, val: stato.token_output_totali.toLocaleString(), color: 'text-[#0D1B2A]' },
                  { label: `Costo ${periodoGiorni}gg`, val: `€${stato.costo_totale_euro.toFixed(4)}`, color: 'text-orange-500' },
                  { label: 'Costo oggi', val: `€${stato.costo_oggi_euro.toFixed(4)}`, color: 'text-orange-500' },
                ].map(s => (
                  <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                    <div className={`text-2xl font-bold ${s.color}`}>{s.val}</div>
                    <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Uso per endpoint */}
        {usaggioEndpoint.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Endpoint AI</h2>
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Endpoint</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Chiamate</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Token totali</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Costo €</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Latenza ms</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {usaggioEndpoint.map(e => (
                    <tr key={e.endpoint} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-[#0D1B2A]">{e.endpoint}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{e.chiamate}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{e.token_totali.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-orange-500 font-medium">€{e.costo_euro.toFixed(4)}</td>
                      <td className="px-4 py-3 text-right text-gray-500">{e.latenza_media}ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Eventi frequenti */}
        {eventiFrequenti.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Funzioni più usate</h2>
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-8">#</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Funzione</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Piattaforma</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Utilizzo</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {eventiFrequenti.map((e, i) => {
                    const max = eventiFrequenti[0].count
                    const pct = Math.round((e.count / max) * 100)
                    return (
                      <tr key={e.evento} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-xs text-gray-400">{i + 1}</td>
                        <td className="px-4 py-3 text-sm text-[#0D1B2A]">
                          {NOMI_EVENTI[e.evento] ?? e.evento}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                          {e.schermata ?? '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="bg-gray-100 rounded-full h-2 min-w-[80px]">
                            <div
                              className="bg-[#0E9F8E] h-2 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                          {e.count}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Feature adoption */}
        {featureAdoption.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Feature adoption</h2>
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Feature</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Utenti unici</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">% sul totale utenti</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {featureAdoption.map((f) => (
                    <tr key={f.evento} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-[#0D1B2A]">
                        {NOMI_EVENTI[f.evento] ?? f.evento}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">{f.utenti_unici}</td>
                      <td className="px-4 py-3 text-right text-[#0E9F8E] font-medium">{f.pct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Vendite prodotti digitali */}
        {venditeSommario && (
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Vendite prodotti digitali</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                <div className="text-2xl font-bold text-[#0D1B2A]">{venditeSommario.totale_vendite}</div>
                <div className="text-xs text-gray-500 mt-1">Totale vendite</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                <div className="text-2xl font-bold text-[#0E9F8E]">€{venditeSommario.totale_incassato.toFixed(2)}</div>
                <div className="text-xs text-gray-500 mt-1">Totale incassato</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                <div className="text-2xl font-bold text-orange-500">€{venditeSommario.commissioni.toFixed(2)}</div>
                <div className="text-xs text-gray-500 mt-1">Commissioni piattaforma (1%)</div>
              </div>
            </div>
            {venditeProdotti.length > 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Prodotto</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Creator</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Vendite</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Incassato</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {venditeProdotti.map((v) => (
                      <tr key={v.prodotto_id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-[#0D1B2A]">{v.titolo}</td>
                        <td className="px-4 py-3 text-gray-600">{v.creator}</td>
                        <td className="px-4 py-3 text-right text-gray-700">{v.vendite}</td>
                        <td className="px-4 py-3 text-right text-[#0E9F8E] font-medium">€{v.incassato.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-6">Nessuna vendita nel periodo selezionato</p>
            )}
          </div>
        )}

        {/* Utenti attivi */}
        {utentiAttivi.length > 0 && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Utenti attivi
              </h2>
              <select
                value={filtroPiattaforma}
                onChange={(e) =>
                  setFiltroPiattaforma(e.target.value as FiltroPiattaforma)
                }
                className="text-xs bg-white text-[#0D1B2A] border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm"
              >
                <option value="tutte">Tutte le piattaforme</option>
                <option value="mobile">Mobile</option>
                <option value="desktop">Desktop</option>
              </select>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Azienda</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Preventivi</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Sessioni</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Costo AI</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Ultimo accesso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {utentiAttivi.map(u => (
                    <Fragment key={u.user_id}>
                      <tr
                        onClick={() => toggleUtente(u.user_id)}
                        className={`hover:bg-gray-50 cursor-pointer ${utenteEspanso === u.user_id ? 'bg-[#F0FDFB]' : ''}`}
                      >
                        <td className="px-4 py-3 font-medium text-[#0D1B2A]">
                          <span className="mr-2 text-gray-400">{utenteEspanso === u.user_id ? '▼' : '▶'}</span>
                          {u.nome_azienda}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700">{u.num_preventivi}</td>
                        <td className="px-4 py-3 text-right text-gray-700">{u.numero_sessioni}</td>
                        <td className="px-4 py-3 text-right text-orange-500">€{u.costo_euro.toFixed(4)}</td>
                        <td className="px-4 py-3 text-right text-gray-400 text-xs">
                          {new Date(u.ultimo_accesso).toLocaleDateString('it-IT')}
                        </td>
                      </tr>
                      {utenteEspanso === u.user_id && (
                        <tr>
                          <td colSpan={5} className="px-4 py-4 bg-gray-50 border-t border-gray-100">
                            {dettaglioLoading || !dettaglioUtente ? (
                              <div className="flex justify-center py-6">
                                <div className="w-5 h-5 border-2 border-[#0E9F8E] border-t-transparent rounded-full animate-spin" />
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                <div>
                                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Schermate visitate</h3>
                                  {dettaglioUtente.schermate.length === 0 ? (
                                    <p className="text-gray-400 text-xs">Nessuna</p>
                                  ) : (
                                    <ul className="space-y-1">
                                      {dettaglioUtente.schermate.map((s) => (
                                        <li key={s.nome} className="flex justify-between text-gray-700">
                                          <span className="font-mono text-xs">{s.nome}</span>
                                          <span className="font-semibold">{s.count}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                                <div>
                                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Feature usate</h3>
                                  {dettaglioUtente.feature.length === 0 ? (
                                    <p className="text-gray-400 text-xs">Nessuna</p>
                                  ) : (
                                    <ul className="space-y-1">
                                      {dettaglioUtente.feature.map((f) => (
                                        <li key={f.nome} className="flex justify-between text-gray-700">
                                          <span className="font-mono text-xs">{f.nome}</span>
                                          <span className="font-semibold">{f.count}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                                <div>
                                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Preventivi</h3>
                                  <p className="text-gray-700">
                                    {dettaglioUtente.preventivi_count} creati — €{dettaglioUtente.preventivi_importo.toFixed(2)} totale
                                  </p>
                                </div>
                                <div>
                                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Prodotti digitali</h3>
                                  <p className="text-gray-700">
                                    {dettaglioUtente.prodotti_creati} creati
                                    {dettaglioUtente.vendite_count > 0 && (
                                      <> — {dettaglioUtente.vendite_count} vendite (€{dettaglioUtente.vendite_incassato.toFixed(2)})</>
                                    )}
                                  </p>
                                </div>
                                <div className="md:col-span-2">
                                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Timeline ultimi eventi</h3>
                                  {dettaglioUtente.timeline.length === 0 ? (
                                    <p className="text-gray-400 text-xs">Nessun evento</p>
                                  ) : (
                                    <ul className="space-y-1.5">
                                      {dettaglioUtente.timeline.map((ev, i) => (
                                        <li key={i} className="flex items-center gap-3 text-xs text-gray-600">
                                          <span className="text-gray-400 w-32 shrink-0">
                                            {new Date(ev.created_at).toLocaleString('it-IT')}
                                          </span>
                                          <span className="font-mono text-[#0D1B2A]">{ev.evento}</span>
                                          {ev.schermata && (
                                            <span className="text-gray-400">({ev.schermata})</span>
                                          )}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {eventiFrequenti.length === 0 && usaggioEndpoint.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg font-medium">Nessun dato ancora</p>
            <p className="text-sm mt-1">I dati appariranno dopo le prime interazioni degli utenti</p>
          </div>
        )}

      </main>
    </div>
  )
}
