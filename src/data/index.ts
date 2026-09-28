/**
 * Catálogo agregado. Para adicionar um anúncio: crie um arquivo em
 * src/data/listings/ e inclua-o na lista `all` abaixo (ver README).
 */
import type { Empreendimento, Listing, Terreno } from '@/types/listing';
import { isEmpreendimento } from '@/types/listing';
import { recantoDasAraucarias } from './listings/recanto-das-araucarias';
import { terrasDoCafezal } from './listings/terras-do-cafezal';
import { sitioPedraBranca } from './listings/sitio-pedra-branca';
import { areaRuralCamanducaia } from './listings/area-rural-camanducaia';
import { chacaraVistaDaMantiqueira } from './listings/chacara-vista-da-mantiqueira';
import { terrenoRibeiraoDasPedras } from './listings/terreno-ribeirao-das-pedras';
import { terrenoJardimDasPalmeiras } from './listings/terreno-jardim-das-palmeiras';
import { residencialColinasDeExtrema } from './listings/residencial-colinas-de-extrema';

const all: Listing[] = [
  recantoDasAraucarias,
  terrasDoCafezal,
  sitioPedraBranca,
  areaRuralCamanducaia,
  chacaraVistaDaMantiqueira,
  terrenoRibeiraoDasPedras,
  terrenoJardimDasPalmeiras,
  residencialColinasDeExtrema,
];

/** Todos os anúncios, inclusive rascunhos (uso interno e testes). */
export const catalog: readonly Listing[] = all;

/** Somente anúncios publicados aparecem no site. */
export const published: readonly Listing[] = all.filter((l) => l.status === 'publicado');

export function getListingBySlug(slug: string): Listing | null {
  return published.find((l) => l.slug === slug) ?? null;
}

export function getListingById(id: string): Listing | null {
  return published.find((l) => l.id === id) ?? null;
}

export const publishedTerrenos: readonly Terreno[] = published.filter((l): l is Terreno => l.kind === 'terreno');
export const publishedEmpreendimentos: readonly Empreendimento[] = published.filter(isEmpreendimento);

/** Relacionados por `related[]`; completa com mesma zona e região. */
export function relatedListings(listing: Listing, limit = 3): Listing[] {
  const explicit = listing.related
    .map((id) => getListingById(id))
    .filter((l): l is Listing => l !== null && l.id !== listing.id);
  const seen = new Set([listing.id, ...explicit.map((l) => l.id)]);
  const fallback = published.filter(
    (l) => !seen.has(l.id) && l.zone === listing.zone && (l.regiao === listing.regiao || l.municipio === listing.municipio),
  );
  const rest = published.filter((l) => !seen.has(l.id) && !fallback.includes(l) && l.zone === listing.zone);
  return [...explicit, ...fallback, ...rest].slice(0, limit);
}

/** Checagens de integridade usadas nos testes. */
export function validateCatalog(list: readonly Listing[]): string[] {
  const errors: string[] = [];
  const slugs = new Set<string>();
  const ids = new Set<string>();
  for (const l of list) {
    if (slugs.has(l.slug)) errors.push(`slug duplicado: ${l.slug}`);
    if (ids.has(l.id)) errors.push(`id duplicado: ${l.id}`);
    slugs.add(l.slug);
    ids.add(l.id);
    if (l.media.some((m) => !m.alt.trim())) errors.push(`${l.id}: imagem sem alt`);
    if (l.media.some((m) => !m.illustrative)) errors.push(`${l.id}: imagem demo não marcada como ilustrativa`);
    if (l.videos.some((v) => !v.demonstrativo)) errors.push(`${l.id}: vídeo demo não marcado como demonstrativo`);
    for (const r of l.related) if (!list.some((x) => x.id === r)) errors.push(`${l.id}: relacionado inexistente ${r}`);
    if (isEmpreendimento(l)) {
      if (l.plan?.kind === 'svg' && !l.plan.viewBox) errors.push(`${l.id}: planta SVG sem viewBox`);
      if (l.plan?.kind === 'imagem' && l.lots.some((lot) => lot.polygon !== null)) {
        errors.push(`${l.id}: planta em imagem não pode ter polígonos`);
      }
      const lotIds = new Set<string>();
      for (const lot of l.lots) {
        if (lotIds.has(lot.id)) errors.push(`${l.id}: lote duplicado ${lot.id}`);
        lotIds.add(lot.id);
      }
    }
  }
  return errors;
}
