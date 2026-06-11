# tests/e2e/

Specs [Playwright](https://playwright.dev) dos fluxos críticos do usuário. Lentos mas valiosos — um teste E2E vale dez unit tests quando cobre a jornada real.

## Specs

| Arquivo | Cobre |
|---|---|
| `auth.spec.ts` | Login, logout, proteção de rotas não autenticadas |
| `dashboard.spec.ts` | Widgets carregam, lembretes funcionam |
| `patients.spec.ts` | CRUD de paciente + busca + arquivamento |
| `appointments.spec.ts` | Criar/editar/cancelar agendamento; bloqueio de conflito |
| `billings.spec.ts` | Criar, filtrar, marcar pago, excluir (por papel) |
| `inventory.spec.ts` | CRUD item; baixo estoque; exportar CSV |
| `supervision.spec.ts` | Fluxo com dois contextos — criar caso, chat realtime |
| `library.spec.ts` | Upload, navegação por pastas, download assinado |
| `settings.spec.ts` | Admin-only; convidar usuário; mudar papel; desativar |

## Estrutura padrão de um spec

```ts
import { test, expect } from '@playwright/test';
import { signIn, resetDb, seedPatients } from '../fixtures/db';

test.describe('patients', () => {
  test.beforeEach(async ({ page }) => {
    await resetDb();
    await signIn(page, 'admin');
  });

  test('cria paciente via modal', async ({ page }) => {
    await page.goto('/pacientes');
    await page.getByRole('button', { name: /novo paciente/i }).click();
    // ...
    await expect(page.getByText('Fulano de Tal')).toBeVisible();
  });
});
```

## Padrões

- **Seletores por role** (`getByRole`), depois `getByLabel`, por último `getByTestId`. Nunca CSS selectors frágeis.
- **Esperas baseadas em estado**, não em tempo. Use `toBeVisible`, `toHaveURL`, `toHaveText`.
- **Fixtures por teste**, não globais. `beforeEach` reseta DB.
- **Paralelismo** por default. Cada teste cria sua própria org/usuário se tocar dados compartilhados.
- **Tags** via `test.describe.configure({ mode: 'serial' })` apenas em specs que realmente dependem de ordem (ex.: supervisão com dois contextos).

## Ambiente local para E2E

```bash
supabase start              # sobe Postgres + Auth locais
pnpm supabase:seed:test     # aplica seed de teste
pnpm dev                    # Next em :3000
pnpm e2e                    # em outro terminal
```

`playwright.config.ts` aponta `baseURL = http://localhost:3000`.

## CI

- Job `e2e` em workflow separado.
- Vercel Preview **não** roda E2E contra produção — sempre ambiente efêmero.
- Artefatos (trace.zip) salvos em falha para depuração.
