import { XCircle } from 'lucide-react'

export default function PagamentoAnnullatoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D1B2A] to-[#1a2f45] flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
          <div className="flex flex-col items-center py-16 px-6 text-center">
            <XCircle size={56} className="text-gray-400 mb-6" aria-hidden />
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0D1B2A] mb-4">
              Pagamento annullato
            </h1>
            <p className="text-base text-[#0D1B2A] leading-relaxed max-w-md mb-3">
              Il pagamento non è stato completato.
            </p>
            <p className="text-sm text-gray-500 max-w-sm">
              Puoi chiudere questa pagina e riprovare dal link che ti ha inviato l&apos;artigiano.
            </p>
          </div>
        </div>
      </main>
      <footer className="pb-8 text-center">
        <p className="text-sm text-white/50">
          Previ<span className="text-[#2DD4BF]">Cloud</span>
        </p>
      </footer>
    </div>
  )
}
