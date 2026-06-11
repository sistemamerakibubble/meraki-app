# modules/auth

Autenticação, sessão e guardas.

## Responsabilidades

- Formulários de login, recuperação e redefinição de senha.
- Server Actions que interagem com Supabase Auth.
- Helpers `requireUser`, `requireRole`, `getCurrentProfile` (reexport de `lib/auth/guards.ts`).
- Logout.

## Estrutura

```
auth/
├── components/
│   ├── LoginForm.tsx
│   ├── ForgotPasswordForm.tsx
│   ├── ResetPasswordForm.tsx
│   └── UserMenu.tsx          Avatar + dropdown com logout (usado no Header)
├── actions/
│   ├── sign-in.ts            email + password, "manter conectado"
│   ├── sign-out.ts
│   ├── request-password-reset.ts
│   └── update-password.ts
├── schemas/
│   ├── sign-in.ts
│   ├── request-reset.ts
│   └── update-password.ts
└── types/index.ts            Profile, Role, SessionUser
```

## Regras

- "Manter conectado" estende o `maxAge` do cookie via opções do Supabase SSR.
- Action retorna `{ ok, error? }` — formulário exibe em campo ou toast.
- Após login bem-sucedido, `redirect('/dashboard')` dentro da action.
