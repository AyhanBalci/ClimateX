import React from 'react'
import { ChevronDown, Bell } from 'lucide-react'

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="flex items-center justify-between border-b border-agentbase-border px-6 py-4 sticky top-0 bg-agentbase-900/80 backdrop-blur-md z-10">
      <div>
        <h1 className="font-agentdisplay text-lg font-semibold text-white">{title}</h1>
        {subtitle && <p className="text-xs text-white/40 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 rounded-xl border border-agentbase-border bg-agentbase-800/60 px-3 py-2 text-xs text-white/70 hover:text-white transition-colors">
          ClimateX — Nederland
          <ChevronDown size={13} className="text-white/35" />
        </button>
        <button className="w-9 h-9 rounded-xl border border-agentbase-border bg-agentbase-800/60 flex items-center justify-center text-white/50 hover:text-white transition-colors">
          <Bell size={15} />
        </button>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-agentice-400 to-agentamber-400 flex items-center justify-center text-xs font-semibold text-agentbase-950">
          A
        </div>
      </div>
    </header>
  )
}
