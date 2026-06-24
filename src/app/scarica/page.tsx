'use client'

import { useEffect, useState } from 'react'
import { Loader2, Download } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { DashboardLayout } from '@/components/DashboardLayout'

const APK_URL =
  'https://github.com/danielegalmax/preventivoai-mobile/releases/download/v1.0.0-beta/preventivoai-android-v1.0.0-beta.apk'
const WINDOWS_INSTALLER_URL =
  'https://github.com/danielegalmax/preventivoai-desktop/releases/download/v1.0.0-beta/preventivoai-desktop_1.0.0_x64-setup.exe'
const VERSIONE_ANDROID = '1.0.0'
const VERSIONE_WINDOWS = '1.0.0'

function AndroidIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M17.6 9.48l1.84-3.18c.16-.27.07-.62-.2-.78a.6.6 0 00-.78.2l-1.88 3.24a11.4 11.4 0 00-8.56 0L6.14 5.72a.6.6 0 00-.78-.2.6.6 0 00-.2.78L7 9.48A8.1 8.1 0 004 15.5h16a8.1 8.1 0 00-3.6-6.02zM8.5 14.25a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5zm7 0a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5z"
        fill="#3DDC84"
      />
    </svg>
  )
}

function WindowsIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path fill="#0078D4" d="M3 12.5l8.5-1.1V21L3 19.9V12.5z" />
      <path fill="#0078D4" d="M12.5 11.2L21 10v9.9l-8.5-1.1v-7.6z" />
      <path fill="#0078D4" d="M3 4.1l8.5 1.2v7.1L3 11.3V4.1z" />
      <path fill="#0078D4" d="M12.5 12.4L21 13.6V4.1l-8.5 1.1v7.2z" />
    </svg>
  )
}

export default function ScaricaPage() {
  const [nomeAzienda, setNomeAzienda] = useState('')
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
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-[#0E9F8E]" />
      </div>
    )
  }

  return (
    <DashboardLayout nomeAzienda={nomeAzienda} activeRoute="/scarica">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#0D1B2A]">Scarica PreventivoAI</h1>
          <p className="text-sm text-gray-500 mt-1">
            Installa l&apos;app sul tuo dispositivo per lavorare ovunque.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <AndroidIcon />
              <div>
                <h2 className="text-lg font-semibold text-[#0D1B2A]">App Android</h2>
                <span className="text-xs text-gray-400 font-normal">v{VERSIONE_ANDROID}</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 flex-1 mb-5">
              Scarica l&apos;APK e installa PreventivoAI sul tuo smartphone Android.
            </p>
            <a
              href={APK_URL}
              className="inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-[#0D1B2A] text-white rounded-xl text-sm font-semibold hover:bg-[#162540] transition-all"
            >
              <Download size={16} />
              Scarica APK
            </a>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <WindowsIcon />
              <div>
                <h2 className="text-lg font-semibold text-[#0D1B2A]">App Windows</h2>
                <span className="text-xs text-gray-400 font-normal">v{VERSIONE_WINDOWS}</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 flex-1 mb-5">
              Scarica l&apos;installer per usare PreventivoAI sul tuo PC Windows.
            </p>
            <a
              href={WINDOWS_INSTALLER_URL}
              className="inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-[#0D1B2A] text-white rounded-xl text-sm font-semibold hover:bg-[#162540] transition-all"
            >
              <Download size={16} />
              Scarica installer
            </a>
          </div>
        </div>

        <p className="text-sm text-gray-500 bg-white border border-gray-200 rounded-xl px-4 py-3">
          L&apos;app mobile è disponibile per Android. iOS in arrivo.
        </p>
      </div>
    </DashboardLayout>
  )
}
