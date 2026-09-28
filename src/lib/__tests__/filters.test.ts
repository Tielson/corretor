import { describe, expect, it } from 'vitest';
import {
  DEFAULT_FILTERS,
  applyFilters,
  countHiddenByUnknownPrice,
  describeFilters,
  eligibleLots,
  hasExistingInfra,
  type Filters,
} from '@/lib/filters';
import { published, getListingById } from '@/data';
import { makeEmp, makeLot, makeTerreno } from './fixtures';

const ctx = { referenceCity: 'São Paulo' };
const F = (over: Partial<Filters>): Filters => ({ ...DEFAULT_FILTERS, ...over });

describe('regra do mesmo lote', () => {
  const emp = makeEmp([
    makeLot({ id: 'barato-pequeno', priceCents: 15000000, areaM2: 2000 }),
    makeLot({ id: 'caro-grande', priceCents: 39000000, areaM2: 6400 }),
  ]);

  it('não combina o preço de um lote com a área de outro', () => {
    const f = F({ precoMaxCents: 20000000, areaMinM2: 5000 });
    expect(eligibleLots(emp.lots, f)).toHaveLength(0);
    expect(applyFilters([emp], f, ctx)).toHaveLength(0);
  });

  it('aceita quando um mesmo lote satisfaz preço e área', () => {
    const f = F({ precoMaxCents: 40000000, areaMinM2: 5000 });
    expect(eligibleLots(emp.lots, f).map((l) => l.id)).toEqual(['caro-grande']);
    expect(applyFilters([emp], f, ctx)).toHaveLength(1);
  });

  it('considera apenas lotes disponíveis', () => {
    const e = makeEmp([makeLot({ status: 'vendido', priceCents: 1000, areaM2: 9000 })]);
    expect(applyFilters([e], F({ precoMaxCents: 5000 }), ctx)).toHaveLength(0);
  });

  it('caso do catálogo demo: Recanto das Araucárias fica de fora com "até R$ 200 mil e 5.000 m² ou mais"', () => {
    const f = F({ precoMaxCents: 20000000, areaMinM2: 5000 });
    const ids = applyFilters(published, f, ctx).map((l) => l.id);
    expect(ids).not.toContain('recanto-das-araucarias');
    // Cada condição sozinha incluiria o empreendimento:
    expect(applyFilters(published, F({ precoMaxCents: 20000000 }), ctx).map((l) => l.id)).toContain('recanto-das-araucarias');
    expect(applyFilters(published, F({ areaMinM2: 5000 }), ctx).map((l) => l.id)).toContain('recanto-das-araucarias');
  });
});

describe('infraestrutura', () => {
  it('prevista não satisfaz o filtro de existente', () => {
    const cafezal = getListingById('terras-do-cafezal');
    expect(cafezal).not.toBeNull();
    expect(hasExistingInfra(cafezal!, 'energia')).toBe(false);
    const ids = applyFilters(published, F({ infra: ['energia'] }), ctx).map((l) => l.id);
    expect(ids).not.toContain('terras-do-cafezal');
    expect(ids).toContain('recanto-das-araucarias');
  });
  it('não informada também não satisfaz', () => {
    const t = makeTerreno({ infrastructure: { items: [{ key: 'agua', label: 'Água', status: 'nao_informada', note: null }] } });
    expect(applyFilters([t], F({ infra: ['agua'] }), ctx)).toHaveLength(0);
  });
});

describe('preço sob consulta', () => {
  it('nunca satisfaz filtro de preço (não vira zero)', () => {
    const t = makeTerreno({ priceCents: null });
    expect(applyFilters([t], F({ precoMaxCents: 100 }), ctx)).toHaveLength(0);
    expect(applyFilters([t], F({ precoMinCents: 0 }), ctx)).toHaveLength(0);
    expect(applyFilters([t], F({}), ctx)).toHaveLength(1);
  });
  it('conta os anúncios ocultos só por falta de preço', () => {
    const t = makeTerreno({ priceCents: null });
    expect(countHiddenByUnknownPrice([t, makeTerreno({ id: 't2' })], F({ precoMaxCents: 5000 }), ctx)).toBe(1);
  });
});

describe('outros filtros', () => {
  it('zona, tipo, local e texto', () => {
    expect(applyFilters(published, F({ zona: 'urbano' }), ctx).every((l) => l.zone === 'urbano')).toBe(true);
    expect(applyFilters(published, F({ tipo: 'empreendimento' }), ctx).every((l) => l.kind === 'empreendimento')).toBe(true);
    expect(applyFilters(published, F({ local: 'goncalves' }), ctx).map((l) => l.id)).toEqual(['recanto-das-araucarias']);
    expect(applyFilters(published, F({ q: 'araucárias' }), ctx).map((l) => l.id)).toContain('recanto-das-araucarias');
  });
  it('distância até a cidade de referência', () => {
    const ids = applyFilters(published, F({ distMaxKm: 120 }), ctx).map((l) => l.id);
    expect(ids).toContain('chacara-vista-da-mantiqueira');
    expect(ids).not.toContain('terreno-ribeirao-das-pedras');
  });
  it('rural + município + faixa de preço + área', () => {
    const f = F({ zona: 'rural', local: 'Sapucaí-Mirim', precoMaxCents: 70000000, areaMinM2: 40000 });
    expect(applyFilters(published, f, ctx).map((l) => l.id)).toEqual(['sitio-pedra-branca']);
  });
  it('descreve os filtros em texto', () => {
    const d = describeFilters(F({ zona: 'rural', precoMaxCents: 20000000, areaMinM2: 5000 }));
    expect(d[0]).toBe('No campo (rural)');
    expect(d.join(' ').replace(/\u00a0/g, ' ')).toContain('Preço até R$ 200.000');
    expect(d.join(' ')).toContain('Área a partir de 5.000 m²');
  });
});
