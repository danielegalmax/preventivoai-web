"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Eraser, PenLine } from "lucide-react";

type Props = {
  onChange: (dataUrl: string | null) => void;
};

export function SignaturePad({ onChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const hasStroke = useRef(false);
  const [active, setActive] = useState(false);

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#0D1B2A";
  }, []);

  useEffect(() => {
    setupCanvas();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => {
      const hadStroke = hasStroke.current;
      setupCanvas();
      if (!hadStroke) onChange(null);
    });
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [onChange, setupCanvas]);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const exportFirma = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !hasStroke.current) {
      onChange(null);
      return;
    }
    onChange(canvas.toDataURL("image/png"));
  }, [onChange]);

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasStroke.current = false;
    setActive(false);
    onChange(null);
  };

  return (
    <div>
      <div
        className={`relative overflow-hidden rounded-xl border-2 border-dashed transition-colors ${
          active ? "border-[#0E9F8E] bg-white" : "border-[#D1D5DB] bg-[#FAFBFC]"
        }`}
      >
        {!hasStroke.current && !active ? (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 text-[#9CA3AF]">
            <PenLine className="h-5 w-5" aria-hidden />
            <span className="text-xs sm:text-sm">Disegna la firma con mouse o dito</span>
          </div>
        ) : null}
        <canvas
          ref={canvasRef}
          className="relative z-10 h-40 w-full touch-none sm:h-36"
          onPointerDown={(e) => {
            drawing.current = true;
            setActive(true);
            const ctx = canvasRef.current!.getContext("2d")!;
            const p = pos(e);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            canvasRef.current!.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!drawing.current) return;
            const ctx = canvasRef.current!.getContext("2d")!;
            const p = pos(e);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
            hasStroke.current = true;
          }}
          onPointerUp={() => {
            drawing.current = false;
            exportFirma();
          }}
          onPointerLeave={() => {
            if (!drawing.current) return;
            drawing.current = false;
            exportFirma();
          }}
        />
      </div>
      <button
        type="button"
        onClick={clear}
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#6B7280] underline-offset-2 hover:text-[#0D1B2A] hover:underline"
      >
        <Eraser className="h-3.5 w-3.5" aria-hidden />
        Cancella firma
      </button>
    </div>
  );
}
