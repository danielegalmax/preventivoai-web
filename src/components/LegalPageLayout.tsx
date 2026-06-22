import Link from 'next/link'
import type { ReactNode } from 'react'

function BrandLogo({ className = '' }: { className?: string }) {
  return (
    <Link href="/" className={`font-semibold tracking-tight text-[#0D1B2A] hover:opacity-90 ${className}`}>
      Preventivo<span className="text-[#0E9F8E]">AI</span>
    </Link>
  )
}

type Props = {
  title: string
  children: ReactNode
}

export function LegalPageLayout({ title, children }: Props) {
  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col">
      <header className="border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <BrandLogo className="text-lg" />
          <Link
            href="/"
            className="text-sm font-medium text-[#6B7280] hover:text-[#0E9F8E] transition-colors"
          >
            Torna alla home
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10 sm:py-12">
        <h1 className="text-2xl font-semibold text-[#0D1B2A] tracking-tight sm:text-3xl">{title}</h1>
        <p className="mt-2 text-sm text-[#6B7280]">
          Ultimo aggiornamento: [data di pubblicazione]
        </p>
        <article className="mt-8 space-y-8 text-[#0D1B2A]/85">
          {children}
        </article>
      </main>

      <footer className="border-t border-[#E5E7EB] bg-white py-6 mt-auto">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 px-5 text-center sm:flex-row sm:justify-between sm:text-left">
          <BrandLogo className="text-sm" />
          <nav className="flex gap-4 text-sm text-[#6B7280]">
            <Link href="/termini" className="hover:text-[#0E9F8E] transition-colors">
              Termini
            </Link>
            <Link href="/privacy" className="hover:text-[#0E9F8E] transition-colors">
              Privacy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}

export function LegalSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-[#0D1B2A]">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-7 text-[#374151]">{children}</div>
    </section>
  )
}
