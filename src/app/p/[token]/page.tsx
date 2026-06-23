"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { FirmaBrandHeader } from "@/components/firma/FirmaBrandHeader";
import { FirmaPageShell, FirmaStatusCard } from "@/components/firma/FirmaStatusCard";
import { FirmaSlideFlow } from "@/components/firma/FirmaSlideFlow";
import { SignaturePad } from "@/components/firma/SignaturePad";
import { formatEuro } from "@/lib/formatEuro";

type PaginaFirma =
  | { stato: "loading" }
  | {
      stato: "pronto";
      nomeCliente: string;
      nomeAzienda: string;
      html: string;
      importoTotale?: number | null;
      titolo?: string | null;
      pdfOriginaleUrl?: string;
    }
  | { stato: "gia_firmato"; nomeCliente: string; pdfFirmatoUrl?: string }
  | { stato: "scaduto" | "revocato" | "link_non_valido"; nomeCliente?: string; nomeAzienda?: string }
  | { stato: "successo"; pdfFirmatoUrl?: string; nomeCliente?: string };

function backendUrl() {
  return (process.env.NEXT_PUBLIC_BACKEND_URL || "").replace(/\/$/, "");
}

const ERROR_TITLES = {
  link_non_valido: "Link non valido",
  scaduto: "Link scaduto",
  revocato: "Link non più valido",
} as const;

