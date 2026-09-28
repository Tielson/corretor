import { describe, expect, it } from 'vitest';
import { DEFAULT_STATE, catalogUrl, parseCatalogState, serializeCatalogState, type CatalogState } from '@/lib/url-state';
import { DEFAULT_FILTERS } from '@/lib/filters';

describe('url-state', () => {
  const state: CatalogState = {
    filters: {
      ...DEFAULT_FILTERS,
      q: 'lago',
      zona: 'rural',
      tipo: 'terreno',
      local: 'Extrema',
      precoMinCents: 10000000,
      precoMaxCents: 40000000,
      areaMinM2: 1000,
      areaMaxM2: 50000,
      relevo: ['suave', 'plano'],
      acesso: ['misto'],
      infra: ['energia', 'agua'],
      distMaxKm: 150,
      interesse: 'lazer',
    },
    sort: 'menor_preco',
    view: 'mapa',
  };

  it('é idempotente: filtros -> query -> filtros', () => {
    const qs = serializeCatalogState(state);
    const parsed = parseCatalogState(qs);
    expect(serializeCatalogState(parsed)).toBe(qs);
    expect(parseCatalogState(serializeCatalogState(parsed))).toEqual(parsed);
    expect(parsed.filters.relevo).toEqual(['plano', 'suave']);
    expect(parsed.filters.infra).toEqual(['agua', 'energia']);
    expect(parsed.filters.precoMaxCents).toBe(40000000);
    expect(parsed.sort).toBe('menor_preco');
    expect(parsed.view).toBe('mapa');
  });

  it('omite padrões e ignora valores inválidos', () => {
    expect(serializeCatalogState(DEFAULT_STATE)).toBe('');
    const p = parseCatalogState('zona=marte&ordem=xpto&pmax=abc&relevo=plano,lunar&modo=3d');
    expect(p).toEqual({ ...DEFAULT_STATE, filters: { ...DEFAULT_FILTERS, relevo: ['plano'] } });
  });

  it('preço na URL em reais', () => {
    expect(catalogUrl({ precoMaxCents: 30000000, zona: 'rural' })).toBe('/terrenos/?zona=rural&pmax=300000');
    expect(catalogUrl({})).toBe('/terrenos/');
  });

  it('respeita a base da página de empreendimentos', () => {
    const base = { tipo: 'empreendimento' as const };
    const qs = serializeCatalogState(
      { ...DEFAULT_STATE, filters: { ...DEFAULT_FILTERS, tipo: 'empreendimento', zona: 'rural' } },
      base,
    );
    expect(qs).toBe('zona=rural');
    expect(parseCatalogState(qs, base).filters.tipo).toBe('empreendimento');
  });
});
