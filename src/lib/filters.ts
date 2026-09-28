import type { AccessType, Interesse, Listing, ListingKind, Relief, Zone } from '@/types/listing';
import { isEmpreendimento } from '@/types/listing';
import type { Lot } from '@/types/lot';
import { availableLots } from './lots';
import { ACCESS_TYPE_LABEL, INTERESSE_LABEL, RELIEF_LABEL, normalizeText } from './listing';
import { formatCents } from './money';
import { formatArea } from './area';

export interface Filters {
  q: string;
  zona: Zone | 'todos';
  tipo: ListingKind | 'todos';
  /** Município ou região (texto exibido; comparação normalizada). */
  local: string | null;
  precoMinCents: number | null;
  precoMaxCents: number | null;
  areaMinM2: number | null;
  areaMaxM2: number | null;
  relevo: Relief[];
  acesso: AccessType[];
  /** Chaves de infraestrutura que precisam estar com status 'existente'. */
  infra: string[];
  /** Distância máxima (km) até a cidade de referência. */
  distMaxKm: number | null;
  interesse: Interesse | null;
}

export const DEFAULT_FILTERS: Filters = {
  q: '',
  zona: 'todos',
  tipo: 'todos',
  local: null,
  precoMinCents: null,
  precoMaxCents: null,
  areaMinM2: null,
  areaMaxM2: null,
  relevo: [],
  acesso: [],
  infra: [],
  distMaxKm: null,
  interesse: null,
};

export interface FilterContext {
  /** Nome da cidade de referência para o filtro de distância. */
  referenceCity: string;
}

const hasPriceFilter = (f: Filters) => f.precoMinCents !== null || f.precoMaxCents !== null;
const hasAreaFilter = (f: Filters) => f.areaMinM2 !== null || f.areaMaxM2 !== null;

/** Preço desconhecido (null) nunca satisfaz um filtro de preço. */
export function priceMatches(cents: number | null, f: Pick<Filters, 'precoMinCents' | 'precoMaxCents'>): boolean {
  if (f.precoMinCents === null && f.precoMaxCents === null) return true;
  if (cents === null) return false;
  if (f.precoMinCents !== null && cents < f.precoMinCents) return false;
  if (f.precoMaxCents !== null && cents > f.precoMaxCents) return false;
  return true;
}

export function areaMatches(m2: number, f: Pick<Filters, 'areaMinM2' | 'areaMaxM2'>): boolean {
  if (f.areaMinM2 !== null && m2 < f.areaMinM2) return false;
  if (f.areaMaxM2 !== null && m2 > f.areaMaxM2) return false;
  return true;
}

/**
 * Regra do mesmo lote: um lote só é elegível se ele próprio satisfizer
 * preço E área ao mesmo tempo. Nunca combina preço de um lote com área de outro.
 */
export function eligibleLots(
  lots: readonly Lot[],
  f: Pick<Filters, 'precoMinCents' | 'precoMaxCents' | 'areaMinM2' | 'areaMaxM2'>,
): Lot[] {
  return availableLots(lots).filter((lot) => priceMatches(lot.priceCents, f) && areaMatches(lot.areaM2, f));
}

/** Infraestrutura existente: 'prevista' e 'nao_informada' não satisfazem. */
export function hasExistingInfra(listing: Listing, key: string): boolean {
  return listing.infrastructure.items.some((i) => i.key === key && i.status === 'existente');
}

export function distanceToReference(listing: Listing, referenceCity: string): number | null {
  const ref = normalizeText(referenceCity);
  const d = listing.location.distances.find((x) => normalizeText(x.label).includes(ref));
  return d ? d.km : null;
}

function textMatches(listing: Listing, q: string): boolean {
  const terms = normalizeText(q).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const haystack = normalizeText(
    [
      listing.title,
      listing.code,
      listing.municipio,
      listing.uf,
      listing.regiao ?? '',
      listing.summary,
      ...listing.highlights,
    ].join(' '),
  );
  return terms.every((t) => haystack.includes(t));
}

function localMatches(listing: Listing, local: string | null): boolean {
  if (!local) return true;
  const n = normalizeText(local);
  return normalizeText(listing.municipio) === n || (listing.regiao !== null && normalizeText(listing.regiao) === n);
}

