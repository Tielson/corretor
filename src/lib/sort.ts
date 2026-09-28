import type { Listing } from '@/types/listing';
import { areaInfo, sortablePriceCents } from './listing';

export type SortKey = 'destaque' | 'menor_preco' | 'maior_area' | 'atualizacao';

export const SORT_LABEL: Record<SortKey, string> = {
  destaque: 'Destaques',
  menor_preco: 'Menor preço',
  maior_area: 'Maior área',
  atualizacao: 'Atualização mais recente',
};

export const SORT_KEYS = Object.keys(SORT_LABEL) as SortKey[];

const byUpdatedDesc = (a: Listing, b: Listing) => b.updatedAt.localeCompare(a.updatedAt);

/** Destaque: anúncios em destaque, depois rurais antes de urbanos, depois os mais recentes. */
function byFeatured(a: Listing, b: Listing): number {
  if (a.featured !== b.featured) return a.featured ? -1 : 1;
  if (a.zone !== b.zone) return a.zone === 'rural' ? -1 : 1;
  return byUpdatedDesc(a, b);
}

/** Compara números com null sempre no final (sob consulta nunca vira zero). */
function nullsLast(a: number | null, b: number | null, dir: 1 | -1): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return (a - b) * dir;
}

export function sortListings(listings: readonly Listing[], key: SortKey): Listing[] {
  const list = [...listings];
  switch (key) {
    case 'menor_preco':
      return list.sort((a, b) => nullsLast(sortablePriceCents(a), sortablePriceCents(b), 1) || byFeatured(a, b));
    case 'maior_area':
      return list.sort(
        (a, b) => nullsLast(areaInfo(a)?.maxM2 ?? null, areaInfo(b)?.maxM2 ?? null, -1) || byFeatured(a, b),
      );
    case 'atualizacao':
      return list.sort((a, b) => byUpdatedDesc(a, b) || byFeatured(a, b));
    case 'destaque':
    default:
      return list.sort(byFeatured);
  }
}
