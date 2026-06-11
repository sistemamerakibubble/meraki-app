-- purpose: tabela inventory_items (acervo técnico / estoque).
-- Categoria e tag são text livres no MVP; podem ser normalizadas em tabelas próprias no futuro.

create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete restrict,
  name text not null check (length(trim(name)) > 0),
  description text,
  category text,
  quantity integer not null default 0 check (quantity >= 0),
  unit text not null default 'un' check (length(trim(unit)) > 0),
  min_quantity integer not null default 0 check (min_quantity >= 0),
  tag text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_inventory_items_org on public.inventory_items (org_id);
create index if not exists idx_inventory_items_category on public.inventory_items (org_id, category);
create index if not exists idx_inventory_items_search
  on public.inventory_items
  using gin (to_tsvector(
    'portuguese',
    public.immutable_unaccent(
      coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(tag, '')
    )
  ));

drop trigger if exists set_inventory_items_updated_at on public.inventory_items;
create trigger set_inventory_items_updated_at
before update on public.inventory_items
for each row execute function public.set_updated_at();

alter table public.inventory_items enable row level security;

drop policy if exists "inventory_items_select_same_org" on public.inventory_items;
create policy "inventory_items_select_same_org" on public.inventory_items
  for select
  using (org_id = public.current_org_id());

-- Escrita: admin e recepção. (Médicos não gerenciam estoque no MVP.)
drop policy if exists "inventory_items_write_admin_recep" on public.inventory_items;
create policy "inventory_items_write_admin_recep" on public.inventory_items
  for all
  using (
    org_id = public.current_org_id()
    and public.current_user_role() in ('admin', 'recepcao')
  )
  with check (
    org_id = public.current_org_id()
    and public.current_user_role() in ('admin', 'recepcao')
  );
