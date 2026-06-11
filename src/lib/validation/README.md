# lib/validation/

Validadores e adapters reusáveis entre módulos.

## Arquivos

```
validation/
├── zod-common.ts         Primitivas Zod compartilhadas (email, phone, cpf...).
├── action-result.ts      Tipo Result<T, E> + helper ok()/err()
└── parse-form-data.ts    Converte FormData → objeto antes do zod parse
```

## API

```ts
// zod-common.ts
export const zBrazilianPhone = z.string().regex(/^\d{10,11}$/);
export const zCPF = z.string().refine(isValidCPF);
export const zEmail = z.string().email();
export const zDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

// action-result.ts
export type Result<T, E = string> =
  | { ok: true; data: T }
  | { ok: false; error: E };

export const ok = <T>(data: T): Result<T> => ({ ok: true, data });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });
```

## Regras

- Primitivas Zod reusadas por módulos via import direto. Evita divergência entre formulários.
- Sem lógica de domínio — apenas forma/formato.
