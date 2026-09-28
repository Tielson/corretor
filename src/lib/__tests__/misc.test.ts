import { describe, expect, it } from 'vitest';
import { availableAreaRange, lotLabel, parseViewBox, polygonCentroid, polygonToPath, referencePriceCents, summarizeLots } from '@/lib/lots';
import { areaInfo, priceInfo } from '@/lib/listing';
import { googleMapsDirectionsUrl, googleMapsSearchUrl, routeTarget } from '@/lib/maps';
import { generateHeightfield, projectToRelief, quantize } from '@/lib/relief';
import { threeMode, type Environment } from '@/lib/capabilities';
import { transparencyReport } from '@/lib/transparency';
import { buildSeo, truncateDescription } from '@/lib/seo';
import { getListingById, getListingBySlug } from '@/data';
import { site } from '@/config/site';
import { makeEmp, makeLot, makeTerreno } from './fixtures';

describe('lotes', () => {
  const lots = [
    makeLot({ id: '1', status: 'disponivel', priceCents: 300, areaM2: 1000 }),
    makeLot({ id: '2', status: 'disponivel', priceCents: null, areaM2: 3000 }),
    makeLot({ id: '3', status: 'vendido', priceCents: 100, areaM2: 9000 }),
    makeLot({ id: '4', status: 'reservado', priceCents: 200, areaM2: 500 }),
  ];
  it('resume por situação', () => {
    expect(summarizeLots(lots)).toEqual({ total: 4, disponivel: 2, reservado: 1, vendido: 1, sob_consulta: 0 });
  });
  it('"a partir de" usa só lotes disponíveis com preço', () => {
    expect(referencePriceCents(lots)).toBe(300);
    expect(referencePriceCents([makeLot({ priceCents: null })])).toBeNull();
    expect(availableAreaRange(lots)).toEqual({ minM2: 1000, maxM2: 3000 });
  });
  it('priceInfo do empreendimento sem referência é sob consulta', () => {
    expect(priceInfo(makeEmp([makeLot({ status: 'vendido' })]))).toEqual({ mode: 'sob_consulta', cents: null });
    expect(priceInfo(makeEmp(lots))).toEqual({ mode: 'a_partir_de', cents: 300 });
    expect(priceInfo(makeTerreno({ priceCents: 5 }))).toEqual({ mode: 'total', cents: 5 });
    expect(areaInfo(makeEmp([makeLot({ status: 'vendido' })]))).toBeNull();
  });
  it('geometria', () => {
    expect(polygonToPath([[0, 0], [10, 0], [10, 10]])).toBe('M0 0L10 0L10 10Z');
    expect(polygonCentroid([[0, 0], [10, 0], [10, 10], [0, 10]])).toEqual([5, 5]);
    expect(parseViewBox('0 0 1000 660')).toEqual({ x: 0, y: 0, width: 1000, height: 660 });
    expect(lotLabel({ number: '3', block: 'A' })).toBe('Quadra A, lote 3');
    expect(lotLabel({ number: '3', block: null })).toBe('Lote 3');
  });
});

describe('mapas', () => {
  const center = { lat: -22.1, lng: -45.2 };
  it('gera Maps URLs', () => {
    expect(googleMapsSearchUrl(center)).toBe('https://www.google.com/maps/search/?api=1&query=-22.100000,-45.200000');
    expect(googleMapsDirectionsUrl(center)).toBe('https://www.google.com/maps/dir/?api=1&destination=-22.100000,-45.200000');
  });
  it('rota usa o ponto de entrada quando existe', () => {
    const cam = getListingById('area-rural-camanducaia')!;
    const r = routeTarget(cam.location);
    expect(r.usesEntrance).toBe(true);
    expect(r.point).toEqual(cam.location.entrance);
  });
  it('sem entrada e aproximada: centro com aviso', () => {
    const r = routeTarget({ center, entrance: null, precision: 'aproximada', addressText: null, references: [], distances: [] });
    expect(r.usesEntrance).toBe(false);
    expect(r.warning).toMatch(/aproximada/);
  });
});

describe('relevo da maquete', () => {
  const bounds = site.regiaoBounds;
  const size = { width: 10, depth: 8 };
  it('projeta dentro da maquete', () => {
    expect(projectToRelief({ lat: bounds.north, lng: bounds.west }, bounds, size)).toEqual({ x: -5, z: -4 });
    expect(projectToRelief({ lat: bounds.south, lng: bounds.east }, bounds, size)).toEqual({ x: 5, z: 4 });
    const out = projectToRelief({ lat: 0, lng: 0 }, bounds, size);
    expect(Math.abs(out.x)).toBeLessThanOrEqual(5);
    expect(Math.abs(out.z)).toBeLessThanOrEqual(4);
  });
  it('relevo determinístico e em degraus', () => {
    const a = generateHeightfield({ resolution: 32, seed: 7, steps: 8 });
    const b = generateHeightfield({ resolution: 32, seed: 7, steps: 8 });
    expect(Array.from(a)).toEqual(Array.from(b));
    const levels = new Set(Array.from(a).map((v) => Math.round(v * 7)));
    expect(levels.size).toBeLessThanOrEqual(8);
    expect(Math.min(...a)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...a)).toBeLessThanOrEqual(1);
    expect(quantize(0.5, 1)).toBe(0.5);
  });
});

