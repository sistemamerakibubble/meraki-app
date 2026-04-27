# src/config/

Configuração do app.

## Arquivos

```
config/
├── env.ts              Parse e valida process.env com Zod. Exporta tipado.
├── features.ts         Feature flags em compile time (ex.: ENABLE_REALTIME_AGENDA)
└── metadata.ts         Metadata Next default (título, descrição, favicon)
```

## env.ts (esboço)

```ts
import { z } from 'zod';

const schema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
});

export const env = schema.parse(process.env);
export type Env = z.infer<typeof schema>;
```

## Regras

- **Toda** leitura de `process.env` passa por `env`. Grep por `process.env` deve retornar só `config/env.ts`.
- Variáveis `NEXT_PUBLIC_*` são seguras no client; as demais são server-only.
- Feature flag muda via env ou constante — nunca por tabela em DB no MVP (evita round-trip).
