'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { CATEGORIES } from '@/types'
import { formatCurrency } from '@/lib/finance'

interface Props {
  data: { category: string; amount: number }[]
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    const cat = CATEGORIES.find((c) => c.id === payload[0].payload.category)
    return (
      <div className="bg-bg-card border border-bg-border rounded-lg px-3 py-2 text-[12px]">
        <p className="text-text-secondary">{cat?.emoji} {cat?.label || payload[0].payload.category}</p>
        <p className="text-brand-light font-mono font-medium">{formatCurrency(payload[0].value)}</p>
      </div>
    )
  }
  return null
}

export default function SpendingChart({ data }: Props) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-40 text-text-muted text-sm">
        Nenhum gasto registrado ainda
      </div>
    )
  }

  const enriched = data.map((d) => {
    const cat = CATEGORIES.find((c) => c.id === d.category)
    return { ...d, color: cat?.color || '#64748b', label: cat?.label || d.category }
  })

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={enriched} barSize={20}>
        <XAxis
          dataKey="label"
          tick={{ fill: '#475569', fontSize: 10, fontFamily: 'JetBrains Mono' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis hide />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e1e2e' }} />
        <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
          {enriched.map((entry, i) => (
            <Cell key={i} fill={entry.color} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
