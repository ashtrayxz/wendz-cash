'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Target, PiggyBank, History, Settings } from 'lucide-react'
import clsx from 'clsx'

const NAV = [
  { href: '/dashboard', label: 'Visão geral', icon: LayoutDashboard },
  { href: '/historico', label: 'Histórico', icon: History },
  { href: '/metas', label: 'Metas', icon: Target },
  { href: '/reservas', label: 'Reservas', icon: PiggyBank },
  { href: '/dashboard?tab=config', label: 'Configurar', icon: Settings },
]

export default function Sidebar() {
  const path = usePathname()

  return (
    <aside className="w-52 shrink-0 bg-bg-secondary border-r border-bg-border flex flex-col py-4 px-3 gap-1">
      <div className="flex items-center gap-2 px-2 mb-5">
        <div className="w-2 h-2 rounded-full bg-brand-purple shadow-[0_0_8px_#7c3aed]" />
        <span className="font-mono text-sm text-brand-purple tracking-tight">wendz.cash</span>
      </div>

      <p className="text-[10px] text-text-muted uppercase tracking-widest px-2 mb-1 font-mono">Menu</p>

      {NAV.map(({ href, label, icon: Icon }) => {
        const active = path === href.split('?')[0]
        return (
          <Link
            key={href}
            href={href}
            className={clsx(
              'flex items-center gap-3 px-3 py-2 rounded text-sm transition-all',
              active
                ? 'bg-bg-border text-brand-light'
                : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
            )}
          >
            <Icon size={15} />
            {label}
          </Link>
        )
      })}
    </aside>
  )
}
