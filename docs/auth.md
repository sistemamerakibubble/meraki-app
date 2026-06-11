# Autenticação e autorização

## Visão geral

- Provedor: **Supabase Auth**.
- Estratégia MVP: **e-mail + senha** + "manter conectado".
- Sessão via **cookies HTTP-only** gerenciados pelo `@supabase/ssr`.
- Middleware Next renova tokens e protege rotas.
- Autorização em **duas camadas**: UI (ocultar ações) + **RLS no Postgres** (fonte de verdade).

## Fluxo de login

1. Usuário submete formulário em `/login`.
2. Server Action (`modules/auth/actions/sign-in.ts`) chama `supabase.auth.signInWithPassword`.
3. Em sucesso, Supabase SSR grava cookie de sessão. Action redireciona para `/dashboard`.
4. Em erro, Action retorna `{ ok: false, error }` e a UI exibe toast.

## Middleware

Arquivo `src/middleware.ts`:

- Renova token Supabase em toda request.
- Se rota pertence a `(app)` e não há sessão → redireciona para `/login`.
- Se rota é `/login` e há sessão → redireciona para `/dashboard`.
- Exclui assets, `_next`, `api/webhooks`.

## Papéis (roles)

Definidos em `profiles.role`:

| Role | Permissões principais |
|---|---|
| `admin` | Tudo: equipe, financeiro, configurações, todas as áreas. |
| `medico` | Agenda (própria + global se permitido), pacientes, prontuários, supervisão (solicitar). |
| `supervisor` | Supervisão (revisar), leitura de prontuários. |
| `recepcao` | Agenda, pacientes (cadastro básico), financeiro (entrada), sem acesso a prontuário clínico detalhado. |

## Guarda de rota

- Protecionar **segmento inteiro** via `layout.tsx` do `(app)`, que chama `requireUser()`.
- Para páginas com permissão fina, `layout.tsx` local ou `page.tsx` chama `requireRole('admin')` e faz `redirect('/dashboard')` se negado.
- `requireUser` / `requireRole` vivem em `src/lib/auth/guards.ts`.

## Autorização no banco (RLS)

A UI **nunca** é fonte de verdade. Toda policy Postgres respeita:

1. `org_id` do JWT casa com `org_id` da linha.
2. Para tabelas sensíveis (ex.: `billings`, `clinical_notes`), policy adicional checa papel:

```sql
create policy "billings write admin or recep" on billings
  for insert, update, delete
  using (
    org_id = (auth.jwt() ->> 'org_id')::uuid
    and (auth.jwt() ->> 'role') in ('admin', 'recepcao')
  );
```

## Claims customizados

Via Supabase Auth Hook (Edge Function) injetamos `org_id` e `role` no JWT na criação/refresh. Alternativa mais simples: coluna em `profiles` lida via RLS JOIN — decidir na implementação.

## Logout

Server Action chama `supabase.auth.signOut()` → limpa cookie → redireciona para `/login`.

## Recuperação de senha

Fluxo Supabase nativo:

1. `/esqueci-senha` → Action chama `resetPasswordForEmail`.
2. Supabase envia e-mail com link.
3. Link abre `/redefinir-senha?token=...` → Action chama `updateUser({ password })`.

## Segurança

- **Nunca** usar Service Role key no cliente ou em Server Actions acionadas por usuário. Reservada a jobs/edge functions administrativas.
- Rate limit em login via Supabase (built-in) + Vercel Edge.
- Senha mínima 8 caracteres, validada no schema Zod **e** no Supabase settings.
- Logs de login/logout em tabela `auth_events` (opcional pós-MVP).
