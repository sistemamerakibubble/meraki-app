import { describe, it, expect } from 'vitest';
import { folderSchema } from './folder';

const UUID = '00000000-0000-0000-0000-000000000001';

describe('folderSchema', () => {
  it('aceita nome válido sem parent', () => {
    const r = folderSchema.safeParse({ name: 'Artigos' });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.parentId).toBeNull();
  });

  it('rejeita nome vazio', () => {
    expect(folderSchema.safeParse({ name: '' }).success).toBe(false);
  });

  it('aceita parent UUID', () => {
    const r = folderSchema.parse({ name: 'x', parentId: UUID });
    expect(r.parentId).toBe(UUID);
  });

  it('rejeita parent não-UUID', () => {
    expect(folderSchema.safeParse({ name: 'x', parentId: 'nope' }).success).toBe(false);
  });

  it('rejeita nome acima de 100 chars', () => {
    expect(folderSchema.safeParse({ name: 'x'.repeat(101) }).success).toBe(false);
  });
});
