'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { creaProdotto } from '@/lib/prodotti'
import { ArrowLeft, Loader2 } from 'lucide-react'

export default function NuovoProdottoPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    titolo: '',
    descrizione: '',
    prezzo: '',
    link_preview: '',
    link_download: '',
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        window.location.href = '/login'
        return
      }
      setUserId(user.id)
      setLoading(false)
    })
  }, [])

  function set(key: keyof typeof form, val: string) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  async function salva() {
    if (!userId || !form.titolo.trim() || !form.link_download.trim()) {
      alert('Titolo e link download sono obbligatori')
      return
    }

    const prezzo = parseFloat(form.prezzo.replace(',', '.'))
    if (isNaN(prezzo) || prezzo <= 0) {
      alert('Inserisci un prezzo valido')
      return
    }

    setSaving(true)
    try {
      await creaProdotto({
        user_id: userId,
        titolo: form.titolo.trim(),
        descrizione: form.descrizione.trim() || null,
        prezzo,
        link_preview: form.link_preview.trim() || null,
        link_download: form.link_download.trim(),
      })
      window.location.href = '/dashboard/prodotti'
    } catch (err) {
      console.error(err)
      alert('Errore durante il salvataggio')
      setSaving(false)
    }
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
          onClick={() => (window.location.href = '/dashboard/prodotti')}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-base font-semibold text-white tracking-tight">
          Preventivo<span className="text-[#2DD4BF]">AI</span>
          <span className="text-gray-400 font-normal ml-2">— Nuovo prodotto</span>
        </h1>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="text-base font-semibold text-[#0D1B2A] mb-5">
            Dettagli prodotto
          </h2>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Titolo *
            </label>
            <input
              value={form.titolo}
              onChange={(e) => set('titolo', e.target.value)}
              placeholder="es. Guida completa al preventivo perfetto"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-[#F7F8FA] focus:bg-white focus:border-[#0E9F8E] outline-none"
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Descrizione
            </label>
            <textarea
              value={form.descrizione}
              onChange={(e) => set('descrizione', e.target.value)}
              rows={4}
              placeholder="Descrivi cosa riceverà il cliente..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-[#F7F8FA] focus:bg-white focus:border-[#0E9F8E] outline-none resize-none leading-relaxed"
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Prezzo (€) *
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={form.prezzo}
              onChange={(e) => set('prezzo', e.target.value)}
              placeholder="es. 29.00"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-[#F7F8FA] focus:bg-white focus:border-[#0E9F8E] outline-none"
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Link anteprima
            </label>
            <input
              value={form.link_preview}
              onChange={(e) => set('link_preview', e.target.value)}
              placeholder="YouTube, Vimeo, qualsiasi URL"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-[#F7F8FA] focus:bg-white focus:border-[#0E9F8E] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Link download privato *
            </label>
            <input
              value={form.link_download}
              onChange={(e) => set('link_download', e.target.value)}
              placeholder="Google Drive, Dropbox, WeTransfer..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-[#F7F8FA] focus:bg-white focus:border-[#0E9F8E] outline-none"
            />
            <p className="text-xs text-gray-400 mt-1.5">
              Visibile solo al cliente dopo il pagamento
            </p>
          </div>
        </div>

        <button
          onClick={salva}
          disabled={saving}
          className="w-full py-3 bg-[#0D1B2A] text-white rounded-xl font-semibold text-sm hover:bg-[#162540] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving && <Loader2 size={15} className="animate-spin" />}
          Salva prodotto
        </button>
      </main>
    </div>
  )
}
