'use client'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import FinnChat from '@/components/layout/FinnChat'
import StatCard from '@/components/ui/StatCard'
import GoalRing from '@/components/ui/GoalRing'
import SpendingChart from '@/components/charts/SpendingChart'
import { Transaction, Goal, Saving, UserConfig, CATEGORIES } from '@/types'
import {
  formatCurrency, calcSummary, groupByCategory,
  calcGoalProgress, buildFinancialContext, getDaysLeftInMonth, getCurrentMonth
} from '@/lib/finance'
import { Plus, Wallet, TrendingDown, Target, PiggyBank, X, ChevronRight } from 'lucide-react'
import clsx from 'clsx'

export default function Dashboard() {
  const [config, setConfig] = useState<UserConfig>({ id: '1', salary: 0, name: 'Você', updated_at: '' })
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [savings, setSavings] = useState<Saving[]>([])
  const [showAddTx, setShowAddTx] = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  const [loading, setLoading] = useState(true)

  // Add transaction form state
  const [txForm, setTxForm] = useState({
    description: '', amount: '', category: 'alimentacao', type: 'expense' as 'income' | 'expense', date: new Date().toISOString().slice(0, 10)
  })

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    const { start, end } = getCurrentMonth()
    const [cfgRes, txRes, goalsRes, savingsRes] = await Promise.all([
      fetch('/api/config'), fetch(`/api/transactions?start=${start}&end=${end}`),
      fetch('/api/goals'), fetch('/api/savings'),
    ])
    setConfig(await cfgRes.json())
    setTransactions(await txRes.json())
    setGoals(await goalsRes.json())
    setSavings(await savingsRes.json())
    setLoading(false)
  }

  async function saveConfig(e: React.FormEvent) {
    e.preventDefault()
    await fetch('/api/config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: config.name, salary: config.salary }) })
    setShowConfig(false)
    fetchAll()
  }

  async function addTransaction(e: React.FormEvent) {
    e.preventDefault()
    await fetch('/api/transactions', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...txForm, amount: parseFloat(txForm.amount) }),
    })
    setShowAddTx(false)
    setTxForm({ description: '', amount: '', category: 'alimentacao', type: 'expense', date: new Date().toISOString().slice(0, 10) })
    fetchAll()
  }

  async function deleteTransaction(id: string) {
    await fetch('/api/transactions', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    fetchAll()
  }

  const summary = calcSummary(transactions, config.salary)
  const spendingData = groupByCategory(transactions)
  const financialContext = buildFinancialContext(config.salary, transactions, goals, config.name)
  const daysLeft = getDaysLeftInMonth()
  const totalSaved = savings.reduce((s, sv) => s + sv.amount, 0)

  return (
    <div className="flex h-screen overflow-hidden bg-bg-primary">
      <Sidebar />

      <main className="flex-1 overflow-y-auto flex flex-col min-w-0">
        {/* Topbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-bg-border bg-bg-secondary sticky top-0 z-10">
          <div>
            <h1 className="text-base font-medium text-text-primary">
              Olá, {config.name} 👋
            </h1>
            <p className="text-[11px] text-text-muted font-mono mt-0.5">
              // {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })} · {daysLeft} dias restantes
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-bg-card border border-bg-border rounded-lg px-4 py-2 text-right">
              <p className="text-[10px] text-text-muted font-mono uppercase tracking-wider">Salário</p>
              <p className="text-base text-brand-muted font-mono font-medium">{formatCurrency(config.salary)}</p>
            </div>
            <button onClick={() => setShowConfig(true)} className="text-[12px] text-text-secondary hover:text-brand-light border border-bg-border rounded-lg px-3 py-2 transition-colors">
              Editar
            </button>
            <button
              onClick={() => setShowAddTx(true)}
              className="flex items-center gap-2 bg-brand-purple hover:bg-brand-violet text-white text-[12px] px-3 py-2 rounded-lg transition-colors"
            >
              <Plus size={14} /> Gasto
            </button>
          </div>
        </div>

        <div className="p-6 flex flex-col gap-6">
          {/* Stat cards */}
          <div className="grid grid-cols-4 gap-3">
            <StatCard label="Disponível" value={formatCurrency(summary.available)} sub={`${(100 - summary.spentPercent).toFixed(0)}% do salário`} trend={summary.available > 0 ? 'up' : 'down'} icon={<Wallet size={14} />} />
            <StatCard label="Gasto este mês" value={formatCurrency(summary.expenses)} sub={`${summary.spentPercent.toFixed(0)}% do salário`} trend={summary.spentPercent > 80 ? 'down' : summary.spentPercent > 60 ? 'neutral' : 'up'} icon={<TrendingDown size={14} />} />
            <StatCard label="Metas ativas" value={String(goals.length)} sub={`${goals.filter(g => calcGoalProgress(g) >= 100).length} concluída(s)`} trend="neutral" icon={<Target size={14} />} />
            <StatCard label="Reservas" value={formatCurrency(totalSaved)} sub={`${savings.length} reserva(s)`} trend="neutral" icon={<PiggyBank size={14} />} />
          </div>

          {/* Chart + Goals */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-bg-card border border-bg-border rounded-lg p-4">
              <p className="text-[11px] text-text-muted uppercase tracking-wider font-mono mb-3">Gastos por categoria</p>
              {loading ? <div className="h-40 animate-pulse bg-bg-border rounded" /> : <SpendingChart data={spendingData} />}
            </div>

            <div className="bg-bg-card border border-bg-border rounded-lg p-4">
              <p className="text-[11px] text-text-muted uppercase tracking-wider font-mono mb-3">Progresso das metas</p>
              {goals.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 gap-2 text-text-muted">
                  <Target size={28} className="opacity-30" />
                  <p className="text-sm">Nenhuma meta cadastrada</p>
                  <a href="/metas" className="text-[12px] text-brand-light flex items-center gap-1 hover:underline">
                    Criar meta <ChevronRight size={12} />
                  </a>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {goals.slice(0, 4).map((g) => {
                    const pct = calcGoalProgress(g)
                    return (
                      <div key={g.id} className="flex items-center gap-3 py-1.5 border-b border-bg-border last:border-0">
                        <span className="text-base">{g.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] text-text-primary truncate">{g.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-1 bg-bg-border rounded-full overflow-hidden">
                              <div className="h-full bg-brand-purple rounded-full transition-all" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-[10px] text-text-muted font-mono">{pct.toFixed(0)}%</span>
                          </div>
                        </div>
                        <GoalRing percent={pct} size={32} />
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Recent transactions */}
          <div className="bg-bg-card border border-bg-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] text-text-muted uppercase tracking-wider font-mono">Lançamentos recentes</p>
              <a href="/historico" className="text-[11px] text-brand-light flex items-center gap-1 hover:underline">Ver todos <ChevronRight size={11} /></a>
            </div>
            {transactions.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-6">Nenhum lançamento este mês</p>
            ) : (
              <div className="flex flex-col divide-y divide-bg-border">
                {transactions.slice(0, 8).map((t) => {
                  const cat = CATEGORIES.find((c) => c.id === t.category)
                  return (
                    <div key={t.id} className="flex items-center gap-3 py-2.5 group">
                      <span className="text-base w-6 text-center">{cat?.emoji || '📦'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-text-primary truncate">{t.description}</p>
                        <p className="text-[11px] text-text-muted font-mono">{new Date(t.date).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <p className={clsx('text-[13px] font-mono font-medium', t.type === 'expense' ? 'text-status-red' : 'text-status-green')}>
                        {t.type === 'expense' ? '-' : '+'}{formatCurrency(t.amount)}
                      </p>
                      <button onClick={() => deleteTransaction(t.id)} className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-status-red transition-all ml-1">
                        <X size={13} />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <FinnChat financialContext={financialContext} />

      {/* Modal: Add Transaction */}
      {showAddTx && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAddTx(false)}>
          <div className="bg-bg-secondary border border-bg-border rounded-xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-medium">Novo lançamento</h2>
              <button onClick={() => setShowAddTx(false)} className="text-text-muted hover:text-text-primary"><X size={16} /></button>
            </div>
            <form onSubmit={addTransaction} className="flex flex-col gap-3">
              {/* Type toggle */}
              <div className="flex rounded-lg overflow-hidden border border-bg-border">
                {(['expense', 'income'] as const).map((t) => (
                  <button key={t} type="button" onClick={() => setTxForm(f => ({ ...f, type: t }))}
                    className={clsx('flex-1 py-2 text-[13px] transition-colors', txForm.type === t ? (t === 'expense' ? 'bg-status-red/20 text-status-red' : 'bg-status-green/20 text-status-green') : 'text-text-muted hover:text-text-secondary')}>
                    {t === 'expense' ? 'Gasto' : 'Receita extra'}
                  </button>
                ))}
              </div>
              <input required placeholder="Descrição" value={txForm.description} onChange={e => setTxForm(f => ({ ...f, description: e.target.value }))}
                className="bg-bg-card border border-bg-border rounded-lg px-3 py-2.5 text-[13px] text-text-primary outline-none focus:border-brand-purple transition-colors" />
              <input required type="number" step="0.01" min="0" placeholder="Valor (R$)" value={txForm.amount} onChange={e => setTxForm(f => ({ ...f, amount: e.target.value }))}
                className="bg-bg-card border border-bg-border rounded-lg px-3 py-2.5 text-[13px] text-text-primary font-mono outline-none focus:border-brand-purple transition-colors" />
              <select value={txForm.category} onChange={e => setTxForm(f => ({ ...f, category: e.target.value }))}
                className="bg-bg-card border border-bg-border rounded-lg px-3 py-2.5 text-[13px] text-text-primary outline-none focus:border-brand-purple transition-colors">
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
              </select>
              <input type="date" value={txForm.date} onChange={e => setTxForm(f => ({ ...f, date: e.target.value }))}
                className="bg-bg-card border border-bg-border rounded-lg px-3 py-2.5 text-[13px] text-text-primary outline-none focus:border-brand-purple transition-colors" />
              <button type="submit" className="mt-1 bg-brand-purple hover:bg-brand-violet text-white rounded-lg py-2.5 text-[13px] font-medium transition-colors">
                Salvar lançamento
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Config */}
      {showConfig && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowConfig(false)}>
          <div className="bg-bg-secondary border border-bg-border rounded-xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-medium">Configurações</h2>
              <button onClick={() => setShowConfig(false)} className="text-text-muted hover:text-text-primary"><X size={16} /></button>
            </div>
            <form onSubmit={saveConfig} className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] text-text-muted font-mono uppercase tracking-wider block mb-1.5">Seu nome</label>
                <input value={config.name} onChange={e => setConfig(c => ({ ...c, name: e.target.value }))}
                  className="w-full bg-bg-card border border-bg-border rounded-lg px-3 py-2.5 text-[13px] text-text-primary outline-none focus:border-brand-purple transition-colors" />
              </div>
              <div>
                <label className="text-[11px] text-text-muted font-mono uppercase tracking-wider block mb-1.5">Salário mensal (R$)</label>
                <input type="number" step="0.01" min="0" value={config.salary || ''} onChange={e => setConfig(c => ({ ...c, salary: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-bg-card border border-bg-border rounded-lg px-3 py-2.5 text-[13px] text-text-primary font-mono outline-none focus:border-brand-purple transition-colors" />
              </div>
              <button type="submit" className="mt-1 bg-brand-purple hover:bg-brand-violet text-white rounded-lg py-2.5 text-[13px] font-medium transition-colors">
                Salvar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
