# modules/estudos

Biblioteca digital: pastas e arquivos em Supabase Storage.

## Estrutura

```
estudos/
├── components/
│   ├── LibraryView.tsx          Raiz — pastas + arquivos recentes
│   ├── FolderView.tsx           Conteúdo de pasta específica
│   ├── FolderGrid.tsx           Cards de pastas
│   ├── FileCard.tsx             Thumb + nome
│   ├── UploadButton.tsx         Client — abre picker + dispara action
│   ├── CategorySelect.tsx       Select de pasta destino
│   └── NewFolderDialog.tsx
├── actions/
│   ├── upload-file.ts           Multipart + grava metadado
│   ├── create-folder.ts
│   ├── rename-folder.ts
│   ├── rename-file.ts
│   ├── delete-folder.ts
│   └── delete-file.ts
├── queries/
│   ├── listRootFolders.ts
│   ├── listRecentFiles.ts
│   ├── listFolderContents.ts
│   └── getSignedFileUrl.ts      URL assinada on-demand
├── schemas/
│   ├── folder.ts
│   └── file.ts
└── types/index.ts
```

## Storage

- Bucket: `library` (privado).
- Convenção de path: `<org_id>/<folder_id>/<uuid>-<filename-slug>`.
- Upload via Server Action limita tamanho (ex.: 25 MB MVP) e tipos MIME.
- Download via URL assinada (5 min).

## Regras

- Nunca expor o bucket como público.
- Thumbs de imagem: gerar sob demanda via `image/resize` do Supabase ou `next/image` com URL assinada.
- Exclusão remove também o objeto no Storage (via trigger SQL chamando `storage.objects`).
