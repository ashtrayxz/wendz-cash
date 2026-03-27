'use client'
import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import { ChatMessage } from '@/types'
import clsx from 'clsx'

interface Props {
  financialContext: string
}

export default function FinnChat({ financialContext }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Oi! 👋 Sou o Finn, seu assistente financeiro. Me conta: como tá indo o mês pra você?',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send() {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: ChatMessage = { role: 'user', content: text }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          financialContext,
        }),
      })
      const data = await res.json()
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Ops, tive um problema. Tenta de novo! 😅' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-56 shrink-0 border-l border-bg-border bg-bg-secondary flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-bg-border">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-muted to-brand-violet shadow-[0_0_12px_#7c3aed44] shrink-0" />
        <div>
          <p className="text-[13px] text-brand-light font-medium leading-none">FINN</p>
          <p className="text-[10px] text-status-green font-mono mt-0.5">● online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 min-h-0">
        {messages.map((m, i) => (
          <div
            key={i}
            className={clsx(
              'text-[12px] leading-relaxed px-3 py-2 rounded-lg max-w-full',
              m.role === 'assistant'
                ? 'bg-bg-border text-brand-light rounded-tl-sm self-start'
                : 'bg-[#2d1f5e] text-text-primary rounded-tr-sm self-end'
            )}
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="bg-bg-border text-brand-light text-[12px] px-3 py-2 rounded-lg rounded-tl-sm self-start">
            <span className="animate-pulse">Pensando...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-2 border-t border-bg-border flex gap-2">
        <input
          className="flex-1 bg-bg-border text-text-primary text-[12px] px-3 py-2 rounded-md outline-none border border-transparent focus:border-brand-purple placeholder:text-text-muted transition-colors"
          placeholder="Pergunte ao Finn..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
        />
        <button
          onClick={send}
          disabled={loading}
          className="bg-brand-purple hover:bg-brand-violet text-white rounded-md px-2.5 transition-colors disabled:opacity-50"
        >
          <Send size={13} />
        </button>
      </div>
    </div>
  )
}
