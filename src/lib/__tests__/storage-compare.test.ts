import { describe, expect, it } from 'vitest';
import { createMemoryBackend, createSafeStorage, type KeyValueBackend } from '@/lib/storage';
import {
  COMPARE_LIMIT,
  addToCompare,
  parseCompareItems,
  removeFromCompare,
  setCompareScope,
  toggleFavorite,
} from '@/lib/compare';

const throwing: KeyValueBackend = {
  getItem: () => {
    throw new Error('SecurityError');
  },
  setItem: () => {
    throw new Error('SecurityError');
  },
  removeItem: () => {
    throw new Error('SecurityError');
  },
};

describe('safeStorage', () => {
  it('usa o backend quando disponível', () => {
    const backend = createMemoryBackend();
    const s = createSafeStorage(() => backend);
    expect(s.persistent).toBe(true);
    s.set('k', ['a']);
    expect(JSON.parse(backend.getItem('k') as string)).toEqual(['a']);
    expect(s.get('k', [])).toEqual(['a']);
  });
  it('cai para memória quando o armazenamento está bloqueado', () => {
    const s = createSafeStorage(() => throwing);
    expect(s.persistent).toBe(false);
    s.set('k', [1, 2]);
    expect(s.get('k', [])).toEqual([1, 2]);
    s.remove('k');
    expect(s.get('k', 'vazio')).toBe('vazio');
  });
  it('funciona sem window (build)', () => {
    const s = createSafeStorage(() => null);
    expect(s.persistent).toBe(false);
    expect(s.get('x', 0)).toBe(0);
  });
  it('JSON corrompido devolve o padrão', () => {
    const backend = createMemoryBackend();
    backend.setItem('k', '{quebrado');
    expect(createSafeStorage(() => backend).get('k', 'padrao')).toBe('padrao');
  });
});

describe('comparação e favoritos', () => {
  it(`aceita até ${COMPARE_LIMIT} itens e recusa o 4º`, () => {
    let items = addToCompare([], { listingId: 'a', lotId: null }).items;
    items = addToCompare(items, { listingId: 'b', lotId: null }).items;
    items = addToCompare(items, { listingId: 'c', lotId: 'l1' }).items;
    const fourth = addToCompare(items, { listingId: 'd', lotId: null });
    expect(fourth.ok).toBe(false);
    expect(fourth.ok === false && fourth.reason).toBe('limite');
    expect(fourth.items).toHaveLength(3);
  });
  it('não duplica e troca o escopo entre conjunto e lote', () => {
    const items = addToCompare([], { listingId: 'a', lotId: null }).items;
    expect(addToCompare(items, { listingId: 'a', lotId: null }).ok).toBe(false);
    expect(setCompareScope(items, 'a', 'l2')).toEqual([{ listingId: 'a', lotId: 'l2' }]);
    expect(removeFromCompare(items, 'a')).toEqual([]);
  });
  it('sanitiza o que vem do armazenamento', () => {
    expect(parseCompareItems('x')).toEqual([]);
    expect(parseCompareItems([{ listingId: 'a', lotId: null }, { foo: 1 }, { listingId: 'b', lotId: 3 }])).toEqual([
      { listingId: 'a', lotId: null },
    ]);
  });
  it('alterna favoritos', () => {
    expect(toggleFavorite([], 'a')).toEqual(['a']);
    expect(toggleFavorite(['a', 'b'], 'a')).toEqual(['b']);
  });
});
