import { FirmaPdfDownloadLink } from "./FirmaStatusCard";

type Props = {
  nomeAzienda: string;
  nomeCliente: string;
  titolo?: string | null;
  importoLabel?: string | null;
  pdfOriginaleUrl?: string;
};

export function FirmaBrandHeader({
  nomeAzienda,
  nomeCliente,
  titolo,
  importoLabel,
  pdfOriginaleUrl,
}: Props) {
  return (
    <header className="shrink-0 border-b border-black/5 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-3 sm:gap-4 sm:px-5 sm:py-4">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#0E9F8E] sm:text-xs">
            Preventivo<span className="text-[#0D1B2A]">AI</span>
          </p>
          <h1 className="truncate text-base font-semibold text-[#0D1B2A] sm:text-xl lg:text-2xl">
            {titolo?.trim() || "Firma preventivo"}
          </h1>
          <p className="mt-0.5 truncate text-xs text-[#6B7280] sm:text-sm">
            {nomeAzienda}
            <span className="mx-1.5 text-[#D1D5DB]">·</span>
            {nomeCliente}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          {importoLabel ? (
            <div className="rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] px-3 py-2 text-right sm:px-4 sm:py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                Importo
              </p>
              <p className="text-base font-bold text-[#0E9F8E] sm:text-lg">{importoLabel}</p>
            </div>
          ) : null}
          {pdfOriginaleUrl ? (
            <FirmaPdfDownloadLink
              href={pdfOriginaleUrl}
              label="Scarica PDF"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0D1B2A] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#162540] sm:gap-2 sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-sm"
            />
          ) : null}
        </div>
      </div>
    </header>
  );
}
