# public/

Assets estáticos servidos em `/`.

## Conteúdo esperado

```
public/
├── favicon.ico
├── logo.svg                 Logo Meraki (monocromático para header)
├── logo-mark.svg            Símbolo isolado (ícone azul das telas)
├── og-image.png             Open Graph (compartilhamento)
└── robots.txt
```

## Regras

- Nada sensível aqui (é público).
- Imagens pesadas: usar `next/image` com optimization em vez de colocar grandes assets brutos.
- SVGs inline em componentes quando forem ícones de UI; aqui só quando precisam ser servidos por URL direta.
