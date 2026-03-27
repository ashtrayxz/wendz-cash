import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'wendz.cash — seu dinheiro, sob controle',
  description: 'Assistente financeiro pessoal com IA. Controle gastos, defina metas e pare de terminar o mês no vermelho.',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-bg-primary min-h-screen">{children}</body>
    </html>
  )
}
