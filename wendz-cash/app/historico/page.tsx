'use client'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import { Transaction, CATEGORIES } from '@/types'
import { formatCurrency } from '@/lib/finance'
import { X, Search, History } from 'lucide-react'
import clsx from 'clsx'

export default function HistoricoPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all')
  const [filterCat, setFilterCat] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    const res = await fetch('/api/transactions')
    setTransactions(await res.json())
    setLoading(false)
  }

  async function deleteTransaction(id: string) {
    await fetch('/api/transactions', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    fetchAll()
  }

  const filtered = transactions.filter((t) => {
    const matchSearch = t.description.toLowerCase().includes(search.toLowerCase())
    const matchType = filterType === 'all' || t.type === filterType
    const matchCat = filterCat === 'all' || t.category === filterCat
    return matchSearch && matchType && matchCat
  })

  const total = filtered.reduce((s, t) => t.type === 'expense' ? s - t.amount : s + t.amount, 0)

  return (
    <div className="flex h-screen overflow-hidden bg-bg-primary">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 px-6 py-4 border-b border-bg-border bg-bg-secondary">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-base font-medium">Histórico completo</h1>
              <p className="text-[11px] text-text-muted font-mono mt-0.5">// {filtered.length} lançamentos · saldo {formatCurrency(total)}</p>
            </div>
          </div>
          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1 min-w-40">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full bg-bg-card border border-bg-border rounded-lg pl-8 pr-3 py-2 text-[12px] text-text-primary outline-none focus:border-brand-purple transition-colors" />
            </div>
            <div className="flex rounded-lg overflow-hidden border border-bg-border">
              {(['all', 'expense', 'income'] as const).map(t => (
                <button key={t} onClick={() => setFilterType(t)}
                  className={clsx('px-3 py-2 text-[12px] transition-colors', filterType === t ? 'bg-brand-purple text-white' : 'text-text-muted hover:text-text-secondary bg-bg-card')}>
                  {t === 'all' ? 'Todos' : t === 'expense' ? 'Gastos' : 'Receitas'}
                </button>
              ))}
            </div>
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
              className="bg-bg-card border border-bg-border rounded-lg px-3 py-2 text-[12px] text-text-primary outline-none">
              <option value="all">Todas categorias</option>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
            </select>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex flex-col gap-2">
              {[...Array(6)].map((_, i) => <div key={i} className="h-14 bg-bg-card rounded-lg animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-text-muted">
              <History size={40} className="opacity-20" />
              <p className="text-sm">Nenhum lançamento encontrado</p>
            </div>
          ) : (
            <div className="bg-bg-card border border-bg-border rounded-xl overflow-hidden">
              {filtered.map((t, i) => {
                const cat = CATEGORIES.find(c => c.id === t.category)
                return (
                  <div key={t.id} className={clsx('flex items-center gap-3 px-5 py-3.5 group hover:bg-bg-hover transition-colors', i !== 0 && 'border-t border-bg-border')}>
                    <span className="text-base w-6 text-center flex-shrink-0">{cat?.emoji || '📦'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-text-primary truncate">{t.description}</p>
                      <p className="text-[11px] text-text-muted font-mono">{cat?.label || t.category} · {new Date(t.date).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <p className={clsx('text-[13px] font-mono font-medium flex-shrink-0', t.type === 'expense' ? 'text-status-red' : 'text-status-green')}>
                      {t.type === 'expense' ? '-' : '+'}{formatCurrency(t.amount)}
                    </p>
                    <button onClick={() => deleteTransaction(t.id)} className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-status-red transition-all ml-1 flex-shrink-0">
                      <X size={13} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
