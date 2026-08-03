import React from 'react'
import clsx from 'clsx'

export function Card({
  children,
  className,
  hover = false,
}: {
  children: React.ReactNode
  className?: string
  hover?: boolean
}) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-agentbase-border bg-agentbase-800/60 backdrop-blur-sm p-5',
        hover && 'transition-colors hover:border-agentice-600/40',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="font-agentdisplay text-sm font-medium tracking-wide text-white/90">{title}</h3>
        {subtitle && <p className="text-xs text-white/40 mt-0.5">{subtitle}</p>}
      </div>
      {right}
    </div>
  )
}
