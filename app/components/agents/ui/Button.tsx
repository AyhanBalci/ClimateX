import React from 'react'
import clsx from 'clsx'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  const variants: Record<string, string> = {
    primary: 'bg-agentice-500 text-agentbase-950 hover:bg-agentice-400 font-semibold shadow-agentglow',
    secondary: 'bg-white/5 text-white hover:bg-white/10 border border-white/10',
    ghost: 'text-white/60 hover:text-white hover:bg-white/5',
    danger: 'bg-agentcrit/15 text-agentcrit border border-agentcrit/30 hover:bg-agentcrit/25',
  }
  const sizes: Record<string, string> = {
    sm: 'text-xs px-3 py-1.5 rounded-lg',
    md: 'text-sm px-4 py-2 rounded-xl',
  }
  return (
    <button
      className={clsx('inline-flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap', variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  )
}
