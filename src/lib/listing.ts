import type { Listing } from '@/types/listing';
import { isEmpreendimento } from '@/types/listing';
import { availableAreaRange, referencePriceCents, summarizeLots } from './lots';

export const ZONE_LABEL = { rural: 'Rural', urbano: 'Urbano' } as const;
export const KIND_LABEL = { terreno: 'Terreno avulso', empreendimento: 'Empreendimento' } as const;
export const INTERESSE_LABEL = {
  lazer: 'Lazer',
  chacara: 'Chácara',
  moradia: 'Moradia',
  uso_rural: 'Uso rural',
} as const;
export const RELIEF_LABEL = { plano: 'Plano', suave: 'Suave ondulado', acidentado: 'Acidentado' } as const;
export const ACCESS_TYPE_LABEL = { asfalto: 'Asfalto', terra: 'Estrada de terra', misto: 'Asfalto e terra' } as const;

export type PriceInfo =
  | { mode: 'total'; cents: number }
  | { mode: 'a_partir_de'; cents: number }
  | { mode: 'sob_consulta'; cents: null };

/**
 * Preço de exibição. Terreno: preço total. Empreendimento: "a partir de"
 * somente com base nos lotes disponíveis com preço informado.
 */
export function priceInfo(listing: Listing): PriceInfo {
  if (isEmpreendimento(listing)) {
    const ref = referencePriceCents(listing.lots);
    return ref === null ? { mode: 'sob_consulta', cents: null } : { mode: 'a_partir_de', cents: ref };
  }
  return listing.priceCents === null
    ? { mode: 'sob_consulta', cents: null }
    : { mode: 'total', cents: listing.priceCents };
}

/** Valor usado na ordenação por preço; null vai para o fim, nunca vira zero. */
export function sortablePriceCents(listing: Listing): number | null {
  return priceInfo(listing).cents;
}

export interface AreaInfo {
  minM2: number;
  maxM2: number;
  /** true quando é faixa de lotes disponíveis. */
  isRange: boolean;
}

export function areaInfo(listing: Listing): AreaInfo | null {
  if (isEmpreendimento(listing)) {
    const range = availableAreaRange(listing.lots);
    return range ? { ...range, isRange: range.minM2 !== range.maxM2 } : null;
  }
  return { minM2: listing.areaM2, maxM2: listing.areaM2, isRange: false };
}

export function detailPath(listing: Pick<Listing, 'kind' | 'slug'>): string {
  return listing.kind === 'empreendimento' ? `/empreendimentos/${listing.slug}/` : `/terrenos/${listing.slug}/`;
}

export function categoryLabel(listing: Pick<Listing, 'kind' | 'zone'>): string {
  return `${KIND_LABEL[listing.kind]} ${listing.zone === 'rural' ? 'rural' : 'urbano'}`;
}

export function lotSummaryOf(listing: Listing) {
  return isEmpreendimento(listing) ? summarizeLots(listing.lots) : null;
}

/** Remove acentos e caixa para comparação textual. */
export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}
