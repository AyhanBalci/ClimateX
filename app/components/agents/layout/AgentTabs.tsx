'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

export interface AgentTab {
  to: string
  label: string
  end?: boolean
}

export function AgentTabs({ tabs }: { tabs: AgentTab[] }) {
  const pathname = usePathname()

  return (
    <div className="flex items-center gap-1 border-b border-agentbase-border mb-6 overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = tab.end ? pathname === tab.to : pathname === tab.to || pathname.startsWith(`${tab.to}/`)
        return (
          <Link
            key={tab.to}
            href={tab.to}
            className={clsx(
              'px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors',
              isActive ? 'border-agentice-400 text-white' : 'border-transparent text-white/45 hover:text-white/80',
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
