'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  getProdottiUtente,
  aggiornaProdotto,
  normalizzaLinkPreviewMultipli,
  preparaLinkPreviewPerSalvataggio,
  type ProdottoDigitale,
} from '@/lib/prodotti'
import { ArrowLeft, Loader2, Plus, X } from 'lucide-react'

export default function ModificaProdottoPage() {
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [prodotto, setProdotto] = useState<ProdottoDigitale | null>(null)
  const [form, setForm] = useState({
    titolo: '',
    descrizione: '',
    prezzo: '',
    link_download: '',
    attivo: true,
  })
  const [linkPreviewMultipli, setLinkPreviewMultipli] = useState<string[]>([])

  useEffect(() => {
    carica()
  }, [id])

  async function carica() {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      window.location.href = '/login'
      return
    }

    try {
      const lista = await getProdottiUtente(user.id)
      const trovato = lista.find((p) => p.id === id)
      if (!trovato) {
        window.location.href = '/dashboard/prodotti'
        return
      }
      setProdotto(trovato)
      setForm({
        titolo: trovato.titolo,
        descrizione: trovato.descrizione ?? '',
        prezzo: String(trovato.prezzo),
        link_download: trovato.link_download,
        attivo: trovato.attivo,
      })
      setLinkPreviewMultipli(
        normalizzaLinkPreviewMultipli(
          trovato.link_preview_multipli,
          trovato.link_preview
        )
      )
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  function set(key: keyof typeof form, val: string | boolean) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  function aggiungiLinkPreview() {
    setLinkPreviewMultipli((prev) => [...prev, ''])
  }

  function rimuoviLinkPreview(index: number) {
    setLinkPreviewMultipli((prev) => prev.filter((_, i) => i !== index))
  }

  function aggiornaLinkPreview(index: number, val: string) {
    setLinkPreviewMultipli((prev) =>
      prev.map((url, i) => (i === index ? val : url))
    )
  }

  async function salva() {
    if (!prodotto || !form.titolo.trim() || !form.link_download.trim()) {
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
      const preview = preparaLinkPreviewPerSalvataggio(linkPreviewMultipli)
      await aggiornaProdotto(prodotto.id, {
        titolo: form.titolo.trim(),
        descrizione: form.descrizione.trim() || null,
        prezzo,
        link_preview_multipli: preview.link_preview_multipli,
        link_preview: preview.link_preview,
        link_download: form.link_download.trim(),
        attivo: form.attivo,
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
          Previ<span className="text-[#2DD4BF]">Cloud</span>
          <span className="text-gray-400 font-normal ml-2">— Modifica prodotto</span>
        </h1>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-4">
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
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-[#F7F8FA] focus:bg-white focus:border-[#0E9F8E] outline-none"
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Link anteprima
            </label>
            <div className="space-y-2">
              {linkPreviewMultipli.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    value={url}
                    onChange={(e) => aggiornaLinkPreview(index, e.target.value)}
                    placeholder="YouTube, Vimeo, Google Drive, qualsiasi URL..."
                    className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-[#F7F8FA] focus:bg-white focus:border-[#0E9F8E] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => rimuoviLinkPreview(index)}
                    className="px-3 py-2.5 border border-gray-200 rounded-xl text-gray-500 hover:border-red-300 hover:text-red-500 transition-colors"
                    aria-label="Rimuovi link anteprima"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={aggiungiLinkPreview}
              className="mt-2 flex items-center gap-1.5 text-sm font-medium text-[#0E9F8E] hover:text-[#0b8a7a] transition-colors"
            >
              <Plus size={16} />
              Aggiungi link anteprima
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Link download privato *
            </label>
            <input
              value={form.link_download}
              onChange={(e) => set('link_download', e.target.value)}
              placeholder="Google Drive, Dropbox, WeTransfer..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-[#F7F8FA] focus:bg-white focus:border-[#0E9F8E] outline-none"
            />
          </div>

          {prodotto && (
            <div className="text-xs text-gray-400 font-mono">
              Link pubblico: /store/{prodotto.slug}
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#0D1B2A]">
                Prodotto attivo
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Se disattivato, la pagina store non sarà acquistabile
              </p>
            </div>
            <button
              type="button"
              onClick={() => set('attivo', !form.attivo)}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                form.attivo ? 'bg-[#0E9F8E]' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                  form.attivo ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <button
          onClick={salva}
          disabled={saving}
          className="w-full py-3 bg-[#0D1B2A] text-white rounded-xl font-semibold text-sm hover:bg-[#162540] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving && <Loader2 size={15} className="animate-spin" />}
          Salva modifiche
        </button>
      </main>
    </div>
  )
}