export default function FirmaPreventivoPage() {
  const params = useParams();
  const token = params.token as string;
  const [pagina, setPagina] = useState<PaginaFirma>({ stato: "loading" });
  const [accettato, setAccettato] = useState(false);
  const [firma, setFirma] = useState<string | null>(null);
  const [invio, setInvio] = useState(false);
  const [errore, setErrore] = useState("");

  useEffect(() => {
    void (async () => {
      const base = backendUrl();
      if (!base) {
        setPagina({ stato: "link_non_valido" });
        return;
      }

      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 30000);

      try {
        const res = await fetch(`${base}/api/public/firma/${token}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        if (data.stato === "pronto") {
          setPagina({
            stato: "pronto",
            nomeCliente: data.nomeCliente,
            nomeAzienda: data.nomeAzienda,
            html: data.html,
            importoTotale: data.importoTotale,
            titolo: data.titolo,
            pdfOriginaleUrl: data.pdfOriginaleUrl,
          });
        } else if (data.stato === "gia_firmato") {
          setPagina({
            stato: "gia_firmato",
            nomeCliente: data.nomeCliente,
            pdfFirmatoUrl: data.pdfFirmatoUrl,
          });
        } else {
          setPagina({
            stato: data.stato,
            nomeCliente: data.nomeCliente,
            nomeAzienda: data.nomeAzienda,
          });
        }
      } catch {
        setPagina({ stato: "link_non_valido" });
      } finally {
        window.clearTimeout(timeout);
      }
    })();
  }, [token]);

  async function conferma() {
    if (!accettato || !firma) {
      setErrore("Disegna la firma e spunta la casella di accettazione.");
      return;
    }
    setErrore("");
    setInvio(true);
    try {
      const res = await fetch(`${backendUrl()}/api/public/firma/${token}/accetta`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firma_base64: firma, accettato: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrore(data.error || "Errore durante la firma.");
        return;
      }
      setPagina({
        stato: "successo",
        pdfFirmatoUrl: data.pdfFirmatoUrl,
        nomeCliente: data.nomeCliente,
      });
    } catch {
      setErrore("Connessione non disponibile. Riprova.");
    } finally {
      setInvio(false);
    }
  }

  if (pagina.stato === "loading") {
    return (
      <FirmaPageShell>
        <main className="flex flex-1 items-center justify-center overflow-hidden px-4 py-4">
          <FirmaStatusCard
            variant="loading"
            title="Caricamento preventivo"
            description="Attendi un momento…"
          />
        </main>
      </FirmaPageShell>
    );
  }

  if (pagina.stato === "link_non_valido" || pagina.stato === "scaduto" || pagina.stato === "revocato") {
    return (
      <FirmaPageShell>
        <main className="flex flex-1 items-center justify-center overflow-hidden px-4 py-4">
          <FirmaStatusCard
            variant="error"
            title={ERROR_TITLES[pagina.stato]}
            description={
              <>
                {pagina.nomeAzienda ? (
                  <p className="mb-2">
                    Preventivo da <strong>{pagina.nomeAzienda}</strong>
                  </p>
                ) : null}
                Contatta l&apos;artigiano per ricevere un nuovo link di firma.
              </>
            }
          />
        </main>
      </FirmaPageShell>
    );
  }

  if (pagina.stato === "gia_firmato" || pagina.stato === "successo") {
    const pdf = pagina.pdfFirmatoUrl;
    const giaFatto = pagina.stato === "gia_firmato";
    return (
      <FirmaPageShell>
        <main className="flex flex-1 items-center justify-center overflow-hidden px-4 py-4">
          <FirmaStatusCard
            variant="success"
            title={giaFatto ? "Preventivo già firmato" : "Preventivo accettato"}
            description={
              <>
                Grazie{pagina.nomeCliente ? `, ${pagina.nomeCliente}` : ""}!{" "}
                {giaFatto
                  ? "Hai già completato la firma di questo preventivo."
                  : "L'artigiano è stato avvisato e ha ricevuto la tua accettazione."}
              </>
            }
            action={
              pdf
                ? { href: pdf, label: "Scarica PDF firmato" }
                : undefined
            }
          />
        </main>
      </FirmaPageShell>
    );
  }

  if (pagina.stato !== "pronto") {
    return null;
  }

  const importoLabel = formatEuro(pagina.importoTotale);

  return (
    <FirmaPageShell>
      <FirmaBrandHeader
        nomeAzienda={pagina.nomeAzienda}
        nomeCliente={pagina.nomeCliente}
        titolo={pagina.titolo}
        importoLabel={importoLabel}
        pdfOriginaleUrl={pagina.pdfOriginaleUrl}
      />

      <main className="mx-auto flex w-full max-w-6xl min-h-0 flex-1 flex-col overflow-hidden px-3 py-2 sm:px-5 sm:py-3">
        <FirmaSlideFlow
          html={pagina.html}
          firmaSlide={
            <>
              <p className="text-sm text-[#6B7280]">
                Scorri le pagine del preventivo, poi firma qui per confermare.
              </p>

              <ol className="mt-5 space-y-5">
                <li>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                    1 · Firma
                  </p>
                  <SignaturePad onChange={setFirma} />
                </li>

                <li>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                    2 · Accettazione
                  </p>
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] p-3 transition hover:border-[#0E9F8E]/40">
                    <input
                      type="checkbox"
                      checked={accettato}
                      onChange={(e) => setAccettato(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#D1D5DB] text-[#0E9F8E] focus:ring-[#0E9F8E]"
                    />
                    <span className="text-sm leading-snug text-[#374151]">
                      Accetto il preventivo e le condizioni indicate nell&apos;anteprima.
                    </span>
                  </label>
                </li>
              </ol>

              {errore ? (
                <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {errore}
                </p>
              ) : null}

              <button
                type="button"
                disabled={invio}
                onClick={() => void conferma()}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0E9F8E] py-3.5 text-sm font-semibold text-white transition hover:bg-[#0c8a7c] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {invio ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Invio in corso…
                  </>
                ) : (
                  "Conferma e invia"
                )}
              </button>

              <p className="mt-4 text-center text-[11px] leading-relaxed text-[#9CA3AF]">
                La firma viene registrata in modo sicuro e l&apos;artigiano riceverà una
                notifica.
              </p>
            </>
          }
        />
      </main>
    </FirmaPageShell>
  );
}
