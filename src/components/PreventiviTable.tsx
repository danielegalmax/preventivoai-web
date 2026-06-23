'use client'

import Link from 'next/link'
import { Download, PenLine } from 'lucide-react'
import { formatEuro } from '@/lib/formatEuro'

export interface InvioFirma {
  link_token: string
  revocato_at: string | null
  scade_at: string
  inviato_at: string
}

export interface PreventivoRow {
  id: string
  nome_cliente: string | null
  importo_totale: number | null
  stato: string | null
  created_at: string
  pdf_url: string | null
  numero_preventivo: string | null
  titolo: string | null
  pagato: boolean
  preventivo_invii?: InvioFirma[] | null
}

const AVATAR_COLORS = [
  'bg-[#E1F5EE] text-[#085041]',
  'bg-[#E6F1FB] text-[#0C447C]',
  'bg-[#FEF3C7] text-[#92400E]',
  'bg-[#EDE9FE] text-[#5B21B6]',
  'bg-[#FFE4E6] text-[#9F1239]',
]

export function salutoOrario(): string {
  const h = new Date().getHours()
  if (h < 12) return 'mattino'
  if (h < 18) return 'pomeriggio'
  return 'sera'
}

export function dataItalianaMaiuscola(date = new Date()): string {
  return date
    .toLocaleDateString('it-IT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
    .toUpperCase()
}

function hashNome(nome: string): number {
  let hash = 0
  for (let i = 0; i < nome.length; i++) {
    hash = nome.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash)
}

export function inizialeCliente(nome: string | null): string {
  const n = (nome || 'C').trim()
  return n.charAt(0).toUpperCase()
}

export function coloreAvatar(nome: string | null): string {
  return AVATAR_COLORS[hashNome(nome || 'Cliente') % AVATAR_COLORS.length]
}

export function numeroPreventivoLabel(p: PreventivoRow): string {
  if (p.numero_preventivo) return p.numero_preventivo
  return p.id.slice(0, 8).toUpperCase()
}

export function linkTokenFirma(p: PreventivoRow): string | null {
  const invii = p.preventivo_invii ?? []
  const now = Date.now()
  const attivo = invii
    .filter((i) => !i.revocato_at && new Date(i.scade_at).getTime() > now)
    .sort(
      (a, b) =>
        new Date(b.inviato_at).getTime() - new Date(a.inviato_at).getTime()
    )
  return attivo[0]?.link_token ?? null
}

export function statoBadge(p: PreventivoRow): {
  label: string
  className: string
} {
  if (p.pagato || p.stato === 'pagato') {
    return {
      label: 'pagato',
      className: 'bg-[#E1F5EE] text-[#085041]',
    }
  }
  if (p.stato === 'bozza') {
    return { label: 'bozza', className: 'bg-gray-100 text-gray-600' }
  }
  if (p.stato === 'accettato') {
    return { label: 'accettato', className: 'bg-[#E6F1FB] text-[#0C447C]' }
  }
  return {
    label: 'da incassare',
    className: 'bg-[#FEF3C7] text-[#92400E]',
  }
}

type Props = {
  preventivi: PreventivoRow[]
  showHeaderLink?: boolean
  title?: string
  subtitle?: string
}

export function PreventiviTable({
  preventivi,
  showHeaderLink = false,
  title = 'Storico preventivi',
  subtitle = 'Ultimi 5 preventivi',
}: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-gray-100">
        <div>
          <h3 className="text-sm font-semibold text-[#0D1B2A]">{title}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
        </div>
        {showHeaderLink && (
          <Link
            href="/dashboard/storico"
            className="text-xs font-medium text-[#0E9F8E] hover:underline whitespace-nowrap"
          >
            Apri storico completo →
          </Link>
        )}
      </div>

      {preventivi.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-gray-400">
          Nessun preventivo ancora.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-50">
                <th className="px-5 py-3 font-medium w-12" />
                <th className="px-3 py-3 font-medium">N°</th>
                <th className="px-3 py-3 font-medium">Cliente</th>
                <th className="px-3 py-3 font-medium">Data</th>
                <th className="px-3 py-3 font-medium">Importo</th>
                <th className="px-3 py-3 font-medium">Stato</th>
                <th className="px-5 py-3 font-medium text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {preventivi.map((p) => {
                const badge = statoBadge(p)
                const token = linkTokenFirma(p)
                const importo = formatEuro(p.importo_totale)

                return (
                  <tr key={p.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3.5">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold ${coloreAvatar(p.nome_cliente)}`}
                      >
                        {inizialeCliente(p.nome_cliente)}
                      </div>
                    </td>
                    <td className="px-3 py-3.5 font-mono text-xs text-gray-500">
                      {numeroPreventivoLabel(p)}
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="font-medium text-[#0D1B2A]">
                        {p.nome_cliente || 'Cliente'}
                      </div>
                      {p.titolo && (
                        <div className="text-xs text-gray-400 truncate max-w-[140px]">
                          {p.titolo}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3.5 text-gray-500 whitespace-nowrap">
                      {new Date(p.created_at).toLocaleDateString('it-IT')}
                    </td>
                    <td className="px-3 py-3.5 font-medium text-[#0D1B2A] whitespace-nowrap">
                      {importo ?? '—'}
                    </td>
                    <td className="px-3 py-3.5">
                      <span
                        className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full capitalize ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        {token ? (
                          <Link
                            href={`/p/${token}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium border border-[#0E9F8E] text-[#0E9F8E] rounded-lg hover:bg-[#E1F5EE] transition-colors"
                          >
                            <PenLine size={13} />
                            Invia firma
                          </Link>
                        ) : (
                          <span
                            title="Genera il link firma dall'app"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium border border-gray-200 text-gray-300 rounded-lg cursor-not-allowed"
                          >
                            <PenLine size={13} />
                            Invia firma
                          </span>
                        )}
                        {p.pdf_url ? (
                          <a
                            href={p.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-gray-500 hover:text-[#0E9F8E] transition-colors"
                            title="Scarica PDF"
                          >
                            <Download size={16} />
                          </a>
                        ) : (
                          <span
                            className="p-1.5 text-gray-200 cursor-not-allowed"
                            title="PDF non disponibile"
                          >
                            <Download size={16} />
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
