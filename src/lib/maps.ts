import type { LatLng, Location } from '@/types/location';

const coord = (p: LatLng) => `${p.lat.toFixed(6)},${p.lng.toFixed(6)}`;

/** "Abrir no Google Maps" (centro do terreno). */
export function googleMapsSearchUrl(point: LatLng): string {
  return `https://www.google.com/maps/search/?api=1&query=${coord(point)}`;
}

/** "Traçar rota" até o ponto informado. */
export function googleMapsDirectionsUrl(point: LatLng): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${coord(point)}`;
}

export interface RouteTarget {
  point: LatLng;
  /** true quando a rota usa o ponto de entrada confirmado. */
  usesEntrance: boolean;
  /** Aviso a exibir junto ao botão de rota, quando houver. */
  warning: string | null;
}

/**
 * A rota usa o ponto de entrada quando existir; senão o centro,
 * com aviso quando a localização é aproximada.
 */
export function routeTarget(location: Location): RouteTarget {
  if (location.entrance) {
    return { point: location.entrance, usesEntrance: true, warning: null };
  }
  return {
    point: location.center,
    usesEntrance: false,
    warning:
      location.precision === 'aproximada'
        ? 'Localização aproximada: a rota leva à região do terreno. Confirme o ponto de chegada com o corretor.'
        : null,
  };
}

export function mapLinks(location: Location) {
  const route = routeTarget(location);
  return {
    open: googleMapsSearchUrl(location.center),
    directions: googleMapsDirectionsUrl(route.point),
    route,
  };
}
