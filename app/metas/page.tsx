'use client'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import GoalRing from '@/components/ui/GoalRing'
import { Goal } from '@/types'
import { formatCurrency, calcGoalProgress } from '@/lib/finance'
import { Plus, X, Pencil, Trophy } from 'lucide-react'
import clsx from 'clsx'

const EMOJIS = ['🎮', '✈️', '📱', '🏠', '🚗', '💻', '👟', '📚', '🎸', '💍', '🏋️', '🎯']

export default function MetasPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Goal | null>(null)
  const [form, setForm] = useState({ name: '', emoji: '🎯', target_amount: '', current_amount: '', deadline: '' })

  useEffect(() => { fetchGoals() }, [])

  async function fetchGoals() {
    const res = await fetch('/api/goals')
    setGoals(await res.json())
  }

  function openNew() {
    setEditing(null)
    setForm({ name: '', emoji: '🎯', target_amount: '', current_amount: '', deadline: '' })
    setShowForm(true)
  }

  function openEdit(g: Goal) {
    setEditing(g)
    setForm({ name: g.name, emoji: g.emoji, target_amount: String(g.target_amount), current_amount: String(g.current_amount), deadline: g.deadline || '' })
    setShowForm(true)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const payload = { name: form.name, emoji: form.emoji, target_amount: parseFloat(form.target_amount), current_amount: parseFloat(form.current_amount) || 0, deadline: form.deadline || null }
    if (editing) {
      await fetch('/api/goals', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editing.id, ...payload }) })
    } else {
      await fetch('/api/goals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    }
    setShowForm(false)
    fetchGoals()
  }

  async function addDeposit(goal: Goal, amount: number) {
    const newAmount = Math.min(goal.current_amount + amount, goal.target_amount)
    await fetch('/api/goals', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: goal.id, current_amount: newAmount }) })
    fetchGoals()
  }

  async function deleteGoal(id: string) {
    await fetch('/api/goals', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    fetchGoals()
  }

  return (
    <div className="flex h-screen overflow-hidden bg-bg-primary">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-bg-border bg-bg-secondary">
          <div>
            <h1 className="text-base font-medium">Minhas Metas</h1>
            <p className="text-[11px] text-text-muted font-mono mt-0.5">// defina onde quer chegar</p>
          </div>
          <button onClick={openNew} className="flex items-center gap-2 bg-brand-purple hover:bg-brand-violet text-white text-[12px] px-3 py-2 rounded-lg transition-colors">
            <Plus size={14} /> Nova meta
          </button>
        </div>

        <div className="p-6">
          {goals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-text-muted">
              <Trophy size={40} className="opacity-20" />
              <p className="text-sm">Nenhuma meta ainda</p>
              <button onClick={openNew} className="text-[12px] text-brand-light hover:underline">Criar minha primeira meta</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {goals.map((g) => {
                const pct = calcGoalProgress(g)
                const done = pct >= 100
                return (
                  <div key={g.id} className={clsx('bg-bg-card border rounded-xl p-5 flex flex-col gap-4 relative group', done ? 'border-status-green/30' : 'border-bg-border')}>
                    {done && <div className="absolute top-3 right-3 text-status-green text-[10px] font-mono bg-status-green/10 px-2 py-0.5 rounded-full">✓ concluída</div>}
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{g.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{g.name}</p>
                        {g.deadline && <p className="text-[11px] text-text-muted font-mono mt-0.5">até {new Date(g.deadline).toLocaleDateString('pt-BR')}</p>}
                      </div>
                      <GoalRing percent={pct} size={44} color={done ? '#34d399' : '#7c3aed'} />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-text-muted font-mono mb-1.5">
                        <span>{formatCurrency(g.current_amount)}</span>
                        <span>{pct.toFixed(0)}% de {formatCurrency(g.target_amount)}</span>
                      </div>
                      <div className="h-1.5 bg-bg-border rounded-full overflow-hidden">
                        <div className={clsx('h-full rounded-full transition-all duration-500', done ? 'bg-status-green' : 'bg-brand-purple')} style={{ width: `${pct}%` }} />
                      </div>
                    </div>

                    {!done && (
                      <div className="flex gap-2">
                        {[50, 100, 200].map((v) => (
                          <button key={v} onClick={() => addDeposit(g, v)}
                            className="flex-1 text-[11px] font-mono bg-bg-border hover:bg-brand-purple/20 hover:text-brand-light text-text-muted rounded-lg py-1.5 transition-colors">
                            +{formatCurrency(v)}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(g)} className="flex-1 flex items-center justify-center gap-1.5 text-[11px] text-text-muted hover:text-brand-light border border-bg-border rounded-lg py-1.5 transition-colors">
                        <Pencil size={11} /> Editar
                      </button>
                      <button onClick={() => deleteGoal(g.id)} className="flex-1 flex items-center justify-center gap-1.5 text-[11px] text-text-muted hover:text-status-red border border-bg-border rounded-lg py-1.5 transition-colors">
                        <X size={11} /> Remover
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-bg-secondary border border-bg-border rounded-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-medium">{editing ? 'Editar meta' : 'Nova meta'}</h2>
              <button onClick={() => setShowForm(false)} className="text-text-muted hover:text-text-primary"><X size={16} /></button>
            </div>
            <form onSubmit={submit} className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] text-text-muted font-mono uppercase tracking-wider block mb-1.5">Emoji</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJIS.map(em => (
                    <button key={em} type="button" onClick={() => setForm(f => ({ ...f, emoji: em }))}
                      className={clsx('text-xl p-1.5 rounded-lg transition-colors', form.emoji === em ? 'bg-brand-purple/30 ring-1 ring-brand-purple' : 'hover:bg-bg-border')}>
                      {em}
                    </button>
                  ))}
                </div>
              </div>
              <input required placeholder="Nome da meta (ex: PS5)" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="bg-bg-card border border-bg-border rounded-lg px-3 py-2.5 text-[13px] text-text-primary outline-none focus:border-brand-purple transition-colors" />
              <input required type="number" step="0.01" min="1" placeholder="Valor total (R$)" value={form.target_amount} onChange={e => setForm(f => ({ ...f, target_amount: e.target.value }))}
                className="bg-bg-card border border-bg-border rounded-lg px-3 py-2.5 text-[13px] text-text-primary font-mono outline-none focus:border-brand-purple transition-colors" />
              <input type="number" step="0.01" min="0" placeholder="Já guardou quanto? (R$)" value={form.current_amount} onChange={e => setForm(f => ({ ...f, current_amount: e.target.value }))}
                className="bg-bg-card border border-bg-border rounded-lg px-3 py-2.5 text-[13px] text-text-primary font-mono outline-none focus:border-brand-purple transition-colors" />
              <div>
                <label className="text-[11px] text-text-muted font-mono uppercase tracking-wider block mb-1.5">Prazo (opcional)</label>
                <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                  className="w-full bg-bg-card border border-bg-border rounded-lg px-3 py-2.5 text-[13px] text-text-primary outline-none focus:border-brand-purple transition-colors" />
              </div>
              <button type="submit" className="mt-1 bg-brand-purple hover:bg-brand-violet text-white rounded-lg py-2.5 text-[13px] font-medium transition-colors">
                {editing ? 'Salvar alterações' : 'Criar meta'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
