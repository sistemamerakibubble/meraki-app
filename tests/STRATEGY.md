# Estratégia de testes — Meraki

## Princípios

1. **Testar comportamento, não implementação.** Refatorar sem quebrar o teste é meta.
2. **Pirâmide com inversão leve.** Muito unit em `lib/` e `schemas/`; integration nos módulos; E2E só nos fluxos críticos do usuário.
3. **Teste como documentação executável.** O nome do teste descreve a regra de negócio.
4. **Determinístico.** Zero `sleep`, zero dependência de relógio real (congelar via `vi.useFakeTimers` ou `Date.now` mockado).
5. **Isolado.** Cada teste prepara e limpa seus dados. Testes rodam em qualquer ordem.
6. **Real onde importa.** Integration tests **não mockam Supabase** — sobem instância local via `supabase start`.

## Pirâmide

```
            E2E (Playwright)
            ┌─────────────┐
            │  ~10 fluxos │       Fluxos críticos: login, criar paciente,
            │  críticos   │       criar agendamento, chat supervisão,
            └─────────────┘       upload estudos, financeiro marcar pago.
           Integration (Vitest + TL)
        ┌───────────────────────┐
        │  Componentes + forms  │    Forms, validação, server actions
        │  + Server Actions     │    contra Supabase local.
        └───────────────────────┘
           Unit (Vitest)
    ┌───────────────────────────────┐
    │  lib/utils, lib/validation,   │   Funções puras, schemas Zod,
    │  schemas, utils de módulo     │   cálculos de domínio.
    └───────────────────────────────┘
```

## Ferramentas

