import { describe, it, expect } from 'vitest';
import { buildStoragePath, extractOriginalName } from './buildStoragePath';

const ORG = '11111111-1111-1111-1111-111111111111';
const FOLDER = '22222222-2222-2222-2222-222222222222';
const FIXED_UUID = '33333333-3333-3333-3333-333333333333';

describe('buildStoragePath', () => {
  it('usa orgId como primeiro segmento', () => {
    const path = buildStoragePath(ORG, FOLDER, 'arquivo.pdf', FIXED_UUID);
    expect(path.startsWith(`${ORG}/`)).toBe(true);
  });

  it('usa folderId como segundo segmento', () => {
    const path = buildStoragePath(ORG, FOLDER, 'arquivo.pdf', FIXED_UUID);
    expect(path.split('/')[1]).toBe(FOLDER);
  });

  it('usa _root quando sem pasta', () => {
    const path = buildStoragePath(ORG, null, 'arquivo.pdf', FIXED_UUID);
    expect(path.split('/')[1]).toBe('_root');
  });

  it('slugifica o nome preservando extensão', () => {
    const path = buildStoragePath(ORG, FOLDER, 'Documento Final Ção.PDF', FIXED_UUID);
    expect(path.endsWith(`${FIXED_UUID}-documento-final-cao.pdf`)).toBe(true);
  });

  it('aceita arquivos sem extensão', () => {
    const path = buildStoragePath(ORG, FOLDER, 'Notas', FIXED_UUID);
    expect(path.endsWith(`${FIXED_UUID}-notas`)).toBe(true);
  });
});

describe('extractOriginalName', () => {
  it('remove o prefixo UUID', () => {
    expect(extractOriginalName(`${ORG}/${FOLDER}/${FIXED_UUID}-doc.pdf`)).toBe('doc.pdf');
  });

  it('devolve a última parte se não tiver prefixo UUID', () => {
    expect(extractOriginalName('foo/bar/baz.txt')).toBe('baz.txt');
  });
});
