import { describe, expect, it } from 'vitest';
import { evaluate, guidedSearch, type GuidedInput } from '@/lib/match';
import { published } from '@/data';
import { makeEmp, makeLot, makeTerreno } from './fixtures';

const input = (over: Partial<GuidedInput>): GuidedInput => ({
  objetivo: null,
  regiao: null,
  orcamentoMaxCents: null,
  areaMinM2: null,
  areaMaxM2: null,
  ...over,
});

describe('busca guiada', () => {
  it('explica os critérios atendidos', () => {
    const t = makeTerreno({ municipio: 'Gonçalves', priceCents: 10000000 });
    const r = evaluate(t, input({ regiao: 'Gonçalves', orcamentoMaxCents: 20000000 }));
    expect(r.complete).toBe(true);
    expect(r.explanation).toBe('Na região escolhida e dentro do orçamento informado.');
  });

  it('não apresenta correspondência parcial como completa', () => {
    const t = makeTerreno({ municipio: 'Gonçalves', priceCents: 90000000 });
    const r = evaluate(t, input({ regiao: 'Gonçalves', orcamentoMaxCents: 20000000 }));
    expect(r.complete).toBe(false);
    expect(r.explanation).toContain('Não atende: orçamento informado.');
    const out = guidedSearch([t], input({ regiao: 'Gonçalves', orcamentoMaxCents: 20000000 }));
    expect(out.complete).toHaveLength(0);
    expect(out.partial).toHaveLength(1);
  });

  it('preço sob consulta não conta como dentro do orçamento', () => {
    const r = evaluate(makeTerreno({ priceCents: null }), input({ orcamentoMaxCents: 50000000 }));
    expect(r.complete).toBe(false);
    expect(r.criteria[0].status).toBe('sem_dado');
  });

  it('empreendimento: orçamento e área precisam ser do mesmo lote', () => {
    const emp = makeEmp([
      makeLot({ id: 'a', priceCents: 15000000, areaM2: 2000 }),
      makeLot({ id: 'b', priceCents: 39000000, areaM2: 6000 }),
    ]);
    const r = evaluate(emp, input({ orcamentoMaxCents: 20000000, areaMinM2: 5000 }));
    expect(r.complete).toBe(false);
    const ok = evaluate(emp, input({ orcamentoMaxCents: 40000000, areaMinM2: 5000 }));
    expect(ok.complete).toBe(true);
    expect(ok.lots.map((l) => l.id)).toEqual(['b']);
  });

  it('sem critérios informados não retorna nada', () => {
    expect(guidedSearch(published, input({}))).toEqual({ asked: [], complete: [], partial: [] });
  });

  it('catálogo demo: lazer em Extrema até R$ 350 mil', () => {
    const out = guidedSearch(published, input({ objetivo: 'lazer', regiao: 'Extrema', orcamentoMaxCents: 35000000 }));
    expect(out.complete.map((r) => r.listing.id)).toEqual(['chacara-vista-da-mantiqueira']);
    expect(out.complete.every((r) => r.criteria.every((c) => c.status === 'atende'))).toBe(true);
  });
});
