"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Minus, Plus, Scan, X } from "lucide-react";
import {
  dimensioniPaginaPreview,
  htmlPerPaginaPreviewFullscreen,
} from "@/lib/pdfPreviewPaginata";

type FrameSize = {
  larghezza: number;
  altezza: number;
  scale: number;
};

type ViewTransform = {
  scale: number;
  translateX: number;
  translateY: number;
};

const FRAME_VUOTO: FrameSize = { larghezza: 0, altezza: 0, scale: 1 };
const VIEW_FIT: ViewTransform = { scale: 1, translateX: 0, translateY: 0 };
const MAX_ZOOM = 3;
const SWIPE_THRESHOLD_PX = 48;
const DOUBLE_TAP_MS = 320;
const DOUBLE_TAP_SLOP_PX = 24;
const ZOOM_STEP = 0.25;

type Props = {
  open: boolean;
  onClose: () => void;
  html: string;
  pageIndex: number;
  totalPages: number;
  onPageChange: (index: number) => void;
};

function touchDistance(touches: TouchList) {
  if (touches.length < 2) return 0;
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.hypot(dx, dy);
}

function clampZoom(scale: number) {
  return Math.min(MAX_ZOOM, Math.max(1, scale));
}

function clampTranslate(
  translateX: number,
  translateY: number,
  scale: number,
  contentW: number,
  contentH: number,
  containerW: number,
  containerH: number,
): Pick<ViewTransform, "translateX" | "translateY"> {
  if (scale <= 1 || contentW <= 0 || contentH <= 0) {
    return { translateX: 0, translateY: 0 };
  }
  const scaledW = contentW * scale;
  const scaledH = contentH * scale;
  const maxTx = Math.max(0, (scaledW - containerW) / 2);
  const maxTy = Math.max(0, (scaledH - containerH) / 2);
  return {
    translateX: Math.min(maxTx, Math.max(-maxTx, translateX)),
    translateY: Math.min(maxTy, Math.max(-maxTy, translateY)),
  };
}

