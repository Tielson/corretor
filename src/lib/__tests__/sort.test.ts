import { describe, expect, it } from 'vitest';
import { sortListings } from '@/lib/sort';
import { published } from '@/data';
import { makeEmp, makeLot, makeTerreno } from './fixtures';

describe('ordenação', () => {
  it('menor preço coloca "sob consulta" no final', () => {
    const list = [
      makeTerreno({ id: 'nulo', priceCents: null }),
      makeTerreno({ id: 'caro', priceCents: 50000000 }),
      makeTerreno({ id: 'barato', priceCents: 1000000 }),
      makeEmp([makeLot({ priceCents: null })], { id: 'emp-nulo' }),
    ];
    const ids = sortListings(list, 'menor_preco').map((l) => l.id);
    expect(ids.slice(0, 2)).toEqual(['barato', 'caro']);
    expect(ids.slice(2).sort()).toEqual(['emp-nulo', 'nulo']);
  });
  it('no catálogo demo, o anúncio sob consulta é o último', () => {
    const ids = sortListings(published, 'menor_preco').map((l) => l.id);
    expect(ids[ids.length - 1]).toBe('area-rural-camanducaia');
  });
  it('maior área em ordem decrescente', () => {
    const ids = sortListings(published, 'maior_area').map((l) => l.id);
    expect(ids[0]).toBe('area-rural-camanducaia');
  });
  it('destaque: destacados e rurais primeiro', () => {
    const sorted = sortListings(published, 'destaque');
    expect(sorted[0].featured).toBe(true);
    const firstUrban = sorted.findIndex((l) => l.zone === 'urbano');
    expect(sorted.slice(firstUrban).every((l) => l.zone === 'urbano' && !l.featured)).toBe(true);
  });
  it('não altera o array original', () => {
    const copy = [...published];
    sortListings(published, 'maior_area');
    expect(published).toEqual(copy);
  });
});
