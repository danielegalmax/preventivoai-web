'use client'

import Link from 'next/link'
import { LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { ReactNode } from 'react'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Preventivi', href: '/dashboard/storico' },
  { label: 'Prodotti digitali', href: '/dashboard/prodotti' },
  { label: 'Impostazioni', href: '/dashboard/settings' },
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
  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <header className="bg-[#0D1B2A] px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <Link
          href="/dashboard"
          className="text-lg font-semibold text-white tracking-tight hover:opacity-90"
        >
          Preventivo<span className="text-[#2DD4BF]">AI</span>
        </Link>
        <div className="flex items-center gap-4">
          {nomeAzienda && (
            <span className="text-sm text-gray-300 hidden sm:inline">
              {nomeAzienda}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <nav className="bg-white border-b border-gray-200 sticky top-[60px] z-10">
        <div className="max-w-4xl mx-auto px-4 flex gap-1 overflow-x-auto">
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

      <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
