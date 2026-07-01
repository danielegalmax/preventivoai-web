import { CheckCircle2 } from 'lucide-react'

export default function StripeConnessoPage() {
  return (
    <main className="min-h-screen bg-[#F7F8FA] flex items-center justify-center px-4 py-10">
      <section className="w-full max-w-md text-center">
        <h1 className="text-2xl font-semibold text-[#0D1B2A] tracking-tight">
          Previ<span className="text-[#0E9F8E]">Cloud</span>
        </h1>
        <CheckCircle2 className="mx-auto mt-8 h-12 w-12 text-[#0E9F8E]" aria-hidden />
        <p className="mt-6 text-sm leading-6 text-gray-500">
          Account collegato! Torna all&apos;app PreviCloud per continuare.
        </p>
      </section>
    </main>
  )
}
