'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { LayoutGrid, Users, Snowflake, ExternalLink } from 'lucide-react'

const NAV = [
  { to: '/dashboard', label: 'CRM Dashboard', icon: Users },
  { to: '/agents', label: 'AI Agent Center', icon: LayoutGrid },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r border-agentbase-border bg-agentbase-950/80 h-screen sticky top-0 px-4 py-5">
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-agentice-400 to-agentice-600 flex items-center justify-center">
          <Snowflake size={16} className="text-agentbase-950" />
        </div>
        <div>
          <div className="font-agentdisplay text-sm font-semibold text-white">ClimateX</div>
          <div className="text-[10px] text-white/35 -mt-0.5">Agent Platform</div>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV.map((item) => {
          const isActive = pathname === item.to || pathname.startsWith(`${item.to}/`)
          return (
            <Link
              key={item.to}
              href={item.to}
              className={clsx(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                isActive ? 'bg-agentice-500/10 text-agentice-300 border border-agentice-500/20' : 'text-white/55 hover:text-white hover:bg-white/5 border border-transparent',
              )}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium text-white/35 hover:text-white/70 hover:bg-white/5 transition-colors"
        >
          <ExternalLink size={13} />
          Naar publieke website
        </Link>
      </div>
    </aside>
  )
}
