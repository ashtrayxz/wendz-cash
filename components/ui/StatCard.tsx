import { ReactNode } from 'react'
import clsx from 'clsx'

interface Props {
  label: string
  value: string
  sub?: string
  trend?: 'up' | 'down' | 'neutral'
  icon?: ReactNode
}

export default function StatCard({ label, value, sub, trend = 'neutral', icon }: Props) {
  const trendColor = {
    up: 'text-status-green',
    down: 'text-status-red',
    neutral: 'text-status-yellow',
  }[trend]

  return (
    <div className="bg-bg-card border border-bg-border rounded-lg p-4 flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-text-muted uppercase tracking-widest font-mono">{label}</p>
        {icon && <span className="text-text-muted">{icon}</span>}
      </div>
      <p className={clsx('text-xl font-mono font-medium', trendColor)}>{value}</p>
      {sub && <p className={clsx('text-[11px]', trendColor)}>{sub}</p>}
    </div>
  )
}
