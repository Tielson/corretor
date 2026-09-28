/**
 * Modelo de exibição do card, derivado do anúncio (puro, serializável).
 * Usado tanto no HTML estático quanto dentro das ilhas React.
 */
import type { Listing } from '@/types/listing';
import { isEmpreendimento } from '@/types/listing';
import { formatArea, formatAreaRange } from './area';
import { areaInfo, categoryLabel, detailPath, priceInfo, type PriceInfo } from './listing';
import { summarizeLots, type LotSummary } from './lots';
import { formatCents } from './money';

export interface CardImage {
  src: string;
  srcSet: string;
  width: number;
  height: number;
  alt: string;
  credit: string | null;
  illustrative: boolean;
}

export interface CardModel {
  id: string;
  href: string;
  title: string;
  place: string;
  category: string;
  zone: Listing['zone'];
  kind: Listing['kind'];
  price: PriceInfo;
  /** Entrada e parcelas, exibidas separadas e menores que o preço. */
  terms: { downPayment: string | null; installments: string | null } | null;
  area: string | null;
  highlights: string[];
  lots: LotSummary | null;
  image: CardImage | null;
  code: string;
}

export function termsOf(listing: Listing): CardModel['terms'] {
  const c = listing.commercial;
  if (!c) return null;
  const downPayment = c.downPaymentCents !== null ? `Entrada de ${formatCents(c.downPaymentCents)}` : null;
  let installments: string | null = null;
  if (c.installments !== null && c.installmentCents !== null) {
    installments = `${c.installments} parcelas de ${formatCents(c.installmentCents)}`;
  } else if (c.installments !== null) {
    installments = `Saldo em até ${c.installments} parcelas`;
  }
  return downPayment || installments ? { downPayment, installments } : null;
}

export function areaText(listing: Listing): string | null {
  const a = areaInfo(listing);
  if (!a) return null;
  return a.isRange ? formatAreaRange(a) : formatArea(a.minM2);
}

export function toCardModel(listing: Listing, image: CardImage | null): CardModel {
  return {
    id: listing.id,
    href: detailPath(listing),
    title: listing.title,
    place: `${listing.municipio}, ${listing.uf}`,
    category: categoryLabel(listing),
    zone: listing.zone,
    kind: listing.kind,
    price: priceInfo(listing),
    terms: termsOf(listing),
    area: areaText(listing),
    highlights: listing.highlights.slice(0, 3),
    lots: isEmpreendimento(listing) ? summarizeLots(listing.lots) : null,
    image,
    code: listing.code,
  };
}
