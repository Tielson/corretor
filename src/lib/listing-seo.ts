import type { Listing } from '@/types/listing';
import { categoryLabel, priceInfo } from './listing';
import { areaText } from './card';
import { formatCents } from './money';

/** Título e descrição exclusivos por anúncio. */
export function listingSeo(listing: Listing): { title: string; description: string } {
  const p = priceInfo(listing);
  const price =
    p.mode === 'total'
      ? `Preço ${formatCents(p.cents)}.`
      : p.mode === 'a_partir_de'
        ? `Lotes a partir de ${formatCents(p.cents)}.`
        : 'Preço sob consulta.';
  const area = areaText(listing);
  return {
    title: `${listing.title}, ${categoryLabel(listing).toLowerCase()} em ${listing.municipio}/${listing.uf}`,
    description: `${listing.summary} ${area ? `Área: ${area}.` : ''} ${price} Código ${listing.code}.`.replace(/ /g, ' '),
  };
}
