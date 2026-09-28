import { describe, expect, it } from 'vitest';
import { catalog, published, relatedListings, validateCatalog } from '@/data';
import { faqGeral } from '@/data/faq-geral';
import { isEmpreendimento } from '@/types/listing';
import { LOT_STATUSES } from '@/lib/lots';

describe('catálogo demonstrativo', () => {
  it('passa nas checagens de integridade', () => {
    expect(validateCatalog(catalog)).toEqual([]);
  });

  it('tem 8 anúncios publicados: 6 rurais e 2 urbanos', () => {
    expect(published).toHaveLength(8);
    expect(published.filter((l) => l.zone === 'rural')).toHaveLength(6);
    expect(published.filter((l) => l.zone === 'urbano')).toHaveLength(2);
  });

  it('cobre os casos obrigatórios do briefing', () => {
    const emps = published.filter(isEmpreendimento);
    const svg = emps.find((e) => e.plan?.kind === 'svg' && e.zone === 'rural');
    expect(svg).toBeDefined();
    expect(svg!.lots.length).toBeGreaterThanOrEqual(8);
    expect(svg!.lots.every((l) => l.polygon !== null)).toBe(true);
    expect(new Set(svg!.lots.map((l) => l.status))).toEqual(new Set(LOT_STATUSES));
    expect(svg!.plan!.demonstrativa).toBe(true);

    const img = emps.find((e) => e.plan?.kind === 'imagem');
    expect(img).toBeDefined();
    expect(img!.lots.every((l) => l.polygon === null)).toBe(true);

    expect(published.some((l) => l.kind === 'terreno' && l.zone === 'rural' && l.priceCents !== null)).toBe(true);
    expect(published.some((l) => l.kind === 'terreno' && l.priceCents === null)).toBe(true);
    expect(
      published.some(
        (l) =>
          l.infrastructure.items.some((i) => i.status === 'prevista') &&
          l.infrastructure.items.some((i) => i.status === 'nao_informada'),
      ),
    ).toBe(true);
    expect(published.some((l) => l.videos.length === 0)).toBe(true);
    const urb = published.filter((l) => l.zone === 'urbano');
    expect(urb.map((l) => l.kind).sort()).toEqual(['empreendimento', 'terreno']);
    expect(
      published.some(
        (l) =>
          l.location.precision === 'aproximada' &&
          l.location.entrance !== null &&
          (l.location.entrance.lat !== l.location.center.lat || l.location.entrance.lng !== l.location.center.lng),
      ),
    ).toBe(true);
  });

  it('todas as imagens são ilustrativas, com alt, dimensões e crédito', () => {
    for (const l of published) {
      expect(l.media.length).toBeGreaterThan(0);
      for (const m of l.media) {
        expect(m.illustrative).toBe(true);
        expect(m.alt.length).toBeGreaterThan(10);
        expect(m.width).toBeGreaterThan(0);
        expect(m.height).toBeGreaterThan(0);
        expect(m.credit).toMatch(/Unsplash/);
      }
    }
  });

  it('não contém dados pessoais (CPF, RG, telefones, e-mails)', () => {
    const text = JSON.stringify(catalog);
    expect(text).not.toMatch(/\d{3}\.\d{3}\.\d{3}-\d{2}/);
    expect(text).not.toMatch(/\(\d{2}\)\s?\d{4,5}-\d{4}/);
    expect(text).not.toMatch(/[\w.-]+@[\w-]+\.[\w.]+/);
    // \b do JS não reconhece acentos ("órgãos" casaria com "rg"), por isso o lookaround Unicode.
    expect(text.toLowerCase()).not.toMatch(/(?<!\p{L})(cpf|rg)(?!\p{L})/u);
  });

  it('não promete valorização nem retorno', () => {
    const text = JSON.stringify(catalog).toLowerCase();
    expect(text).not.toMatch(/valoriza|retorno garantido|investimento seguro/);
  });

  it('FAQs têm palavras-chave', () => {
    for (const f of [...faqGeral, ...published.flatMap((l) => l.faq)]) expect(f.keywords.length).toBeGreaterThan(0);
  });

  it('relacionados não incluem o próprio anúncio', () => {
    for (const l of published) {
      const rel = relatedListings(l);
      expect(rel.some((r) => r.id === l.id)).toBe(false);
      expect(rel.length).toBeGreaterThan(0);
    }
  });
});
