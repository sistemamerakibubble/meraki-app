# app/(app)

Route group **autenticado**. Todas as rotas internas do produto.

## Layout

`layout.tsx`:

1. Chama `requireUser()` — se não houver sessão, redireciona para `/login`.
2. Carrega `profile` atual (nome, papel, org).
3. Renderiza `<AppShell>` com:
   - Header fixo (logo Meraki, nav, avatar, logout).
   - `<main>` com padding padrão.
4. Providers client (TanStack Query, Toaster).

## Nav principal

Itens fixos no header: Dashboard, Agenda, Pacientes, Financeiro, Acervo Técnico, Supervisão, Estudos, Configurações.

Item "Configurações" só aparece para role `admin`.

## Páginas

| Rota | Componente de módulo |
|---|---|
| `/dashboard` | `modules/dashboard/components/DashboardView` |
| `/agenda` | `modules/agenda/components/AgendaView` |
| `/pacientes` | `modules/pacientes/components/PatientsList` |
| `/pacientes/[id]` | `modules/pacientes/components/PatientDetail` |
| `/financeiro` | `modules/financeiro/components/FinancialView` |
| `/acervo` | `modules/acervo/components/InventoryView` |
| `/supervisao` | `modules/supervisao/components/SupervisionView` |
| `/estudos` | `modules/estudos/components/LibraryView` |
| `/estudos/pasta/[id]` | `modules/estudos/components/FolderView` |
| `/configuracoes` | `modules/configuracoes/components/SettingsView` |

## Loading e erros

- `loading.tsx` em cada segmento crítico com skeleton shadcn.
- `error.tsx` raiz do `(app)` captura falhas não tratadas.
- Mutations exibem feedback via `sonner` (toast).
