# /estudos

Biblioteca digital — pastas e arquivos.

## Rotas

- `/estudos` → raiz (lista de pastas-topo + arquivos recentes).
- `/estudos/pasta/[id]` → conteúdo de uma pasta específica.

## Dados

- `listRootFolders(orgId)` — pastas-topo.
- `listRecentFiles(orgId, limit=12)` — arquivos recentes.
- `listFolderContents(folderId)` — subpastas + arquivos.

## Storage

- Bucket Supabase: `library`.
- Upload via Server Action que gera caminho único (`<orgId>/<folderId>/<uuid>-<filename>`).
- Download via URL assinada de curta duração (5–10 min) gerada on-demand.

## Ações

- "+ Upload Arquivo" → abre picker, envia em stream para Supabase Storage, cria registro em `library_files`.
- "Escolher Categoria" → select usado para decidir em qual pasta destino cair.
- Clique em arquivo → abre preview (imagem) ou gera download (PDF/outros).
- Criar pasta, renomear, mover, excluir (admin).
