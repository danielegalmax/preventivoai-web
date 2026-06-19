"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, FileText, PenLine } from "lucide-react";
import {
  dimensioniPaginaPreview,
  htmlPerPaginaPreview,
  type PageBreakMessage,
} from "@/lib/pdfPreviewPaginata";

type FrameSize = {
  larghezza: number;
  altezza: number;
  scale: number;
};

const FRAME_VUOTO: FrameSize = { larghezza: 0, altezza: 0, scale: 1 };

function dimensioniFallback(): FrameSize {
  const padX = window.innerWidth >= 640 ? 24 : 12;
  const riservatoY = window.innerWidth >= 640 ? 240 : 200;
  const availW = Math.max(280, window.innerWidth - padX * 2 - 24);
  const availH = Math.max(360, window.innerHeight - riservatoY);
  return dimensioniPaginaPreview(availW, availH);
}

type Props = {
  html: string;
  firmaSlide: ReactNode;
};

export function FirmaSlideFlow({ html, firmaSlide }: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState<FrameSize>(FRAME_VUOTO);
  const [totalPages, setTotalPages] = useState(1);
  const [slideAttivo, setSlideAttivo] = useState(0);

  const totalSlides = totalPages + 1;
  const isFirmaSlide = slideAttivo >= totalPages;
  const paginaPreventivo = Math.min(slideAttivo, totalPages - 1);

  const misuraViewport = useCallback(() => {
    const el = viewportRef.current;
    const padX = window.innerWidth >= 640 ? 24 : 12;
    const padY = window.innerWidth >= 640 ? 20 : 12;

    let availW = el ? Math.max(0, el.clientWidth - padX * 2) : 0;
    let availH = el ? Math.max(0, el.clientHeight - padY * 2) : 0;

    if (availW <= 0 || availH <= 0) {
      setFrame(dimensioniFallback());
      return;
    }

    setFrame(dimensioniPaginaPreview(availW, availH));
  }, []);

  useEffect(() => {
    setTotalPages(1);
    setSlideAttivo(0);
    scrollRef.current?.scrollTo({ left: 0, behavior: "auto" });
  }, [html]);

  useEffect(() => {
    misuraViewport();

    let frameId = 0;
    let retries = 0;
    const retryMisura = () => {
      const el = viewportRef.current;
      if (el && el.clientHeight > 0) {
        misuraViewport();
        return;
      }
      if (retries < 12) {
        retries += 1;
        frameId = window.requestAnimationFrame(retryMisura);
      }
    };
    frameId = window.requestAnimationFrame(retryMisura);

    const el = viewportRef.current;
    if (!el) {
      return () => window.cancelAnimationFrame(frameId);
    }

    const ro = new ResizeObserver(misuraViewport);
    ro.observe(el);
    window.addEventListener("resize", misuraViewport);
    return () => {
      window.cancelAnimationFrame(frameId);
      ro.disconnect();
      window.removeEventListener("resize", misuraViewport);
    };
  }, [misuraViewport, totalPages]);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (typeof event.data !== "string") return;
      try {
        const data = JSON.parse(event.data) as PageBreakMessage;
        if (data.type !== "page-breaks") return;
        setTotalPages(Math.max(1, Math.min(data.totalPages || 1, 20)));
      } catch {
        /* ignora */
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const vaiASlide = useCallback(
    (index: number) => {
      const max = totalSlides - 1;
      const next = Math.max(0, Math.min(index, max));
      setSlideAttivo(next);
      const scroller = scrollRef.current;
      if (scroller) {
        scroller.scrollTo({ left: next * scroller.clientWidth, behavior: "smooth" });
      }
    },
    [totalSlides],
  );

  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;

    function onScroll() {
      const w = scroller!.clientWidth;
      if (w <= 0) return;
      const index = Math.round(scroller!.scrollLeft / w);
      setSlideAttivo(Math.max(0, Math.min(index, totalSlides - 1)));
    }

    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", onScroll);
  }, [totalSlides]);

  const frameVisibile =
    frame.larghezza > 0 && frame.altezza > 0
      ? frame
      : typeof window !== "undefined"
        ? dimensioniFallback()
        : FRAME_VUOTO;
  const { larghezza, altezza, scale } = frameVisibile;

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-black/5 bg-[#F7F8FA] px-3 py-2.5 sm:px-4 sm:py-3">
        <div className="flex min-w-0 items-center gap-2">
          {isFirmaSlide ? (
            <PenLine className="h-4 w-4 shrink-0 text-[#0E9F8E]" aria-hidden />
          ) : (
            <FileText className="h-4 w-4 shrink-0 text-[#0E9F8E]" aria-hidden />
          )}
          <h2 className="truncate text-sm font-semibold text-[#0D1B2A]">
            {isFirmaSlide
              ? "Firma e accetta"
              : `Pagina ${paginaPreventivo + 1} di ${totalPages}`}
          </h2>
        </div>
        <span className="shrink-0 text-xs font-medium text-[#9CA3AF]">
          {slideAttivo + 1}/{totalSlides}
        </span>
      </div>

      <div ref={viewportRef} className="relative min-h-0 flex-1 bg-[#ECEEF2]">
        <div
          ref={scrollRef}
          className="absolute inset-0 flex touch-pan-x snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {Array.from({ length: totalPages }, (_, pageIndex) => (
            <div
              key={`page-${pageIndex}`}
              className="flex h-full w-full min-w-full shrink-0 snap-center items-center justify-center"
            >
              {(pageIndex === 0 || slideAttivo === pageIndex) && larghezza > 0 && altezza > 0 ? (
                <div
                  className={`overflow-hidden rounded-lg bg-white shadow-md sm:rounded-xl sm:shadow-lg ${
                    slideAttivo === pageIndex ? "" : "pointer-events-none invisible absolute"
                  }`}
                  style={{ width: larghezza, height: altezza }}
                  aria-hidden={slideAttivo !== pageIndex}
                >
                  <iframe
                    key={`iframe-${pageIndex}-${html.length}`}
                    srcDoc={htmlPerPaginaPreview(html, pageIndex, scale)}
                    title={`Preventivo pagina ${pageIndex + 1}`}
                    className="block border-0"
                    style={{ width: larghezza, height: altezza }}
                    sandbox="allow-same-origin allow-scripts"
                  />
                </div>
              ) : slideAttivo === pageIndex ? (
                <div className="h-[72%] max-h-[640px] w-[min(100%,760px)] animate-pulse rounded-lg bg-white/70" />
              ) : null}
            </div>
          ))}

          <div className="flex h-full w-full min-w-full shrink-0 snap-center overflow-hidden p-3 sm:p-5">
            <div className="mx-auto flex h-full w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm sm:max-w-none sm:rounded-2xl">
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6">
                {firmaSlide}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-center gap-2 border-t border-black/5 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
        <button
          type="button"
          disabled={slideAttivo === 0}
          onClick={() => vaiASlide(slideAttivo - 1)}
          className="inline-flex items-center gap-1 rounded-lg border border-black/10 px-2.5 py-2 text-sm text-[#0D1B2A]/70 transition hover:bg-[#F7F8FA] disabled:cursor-not-allowed disabled:opacity-40 sm:px-3"
          aria-label="Slide precedente"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">Indietro</span>
        </button>

        <div className="flex max-w-[52%] flex-wrap items-center justify-center gap-1.5 sm:max-w-none">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={`dot-page-${i}`}
              type="button"
              onClick={() => vaiASlide(i)}
              aria-label={`Pagina ${i + 1}`}
              aria-current={slideAttivo === i ? "true" : undefined}
              className={`h-2 rounded-full transition-all ${
                slideAttivo === i ? "w-5 bg-[#0E9F8E]" : "w-2 bg-black/15 hover:bg-black/25"
              }`}
            />
          ))}
          <button
            type="button"
            onClick={() => vaiASlide(totalPages)}
            aria-label="Slide firma"
            aria-current={isFirmaSlide ? "true" : undefined}
            className={`ml-0.5 flex h-5 w-5 items-center justify-center rounded-full transition-all ${
              isFirmaSlide
                ? "bg-[#0D1B2A] text-white"
                : "bg-black/10 text-[#6B7280] hover:bg-black/20"
            }`}
          >
            <PenLine className="h-3 w-3" aria-hidden />
          </button>
        </div>

        <button
          type="button"
          disabled={slideAttivo >= totalSlides - 1}
          onClick={() => vaiASlide(slideAttivo + 1)}
          className="inline-flex items-center gap-1 rounded-lg border border-black/10 px-2.5 py-2 text-sm text-[#0D1B2A]/70 transition hover:bg-[#F7F8FA] disabled:cursor-not-allowed disabled:opacity-40 sm:px-3"
          aria-label="Slide successiva"
        >
          <span className="hidden sm:inline">
            {slideAttivo === totalPages - 1 ? "Firma" : "Avanti"}
          </span>
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </section>
  );
}
