'use client'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import { Saving } from '@/types'
import { formatCurrency } from '@/lib/finance'
import { Plus, X, PiggyBank } from 'lucide-react'

const EMOJIS = ['🏦', '🚨', '🏥', '✈️', '🎓', '🏠', '👶', '💼', '🌱', '💎']

export default function ReservasPage() {
  const [savings, setSavings] = useState<Saving[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', emoji: '🏦', amount: '', description: '' })

  useEffect(() => { fetchSavings() }, [])

  async function fetchSavings() {
    const res = await fetch('/api/savings')
    setSavings(await res.json())
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    await fetch('/api/savings', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
    })
    setShowForm(false)
    setForm({ name: '', emoji: '🏦', amount: '', description: '' })
    fetchSavings()
  }

  async function deleteSaving(id: string) {
    await fetch('/api/savings', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    fetchSavings()
  }

  const total = savings.reduce((s, sv) => s + sv.amount, 0)

  return (
    <div className="flex h-screen overflow-hidden bg-bg-primary">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-bg-border bg-bg-secondary">
          <div>
            <h1 className="text-base font-medium">Reservas</h1>
            <p className="text-[11px] text-text-muted font-mono mt-0.5">// dinheiro separado com propósito</p>
          </div>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-brand-purple hover:bg-brand-violet text-white text-[12px] px-3 py-2 rounded-lg transition-colors">
            <Plus size={14} /> Nova reserva
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          {/* Total */}
          <div className="bg-bg-card border border-bg-border rounded-xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-purple/20 flex items-center justify-center">
              <PiggyBank size={22} className="text-brand-muted" />
            </div>
            <div>
              <p className="text-[11px] text-text-muted font-mono uppercase tracking-wider">Total reservado</p>
              <p className="text-2xl text-brand-muted font-mono font-medium mt-0.5">{formatCurrency(total)}</p>
            </div>
          </div>

          {savings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-text-muted">
              <PiggyBank size={40} className="opacity-20" />
              <p className="text-sm">Nenhuma reserva ainda</p>
              <p className="text-[12px] text-center max-w-xs opacity-70">Reservas são valores que você separou com um propósito claro: emergência, saúde, viagem...</p>
              <button onClick={() => setShowForm(true)} className="text-[12px] text-brand-light hover:underline mt-1">Criar primeira reserva</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savings.map((s) => (
                <div key={s.id} className="bg-bg-card border border-bg-border rounded-xl p-5 flex flex-col gap-3 group relative">
                  <button onClick={() => deleteSaving(s.id)} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-text-muted hover:text-status-red transition-all">
                    <X size={14} />
                  </button>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{s.emoji}</span>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{s.name}</p>
                      {s.description && <p className="text-[11px] text-text-muted mt-0.5">{s.description}</p>}
                    </div>
                  </div>
                  <p className="text-xl font-mono text-status-yellow font-medium">{formatCurrency(s.amount)}</p>
                  <p className="text-[10px] text-text-muted font-mono">criada em {new Date(s.created_at).toLocaleDateString('pt-BR')}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-bg-secondary border border-bg-border rounded-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-medium">Nova reserva</h2>
              <button onClick={() => setShowForm(false)} className="text-text-muted hover:text-text-primary"><X size={16} /></button>
            </div>
            <form onSubmit={submit} className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] text-text-muted font-mono uppercase tracking-wider block mb-1.5">Emoji</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJIS.map(em => (
                    <button key={em} type="button" onClick={() => setForm(f => ({ ...f, emoji: em }))}
                      className={`text-xl p-1.5 rounded-lg transition-colors ${form.emoji === em ? 'bg-brand-purple/30 ring-1 ring-brand-purple' : 'hover:bg-bg-border'}`}>
                      {em}
                    </button>
                  ))}
                </div>
              </div>
              <input required placeholder="Nome (ex: Reserva de emergência)" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="bg-bg-card border border-bg-border rounded-lg px-3 py-2.5 text-[13px] text-text-primary outline-none focus:border-brand-purple transition-colors" />
              <input required type="number" step="0.01" min="0" placeholder="Valor (R$)" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                className="bg-bg-card border border-bg-border rounded-lg px-3 py-2.5 text-[13px] text-text-primary font-mono outline-none focus:border-brand-purple transition-colors" />
              <input placeholder="Descrição (opcional)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="bg-bg-card border border-bg-border rounded-lg px-3 py-2.5 text-[13px] text-text-primary outline-none focus:border-brand-purple transition-colors" />
              <button type="submit" className="mt-1 bg-brand-purple hover:bg-brand-violet text-white rounded-lg py-2.5 text-[13px] font-medium transition-colors">
                Salvar reserva
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
