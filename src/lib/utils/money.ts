import { DEFAULT_LOCALE } from '@/lib/constants/time';

const brl = new Intl.NumberFormat(DEFAULT_LOCALE, {
  style: 'currency',
  currency: 'BRL',
});

export function formatBRL(cents: number): string {
  return brl.format(cents / 100);
}

export function centsToBRL(cents: number): string {
  return formatBRL(cents);
}

export function brlToCents(input: string): number {
  const digits = input.replace(/[^\d,-]/g, '').replace(',', '.');
  const n = Number.parseFloat(digits);
  if (!Number.isFinite(n)) {
    throw new Error(`Invalid BRL string: ${input}`);
  }
  return Math.round(n * 100);
}
