# lib/auth/

Guards e helpers de autenticação.

## Arquivos

```
auth/
├── guards.ts         requireUser, requireRole, getCurrentProfile
├── cookies.ts        (opcional) helpers se precisar manipular cookies fora do Supabase
└── jwt.ts            (opcional) leitura de claims customizados
```

## API

```ts
requireUser(): Promise<SessionUser>          // redirect('/login') se sem sessão
requireRole(role: Role | Role[]): Promise<SessionUser>
getCurrentProfile(): Promise<Profile | null>
```

## Regras

- Todas as funções aqui são **server-only** (`import 'server-only'` no topo).
- `requireUser` usa `redirect` do `next/navigation` — não retorna em caso negativo.
- Nunca expor esses helpers em client components (erro de build se tentar).