export function FirmaPreviewFullscreenModal({
  open,
  onClose,
  html,
  pageIndex,
  totalPages,
  onPageChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const touchOverlayRef = useRef<HTMLDivElement>(null);
  const [mountedPage, setMountedPage] = useState(pageIndex);
  const [frame, setFrame] = useState<FrameSize>(FRAME_VUOTO);
  const [view, setView] = useState<ViewTransform>(VIEW_FIT);
  const viewRef = useRef(view);
  const frameRef = useRef(frame);

  viewRef.current = view;
  frameRef.current = frame;

  const gestureRef = useRef<
    | { mode: "idle" }
    | { mode: "pan"; startX: number; startY: number; baseX: number; baseY: number }
    | { mode: "pinch"; startDistance: number; baseScale: number; baseX: number; baseY: number }
    | { mode: "swipe"; startX: number; startY: number }
  >({ mode: "idle" });
  const lastTapRef = useRef<{ at: number; x: number; y: number } | null>(null);

  const misuraContainer = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const next = dimensioniPaginaPreview(el.clientWidth, el.clientHeight);
    setFrame(next);
    setView((prev) => {
      const clamped = clampTranslate(
        prev.translateX,
        prev.translateY,
        prev.scale,
        next.larghezza,
        next.altezza,
        el.clientWidth,
        el.clientHeight,
      );
      return { scale: clampZoom(prev.scale), ...clamped };
    });
  }, []);

  const resetView = useCallback(() => {
    setView(VIEW_FIT);
    gestureRef.current = { mode: "idle" };
  }, []);

  const applyView = useCallback((next: ViewTransform) => {
    const contentW = frameRef.current.larghezza;
    const contentH = frameRef.current.altezza;
    const el = containerRef.current;
    const containerW = el?.clientWidth ?? 0;
    const containerH = el?.clientHeight ?? 0;
    const scale = clampZoom(next.scale);
    const clamped = clampTranslate(
      next.translateX,
      next.translateY,
      scale,
      contentW,
      contentH,
      containerW,
      containerH,
    );
    setView({ scale, ...clamped });
  }, []);

  const zoomToPoint = useCallback(
    (targetScale: number, clientX: number, clientY: number) => {
      const container = containerRef.current;
      const { larghezza, altezza } = frameRef.current;
      const current = viewRef.current;
      if (!container || larghezza <= 0 || altezza <= 0) return;

      const rect = container.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const scale = clampZoom(targetScale);

      if (scale <= 1) {
        setView(VIEW_FIT);
        return;
      }

      const offsetX = clientX - cx;
      const offsetY = clientY - cy;
      const factor = 1 - scale / current.scale;
      applyView({
        scale,
        translateX: current.translateX + offsetX * factor * 0.5,
        translateY: current.translateY + offsetY * factor * 0.5,
      });
    },
    [applyView],
  );

  useEffect(() => {
    if (open) {
      setMountedPage(pageIndex);
      resetView();
    }
  }, [open, pageIndex, resetView]);

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
      const el = containerRef.current;
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

    const el = containerRef.current;
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

  useEffect(() => {
    resetView();
  }, [mountedPage, resetView]);

  const vaiA = useCallback(
    (index: number) => {
      const next = Math.max(0, Math.min(index, totalPages - 1));
      setMountedPage(next);
      onPageChange(next);
    },
    [onPageChange, totalPages],
  );

  useEffect(() => {
    const layer = touchOverlayRef.current;
    if (!open || !layer) return;

    function onTouchStart(e: TouchEvent) {
      const current = viewRef.current;
      if (e.touches.length === 2) {
        e.preventDefault();
        gestureRef.current = {
          mode: "pinch",
          startDistance: touchDistance(e.touches),
          baseScale: current.scale,
          baseX: current.translateX,
          baseY: current.translateY,
        };
        return;
      }

      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      if (current.scale > 1) {
        e.preventDefault();
        gestureRef.current = {
          mode: "pan",
          startX: touch.clientX,
          startY: touch.clientY,
          baseX: current.translateX,
          baseY: current.translateY,
        };
        return;
      }

      gestureRef.current = {
        mode: "swipe",
        startX: touch.clientX,
        startY: touch.clientY,
      };
    }

    function onTouchMove(e: TouchEvent) {
      const g = gestureRef.current;
      const current = viewRef.current;
      if (g.mode === "pinch" && e.touches.length >= 2) {
        e.preventDefault();
        const distance = touchDistance(e.touches);
        if (g.startDistance <= 0) return;
        const nextScale = clampZoom(g.baseScale * (distance / g.startDistance));
        applyView({
          scale: nextScale,
          translateX: g.baseX,
          translateY: g.baseY,
        });
        return;
      }

      if (g.mode === "pan" && e.touches.length === 1) {
        e.preventDefault();
        const touch = e.touches[0];
        applyView({
          scale: current.scale,
          translateX: g.baseX + (touch.clientX - g.startX),
          translateY: g.baseY + (touch.clientY - g.startY),
        });
      }
    }

    function onTouchEnd(e: TouchEvent) {
      const g = gestureRef.current;
      const current = viewRef.current;

      if (g.mode === "pinch" && e.touches.length < 2) {
        gestureRef.current = { mode: "idle" };
        return;
      }

      if (g.mode === "pan" && e.touches.length === 0) {
        gestureRef.current = { mode: "idle" };
        return;
      }

      if (g.mode === "swipe" && e.changedTouches.length === 1) {
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - g.startX;
        const deltaY = touch.clientY - g.startY;

        if (
          current.scale <= 1 &&
          Math.abs(deltaX) >= SWIPE_THRESHOLD_PX &&
          Math.abs(deltaX) > Math.abs(deltaY)
        ) {
          if (deltaX < 0 && pageIndex < totalPages - 1) vaiA(pageIndex + 1);
          if (deltaX > 0 && pageIndex > 0) vaiA(pageIndex - 1);
        } else if (
          current.scale <= 1 &&
          Math.abs(deltaX) < DOUBLE_TAP_SLOP_PX &&
          Math.abs(deltaY) < DOUBLE_TAP_SLOP_PX
        ) {
          const now = Date.now();
          const last = lastTapRef.current;
          if (last && now - last.at <= DOUBLE_TAP_MS) {
            if (current.scale > 1.01) {
              resetView();
            } else {
              zoomToPoint(2, touch.clientX, touch.clientY);
            }
            lastTapRef.current = null;
          } else {
            lastTapRef.current = { at: now, x: touch.clientX, y: touch.clientY };
          }
        }

        gestureRef.current = { mode: "idle" };
      }
    }

    layer.addEventListener("touchstart", onTouchStart, { passive: false });
    layer.addEventListener("touchmove", onTouchMove, { passive: false });
    layer.addEventListener("touchend", onTouchEnd, { passive: false });
    layer.addEventListener("touchcancel", onTouchEnd, { passive: false });

    return () => {
      layer.removeEventListener("touchstart", onTouchStart);
      layer.removeEventListener("touchmove", onTouchMove);
      layer.removeEventListener("touchend", onTouchEnd);
      layer.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [applyView, frame.altezza, frame.larghezza, open, pageIndex, resetView, totalPages, vaiA, zoomToPoint]);

  if (!open) return null;

  const { larghezza, altezza, scale: fitScale } =
    frame.larghezza > 0 && frame.altezza > 0
      ? frame
      : typeof window !== "undefined"
        ? dimensioniPaginaPreview(window.innerWidth, window.innerHeight * 0.65)
        : FRAME_VUOTO;

  const atFit = view.scale <= 1.01;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-[#0D1B2A]/95"
      role="dialog"
      aria-modal="true"
      aria-label={`Anteprima preventivo pagina ${pageIndex + 1} di ${totalPages}`}
    >
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-white/10 px-3 py-3 sm:gap-3 sm:px-5">
        <p className="min-w-0 truncate text-sm font-semibold text-white">
          Pagina {pageIndex + 1} di {totalPages}
        </p>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <div className="flex items-center rounded-lg border border-white/20">
            <button
              type="button"
              onClick={() => applyView({ ...view, scale: clampZoom(view.scale - ZOOM_STEP) })}
              disabled={atFit}
              className="inline-flex h-9 w-9 items-center justify-center text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Riduci zoom"
            >
              <Minus className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => applyView({ ...view, scale: clampZoom(view.scale + ZOOM_STEP) })}
              disabled={view.scale >= MAX_ZOOM - 0.001}
              className="inline-flex h-9 w-9 items-center justify-center border-x border-white/20 text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Aumenta zoom"
            >
              <Plus className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={resetView}
              className="inline-flex h-9 items-center gap-1 px-2.5 text-xs font-medium text-white transition hover:bg-white/10 sm:text-sm"
              aria-label="Adatta allo schermo"
            >
              <Scan className="h-4 w-4 shrink-0" aria-hidden />
              <span className="hidden sm:inline">Adatta</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 px-3 py-2 text-sm text-white transition hover:bg-white/10"
            aria-label="Chiudi anteprima ingrandita"
          >
            <X className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Chiudi</span>
          </button>
        </div>
      </header>

      <div
        ref={containerRef}
        className="relative min-h-0 flex-1 overflow-hidden bg-[#ECEEF2]"
      >
        <div className="flex h-full w-full items-center justify-center p-3 sm:p-6">
          {larghezza > 0 && altezza > 0 ? (
            <div
              className="relative will-change-transform"
              style={{
                width: larghezza,
                height: altezza,
                transform: `translate(${view.translateX}px, ${view.translateY}px) scale(${view.scale})`,
                transformOrigin: "center center",
              }}
            >
              <iframe
                key={`fullscreen-${mountedPage}-${html.length}-${fitScale.toFixed(4)}`}
                srcDoc={htmlPerPaginaPreviewFullscreen(html, mountedPage, fitScale)}
                title={`Preventivo pagina ${mountedPage + 1} ingrandita`}
                className="pointer-events-none block h-full w-full border-0 bg-white shadow-2xl"
                sandbox="allow-same-origin allow-scripts"
              />
              <div
                ref={touchOverlayRef}
                className="absolute inset-0 z-10 touch-none"
                style={{ touchAction: "none" }}
                aria-hidden
              />
            </div>
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
