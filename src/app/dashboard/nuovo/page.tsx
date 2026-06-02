'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Send, Loader2, Download, RotateCcw } from 'lucide-react'

interface Messaggio {
  role: 'user' | 'assistant'
  content: string
}

export default function NuovoPreventivo() {
  const [input, setInput] = useState('')
  const [messaggi, setMessaggi] = useState<Messaggio[]>([])
  const [loading, setLoading] = useState(false)
  const [preventivo, setPreventivo] = useState('')
  const [salvato, setSalvato] = useState(false)
  const [token, setToken] = useState('')
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { window.location.href = '/login'; return }
      setToken(session.access_token)
    })
  }, [])

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' })
  }, [messaggi, loading])

  async function invia() {
    if (!input.trim() || loading) return
    const testo = input.trim()
    setInput('')
    setLoading(true)

    const nuoviMessaggi: Messaggio[] = [...messaggi, { role: 'user', content: testo }]
    setMessaggi(nuoviMessaggi)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ messages: nuoviMessaggi })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      const reply: string = data.reply

      if (reply.includes('PREVENTIVO_PRONTO')) {
        const parts = reply.split('PREVENTIVO_PRONTO')
        if (parts[0].trim()) {
          setMessaggi([...nuoviMessaggi, { role: 'assistant', content: parts[0].trim() }])
        }
        setPreventivo(parts[1].trim())
      } else {
        setMessaggi([...nuoviMessaggi, { role: 'assistant', content: reply }])
      }
    } catch (err: any) {
      setMessaggi([...nuoviMessaggi, { role: 'assistant', content: 'Errore: ' + err.message }])
    }

    setLoading(false)
  }

  async function salvaPreventivo() {
    if (!preventivo || salvato) return
    const importoMatch = preventivo.match(/TOTALE[:\s]*€?\s*([\d.,]+)/i)
    const importo = importoMatch ? parseFloat(importoMatch[1].replace(',', '.')) : null

    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/salva-preventivo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        testo_preventivo: preventivo,
        importo_totale: importo,
        messaggio_cliente: messaggi[0]?.content || ''
      })
    })
    setSalvato(true)
  }

  function scaricaTesto() {
    const blob = new Blob([preventivo], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'preventivo.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  function ricomincia() {
    setMessaggi([])
    setPreventivo('')
    setSalvato(false)
    setInput('')
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col">

      {/* Header */}
      <header className="bg-[#0D1B2A] px-6 py-4 flex items-center gap-4 flex-shrink-0">
        <button onClick={() => window.location.href = '/dashboard'}
          className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-base font-semibold text-white tracking-tight">
          Preventivo<span className="text-[#2DD4BF]">AI</span>
          <span className="text-gray-400 font-normal ml-2">— Nuovo preventivo</span>
        </h1>
      </header>

      {preventivo ? (
        // ── PREVENTIVO GENERATO ──────────────────────────────────
        <div className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full">
          <div className="bg-white border border-[#0E9F8E] rounded-2xl overflow-hidden shadow-sm mb-4">
            <div className="bg-[#0D1B2A] px-6 py-4">
              <div className="text-white font-semibold">Preventivo generato ✓</div>
              <div className="text-gray-400 text-xs mt-0.5">Pronto da inviare al cliente</div>
            </div>
            <div className="p-6">
              <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed">
                {preventivo}
              </pre>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            <button onClick={scaricaTesto}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#0D1B2A] text-white rounded-xl text-sm font-semibold hover:bg-[#162540] transition-all">
              <Download size={15} />
              Scarica testo
            </button>
            <button onClick={salvaPreventivo} disabled={salvato}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                salvato
                  ? 'bg-[#E1F5EE] text-[#085041] cursor-not-allowed'
                  : 'bg-[#0E9F8E] text-white hover:bg-[#0b8a7a]'
              }`}>
              {salvato ? '✓ Salvato' : 'Salva nello storico'}
            </button>
            <button onClick={ricomincia}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:border-gray-400 transition-all">
              <RotateCcw size={15} />
              Nuovo
            </button>
          </div>
        </div>

      ) : (
        // ── CHAT ─────────────────────────────────────────────────
        <>
          <div ref={chatRef} className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full">

            {messaggi.length === 0 && (
              <div className="text-center mt-12">
                <div className="w-14 h-14 bg-[#0E9F8E] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Send size={22} className="text-white" />
                </div>
                <p className="text-[#0D1B2A] font-semibold text-base mb-1">
                  Incolla il messaggio del cliente
                </p>
                <p className="text-gray-400 text-sm">
                  Anche vago o scritto male — l&apos;AI farà le domande giuste
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3 mt-4">
              {messaggi.map((m, i) => (
                <div key={i} className={`flex flex-col ${m.role === 'user' ? '' : 'items-end'}`}>
                  <div className="text-xs text-gray-400 mb-1 px-1">
                    {m.role === 'user' ? 'Cliente' : 'PreventivoAI'}
                  </div>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed max-w-[88%] whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-[#EBF3FF] text-[#1E40AF] rounded-bl-sm'
                      : 'bg-white border border-gray-200 text-gray-800 rounded-br-sm'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex flex-col items-end">
                  <div className="text-xs text-gray-400 mb-1 px-1">PreventivoAI</div>
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-br-sm px-4 py-3">
                    <Loader2 size={16} className="animate-spin text-[#0E9F8E]" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 bg-white p-4 flex-shrink-0">
            <div className="max-w-2xl mx-auto flex gap-3">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); invia() } }}
                placeholder="Incolla il messaggio del cliente…"
                rows={2}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm bg-[#F7F8FA] focus:bg-white focus:border-[#0E9F8E] outline-none resize-none leading-relaxed"
              />
              <button onClick={invia} disabled={loading || !input.trim()}
                className="px-4 bg-[#0E9F8E] text-white rounded-xl hover:bg-[#0b8a7a] transition-all disabled:opacity-40 flex items-center">
                <Send size={18} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}