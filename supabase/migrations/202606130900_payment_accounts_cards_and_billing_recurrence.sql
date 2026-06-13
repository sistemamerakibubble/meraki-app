-- purpose: contas a pagar com recorrência/parcelamento, cartões de crédito
-- e contas bancárias como meios de pagamento vinculáveis a lançamentos.
--
-- - payment_accounts: contas bancárias da clínica (corrente, poupança, pagamento).
-- - credit_cards: cartões de crédito da clínica.
-- - billings ganha: payment_method_type (pix/cartao_credito/boleto/debito_conta),
--   payment_account_id, credit_card_id, recurrence_type (avulso/recorrente/parcelado),
--   recurrence_group_id (agrupa parcelas/recorrências), installment_number,
--   installment_count.

-- ============================================================================
-- payment_accounts
-- ============================================================================
create table if not exists public.payment_accounts (
  id           uuid        primary key default gen_random_uuid(),
  org_id       uuid        not null references public.orgs(id) on delete cascade,
  name         text        not null,
  bank_name    text,
  account_type text        not null check (account_type in ('corrente', 'poupanca', 'pagamento')),
  agency       text,
  account_number text,
  active       boolean     not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists idx_payment_accounts_org on public.payment_accounts (org_id);

alter table public.payment_accounts enable row level security;

drop policy if exists "payment_accounts_select_same_org" on public.payment_accounts;
create policy "payment_accounts_select_same_org" on public.payment_accounts
  for select
  using (org_id = public.current_org_id());

drop policy if exists "payment_accounts_write_admin" on public.payment_accounts;
create policy "payment_accounts_write_admin" on public.payment_accounts
  for all
  using (
    org_id = public.current_org_id()
    and public.current_user_role() in ('admin', 'recepcao')
  )
  with check (
    org_id = public.current_org_id()
    and public.current_user_role() in ('admin', 'recepcao')
  );

-- ============================================================================
-- credit_cards
-- ============================================================================
create table if not exists public.credit_cards (
  id           uuid        primary key default gen_random_uuid(),
  org_id       uuid        not null references public.orgs(id) on delete cascade,
  name         text        not null,
  brand        text,
  last_four    text        check (last_four ~ '^[0-9]{4}$'),
  closing_day  int         check (closing_day between 1 and 31),
  due_day      int         check (due_day between 1 and 31),
  active       boolean     not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists idx_credit_cards_org on public.credit_cards (org_id);

alter table public.credit_cards enable row level security;

drop policy if exists "credit_cards_select_same_org" on public.credit_cards;
create policy "credit_cards_select_same_org" on public.credit_cards
  for select
  using (org_id = public.current_org_id());

drop policy if exists "credit_cards_write_admin" on public.credit_cards;
create policy "credit_cards_write_admin" on public.credit_cards
  for all
  using (
    org_id = public.current_org_id()
    and public.current_user_role() in ('admin', 'recepcao')
  )
  with check (
    org_id = public.current_org_id()
    and public.current_user_role() in ('admin', 'recepcao')
  );

-- ============================================================================
-- billings — novas colunas
-- ============================================================================
alter table public.billings
  add column if not exists payment_method_type  text check (payment_method_type in ('pix', 'cartao_credito', 'boleto', 'debito_conta')),
  add column if not exists payment_account_id   uuid references public.payment_accounts(id) on delete set null,
  add column if not exists credit_card_id       uuid references public.credit_cards(id) on delete set null,
  add column if not exists recurrence_type      text not null default 'avulso' check (recurrence_type in ('avulso', 'recorrente', 'parcelado')),
  add column if not exists recurrence_group_id  uuid,
  add column if not exists installment_number   int,
  add column if not exists installment_count    int;

create index if not exists idx_billings_recurrence_group on public.billings (recurrence_group_id)
  where recurrence_group_id is not null;
