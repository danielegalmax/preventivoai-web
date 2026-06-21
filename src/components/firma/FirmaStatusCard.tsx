"use client";

import { useEffect, type ReactNode } from "react";
import { AlertCircle, CheckCircle2, Download, Loader2 } from "lucide-react";

type PdfDownloadLinkProps = {
  href: string;
  label: string;
  className?: string;
};

export function FirmaPdfDownloadLink({ href, label, className }: PdfDownloadLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={
        className ??
        "inline-flex items-center gap-2 rounded-xl bg-[#0D1B2A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#162540]"
      }
    >
      <Download className="h-4 w-4" aria-hidden />
      {label}
    </a>
  );
}

type StatusCardProps = {
  variant: "success" | "error" | "loading";
  title: string;
  description: ReactNode;
  action?: { href: string; label: string };
};

export function FirmaStatusCard({ variant, title, description, action }: StatusCardProps) {
  const icon =
    variant === "loading" ? (
      <Loader2 className="h-7 w-7 animate-spin text-[#0E9F8E]" aria-hidden />
    ) : variant === "success" ? (
      <CheckCircle2 className="h-7 w-7 text-[#0E9F8E]" aria-hidden />
    ) : (
      <AlertCircle className="h-7 w-7 text-[#F59E0B]" aria-hidden />
    );

  const iconBg =
    variant === "success"
      ? "bg-[#0E9F8E]/15"
      : variant === "error"
        ? "bg-[#FEF3C7]"
        : "bg-[#0E9F8E]/10";

  return (
    <div className="w-full max-w-lg rounded-2xl border border-[#E5E7EB] bg-white p-8 shadow-sm sm:max-w-xl">
      <div
        className={`mb-5 flex h-14 w-14 items-center justify-center rounded-full ${iconBg}`}
      >
        {icon}
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-[#0D1B2A]">{title}</h1>
      <div className="mt-2 text-sm leading-relaxed text-[#6B7280]">{description}</div>
      {action ? (
        <FirmaPdfDownloadLink
          href={action.href}
          label={action.label}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0D1B2A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#162540]"
        />
      ) : null}
    </div>
  );
}

export function FirmaPageShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#F7F8FA] text-[#0D1B2A]">
      {children}
      <footer className="hidden shrink-0 border-t border-black/5 px-4 py-3 text-center text-xs text-[#9CA3AF] sm:block">
        Powered by{" "}
        <span className="font-semibold text-[#0D1B2A]">
          Preventivo<span className="text-[#0E9F8E]">AI</span>
        </span>
      </footer>
    </div>
  );
}