export function listingMatches(listing: Listing, f: Filters, ctx: FilterContext): boolean {
  if (f.zona !== 'todos' && listing.zone !== f.zona) return false;
  if (f.tipo !== 'todos' && listing.kind !== f.tipo) return false;
  if (!localMatches(listing, f.local)) return false;
  if (f.interesse && !listing.interesses.includes(f.interesse)) return false;
  if (!textMatches(listing, f.q)) return false;

  if (f.relevo.length > 0 && (listing.features.relief === null || !f.relevo.includes(listing.features.relief))) {
    return false;
  }
  if (f.acesso.length > 0 && (listing.features.accessType === null || !f.acesso.includes(listing.features.accessType))) {
    return false;
  }
  if (f.infra.some((key) => !hasExistingInfra(listing, key))) return false;

  if (f.distMaxKm !== null) {
    const km = distanceToReference(listing, ctx.referenceCity);
    if (km === null || km > f.distMaxKm) return false;
  }

  if (hasPriceFilter(f) || hasAreaFilter(f)) {
    if (isEmpreendimento(listing)) {
      if (eligibleLots(listing.lots, f).length === 0) return false;
    } else {
      if (!priceMatches(listing.priceCents, f)) return false;
      if (!areaMatches(listing.areaM2, f)) return false;
    }
  }
  return true;
}

export function applyFilters(listings: readonly Listing[], f: Filters, ctx: FilterContext): Listing[] {
  return listings.filter((l) => listingMatches(l, f, ctx));
}

/**
 * Quantos anúncios ficaram de fora apenas porque o preço é "sob consulta".
 * Usado para avisar o visitante, sem tratar o valor como zero.
 */
export function countHiddenByUnknownPrice(listings: readonly Listing[], f: Filters, ctx: FilterContext): number {
  if (!hasPriceFilter(f)) return 0;
  const withoutPrice: Filters = { ...f, precoMinCents: null, precoMaxCents: null };
  return listings.filter((l) => {
    if (!listingMatches(l, withoutPrice, ctx)) return false;
    if (isEmpreendimento(l)) {
      const byArea = availableLots(l.lots).filter((lot) => areaMatches(lot.areaM2, f));
      return byArea.length > 0 && byArea.every((lot) => lot.priceCents === null);
    }
    return l.priceCents === null;
  }).length;
}

export function isDefaultFilters(f: Filters): boolean {
  return JSON.stringify(f) === JSON.stringify(DEFAULT_FILTERS);
}

/** Opções de município/região presentes no catálogo. */
export function localOptions(listings: readonly Listing[]): string[] {
  const set = new Set<string>();
  for (const l of listings) {
    set.add(l.municipio);
    if (l.regiao) set.add(l.regiao);
  }
  return [...set].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

/** Chaves de infraestrutura que existem em pelo menos um anúncio (qualquer status). */
export function infraOptions(listings: readonly Listing[]): Array<{ key: string; label: string }> {
  const map = new Map<string, string>();
  for (const l of listings) for (const i of l.infrastructure.items) if (!map.has(i.key)) map.set(i.key, i.label);
  return [...map].map(([key, label]) => ({ key, label }));
}

/** Descrição legível dos filtros ativos (mensagens de WhatsApp e rótulos). */
export function describeFilters(f: Filters, labels: { infra?: Record<string, string> } = {}): string[] {
  const out: string[] = [];
  const brl = (c: number) => formatCents(c);
  if (f.q.trim()) out.push(`Busca: "${f.q.trim()}"`);
  if (f.zona !== 'todos') out.push(f.zona === 'rural' ? 'No campo (rural)' : 'Na cidade (urbano)');
  if (f.tipo !== 'todos') out.push(f.tipo === 'empreendimento' ? 'Empreendimentos' : 'Terrenos avulsos');
  if (f.local) out.push(`Local: ${f.local}`);
  if (f.interesse) out.push(`Interesse: ${INTERESSE_LABEL[f.interesse]}`);
  if (f.precoMinCents !== null && f.precoMaxCents !== null) out.push(`Preço de ${brl(f.precoMinCents)} a ${brl(f.precoMaxCents)}`);
  else if (f.precoMaxCents !== null) out.push(`Preço até ${brl(f.precoMaxCents)}`);
  else if (f.precoMinCents !== null) out.push(`Preço a partir de ${brl(f.precoMinCents)}`);
  if (f.areaMinM2 !== null && f.areaMaxM2 !== null) out.push(`Área de ${formatArea(f.areaMinM2)} a ${formatArea(f.areaMaxM2)}`);
  else if (f.areaMinM2 !== null) out.push(`Área a partir de ${formatArea(f.areaMinM2)}`);
  else if (f.areaMaxM2 !== null) out.push(`Área até ${formatArea(f.areaMaxM2)}`);
  if (f.relevo.length) out.push(`Relevo: ${f.relevo.map((r) => RELIEF_LABEL[r].toLowerCase()).join(', ')}`);
  if (f.acesso.length) out.push(`Acesso: ${f.acesso.map((a) => ACCESS_TYPE_LABEL[a].toLowerCase()).join(', ')}`);
  if (f.infra.length) out.push(`Com ${f.infra.map((k) => (labels.infra?.[k] ?? k).toLowerCase()).join(', ')} existente`);
  if (f.distMaxKm !== null) out.push(`Até ${f.distMaxKm} km da cidade de referência`);
  return out;
}
