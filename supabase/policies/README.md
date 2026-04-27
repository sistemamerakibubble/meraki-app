# supabase/policies/

(Opcional) Arquivos de policies agrupadas por tabela, quando crescerem além do razoável para viverem junto à migration de criação.

## Quando usar

- Se uma tabela acumula mais de ~5 policies por papel, extrair para `policies/<tabela>.sql`.
- Caso contrário, manter as policies no mesmo arquivo da migration de criação.

## Nomeação

```
<tabela>.sql
```

Arquivos aqui **também** precisam ser referenciados por uma migration datada em `migrations/` para serem aplicados. Usar `\i ../policies/<tabela>.sql` ou colar o conteúdo.

> Decisão de simplificar: no MVP, manter policies inline com a migration. Esta pasta fica como opção futura.
