'use client'

import { useEffect } from 'react'

const DEEP_LINK = 'preventivoai://stripe-callback'

export default function StripeCallbackPage() {
  useEffect(() => {
    window.location.href = DEEP_LINK
  }, [])

  return (
    <main className="min-h-screen bg-[#F7F8FA] flex items-center justify-center px-4 py-10">
      <section className="w-full max-w-md text-center">
        <h1 className="text-2xl font-semibold text-[#0D1B2A] tracking-tight">
          Preventivo<span className="text-[#0E9F8E]">AI</span>
        </h1>
        <p className="mt-6 text-sm leading-6 text-gray-500">
          Verifica completata. Torna all&apos;app PreventivoAI.
        </p>
        <a
          href={DEEP_LINK}
          className="mt-8 inline-block rounded-xl bg-[#0D1B2A] px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
        >
          Apri PreventivoAI
        </a>
      </section>
    </main>
  )
}
