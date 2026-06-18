"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

type PaginaFirma =
  | { stato: "loading" }
  | { stato: "pronto"; nomeCliente: string; nomeAzienda: string; html: string; importoTotale?: number | null }
  | { stato: "gia_firmato"; nomeCliente: string; pdfFirmatoUrl?: string; firmatoAt?: string }
  | { stato: "scaduto" | "revocato" | "link_non_valido"; nomeCliente?: string; nomeAzienda?: string }
  | { stato: "successo"; pdfFirmatoUrl?: string; nomeCliente?: string };

function backendUrl() {
  return (process.env.NEXT_PUBLIC_BACKEND_URL || "").replace(/\/$/, "");
}

function SignaturePad({ onChange }: { onChange: (dataUrl: string | null) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange(null);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(2, 2);
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#0D1B2A";
    }
  }, []);

  const exportFirma = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const blank = document.createElement("canvas");
    blank.width = canvas.width;
    blank.height = canvas.height;
    if (canvas.toDataURL() === blank.toDataURL()) {
      onChange(null);
      return;
    }
    onChange(canvas.toDataURL("image/png"));
  }, [onChange]);

  return (
    <div>
      <canvas
        ref={canvasRef}
        className="h-36 w-full touch-none rounded-xl border-2 border-dashed border-gray-300 bg-white"
        onPointerDown={(e) => {
          drawing.current = true;
          const canvas = canvasRef.current!;
          const ctx = canvas.getContext("2d")!;
          const p = pos(e);
          ctx.beginPath();
          ctx.moveTo(p.x / 2, p.y / 2);
          canvas.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!drawing.current) return;
          const ctx = canvasRef.current!.getContext("2d")!;
          const p = pos(e);
          ctx.lineTo(p.x / 2, p.y / 2);
          ctx.stroke();
        }}
        onPointerUp={() => {
          drawing.current = false;
          exportFirma();
        }}
        onPointerLeave={() => {
          if (drawing.current) {
            drawing.current = false;
            exportFirma();
          }
        }}
      />
      <button type="button" onClick={clear} className="mt-2 text-sm text-gray-500 underline">
        Cancella firma
      </button>
    </div>
  );
}

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
      try {
        const res = await fetch(`${backendUrl()}/api/public/firma/${token}`);
        const data = await res.json();
        if (data.stato === "pronto") {
          setPagina({
            stato: "pronto",
            nomeCliente: data.nomeCliente,
            nomeAzienda: data.nomeAzienda,
            html: data.html,
            importoTotale: data.importoTotale,
          });
        } else if (data.stato === "gia_firmato") {
          setPagina({
            stato: "gia_firmato",
            nomeCliente: data.nomeCliente,
            pdfFirmatoUrl: data.pdfFirmatoUrl,
            firmatoAt: data.firmatoAt,
          });
        } else {
          setPagina({ stato: data.stato, nomeCliente: data.nomeCliente, nomeAzienda: data.nomeAzienda });
        }
      } catch {
        setPagina({ stato: "link_non_valido" });
      }
    })();
  }, [token]);

  async function conferma() {
    if (!accettato || !firma) {
      setErrore("Disegna la firma e accetta il preventivo.");
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
      <main className="flex min-h-screen items-center justify-center bg-[#F7F8FA] text-[#0D1B2A]">
        <p>Caricamento preventivo…</p>
      </main>
    );
  }

  if (pagina.stato === "link_non_valido" || pagina.stato === "scaduto" || pagina.stato === "revocato") {
    const titoli = {
      link_non_valido: "Link non valido",
      scaduto: "Link scaduto",
      revocato: "Link non più valido",
    };
    return (
      <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-12 text-[#0D1B2A]">
        <h1 className="text-2xl font-semibold">{titoli[pagina.stato]}</h1>
        <p className="mt-3 text-gray-600">Contatta l&apos;artigiano per ricevere un nuovo link.</p>
      </main>
    );
  }

  if (pagina.stato === "gia_firmato" || pagina.stato === "successo") {
    const pdf = pagina.stato === "successo" ? pagina.pdfFirmatoUrl : pagina.pdfFirmatoUrl;
    return (
      <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-12 text-[#0D1B2A]">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#0E9F8E]/15 text-2xl">
            ✓
          </div>
          <h1 className="text-2xl font-semibold">Preventivo accettato</h1>
          <p className="mt-2 text-gray-600">
            Grazie{pagina.nomeCliente ? `, ${pagina.nomeCliente}` : ""}! L&apos;artigiano è stato avvisato.
          </p>
          {pdf ? (
            <a
              href={pdf}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex rounded-xl bg-[#0D1B2A] px-5 py-3 text-sm font-medium text-white"
            >
              Scarica PDF firmato
            </a>
          ) : null}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F8FA] pb-12 text-[#0D1B2A]">
      <header className="border-b border-black/5 bg-white px-4 py-4">
        <p className="text-xs uppercase tracking-wide text-gray-500">{pagina.nomeAzienda}</p>
        <h1 className="text-lg font-semibold">Firma preventivo</h1>
        <p className="mt-1 text-sm text-gray-600">
          Preventivo per: <strong>{pagina.nomeCliente}</strong>
        </p>
      </header>

      <div className="mx-auto mt-6 max-w-3xl px-4">
        <div
          className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm"
          dangerouslySetInnerHTML={{ __html: pagina.html }}
        />

        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-semibold">Firma qui sotto</h2>
          <p className="mt-1 text-sm text-gray-500">Usa mouse o dito per firmare nel riquadro.</p>
          <div className="mt-4">
            <SignaturePad onChange={setFirma} />
          </div>

          <label className="mt-6 flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={accettato}
              onChange={(e) => setAccettato(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300"
            />
            <span className="text-sm">Accetto il preventivo e le condizioni indicate.</span>
          </label>

          {errore ? <p className="mt-3 text-sm text-red-600">{errore}</p> : null}

          <button
            type="button"
            disabled={invio}
            onClick={() => void conferma()}
            className="mt-6 w-full rounded-xl bg-[#0E9F8E] py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {invio ? "Invio in corso…" : "Conferma e invia"}
          </button>
        </div>
      </div>
    </main>
  );
}
