/** Pontos de mapa a partir dos anúncios (puro; sem Leaflet). */
import type { Listing } from '@/types/listing';
import { toCardModel } from './card';
import { formatCents, SOB_CONSULTA } from './money';

export interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
  price?: string;
  href?: string;
  kind: 'terreno' | 'entrada';
  zone?: 'rural' | 'urbano';
  approximate?: boolean;
}

export function catalogPoints(listings: readonly Listing[]): MapPoint[] {
  return listings.map((l) => {
    const card = toCardModel(l, null);
    const p = card.price;
    return {
      id: l.id,
      lat: l.location.center.lat,
      lng: l.location.center.lng,
      title: l.title,
      subtitle: `${card.category} em ${card.place}`,
      price: p.cents === null ? SOB_CONSULTA : `${p.mode === 'a_partir_de' ? 'A partir de ' : ''}${formatCents(p.cents)}`,
      href: card.href,
      kind: 'terreno',
      zone: l.zone,
      approximate: l.location.precision === 'aproximada',
    };
  });
}

export function detailPoints(listing: Listing): MapPoint[] {
  const pts: MapPoint[] = [
    {
      id: `${listing.id}-centro`,
      lat: listing.location.center.lat,
      lng: listing.location.center.lng,
      title: listing.title,
      subtitle: listing.location.precision === 'aproximada' ? 'Posição aproximada do terreno' : 'Centro do terreno',
      kind: 'terreno',
      zone: listing.zone,
      approximate: listing.location.precision === 'aproximada',
    },
  ];
  if (listing.location.entrance) {
    pts.push({
      id: `${listing.id}-entrada`,
      lat: listing.location.entrance.lat,
      lng: listing.location.entrance.lng,
      title: 'Ponto de entrada',
      subtitle: listing.access.arrivalPoint ?? 'Acesso informado pelo responsável',
      kind: 'entrada',
    });
  }
  return pts;
}