describe('capacidade 3D', () => {
  const env: Environment = {
    webgl: true,
    reducedMotion: false,
    saveData: false,
    effectiveType: '4g',
    finePointer: true,
    viewportWidth: 1280,
    forceLite: false,
  };
  it('desktop carrega automaticamente', () => expect(threeMode(env)).toBe('auto'));
  it('celular, economia de dados e ?lite=1 esperam o toque', () => {
    expect(threeMode({ ...env, finePointer: false, viewportWidth: 375 })).toBe('on-demand');
    expect(threeMode({ ...env, saveData: true })).toBe('on-demand');
    expect(threeMode({ ...env, effectiveType: '3g' })).toBe('on-demand');
    expect(threeMode({ ...env, forceLite: true })).toBe('on-demand');
  });
  it('sem WebGL desliga o 3D', () => expect(threeMode({ ...env, webgl: false })).toBe('off'));
});

describe('ficha de transparência', () => {
  it('lista o que não foi disponibilizado', () => {
    const r = transparencyReport(getListingById('area-rural-camanducaia')!);
    const keys = r.missing.map((m) => m.key);
    expect(keys).toEqual(expect.arrayContaining(['preco', 'condicoes', 'documentos', 'agua', 'internet', 'cercamento']));
    expect(r.confirmed + r.missing.length).toBe(r.total);
  });
  it('anúncio completo tem mais itens confirmados', () => {
    const a = transparencyReport(getListingById('chacara-vista-da-mantiqueira')!);
    const b = transparencyReport(getListingById('area-rural-camanducaia')!);
    expect(a.confirmed).toBeGreaterThan(b.confirmed);
  });
});

describe('seo', () => {
  it('noindex enquanto demonstrativo, canonical absoluta', () => {
    const s = buildSeo({ title: 'Sítio', description: 'Desc', path: '/terrenos/sitio/' });
    expect(s.robots).toBe('noindex');
    expect(s.canonical).toBe('https://example.com/terrenos/sitio/');
    expect(s.ogImage).toBe('https://example.com/og-fallback.jpg');
    expect(buildSeo({ title: 'x', description: 'y', path: '/' }, { ...site, indexable: true }).robots).toBe('index, follow');
  });
  it('trunca descrições longas', () => {
    const d = truncateDescription('palavra '.repeat(60));
    expect(d.length).toBeLessThanOrEqual(160);
    expect(d.endsWith('…')).toBe(true);
  });
  it('getListingBySlug retorna null para slug inexistente', () => {
    expect(getListingBySlug('nao-existe')).toBeNull();
    expect(getListingBySlug('sitio-pedra-branca')?.id).toBe('sitio-pedra-branca');
  });
});

import { contourSegments } from '@/lib/relief';
import { placeLabels, reliefPins, POSTER_W } from '@/lib/relief-data';
import { published } from '@/data';

describe('pôster da região', () => {
  it('curvas de nível ficam dentro do quadro', () => {
    const field = new Float32Array(16 * 16).map((_, i) => (i % 16) / 15);
    const segs = contourSegments(field, 16, 0.5);
    expect(segs.length).toBeGreaterThan(0);
    for (const s of segs) for (const v of s) expect(v).toBeGreaterThanOrEqual(0), expect(v).toBeLessThanOrEqual(1);
  });
  it('rótulos próximos não ficam na mesma posição', () => {
    const labels = placeLabels([
      { px: 100, py: 400, text: 'Chácara Vista da Mantiqueira' },
      { px: 110, py: 420, text: 'Residencial Colinas' },
    ]);
    expect(labels[0]).not.toEqual(labels[1]);
  });
  it('rótulo perto da borda esquerda não usa âncora à direita', () => {
    const [l] = placeLabels([{ px: 5, py: 400, text: 'Um nome bem comprido de terreno' }]);
    expect(l.anchor).toBe('start');
  });
  it('todos os pinos do catálogo ficam dentro do pôster', () => {
    for (const p of reliefPins(published)) {
      expect(p.px).toBeGreaterThanOrEqual(0);
      expect(p.px).toBeLessThanOrEqual(POSTER_W);
    }
  });
});
