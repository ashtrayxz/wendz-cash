export interface Transaction {
  id: string
  description: string
  amount: number
  category: string
  type: 'income' | 'expense'
  date: string
  created_at: string
}

export interface Goal {
  id: string
  name: string
  emoji: string
  target_amount: number
  current_amount: number
  deadline: string | null
  created_at: string
}

export interface Saving {
  id: string
  name: string
  emoji: string
  amount: number
  description: string
  created_at: string
}

export interface UserConfig {
  id: string
  salary: number
  name: string
  updated_at: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export const CATEGORIES = [
  { id: 'alimentacao', label: 'Alimentação', emoji: '🍔', color: '#7c3aed' },
  { id: 'transporte', label: 'Transporte', emoji: '🚌', color: '#4f46e5' },
  { id: 'moradia', label: 'Moradia', emoji: '🏠', color: '#0891b2' },
  { id: 'saude', label: 'Saúde', emoji: '💊', color: '#10b981' },
  { id: 'lazer', label: 'Lazer', emoji: '🎮', color: '#f59e0b' },
  { id: 'roupas', label: 'Roupas', emoji: '👕', color: '#ec4899' },
  { id: 'educacao', label: 'Educação', emoji: '📚', color: '#06b6d4' },
  { id: 'outros', label: 'Outros', emoji: '📦', color: '#64748b' },
]