| Camada | Ferramenta | Arquivos |
|---|---|---|
| Unit | [Vitest](https://vitest.dev) | `<file>.test.ts` ao lado do código |
| Component / integration | Vitest + [Testing Library](https://testing-library.com/docs/react-testing-library/intro) + [user-event](https://testing-library.com/docs/user-event/intro) | `<file>.test.tsx` |
| Server action integration | Vitest + Supabase local | `modules/<X>/actions/<action>.test.ts` |
| E2E | [Playwright](https://playwright.dev) | `tests/e2e/**/*.spec.ts` |
| Mocks HTTP (raro) | [MSW](https://mswjs.io) | `tests/mocks/` |

## Arquitetura de testes

```
<src ao lado do código>
  foo.ts
  foo.test.ts              ← unit e component (Vitest)

tests/
├── STRATEGY.md            ← este arquivo
├── coverage/              ← plano de cobertura por módulo (MDs)
├── e2e/                   ← Playwright specs
│   ├── auth.spec.ts
│   └── ...
├── fixtures/              ← helpers p/ preparar DB (seed de teste, factories)
│   ├── db.ts              ← cria/limpa dados por teste
│   ├── factories.ts       ← makePatient(), makeAppointment(), ...
│   └── users.ts           ← logar como admin/médico/supervisor
├── setup/
│   ├── vitest.setup.ts    ← global setup (cleanup DOM, polyfills)
│   └── supabase-test.ts   ← helper p/ client contra instância local
└── playwright.config.ts
```

## Escopo por camada

### Unit (rápido, muito)

**Alvo**: funções puras, schemas Zod, utilitários.

Exemplos:
- `lib/utils/money.test.ts` — `formatBRL`, `brlToCents`, `centsToBRL`.
- `lib/utils/dates.test.ts` — `formatDate`, `startOfWeekBR`.
- `lib/utils/phone.test.ts` — `normalizePhone`, `formatPhone`.
- `modules/agenda/utils/buildWeekRange.test.ts`.
- `modules/financeiro/schemas/billing.test.ts` — `z.parse` com casos válidos/ inválidos.

**Não testar**: funções triviais de 2 linhas sem lógica.

### Component (médio, bastante)

**Alvo**: formulários, componentes com interação, empty/loading/error states.

Exemplos:
- `LoginForm.test.tsx` — submit válido chama action; submit inválido mostra erro; "manter conectado" é enviado.
- `PatientForm.test.tsx` — campos obrigatórios, formatação de telefone, submit chama action com payload correto.
- `AppointmentForm.test.tsx` — detecção de conflito local, submit, cancelamento.
- `DataTable.test.tsx` — sorting, paginação, empty state.

**Padrão**:
- `render(<Component />)`.
- Interagir com `userEvent`.
- Assertar resultado no DOM (`screen.getByRole`, `screen.findByText`).
- Mockar Server Action via `vi.mock('@/modules/<X>/actions/...')` — retornos simulados.

### Server Action integration (médio, alguns)

**Alvo**: actions que tocam DB, aplicam RLS, validam.

Exemplos:
- `createPatient` cria linha, respeita `org_id`, retorna erro se papel não permite.
- `createAppointment` bloqueia conflito.
- `sendSupervisionMessage` só autor da supervisão ou supervisor.

**Padrão**:
- `supabase start` antes.
- `db.reset()` + seed mínimo por teste.
- Logar como usuário específico (`signInAs(role)`).
- Chamar action; assertar estado do DB.

### E2E (lento, poucos)

**Alvo**: jornadas completas de usuário pelo navegador.

Fluxos cobertos:

1. **auth** — login válido → redireciona dashboard; inválido → erro visível; logout.
2. **middleware** — acessar `/pacientes` sem login → redireciona `/login`.
3. **pacientes** — criar paciente via modal → aparece na lista.
4. **agenda** — criar agendamento → aparece no grid da semana correta; tentar conflito → bloqueia.
5. **financeiro** — criar faturamento → aparece → marcar pago → soma atualiza.
6. **acervo** — criar item com quantity < min → aparece em "Estoque Baixo".
7. **supervisão** — profissional cria caso, supervisor vê, trocam mensagens (em dois browser contexts).
8. **estudos** — upload → arquivo aparece em "Arquivos Recentes".
9. **configurações** — admin convida usuário; não-admin recebe 403/redirect.
10. **dashboard** — com dados semeados, widgets refletem os números.

## Dados de teste (fixtures)

- `tests/fixtures/db.ts` expõe `setupTestDb()` e `teardownTestDb()`.
- `tests/fixtures/factories.ts` cria entidades com defaults sensatos: `makePatient()`, `makeAppointment()`, `makeBilling()`.
- IDs dos fixtures usam UUIDs fixos quando o teste precisa referenciar (ex.: `TEST_ORG_ID`, `TEST_ADMIN_ID`). Senão, `gen_random_uuid()`.
- Senhas de usuários seed: `meraki-test-<role>`.

## RLS e testes

**Crítico**: testes de server action devem cobrir o caso **negativo** — papel errado tentando ação não pode, e o erro deve vir do Postgres (RLS), não da camada aplicação. Isso valida que a segurança real está no banco.

Exemplo:
```ts
it('recepcao não pode deletar billing', async () => {
  await signInAs('recepcao');
  const result = await deleteBilling(SEED_BILLING_ID);
  expect(result.ok).toBe(false);
  // mensagem de erro deve indicar RLS violation, não "role check".
});
```

## Cobertura esperada

- **Crítico** (100% dos caminhos felizes + principais erros): `lib/validation`, `lib/auth`, schemas Zod, actions.
- **Alta**: componentes de formulário, queries de leitura.
- **Média**: componentes visuais sem lógica.
- **Baixa / dispensada**: pages que apenas compõem, componentes shadcn copiados (são testados upstream).

Sem meta numérica de "coverage %" — foco no valor.

## Convenções de nome

```ts
describe('createPatient', () => {
  it('cria paciente para admin na mesma org', ...);
  it('recusa quando nome está vazio', ...);
  it('recusa quando usuário não tem permissão', ...);
});
```

- `describe` = entidade/função.
- `it` = regra de negócio em linguagem natural ("cria...", "recusa...", "bloqueia...").
- Evitar `should` — traduz mal e alonga sem valor.

## Rodando

```bash
# unit + component
pnpm test

# watch
pnpm test:watch

# apenas um arquivo
pnpm test src/lib/utils/money.test.ts

# integration (precisa supabase start antes)
pnpm test:int

# e2e (precisa supabase + next dev)
pnpm e2e

# apenas um fluxo e2e
pnpm e2e tests/e2e/auth.spec.ts
```

## CI

- PR: `lint` + `typecheck` + `test` (unit + component) + `build`.
- PR: `e2e` em ambiente efêmero com Supabase local.
- `main`: mesmos + `migrate-check` (drift entre migrations locais e prod).
