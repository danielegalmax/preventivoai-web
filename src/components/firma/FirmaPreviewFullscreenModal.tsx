"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  dimensioniPaginaPreview,
  htmlPerPaginaPreviewFullscreen,
} from "@/lib/pdfPreviewPaginata";

type FrameSize = {
  larghezza: number;
  altezza: number;
  scale: number;
};

const FRAME_VUOTO: FrameSize = { larghezza: 0, altezza: 0, scale: 1 };

type Props = {
  open: boolean;
  onClose: () => void;
  html: string;
  pageIndex: number;
  totalPages: number;
  onPageChange: (index: number) => void;
};

const SWIPE_THRESHOLD_PX = 48;

export function FirmaPreviewFullscreenModal({
  open,
  onClose,
  html,
  pageIndex,
  totalPages,
  onPageChange,
}: Props) {
  const touchStartX = useRef<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [mountedPage, setMountedPage] = useState(pageIndex);
  const [frame, setFrame] = useState<FrameSize>(FRAME_VUOTO);

  const misuraContainer = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setFrame(dimensioniPaginaPreview(el.clientWidth, el.clientHeight));
  }, []);

  useEffect(() => {
    if (open) setMountedPage(pageIndex);
  }, [open, pageIndex]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && pageIndex > 0) onPageChange(pageIndex - 1);
      if (e.key === "ArrowRight" && pageIndex < totalPages - 1) onPageChange(pageIndex + 1);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, onPageChange, pageIndex, totalPages]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    misuraContainer();

    let frameId = 0;
    let retries = 0;
    const retryMisura = () => {
      const el = scrollRef.current;
      if (el && el.clientHeight > 0) {
        misuraContainer();
        return;
      }
      if (retries < 12) {
        retries += 1;
        frameId = window.requestAnimationFrame(retryMisura);
      }
    };
    frameId = window.requestAnimationFrame(retryMisura);

    const el = scrollRef.current;
    if (!el) {
      return () => window.cancelAnimationFrame(frameId);
    }

    const ro = new ResizeObserver(misuraContainer);
    ro.observe(el);
    window.addEventListener("resize", misuraContainer);
    return () => {
      window.cancelAnimationFrame(frameId);
      ro.disconnect();
      window.removeEventListener("resize", misuraContainer);
    };
  }, [open, misuraContainer]);

  const vaiA = useCallback(
    (index: number) => {
      const next = Math.max(0, Math.min(index, totalPages - 1));
      setMountedPage(next);
      onPageChange(next);
    },
    [onPageChange, totalPages],
  );

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  }

  function onTouchEnd(e: React.TouchEvent) {
    const start = touchStartX.current;
    touchStartX.current = null;
    if (start == null) return;
    const endX = e.changedTouches[0]?.clientX;
    if (endX == null) return;
    const delta = endX - start;
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return;
    if (delta < 0 && pageIndex < totalPages - 1) vaiA(pageIndex + 1);
    if (delta > 0 && pageIndex > 0) vaiA(pageIndex - 1);
  }

  if (!open) return null;

  const { larghezza, altezza, scale } =
    frame.larghezza > 0 && frame.altezza > 0
      ? frame
      : typeof window !== "undefined"
        ? dimensioniPaginaPreview(window.innerWidth, window.innerHeight * 0.65)
        : FRAME_VUOTO;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-[#0D1B2A]/95"
      role="dialog"
      aria-modal="true"
      aria-label={`Anteprima preventivo pagina ${pageIndex + 1} di ${totalPages}`}
    >
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-3 py-3 sm:px-5">
        <p className="text-sm font-semibold text-white">
          Pagina {pageIndex + 1} di {totalPages}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 px-3 py-2 text-sm text-white transition hover:bg-white/10"
          aria-label="Chiudi anteprima ingrandita"
        >
          <X className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">Chiudi</span>
        </button>
      </header>

      <div
        ref={scrollRef}
        className="relative min-h-0 flex-1 overflow-auto overscroll-contain bg-[#ECEEF2] touch-pan-x touch-pan-y"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="flex min-h-full min-w-full items-start justify-center p-3 sm:p-6">
          {larghezza > 0 && altezza > 0 ? (
            <iframe
              key={`fullscreen-${mountedPage}-${html.length}-${scale.toFixed(4)}`}
              srcDoc={htmlPerPaginaPreviewFullscreen(html, mountedPage, scale)}
              title={`Preventivo pagina ${mountedPage + 1} ingrandita`}
              className="block shrink-0 border-0 bg-white shadow-2xl"
              style={{
                width: larghezza,
                height: altezza,
              }}
              sandbox="allow-same-origin allow-scripts"
            />
          ) : (
            <div
              className="animate-pulse rounded-lg bg-white/70 shadow-2xl"
              style={{ width: "min(100%, 320px)", aspectRatio: "800 / 1123" }}
            />
          )}
        </div>
      </div>

      {totalPages > 1 ? (
        <footer className="flex shrink-0 items-center justify-center gap-3 border-t border-white/10 px-3 py-3 sm:gap-4">
          <button
            type="button"
            disabled={pageIndex === 0}
            onClick={() => vaiA(pageIndex - 1)}
            className="inline-flex items-center gap-1 rounded-lg border border-white/20 px-3 py-2 text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Pagina precedente"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Precedente</span>
          </button>
          <span className="text-xs font-medium text-white/70">
            {pageIndex + 1} / {totalPages}
          </span>
          <button
            type="button"
            disabled={pageIndex >= totalPages - 1}
            onClick={() => vaiA(pageIndex + 1)}
            className="inline-flex items-center gap-1 rounded-lg border border-white/20 px-3 py-2 text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Pagina successiva"
          >
            <span className="hidden sm:inline">Successiva</span>
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </footer>
      ) : null}
    </div>
  );
}
