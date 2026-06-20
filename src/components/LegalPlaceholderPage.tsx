import Link from 'next/link'

export function LegalPlaceholderPage({ title }: { title: string }) {
  return (
    <main className="min-h-screen bg-[#F7F8FA] flex items-center justify-center px-4 py-10">
      <section className="w-full max-w-md text-center">
        <h1 className="text-2xl font-semibold text-[#0D1B2A] tracking-tight">
          Preventivo<span className="text-[#0E9F8E]">AI</span>
        </h1>
        <h2 className="mt-6 text-lg font-semibold text-[#0D1B2A]">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-gray-500">
          Documento in preparazione, disponibile a breve.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block text-sm font-semibold text-[#0E9F8E] hover:underline underline-offset-2"
        >
          Torna alla home
        </Link>
      </section>
    </main>
  )
}
