'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'

export default function Settings() {
  const [form, setForm] = useState({
    nome_azienda: '',
    categoria: 'idraulico',
    citta: '',
    piva: '',
    telefono: '',
    listino: '',
    tono: 'professionale e diretto',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => { caricaProfilo() }, [])

  async function caricaProfilo() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/login'; return }
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (data) setForm({
      nome_azienda: data.nome_azienda || '',
      categoria: data.categoria || 'idraulico',
      citta: data.citta || '',
      piva: data.piva || '',
      telefono: data.telefono || '',
      listino: data.listino || '',
      tono: data.tono || 'professionale e diretto',
    })
    setLoading(false)
  }

  async function salva() {
    setSaving(true)
    setSaved(false)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update(form).eq('id', user.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  function set(key: string, val: string) {
    setForm(f => ({ ...f, [key]: val }))
  }

  function addVoce(v: string) {
    setForm(f => ({ ...f, listino: f.listino ? f.listino + '\n' + v : v }))
  }

  if (loading) return (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#0E9F8E] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <header className="bg-[#0D1B2A] px-6 py-4 flex items-center gap-4">
        <button onClick={() => window.location.href = '/dashboard'}
          className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-base font-semibold text-white tracking-tight">
          Preventivo<span className="text-[#2DD4BF]">AI</span>
          <span className="text-gray-400 font-normal ml-2">— Impostazioni</span>
        </h1>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-4">
          <h2 className="text-base font-semibold text-[#0D1B2A] mb-5">Dati azienda</h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Nome / Azienda</label>
              <input value={form.nome_azienda} onChange={e => set('nome_azienda', e.target.value)}
                placeholder="es. Rossi Impianti"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-[#F7F8FA] focus:bg-white focus:border-[#0E9F8E] outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Categoria</label>
              <select value={form.categoria} onChange={e => set('categoria', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-[#F7F8FA] focus:bg-white focus:border-[#0E9F8E] outline-none">
                <option value="idraulico">🔧 Idraulico</option>
                <option value="elettricista">⚡ Elettricista</option>
                <option value="falegname">🪵 Falegname</option>
                <option value="estetista">💇 Estetista</option>
                <option value="imbianchino">🖌️ Imbianchino</option>
                <option value="fotografo">📸 Fotografo</option>
                <option value="altro">🔨 Altro</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Città</label>
              <input value={form.citta} onChange={e => set('citta', e.target.value)}
                placeholder="es. Roma"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-[#F7F8FA] focus:bg-white focus:border-[#0E9F8E] outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">P.IVA</label>
              <input value={form.piva} onChange={e => set('piva', e.target.value)}
                placeholder="es. 12345678901"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-[#F7F8FA] focus:bg-white focus:border-[#0E9F8E] outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Telefono</label>
            <input value={form.telefono} onChange={e => set('telefono', e.target.value)}
              placeholder="es. 339 1234567"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-[#F7F8FA] focus:bg-white focus:border-[#0E9F8E] outline-none" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-4">
          <h2 className="text-base font-semibold text-[#0D1B2A] mb-2">Listino prezzi</h2>
          <p className="text-xs text-gray-400 mb-4">L&apos;AI userà questi prezzi per ogni preventivo. Aggiornalo quando vuoi.</p>

          <div className="bg-[#F7F8FA] rounded-xl p-3 mb-3">
            <p className="text-xs text-gray-500 mb-2 font-medium">Aggiungi voci rapide:</p>
            <div className="flex flex-wrap gap-2">
              {['Sostituzione rubinetto: €80', 'Perdita tubo: €60-120', 'Cassetta WC: €70', 'Sblocco scarico: €55', 'Caldaia: €90', 'Urgenza: +50%'].map(v => (
                <span key={v} onClick={() => addVoce(v)}
                  className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-full cursor-pointer hover:border-[#0E9F8E] hover:text-[#0E9F8E] transition-all">
                  + {v}
                </span>
              ))}
            </div>
          </div>

          <textarea value={form.listino} onChange={e => set('listino', e.target.value)}
            rows={7} placeholder={'es. Sostituzione rubinetto: €80 manodopera + materiali\nPerdita tubo: €60-120\nUrgenza fuori orario: +50%'}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-[#F7F8FA] focus:bg-white focus:border-[#0E9F8E] outline-none resize-none leading-relaxed" />
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="text-base font-semibold text-[#0D1B2A] mb-4">Tono di comunicazione</h2>
          <select value={form.tono} onChange={e => set('tono', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-[#F7F8FA] focus:bg-white focus:border-[#0E9F8E] outline-none">
            <option value="professionale e diretto, come parlerei di persona">Professionale e diretto</option>
            <option value="cordiale e molto disponibile">Cordiale e disponibile</option>
            <option value="formale e preciso">Formale e preciso</option>
            <option value="semplice e informale">Semplice e informale</option>
          </select>
        </div>

        <button onClick={salva} disabled={saving}
          className="w-full py-3 bg-[#0D1B2A] text-white rounded-xl font-semibold text-sm hover:bg-[#162540] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          {saving && <Loader2 size={15} className="animate-spin" />}
          {saved ? '✓ Salvato!' : 'Salva impostazioni'}
        </button>

      </main>
    </div>
  )
}