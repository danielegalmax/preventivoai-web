'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { inizialeCliente } from '@/components/PreventiviTable'
import type { ReactNode } from 'react'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Prodotti digitali', href: '/dashboard/prodotti' },
] as const

type Props = {
  children: ReactNode
  nomeAzienda?: string
  activeRoute?: string
}

export function DashboardLayout({
  children,
  nomeAzienda,
  activeRoute,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const displayName = nomeAzienda || 'Artigiano'

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <header className="bg-[#0D1B2A] px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <Link
          href="/dashboard"
          className="text-lg font-semibold text-white tracking-tight hover:opacity-90"
        >
          Preventivo<span className="text-[#2DD4BF]">AI</span>
        </Link>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-full hover:bg-white/10 px-2 py-1 transition-colors"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            <span className="text-sm text-gray-300 hidden sm:inline max-w-[140px] truncate">
              {displayName}
            </span>
            <span className="w-9 h-9 rounded-full bg-[#0E9F8E] text-white text-sm font-semibold flex items-center justify-center">
              {inizialeCliente(displayName)}
            </span>
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-30"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => void handleLogout()}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Esci
              </button>
            </div>
          )}
        </div>
      </header>

      <nav className="bg-white border-b border-gray-200 sticky top-[60px] z-10">
        <div className="max-w-5xl mx-auto px-4 flex gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activeRoute === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  isActive
                    ? 'text-[#0D1B2A] border-[#0E9F8E]'
                    : 'text-gray-500 border-transparent hover:text-[#0D1B2A]'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
