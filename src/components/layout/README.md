# components/layout/

Componentes estruturais de tela.

## Componentes

### `AppShell`
Envelope do `(app)`:
- `<Header />` fixo no topo.
- `<main className="container">` para conteúdo.
- Portal para toasts (`<Toaster />`).

### `Header`
- Logo Meraki + nome.
- Nav principal (Dashboard, Agenda, ...).
- `<UserMenu />` à direita (avatar, nome, logout).
- Item "Configurações" condicional ao `role === 'admin'`.

### `SidebarNav` (opcional, se migrarmos para sidebar no futuro)
Por ora o layout é **top nav** conforme telas de referência.

### `AuthShell`
Envelope do `(auth)`:
- Grid 2 colunas (desktop): painel de branding + área de formulário.
- Colapsa para coluna única em mobile.

### `PageHeader`
Título grande + subtítulo + slot de ações à direita (botão primário). Usado em toda página top-level.

## Convenções

- `AppShell` e `AuthShell` aceitam `children` como o único conteúdo principal.
- `Header` é **client component** (dropdowns, logout action). Recebe `profile` como prop.
