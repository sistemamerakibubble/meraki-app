# lib/constants/

Constantes globais que não dependem de ambiente.

## Arquivos

```
constants/
├── routes.ts         Caminhos nomeados (routes.dashboard, routes.patient(id))
├── time.ts           TIMEZONE_BR = 'America/Sao_Paulo'; DEFAULT_LOCALE = 'pt-BR'
├── limits.ts         UPLOAD_MAX_BYTES, PAGE_SIZE, etc.
└── roles.ts          ROLES = ['admin', 'medico', 'supervisor', 'recepcao'] as const
```

## Regras

- Tudo `as const` para inferência literal.
- Rotas centralizadas evitam strings soltas pelo código.
- **Nada** que dependa de `process.env` vai aqui (→ `config/env.ts`).
