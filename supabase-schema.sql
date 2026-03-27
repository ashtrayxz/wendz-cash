-- =============================================
-- wendz.cash — Schema do Supabase
-- Execute no SQL Editor do seu projeto Supabase
-- =============================================

-- Tabela de configuração do usuário
create table if not exists user_config (
  id integer primary key default 1,
  name text not null default 'Você',
  salary numeric(10,2) not null default 0,
  updated_at timestamptz default now()
);

-- Garante que só existe 1 linha
alter table user_config add constraint user_config_single_row check (id = 1);

-- Tabela de transações (gastos e receitas)
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  description text not null,
  amount numeric(10,2) not null,
  category text not null default 'outros',
  type text not null check (type in ('income', 'expense')) default 'expense',
  date date not null default current_date,
  created_at timestamptz default now()
);

-- Tabela de metas
create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  emoji text not null default '🎯',
  target_amount numeric(10,2) not null,
  current_amount numeric(10,2) not null default 0,
  deadline date,
  created_at timestamptz default now()
);

-- Tabela de reservas
create table if not exists savings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  emoji text not null default '🏦',
  amount numeric(10,2) not null,
  description text,
  created_at timestamptz default now()
);

-- Desabilita RLS (para uso pessoal sem autenticação)
alter table user_config disable row level security;
alter table transactions disable row level security;
alter table goals disable row level security;
alter table savings disable row level security;
