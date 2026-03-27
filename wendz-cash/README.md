# wendz.cash 💜

Assistente financeiro pessoal com IA. Controle seus gastos, defina metas e pare de terminar o mês no vermelho.

---

## 🚀 Setup em 5 passos

### 1. Clone e instale as dependências

```bash
git clone <seu-repositorio>
cd wendz-cash
npm install
```

### 2. Configure o Supabase (banco gratuito)

1. Acesse [supabase.com](https://supabase.com) e crie uma conta gratuita
2. Crie um novo projeto
3. No painel, vá em **SQL Editor** e cole o conteúdo do arquivo `supabase-schema.sql` e execute
4. Vá em **Settings → API** e copie:
   - `Project URL`
   - `anon public key`

### 3. Configure o Gemini (IA gratuita)

1. Acesse [aistudio.google.com](https://aistudio.google.com/app/apikey)
2. Clique em **Create API Key**
3. Copie a chave gerada

### 4. Crie o arquivo `.env.local`

Copie o `.env.local.example` e preencha:

```bash
cp .env.local.example .env.local
```

Edite o `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
GEMINI_API_KEY=sua_gemini_key_aqui
```

### 5. Rode localmente

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## ☁️ Deploy na Vercel

1. Suba o projeto no GitHub
2. Acesse [vercel.com](https://vercel.com) e importe o repositório
3. Na tela de configuração, adicione as 3 variáveis de ambiente (as mesmas do `.env.local`)
4. Clique em **Deploy**

A partir daí, qualquer `git push` atualiza o site automaticamente. ✅

---

## 📁 Estrutura do projeto

```
wendz-cash/
├── app/
│   ├── dashboard/page.tsx     # Tela principal
│   ├── metas/page.tsx         # Gerenciador de metas
│   ├── reservas/page.tsx      # Reservas com propósito
│   ├── historico/page.tsx     # Histórico completo
│   └── api/
│       ├── chat/route.ts      # IA (Gemini)
│       ├── transactions/      # CRUD de gastos
│       ├── goals/             # CRUD de metas
│       ├── savings/           # CRUD de reservas
│       └── config/            # Salário e nome
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx        # Menu lateral
│   │   └── FinnChat.tsx       # Assistente FINN
│   ├── ui/
│   │   ├── StatCard.tsx       # Cards de métricas
│   │   └── GoalRing.tsx       # Anel de progresso
│   └── charts/
│       └── SpendingChart.tsx  # Gráfico de gastos
├── lib/
│   ├── supabase.ts            # Cliente Supabase
│   └── finance.ts             # Funções financeiras
├── types/index.ts             # Tipos TypeScript
└── supabase-schema.sql        # Schema do banco
```

---

## 🤖 O assistente FINN

O FINN usa o **Gemini 1.5 Flash** (gratuito, 1500 req/dia) e recebe automaticamente seu contexto financeiro real: salário, gastos do mês, metas e dias restantes. Ele responde de forma personalizada, motivadora e direta.

---

## ✨ Funcionalidades

- [x] Dashboard com resumo financeiro do mês
- [x] Cadastro de gastos e receitas por categoria
- [x] Gráfico de gastos por categoria
- [x] Sistema de metas com progresso visual
- [x] Depósitos rápidos nas metas (+R$50, +R$100, +R$200)
- [x] Reservas com propósito definido
- [x] Histórico com filtros (tipo, categoria, busca)
- [x] Assistente FINN com IA Gemini gratuita
- [x] Dados salvos no Supabase (gratuito)
- [x] Deploy automático via Vercel + GitHub
