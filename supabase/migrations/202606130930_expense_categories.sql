-- purpose: categorias de despesa para classificar lançamentos do tipo 'despesa'.
-- Ex.: Aluguel, Material de escritório, Salários, Impostos, etc.
-- Cada categoria tem nome e uma cor de identificação visual.

create table if not exists public.expense_categories (
  id          uuid        primary key default gen_random_uuid(),
  org_id      uuid        not null references public.orgs(id) on delete cascade,
  name        text        not null,
  color       text        not null default '#6366f1',
  description text,
  active      boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_expense_categories_org on public.expense_categories (org_id);

alter table public.expense_categories enable row level security;

drop policy if exists "expense_categories_select_same_org" on public.expense_categories;
create policy "expense_categories_select_same_org" on public.expense_categories
  for select
  using (org_id = public.current_org_id());

drop policy if exists "expense_categories_write_admin" on public.expense_categories;
create policy "expense_categories_write_admin" on public.expense_categories
  for all
  using (
    org_id = public.current_org_id()
    and public.current_user_role() in ('admin', 'recepcao')
  )
  with check (
    org_id = public.current_org_id()
    and public.current_user_role() in ('admin', 'recepcao')
  );

-- Vincula lançamentos a uma categoria de despesa
alter table public.billings
  add column if not exists expense_category_id uuid references public.expense_categories(id) on delete set null,
  add column if not exists notes text;

create index if not exists idx_billings_expense_category on public.billings (expense_category_id)
  where expense_category_id is not null;

-- Seed: categorias padrão criadas na primeira org (opcional — cada org cria as suas)
-- Não há seed aqui pois org_id é desconhecido em migration.
