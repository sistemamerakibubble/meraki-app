# tests/fixtures/

Helpers para preparar dados de teste. Mantém specs limpos e deterministas.

## Arquivos

### `db.ts`

```ts
setupTestDb(): Promise<void>       // chama supabase db reset + seeds mínimos de teste
teardownTestDb(): Promise<void>    // trunca tabelas — mais rápido que reset entre testes
resetDb(): Promise<void>           // atalho para uso em beforeEach de E2E
```

Estratégia:
- **Vitest integration**: `setupTestDb` uma vez em `beforeAll`; `teardownTestDb` em `afterEach`.
- **Playwright**: `resetDb` em `beforeEach` de specs que mutam estado.
- Conexão via `DATABASE_URL` do ambiente local (nunca prod).

### `factories.ts`

Funções que criam entidades com defaults sensatos e permitem override:

```ts
makeOrg(overrides?): Org
makeProfile(overrides?): Profile           // precisa org_id + role
makePatient(overrides?): Patient
makeProfessional(overrides?): Professional
makeRoom(overrides?): Room
makeAppointment(overrides?): Appointment   // precisa patient, professional, room
makeBilling(overrides?): Billing
makeInventoryItem(overrides?): InventoryItem
makeSupervision(overrides?): Supervision
makeSupervisionMessage(overrides?): SupervisionMessage
makeLibraryFolder(overrides?): LibraryFolder
```

- Sem I/O: apenas constroem objetos.
- Persistência é feita por helpers de `db.ts` (`insertPatients([...])`).
- IDs gerados com `crypto.randomUUID()`.

### `users.ts`

```ts
TEST_ORG_ID: string
TEST_USER_IDS: {
  admin: string,
  medico: string,
  supervisor: string,
  recepcao: string,
}
TEST_USER_EMAILS: { admin: '...', medico: '...', ... }
TEST_USER_PASSWORDS: { admin: 'meraki-test-admin', ... }

signInAs(role: Role): Promise<void>            // Vitest: server action signIn
signIn(page: Page, role: Role): Promise<void>  // Playwright: preenche form e submete
```

- Usuários de teste são criados no seed de teste (`supabase/seed/test.sql`) com senhas conhecidas.
- Os UUIDs são **fixos** nos fixtures — permite referenciar em asserts.

## Regras

- Fixtures não contêm lógica de negócio. Apenas produção/limpeza de dados.
- Nunca use factories em código de produção.
- Evolua factories junto do schema — se uma nova coluna é obrigatória, atualize o default aqui.
- Se a factory começa a divergir do "feliz e realista", é sinal de que a entidade precisa de revisão.
