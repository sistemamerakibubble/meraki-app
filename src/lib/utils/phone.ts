export function normalizePhone(input: string): string {
  return input.replace(/\D/g, '');
}

export function formatPhone(input: string): string {
  const digits = normalizePhone(input);
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return input;
}

export function isValidPhone(input: string): boolean {
  const digits = normalizePhone(input);
  return digits.length === 10 || digits.length === 11;
}
