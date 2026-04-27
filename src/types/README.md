# src/types/

Tipos globais compartilhados.

## Arquivos

```
types/
├── supabase.ts         Gerado por `supabase gen types typescript`. Não editar manual.
├── domain.ts           Tipos cross-module (Role, OrgId, enums compartilhados).
├── api.ts              Tipos de contrato de route handlers
└── utils.ts            Utility types (DeepPartial, Nullable, etc.)
```

## Regras

- `supabase.ts` é **auto-gerado**. Regenerar após cada migration e commitar no PR.
- Tipos específicos de um módulo ficam no próprio módulo (`modules/<X>/types/`).
- Não exportar `interface` de row do DB diretamente — mapear para tipo de domínio em `lib/supabase/helpers.ts`.
