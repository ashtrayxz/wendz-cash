import { Transaction, Goal } from '@/types'

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('pt-BR')
}

export function getCurrentMonth(): { start: string; end: string } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()
  return { start, end }
}

export function getDaysLeftInMonth(): number {
  const now = new Date()
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return lastDay.getDate() - now.getDate()
}

export function calcSummary(transactions: Transaction[], salary: number) {
  const expenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalIncome = salary + income
  const available = totalIncome - expenses
  const spentPercent = totalIncome > 0 ? (expenses / totalIncome) * 100 : 0

  return { expenses, income, totalIncome, available, spentPercent }
}

export function calcGoalProgress(goal: Goal): number {
  if (goal.target_amount === 0) return 0
  return Math.min((goal.current_amount / goal.target_amount) * 100, 100)
}

export function groupByCategory(transactions: Transaction[]) {
  const map: Record<string, number> = {}
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      map[t.category] = (map[t.category] || 0) + t.amount
    })
  return Object.entries(map).map(([category, amount]) => ({ category, amount }))
}

export function buildFinancialContext(
  salary: number,
  transactions: Transaction[],
  goals: Goal[],
  userName: string
): string {
  const summary = calcSummary(transactions, salary)
  const daysLeft = getDaysLeftInMonth()

  const topExpenses = groupByCategory(transactions)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3)
    .map((e) => `${e.category}: R$ ${e.amount.toFixed(2)}`)
    .join(', ')

  const goalsText = goals
    .map((g) => `${g.emoji} ${g.name} (${calcGoalProgress(g).toFixed(0)}% de R$ ${g.target_amount})`)
    .join(', ')

  return `
Usuário: ${userName}
Salário mensal: R$ ${salary.toFixed(2)}
Disponível agora: R$ ${summary.available.toFixed(2)}
Total gasto este mês: R$ ${summary.expenses.toFixed(2)} (${summary.spentPercent.toFixed(0)}% do salário)
Principais gastos: ${topExpenses || 'nenhum gasto registrado ainda'}
Dias restantes no mês: ${daysLeft}
Metas ativas: ${goalsText || 'nenhuma meta cadastrada'}
  `.trim()
}
