import { describe, it, expect } from 'vitest';
import { inventoryItemSchema } from './inventory-item';

describe('inventoryItemSchema', () => {
  it('aceita payload mínimo válido', () => {
    const r = inventoryItemSchema.safeParse({
      name: 'Seringa 10ml',
      quantity: 0,
      unit: 'un',
      minQuantity: 0,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.description).toBe('');
      expect(r.data.category).toBe('');
      expect(r.data.tag).toBe('');
    }
  });

  it('rejeita nome vazio', () => {
    const r = inventoryItemSchema.safeParse({
      name: '',
      quantity: 0,
      unit: 'un',
      minQuantity: 0,
    });
    expect(r.success).toBe(false);
  });

  it('rejeita quantidade negativa', () => {
    const r = inventoryItemSchema.safeParse({
      name: 'x',
      quantity: -1,
      unit: 'un',
      minQuantity: 0,
    });
    expect(r.success).toBe(false);
  });

  it('coerce string numérica para inteiro', () => {
    const r = inventoryItemSchema.parse({
      name: 'x',
      quantity: '25',
      unit: 'un',
      minQuantity: '5',
    });
    expect(r.quantity).toBe(25);
    expect(r.minQuantity).toBe(5);
  });

  it('rejeita unit vazio', () => {
    const r = inventoryItemSchema.safeParse({
      name: 'x',
      quantity: 0,
      unit: '',
      minQuantity: 0,
    });
    expect(r.success).toBe(false);
  });
});
