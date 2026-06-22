import Link from "next/link";
import {
  BellRing,
  CreditCard,
  FileSignature,
  MessageSquare,
  PenLine,
  Users,
} from "lucide-react";

const BETA_REQUEST_URL = "https://earnest-nougat-b08159.netlify.app/";

function BrandLogo({ className = "" }: { className?: string }) {
  return (
    <span className={`font-semibold tracking-tight text-[#0D1B2A] ${className}`}>
      Preventivo<span className="text-[#0E9F8E]">AI</span>
    </span>
  );
}

const FEATURES: {
  icon: typeof FileSignature;
  title: string;
  description: string;
  highlight?: boolean;
}[] = [
  {
    icon: FileSignature,
    title: "Firma digitale e pagamento",
    highlight: true,
    description:
      "Invia al cliente un link per firmare il preventivo online. Se usi Stripe, il link include anche il pagamento. Ricevi notifiche quando firma, paga o serve un reminder.",
  },
  {
    icon: BellRing,
    title: "Notifiche e reminder automatici",
    highlight: true,
    description:
      "L'app ti avvisa se un preventivo resta in attesa di firma o pagamento. Invia reminder via WhatsApp o email con un tap, usando messaggi personalizzabili.",
  },
  {
    icon: MessageSquare,
    title: "Preventivi con intelligenza artificiale",
    description:
      "Crea preventivi scrivendo in chat, dettando a voce o con il builder manuale. L'AI struttura voci, prezzi e testo in pochi minuti.",
  },
  {
    icon: PenLine,
    title: "PDF professionali",
    description:
      "Template personalizzabili con il tuo brand, anteprima paginata e condivisione immediata. Tutto pronto per inviare al cliente.",
  },
  {
    icon: CreditCard,
    title: "Rate, abbonamenti e incassi",
    description:
      "Piani di pagamento a rate o canone mensile collegati al preventivo. Tieni traccia di cosa è pagato, in scadenza o in ritardo.",
  },
  {
    icon: Users,
    title: "Clienti e storico",
    description:
      "Anagrafica clienti, storico preventivi, stati (bozza, inviato, accettato) e insight utili per non perdere opportunità.",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-full bg-[#F7F8FA]">
      <header className="border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <BrandLogo className="text-lg" />
          <span className="rounded-full bg-[#0E9F8E]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#0E9F8E]">
            Beta aperta
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
        <section className="text-center">
          <p className="inline-flex items-center rounded-full border border-[#0E9F8E]/25 bg-white px-4 py-1.5 text-sm font-medium text-[#0E9F8E] shadow-sm">
            La beta è fuori adesso
          </p>

          <h1 className="mt-6 text-3xl font-semibold leading-tight tracking-tight text-[#0D1B2A] sm:text-4xl">
            Preventivi professionali,
            <br />
            <span className="text-[#0E9F8E]">firma e incasso</span> in un flusso solo
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[#6B7280] sm:text-lg">
            PreventivoAI aiuta artigiani e professionisti a creare preventivi con l&apos;AI,
            farli firmare online e riscuotere — senza saltare tra app diverse.
          </p>
        </section>

        <section className="mt-10 rounded-2xl border border-[#E5E7EB] bg-white p-6 text-center shadow-sm sm:p-8">
          <h2 className="text-lg font-semibold text-[#0D1B2A]">
            Vuoi provarla gratis?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#6B7280] sm:text-base">
            Sto aprendo l&apos;accesso in beta a un gruppo ristretto di professionisti.
            Compila il form per richiedere l&apos;accesso gratuito: in cambio mi serve il tuo
            feedback sincero su cosa funziona e cosa migliorare.
          </p>
          <a
            href={BETA_REQUEST_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#0E9F8E] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0c8a7b] sm:text-base"
          >
            Richiedi accesso alla beta
          </a>
          <p className="mt-4 text-xs text-[#9CA3AF]">
            Nessun costo durante la beta · accesso su invito
          </p>
        </section>

        <section className="mt-14">
          <div className="mb-8 text-center">
            <h2 className="text-xl font-semibold text-[#0D1B2A]">
              Cosa trovi dentro
            </h2>
            <p className="mt-2 text-sm text-[#6B7280]">
              Le funzionalità che fanno la differenza nel lavoro quotidiano
            </p>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map(({ icon: Icon, title, description, highlight }) => (
              <li
                key={title}
                className={`rounded-2xl border p-5 ${
                  highlight
                    ? "border-[#0E9F8E]/30 bg-gradient-to-br from-white to-[#0E9F8E]/5 shadow-sm"
                    : "border-[#E5E7EB] bg-white"
                }`}
              >
                <div
                  className={`mb-3 inline-flex rounded-xl p-2.5 ${
                    highlight ? "bg-[#0E9F8E]/15 text-[#0E9F8E]" : "bg-[#F7F8FA] text-[#0D1B2A]"
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </div>
                <h3 className="font-semibold text-[#0D1B2A]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#6B7280]">{description}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14 rounded-2xl bg-[#0D1B2A] px-6 py-8 text-center sm:px-10">
          <h2 className="text-lg font-semibold text-white">
            Flusso firma → pagamento → notifica
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/70">
            Generi il PDF, invii il link firma al cliente, lui firma (e paga se hai Stripe
            collegato). Tu ricevi la notifica in app e puoi mandare un reminder se serve —
            tutto tracciato, senza follow-up manuali infiniti.
          </p>
        </section>
      </main>

      <footer className="border-t border-[#E5E7EB] bg-white py-6">
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
  );
}
