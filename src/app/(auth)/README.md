# app/(auth)

Route group **público**. Renderiza telas de autenticação fora do AppShell.

## Layout

`layout.tsx` — shell simples com duas colunas:

- Esquerda: painel de branding azul com "Bem-vindo ao sistema Meraki" e subtítulo.
- Direita: card centralizado com o formulário (login, recuperação, etc.).

O layout **não** chama `requireUser()`. Se o usuário já estiver logado, o middleware redireciona para `/dashboard`.

## Páginas

- `login/page.tsx` — importa `<LoginForm />` de `modules/auth/components/`.
- `esqueci-senha/page.tsx` — importa `<ForgotPasswordForm />`.
- `redefinir-senha/page.tsx` — importa `<ResetPasswordForm />`. Lê `token` de `searchParams`.

## Responsividade

- < 768px: coluna única. Card de formulário cobre a tela. Painel de branding vira uma faixa topo pequena ou some.
