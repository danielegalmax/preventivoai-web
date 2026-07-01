import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Firma preventivo | PreviCloud",
  description: "Accetta e firma il preventivo online in modo sicuro.",
  robots: { index: false, follow: false },
};

export default function FirmaLayout({ children }: { children: React.ReactNode }) {
  return <div className="firma-public-page flex min-h-0 flex-col">{children}</div>;
}
