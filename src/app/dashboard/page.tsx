'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { LogOut, FileText, Plus, Settings, TrendingUp } from 'lucide-react'

interface Profile {
  nome_azienda: string | null
  plan: string
}

interface Preventivo {
  id: string
  nome_cliente: string | null
  importo_totale: number | null
  stato: string
  created_at: string
}

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [preventivi, setPreventivi] = useState<Preventivo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      window.location.href = '/login'
      return
    }
    await loadData(user.id)
    setLoading(false)
  }

  async function loadData(userId: string) {
    const { data: prof } = await supabase
      .from('profiles')
      .select('nome_azienda, plan')
      .eq('id', userId)
      .single()
    if (prof) setProfile(prof)

    const { data: prevs } = await supabase
      .from('preventivi')
      .select('id, nome_cliente, importo_totale, stato, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)
    if (prevs) setPreventivi(prevs)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#0E9F8E] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const nomeDisplay = profile?.nome_azienda || 'Artigiano'
  const plan = profile?.plan || 'starter'
  const planLabel = plan === 'pro' ? 'Pro' : plan === 'business' ? 'Business' : 'Starter'
  const planColor = plan === 'pro' ? 'bg-[#E1F5EE] text-[#085041]' : plan === 'business' ? 'bg-[#E6F1FB] text-[#0C447C]' : 'bg-gray-100 text-gray-600'
  const totaleValore = preventivi.reduce((acc, p) => acc + (p.importo_totale || 0), 0).toFixed(0)
  const minRisparmiate = Math.round(preventivi.length * 23)

  return (
    <div className="min-h-screen bg-[#F7F8FA]">

      <header className="bg-[#0D1B2A] px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-white tracking-tight">
          Preventivo<span className="text-[#2DD4BF]">AI</span>
        </h1>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${planColor}`}>
            {planLabel}
          </span>
          <button onClick={handleLogout} className="text-gray-400 hover:text-white transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">

        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-[#0D1B2A] tracking-tight">
            Ciao {nomeDisplay} 👋
          </h2>
          <p className="text-sm text-gray-500 mt-1">Cosa vuoi fare oggi?</p>
        </div>

        <div className="flex items-center gap-4 bg-[#0D1B2A] text-white rounded-2xl p-6 mb-6 cursor-pointer hover:bg-[#162540] transition-all"
          onClick={() => window.location.href = '/dashboard/nuovo'}>
          <div className="w-12 h-12 bg-[#0E9F8E] rounded-xl flex items-center justify-center flex-shrink-0">
            <Plus size={22} />
          </div>
          <div>
            <div className="font-semibold text-base">Genera nuovo preventivo</div>
            <div className="text-sm text-gray-400 mt-0.5">Incolla il messaggio del cliente e ricevi il PDF in 10 secondi</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center shadow-sm">
            <div className="text-2xl font-semibold text-[#0D1B2A]">{preventivi.length}</div>
            <div className="text-xs text-gray-500 mt-1">Preventivi</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center shadow-sm">
            <div className="text-2xl font-semibold text-[#0E9F8E]">€{totaleValore}</div>
            <div className="text-xs text-gray-500 mt-1">Valore totale</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center shadow-sm">
            <div className="text-2xl font-semibold text-[#0D1B2A]">{minRisparmiate}</div>
            <div className="text-xs text-gray-500 mt-1">Min. risparmiate</div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm mb-4">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <FileText size={15} className="text-gray-400" />
              <span className="text-sm font-medium text-[#0D1B2A]">Ultimi preventivi</span>
            </div>
            <span onClick={() => window.location.href = '/dashboard/storico'}
              className="text-xs text-[#0E9F8E] hover:underline cursor-pointer">
              Vedi tutti
            </span>
          </div>

          {preventivi.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <TrendingUp size={28} className="text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Nessun preventivo ancora.</p>
              <p className="text-xs text-gray-300 mt-1">Generane uno per iniziare.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {preventivi.map(p => (
                <div key={p.id} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <div className="text-sm font-medium text-[#0D1B2A]">
                      {p.nome_cliente || 'Cliente'}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {new Date(p.created_at).toLocaleDateString('it-IT')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-[#0D1B2A]">
                      {p.importo_totale ? `€${p.importo_totale}` : '—'}
                    </div>
                    <div className={`text-xs mt-0.5 ${p.stato === 'inviato' ? 'text-[#0E9F8E]' : 'text-gray-400'}`}>
                      {p.stato}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div onClick={() => window.location.href = '/dashboard/settings'}
          className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-5 py-4 shadow-sm hover:border-gray-300 transition-all cursor-pointer">
          <Settings size={16} className="text-gray-400" />
          <span className="text-sm text-gray-600">Impostazioni profilo e listino</span>
        </div>

      </main>
    </div>
  )
}