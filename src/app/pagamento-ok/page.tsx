import { CheckCircle2 } from 'lucide-react'

export default function PagamentoOkPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D1B2A] to-[#1a2f45] flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
          <div className="flex flex-col items-center py-16 px-6 text-center">
            <div className="w-20 h-20 rounded-full bg-[#E1F5EE] flex items-center justify-center mb-8">
              <CheckCircle2 size={40} className="text-[#0E9F8E]" aria-hidden />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0D1B2A] mb-4">
              Pagamento effettuato con successo
            </h1>
            <p className="text-base text-[#0D1B2A] leading-relaxed max-w-md mb-3">
              Il pagamento è stato completato correttamente.
            </p>
            <p className="text-sm text-gray-500 max-w-sm">
              Puoi chiudere questa pagina. L&apos;artigiano riceverà conferma del pagamento.
            </p>
          </div>
        </div>
      </main>
      <footer className="pb-8 text-center">
        <p className="text-sm text-white/50">
          Preventivo<span className="text-[#2DD4BF]">AI</span>
        </p>
      </footer>
    </div>
  )
}
