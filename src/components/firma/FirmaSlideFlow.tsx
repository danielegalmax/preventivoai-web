"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, FileText, Maximize2, PenLine } from "lucide-react";
import {
  dimensioniPaginaPreview,
  htmlPerPaginaPreview,
  type PageBreakMessage,
} from "@/lib/pdfPreviewPaginata";
import { FirmaPreviewFullscreenModal } from "./FirmaPreviewFullscreenModal";

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

type PointerPoint = {
  id: number;
  x: number;
  y: number;
  pointerType: string;
};

const FRAME_VUOTO: FrameSize = { larghezza: 0, altezza: 0, scale: 1 };
const VIEW_FIT: ViewTransform = { scale: 1, translateX: 0, translateY: 0 };
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;
const SWIPE_THRESHOLD_PX = 48;

function pointerDistance(a: PointerPoint, b: PointerPoint) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
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
  const previewGestureRef = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState<FrameSize>(FRAME_VUOTO);
  const [view, setView] = useState<ViewTransform>(VIEW_FIT);
  const [totalPages, setTotalPages] = useState(1);
  const [slideAttivo, setSlideAttivo] = useState(0);
  const [previewFullscreen, setPreviewFullscreen] = useState(false);
  const [fullscreenPageIndex, setFullscreenPageIndex] = useState(0);
  const viewRef = useRef(view);
  const frameRef = useRef(frame);
  const activePointersRef = useRef<Map<number, PointerPoint>>(new Map());
  const gestureRef = useRef<
    | { mode: "idle" }
    | { mode: "pan"; pointerId: number; startX: number; startY: number; baseX: number; baseY: number }
    | { mode: "pinch"; startDistance: number; baseScale: number; baseX: number; baseY: number }
    | { mode: "swipe"; startX: number; startY: number }
  >({ mode: "idle" });

  viewRef.current = view;
  frameRef.current = frame;

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
      const fallback = dimensioniFallback();
      setFrame(fallback);
      frameRef.current = fallback;
      return;
    }

    const next = dimensioniPaginaPreview(availW, availH);
    setFrame(next);
    frameRef.current = next;
    setView((prev) => {
      const scale = clampZoom(prev.scale);
      const clamped = clampTranslate(
        prev.translateX,
        prev.translateY,
        scale,
        next.larghezza,
        next.altezza,
        el?.clientWidth ?? 0,
        el?.clientHeight ?? 0,
      );
      return { scale, ...clamped };
    });
  }, []);

  const resetView = useCallback(() => {
    setView(VIEW_FIT);
    viewRef.current = VIEW_FIT;
    activePointersRef.current.clear();
    gestureRef.current = { mode: "idle" };
  }, []);

  const applyView = useCallback((next: ViewTransform) => {
    const contentW = frameRef.current.larghezza;
    const contentH = frameRef.current.altezza;
    const el = viewportRef.current;
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
    const updated = { scale, ...clamped };
    setView(updated);
    viewRef.current = updated;
  }, []);

  const zoomToPoint = useCallback(
    (targetScale: number, clientX: number, clientY: number) => {
      const container = viewportRef.current;
      const { larghezza: contentW, altezza: contentH } = frameRef.current;
      const current = viewRef.current;
      if (!container || contentW <= 0 || contentH <= 0) return;

      const rect = container.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const scale = clampZoom(targetScale);

      if (scale <= 1) {
        resetView();
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
    [applyView, resetView],
  );

  useEffect(() => {
    setTotalPages(1);
    setSlideAttivo(0);
    resetView();
    scrollRef.current?.scrollTo({ left: 0, behavior: "auto" });
  }, [html, resetView]);

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
      resetView();
      const scroller = scrollRef.current;
      if (scroller) {
        scroller.scrollTo({ left: next * scroller.clientWidth, behavior: "smooth" });
      }
    },
    [resetView, totalSlides],
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

  function apriPreviewFullscreen() {
    if (isFirmaSlide) return;
    setFullscreenPageIndex(paginaPreventivo);
    setPreviewFullscreen(true);
  }

  useEffect(() => {
    const layer = previewGestureRef.current;
    if (!layer || isFirmaSlide || larghezza <= 0 || altezza <= 0) return;
    const gestureLayer = layer;
    const pointerMap = activePointersRef.current;

    function activePointers() {
      return Array.from(pointerMap.values());
    }

    function startPinch(points: PointerPoint[]) {
      const current = viewRef.current;
      gestureRef.current = {
        mode: "pinch",
        startDistance: pointerDistance(points[0], points[1]),
        baseScale: current.scale,
        baseX: current.translateX,
        baseY: current.translateY,
      };
    }

    function onPointerDown(e: PointerEvent) {
      e.preventDefault();
      gestureLayer.setPointerCapture(e.pointerId);
      pointerMap.set(e.pointerId, {
        id: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        pointerType: e.pointerType,
      });

      const current = viewRef.current;
      const points = activePointers();
      if (points.length >= 2) {
        startPinch(points);
        return;
      }

      if (current.scale > 1) {
        gestureRef.current = {
          mode: "pan",
          pointerId: e.pointerId,
          startX: e.clientX,
          startY: e.clientY,
          baseX: current.translateX,
          baseY: current.translateY,
        };
        return;
      }

      gestureRef.current = {
        mode: "swipe",
        startX: e.clientX,
        startY: e.clientY,
      };
    }

    function onPointerMove(e: PointerEvent) {
      const existing = pointerMap.get(e.pointerId);
      if (!existing) return;

      e.preventDefault();
      pointerMap.set(e.pointerId, {
        id: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        pointerType: e.pointerType,
      });

      const g = gestureRef.current;
      const current = viewRef.current;
      const points = activePointers();

      if (points.length >= 2) {
        if (g.mode !== "pinch") {
          startPinch(points);
          return;
        }
        const distance = pointerDistance(points[0], points[1]);
        if (g.startDistance <= 0) return;
        applyView({
          scale: clampZoom(g.baseScale * (distance / g.startDistance)),
          translateX: g.baseX,
          translateY: g.baseY,
        });
        return;
      }

      if (g.mode === "pan" && g.pointerId === e.pointerId) {
        applyView({
          scale: current.scale,
          translateX: g.baseX + (e.clientX - g.startX),
          translateY: g.baseY + (e.clientY - g.startY),
        });
      }
    }

    function onPointerEnd(e: PointerEvent) {
      const ended = pointerMap.get(e.pointerId);
      pointerMap.delete(e.pointerId);
      if (gestureLayer.hasPointerCapture(e.pointerId)) gestureLayer.releasePointerCapture(e.pointerId);

      const g = gestureRef.current;
      const current = viewRef.current;
      const points = activePointers();

      if (g.mode === "pinch") {
        gestureRef.current = { mode: "idle" };
        return;
      }

      if (g.mode === "pan" && g.pointerId === e.pointerId) {
        gestureRef.current = { mode: "idle" };
        return;
      }

      if (points.length > 0) return;

      if (g.mode === "swipe" && ended && current.scale <= 1) {
        const deltaX = ended.x - g.startX;
        const deltaY = ended.y - g.startY;
        if (Math.abs(deltaX) >= SWIPE_THRESHOLD_PX && Math.abs(deltaX) > Math.abs(deltaY)) {
          if (deltaX < 0) vaiASlide(slideAttivo + 1);
          if (deltaX > 0) vaiASlide(slideAttivo - 1);
        }
      }

      gestureRef.current = { mode: "idle" };
    }

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      zoomToPoint(viewRef.current.scale + delta, e.clientX, e.clientY);
    }

    gestureLayer.addEventListener("pointerdown", onPointerDown);
    gestureLayer.addEventListener("pointermove", onPointerMove);
    gestureLayer.addEventListener("pointerup", onPointerEnd);
    gestureLayer.addEventListener("pointercancel", onPointerEnd);
    gestureLayer.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      pointerMap.clear();
      gestureLayer.removeEventListener("pointerdown", onPointerDown);
      gestureLayer.removeEventListener("pointermove", onPointerMove);
      gestureLayer.removeEventListener("pointerup", onPointerEnd);
      gestureLayer.removeEventListener("pointercancel", onPointerEnd);
      gestureLayer.removeEventListener("wheel", onWheel);
    };
  }, [altezza, isFirmaSlide, larghezza, applyView, slideAttivo, vaiASlide, zoomToPoint]);

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
        <div className="flex shrink-0 items-center gap-2">
          {!isFirmaSlide ? (
            <button
              type="button"
              onClick={apriPreviewFullscreen}
              className="inline-flex items-center gap-1 rounded-lg border border-black/10 bg-white px-2 py-1.5 text-xs font-medium text-[#0D1B2A]/80 transition hover:bg-[#F7F8FA] sm:gap-1.5 sm:px-2.5 sm:py-2 sm:text-sm"
              aria-label="Ingrandisci anteprima preventivo"
            >
              <Maximize2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
              <span className="hidden sm:inline">Ingrandisci</span>
            </button>
          ) : null}
          <span className="text-xs font-medium text-[#9CA3AF]">
            {slideAttivo + 1}/{totalSlides}
          </span>
        </div>
      </div>

      <div ref={viewportRef} className="relative min-h-0 flex-1 bg-[#ECEEF2]">
        <div
          ref={scrollRef}
          className="absolute inset-0 flex snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {Array.from({ length: totalPages }, (_, pageIndex) => (
            <div
              key={`page-${pageIndex}`}
              className="flex h-full w-full min-w-full shrink-0 snap-center items-center justify-center"
            >
              {(pageIndex === 0 || slideAttivo === pageIndex) && larghezza > 0 && altezza > 0 ? (
                <div
                  className={`relative overflow-hidden rounded-lg bg-white shadow-md will-change-transform sm:rounded-xl sm:shadow-lg ${
                    slideAttivo === pageIndex ? "" : "pointer-events-none invisible absolute"
                  }`}
                  style={{
                    width: larghezza,
                    height: altezza,
                    transform:
                      slideAttivo === pageIndex
                        ? `translate(${view.translateX}px, ${view.translateY}px) scale(${view.scale})`
                        : undefined,
                    transformOrigin: "center center",
                  }}
                  aria-hidden={slideAttivo !== pageIndex}
                >
                  <iframe
                    key={`iframe-${pageIndex}-${html.length}`}
                    srcDoc={htmlPerPaginaPreview(html, pageIndex, scale)}
                    title={`Preventivo pagina ${pageIndex + 1}`}
                    className="pointer-events-none block border-0"
                    style={{ width: larghezza, height: altezza }}
                    sandbox="allow-same-origin allow-scripts"
                  />
                  {slideAttivo === pageIndex ? (
                    <div
                      ref={previewGestureRef}
                      className="absolute inset-0 z-10 touch-none"
                      style={{ touchAction: "none" }}
                      aria-hidden
                    />
                  ) : null}
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

      <FirmaPreviewFullscreenModal
        open={previewFullscreen}
        onClose={() => setPreviewFullscreen(false)}
        html={html}
        pageIndex={fullscreenPageIndex}
        totalPages={totalPages}
        onPageChange={setFullscreenPageIndex}
      />
    </section>
  );
}
