# Modelo de dados

Visão lógica das entidades. DDL final mora em `supabase/migrations/`.

## Convenções

- Nomes de tabelas em **snake_case plural** (`patients`, `appointments`).
- PK: `id uuid default gen_random_uuid() primary key`.
- Timestamps: `created_at timestamptz default now()`, `updated_at timestamptz default now()` (trigger).
- Soft delete: `deleted_at timestamptz null` onde fizer sentido.
- FK: `<entidade>_id` (ex.: `patient_id`).
- Multi-tenant futuro: toda tabela de domínio tem `org_id uuid references orgs(id)`. RLS filtra por `org_id = auth.jwt() ->> 'org_id'`.

## Entidades

### `orgs`
Clínicas/organizações. No MVP existe uma única org, mas o schema já nasce pronto.

- `id`, `name`, `slug`, `created_at`

### `profiles` (extensão de `auth.users`)
Perfil do usuário logado. 1:1 com `auth.users`.

- `id uuid pk references auth.users(id)`
- `org_id uuid references orgs(id)`
- `full_name text`
- `role` — enum: `admin`, `medico`, `supervisor`, `recepcao`
- `active boolean default true`
- `avatar_url text`
- `created_at`, `updated_at`

### `patients` (Pacientes / Prontuários)

- `id`, `org_id`
- `full_name text not null`
- `birthdate date`
- `phone text`
- `email text`
- `document text` (CPF/RG)
- `notes text`
- `active boolean default true`
- `created_at`, `updated_at`, `deleted_at`

**Relações**: `patients 1—N appointments`, `patients 1—N billings`, `patients 1—N supervisions`.

### `professionals`
Profissionais que atendem. Pode estar 1:1 com `profiles` (quando o profissional é usuário do sistema) ou existir sem login (profissional externo).

- `id`, `org_id`
- `profile_id uuid null references profiles(id)` — null se externo
- `full_name text`
- `specialty text`
- `council_number text` (CRM, CRP, CREFITO, etc.)
- `active boolean`

### `rooms` (Salas / Locais)

- `id`, `org_id`
- `name text` (ex.: "Consultório 01", "Online")
- `is_virtual boolean default false`
- `active boolean`

### `appointments` (Agendamentos)

- `id`, `org_id`
- `patient_id uuid references patients(id)`
- `professional_id uuid references professionals(id)`
- `room_id uuid references rooms(id)`
- `starts_at timestamptz`
- `ends_at timestamptz`
- `status` — enum: `agendado`, `confirmado`, `realizado`, `cancelado`, `faltou`
- `confirmed boolean` — "sim/não" visual da agenda
- `notes text`
- `created_at`, `updated_at`

**Índices**: `(org_id, starts_at)`, `(professional_id, starts_at)`.

### `clinical_notes` (Anotações clínicas)

- `id`, `patient_id`, `appointment_id null`
- `author_id uuid references profiles(id)`
- `content text`
- `created_at`

### `billings` (Faturamento / Financeiro)

- `id`, `org_id`
- `patient_id uuid null`
- `appointment_id uuid null`
- `type` — enum: `receita`, `despesa`
- `description text`
- `amount_cents integer` — sempre em centavos para evitar float.
- `status` — enum: `pendente`, `pago`, `cancelado`, `atrasado`
- `due_date date`
- `paid_at timestamptz null`
- `payment_method text`
- `created_at`, `updated_at`

### `inventory_items` (Acervo técnico / Estoque)

- `id`, `org_id`
- `name text`
- `description text`
- `category text` — livre ou FK para `inventory_categories`
- `quantity integer`
- `unit text` (ex.: "Caixas", "Folhas", "Alcateias")
- `min_quantity integer` — dispara alerta "Estoque Baixo"
- `tag text` — etiqueta secundária (ex.: "Livro", "Teste", "Manual")
- `created_at`, `updated_at`

### `inventory_categories`
(opcional; MVP pode viver com `category` livre em `inventory_items`)

- `id`, `org_id`, `name`

### `supervisions` (Supervisão clínica)

- `id`, `org_id`
- `patient_id uuid`
- `professional_id uuid references profiles(id)` — quem solicita
- `supervisor_id uuid references profiles(id)` — quem revisa
- `title text`
- `status` — enum: `pendente`, `em_revisao`, `concluida`
- `created_at`, `updated_at`

### `supervision_messages`
Chat thread por supervisão.

- `id`, `supervision_id`
- `author_id uuid references profiles(id)`
- `content text`
- `created_at`

**Realtime**: canal `supervision:<id>` via Supabase Realtime → subscribe a inserts.

### `library_folders` (Estudos / Biblioteca)

- `id`, `org_id`
- `name text` (ex.: "Livros", "Artigos", "Protocolos", "Testes")
- `parent_id uuid null references library_folders(id)` — árvore simples
- `created_at`

### `library_files`

- `id`, `org_id`
- `folder_id uuid references library_folders(id)`
- `name text` (ex.: `image_3.jpg`)
- `storage_path text` — caminho no bucket Supabase Storage
- `size_bytes bigint`
- `mime_type text`
- `uploaded_by uuid references profiles(id)`
- `created_at`

**Storage bucket**: `library` (privado). URLs assinadas geradas on-demand.

### `reminders` (Post-it / Lembretes do dashboard)

- `id`, `org_id`
- `author_id uuid references profiles(id)`
- `content text`
- `done boolean default false`
- `created_at`

## Row Level Security

Todas as tabelas com `org_id` aplicam:

```sql
alter table <t> enable row level security;

create policy "select same org" on <t>
  for select using (org_id = (auth.jwt() ->> 'org_id')::uuid);

create policy "mutate same org" on <t>
  for all using (org_id = (auth.jwt() ->> 'org_id')::uuid)
  with check (org_id = (auth.jwt() ->> 'org_id')::uuid);
```

Policies por papel (ex.: só `admin` pode deletar usuários) ficam em `supabase/policies/`.

## Migrations

- Nomeação: `YYYYMMDDHHMM_<slug>.sql`.
- Uma migration por mudança lógica.
- Toda migration precisa ser **idempotente ao reaplicar**: usar `if not exists`, `if exists`.
- Nunca editar migration já mergeada — criar nova.
