'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface StatoGenerale {
  totale_utenti: number
  utenti_attivi_7gg: number
  preventivi_totali: number
  preventivi_oggi: number
  pdf_generati: number
  token_input_totali: number
  token_output_totali: number
  costo_totale_euro: number
  costo_oggi_euro: number
}

interface EventoFrequente {
  evento: string
  count: number
}

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

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [accesso, setAccesso] = useState(false)
  const [stato, setStato] = useState<StatoGenerale | null>(null)
  const [eventiFrequenti, setEventiFrequenti] = useState<EventoFrequente[]>([])
  const [usaggioEndpoint, setUsaggioEndpoint] = useState<UsaggioEndpoint[]>([])
  const [utentiAttivi, setUtentiAttivi] = useState<UtenteAttivo[]>([])
  const [periodoGiorni, setPeriodoGiorni] = useState(7)

  useEffect(() => { checkAdmin() }, [])
  useEffect(() => { if (accesso) caricaDati() }, [accesso, periodoGiorni])

  async function checkAdmin() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/login'; return }
    const { data } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
    if (!data?.is_admin) { window.location.href = '/dashboard'; return }
    setAccesso(true)
    setLoading(false)
  }

  async function caricaDati() {
    const dataInizio = new Date()
    dataInizio.setDate(dataInizio.getDate() - periodoGiorni)
    const dataInizioStr = dataInizio.toISOString()

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
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('sessioni').select('user_id').gte('ultimo_accesso', dataInizioStr),
      supabase.from('preventivi').select('*', { count: 'exact', head: true }),
      supabase.from('eventi').select('id').eq('evento', 'pdf_generato').gte('created_at', new Date().toISOString().split('T')[0]),
      supabase.from('ai_usage').select('token_input, token_output, costo_euro, endpoint, latenza_ms').gte('created_at', dataInizioStr),
      supabase.from('ai_usage').select('costo_euro').gte('created_at', new Date().toISOString().split('T')[0]),
      supabase.from('eventi').select('evento').gte('created_at', dataInizioStr),
      supabase.from('sessioni').select('user_id, ultimo_accesso, numero_sessioni').order('ultimo_accesso', { ascending: false }).limit(20),
    ])

    const tokenInput = aiUsage?.reduce((a, r) => a + (r.token_input || 0), 0) || 0
    const tokenOutput = aiUsage?.reduce((a, r) => a + (r.token_output || 0), 0) || 0
    const costoTotale = aiUsage?.reduce((a, r) => a + (r.costo_euro || 0), 0) || 0
    const costoOggi = aiUsageOggi?.reduce((a, r) => a + (r.costo_euro || 0), 0) || 0

    setStato({
      totale_utenti: totaleUtenti || 0,
      utenti_attivi_7gg: sessioniAttive?.length || 0,
      preventivi_totali: preventiviTotali || 0,
      preventivi_oggi: preventiviOggi?.length || 0,
      pdf_generati: preventiviOggi?.length || 0,
      token_input_totali: tokenInput,
      token_output_totali: tokenOutput,
      costo_totale_euro: costoTotale,
      costo_oggi_euro: costoOggi,
    })

    // Eventi frequenti
    const conteggioEventi: Record<string, number> = {}
    eventiRaw?.forEach(e => { conteggioEventi[e.evento] = (conteggioEventi[e.evento] || 0) + 1 })
    setEventiFrequenti(Object.entries(conteggioEventi).map(([evento, count]) => ({ evento, count })).sort((a, b) => b.count - a.count).slice(0, 10))

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
              <div className="divide-y divide-gray-50">
                {eventiFrequenti.map((e, i) => {
                  const max = eventiFrequenti[0].count
                  const pct = Math.round((e.count / max) * 100)
                  return (
                    <div key={e.evento} className="px-4 py-3 flex items-center gap-4">
                      <span className="text-xs text-gray-400 w-4">{i + 1}</span>
                      <span className="text-sm font-mono text-[#0D1B2A] w-48 flex-shrink-0">{e.evento}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div className="bg-[#0E9F8E] h-2 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-sm font-semibold text-gray-700 w-12 text-right">{e.count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Utenti attivi */}
        {utentiAttivi.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Utenti attivi</h2>
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
                    <tr key={u.user_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-[#0D1B2A]">{u.nome_azienda}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{u.num_preventivi}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{u.numero_sessioni}</td>
                      <td className="px-4 py-3 text-right text-orange-500">€{u.costo_euro.toFixed(4)}</td>
                      <td className="px-4 py-3 text-right text-gray-400 text-xs">
                        {new Date(u.ultimo_accesso).toLocaleDateString('it-IT')}
                      </td>
                    </tr>
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
