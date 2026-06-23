'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { DashboardLayout } from '@/components/DashboardLayout'
import { FileText, Trash2, ChevronDown, ChevronUp } from 'lucide-react'

interface Preventivo {
  id: string
  nome_cliente: string | null
  importo_totale: number | null
  stato: string
  testo_preventivo: string | null
  messaggio_cliente: string | null
  created_at: string
}

export default function Storico() {
  const [nomeAzienda, setNomeAzienda] = useState('')
  const [preventivi, setPreventivi] = useState<Preventivo[]>([])
  const [loading, setLoading] = useState(true)
  const [aperto, setAperto] = useState<string | null>(null)

  useEffect(() => { carica() }, [])

  async function carica() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/login'; return }
    const { data: prof } = await supabase.from('profiles').select('nome_azienda').eq('id', user.id).single()
    if (prof?.nome_azienda) setNomeAzienda(prof.nome_azienda)
    const { data } = await supabase
      .from('preventivi')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (data) setPreventivi(data)
    setLoading(false)
  }

  async function elimina(id: string) {
    if (!confirm('Eliminare questo preventivo?')) return
    await supabase.from('preventivi').delete().eq('id', id)
    setPreventivi(p => p.filter(x => x.id !== id))
  }

  async function cambiaStato(id: string, stato: string) {
    await supabase.from('preventivi').update({ stato }).eq('id', id)
    setPreventivi(p => p.map(x => x.id === id ? { ...x, stato } : x))
  }

  function scarica(p: Preventivo) {
    const blob = new Blob([p.testo_preventivo || ''], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `preventivo-${new Date(p.created_at).toLocaleDateString('it-IT').replace(/\//g, '-')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#0E9F8E] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <DashboardLayout nomeAzienda={nomeAzienda || 'Artigiano'} activeRoute="/dashboard/storico">
        {preventivi.length === 0 ? (
          <div className="text-center mt-16">
            <FileText size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Nessun preventivo salvato.</p>
            <button onClick={() => window.location.href = '/dashboard/nuovo'}
              className="mt-4 px-5 py-2.5 bg-[#0D1B2A] text-white rounded-xl text-sm font-semibold hover:bg-[#162540] transition-all">
              Genera il primo preventivo
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {preventivi.map(p => (
              <div key={p.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

                {/* Riga principale */}
                <div className="flex items-center gap-3 px-5 py-4">
                  <div className="w-9 h-9 bg-[#F0FDF4] rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText size={16} className="text-[#0E9F8E]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[#0D1B2A] truncate">
                      {p.nome_cliente || 'Cliente'}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {new Date(p.created_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-semibold text-[#0D1B2A]">
                      {p.importo_totale ? `€${p.importo_totale}` : '—'}
                    </div>
                    <select
                      value={p.stato}
                      onChange={e => cambiaStato(p.id, e.target.value)}
                      className={`text-xs mt-0.5 border-none outline-none cursor-pointer rounded-lg px-1 py-0.5 font-medium ${
                        p.stato === 'inviato' ? 'bg-[#E1F5EE] text-[#085041]' :
                        p.stato === 'accettato' ? 'bg-[#E6F1FB] text-[#0C447C]' :
                        p.stato === 'rifiutato' ? 'bg-[#FEE2E2] text-[#991B1B]' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                      <option value="bozza">bozza</option>
                      <option value="inviato">inviato</option>
                      <option value="accettato">accettato</option>
                      <option value="rifiutato">rifiutato</option>
                    </select>
                  </div>
                  <button onClick={() => setAperto(aperto === p.id ? null : p.id)}
                    className="text-gray-300 hover:text-gray-500 transition-colors ml-1 flex-shrink-0">
                    {aperto === p.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>

                {/* Dettaglio espandibile */}
                {aperto === p.id && (
                  <div className="border-t border-gray-100 px-5 py-4">
                    {p.testo_preventivo && (
                      <pre className="whitespace-pre-wrap font-sans text-xs text-gray-600 leading-relaxed bg-[#F7F8FA] rounded-xl p-4 mb-4">
                        {p.testo_preventivo}
                      </pre>
                    )}
                    <div className="flex gap-2">
                      <button onClick={() => scarica(p)}
                        className="px-3 py-1.5 bg-[#0D1B2A] text-white rounded-lg text-xs font-semibold hover:bg-[#162540] transition-all">
                        Scarica
                      </button>
                      <button onClick={() => elimina(p.id)}
                        className="px-3 py-1.5 border border-red-200 text-red-500 rounded-lg text-xs font-semibold hover:bg-red-50 transition-all flex items-center gap-1">
                        <Trash2 size={12} />
                        Elimina
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
    </DashboardLayout>
  )
}