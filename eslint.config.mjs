import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const config = [
  ...compat.extends('next/core-web-vitals', 'next/typescript', 'prettier'),
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
      // TODO: adicionar eslint-plugin-boundaries ao surgir o 2º módulo
      // para bloquear imports cross-module (modules/X não pode importar modules/Y).
      // Por ora, a regra é enforçada por revisão de código + ARCHITECTURE.md.
    },
  },
  {
    ignores: ['.next/**', 'node_modules/**', 'out/**', 'coverage/**', 'playwright-report/**'],
  },
];

export default config;
