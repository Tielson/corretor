import type { Lot, LotStatus } from '@/types/lot';

export const LOT_STATUSES: readonly LotStatus[] = ['disponivel', 'reservado', 'vendido', 'sob_consulta'];

export const LOT_STATUS_LABEL: Record<LotStatus, string> = {
  disponivel: 'Disponível',
  reservado: 'Reservado',
  vendido: 'Vendido',
  sob_consulta: 'Sob consulta',
};

export type LotSummary = Record<LotStatus, number> & { total: number };

export function summarizeLots(lots: readonly Lot[]): LotSummary {
  const summary: LotSummary = { total: lots.length, disponivel: 0, reservado: 0, vendido: 0, sob_consulta: 0 };
  for (const lot of lots) summary[lot.status] += 1;
  return summary;
}

export const availableLots = (lots: readonly Lot[]): Lot[] => lots.filter((l) => l.status === 'disponivel');

/**
 * Menor preço entre os lotes disponíveis com preço informado.
 * É a única base aceita para "a partir de". null = sem referência consistente.
 */
export function referencePriceCents(lots: readonly Lot[]): number | null {
  const prices = availableLots(lots)
    .map((l) => l.priceCents)
    .filter((p): p is number => p !== null);
  return prices.length > 0 ? Math.min(...prices) : null;
}

/** Faixa de áreas dos lotes disponíveis. */
export function availableAreaRange(lots: readonly Lot[]): { minM2: number; maxM2: number } | null {
  const areas = availableLots(lots).map((l) => l.areaM2);
  if (areas.length === 0) return null;
  return { minM2: Math.min(...areas), maxM2: Math.max(...areas) };
}

export function lotLabel(lot: Pick<Lot, 'number' | 'block'>): string {
  return lot.block ? `Quadra ${lot.block}, lote ${lot.number}` : `Lote ${lot.number}`;
}

export function polygonToPath(points: ReadonlyArray<readonly [number, number]>): string {
  if (points.length === 0) return '';
  const [first, ...rest] = points;
  return `M${first[0]} ${first[1]}${rest.map(([x, y]) => `L${x} ${y}`).join('')}Z`;
}

/** Centroide pela fórmula do polígono (shoelace); cai para a média se a área for nula. */
export function polygonCentroid(points: ReadonlyArray<readonly [number, number]>): [number, number] {
  let a = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < points.length; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[(i + 1) % points.length];
    const f = x0 * y1 - x1 * y0;
    a += f;
    cx += (x0 + x1) * f;
    cy += (y0 + y1) * f;
  }
  if (Math.abs(a) < 1e-9) {
    const n = points.length || 1;
    return [points.reduce((s, p) => s + p[0], 0) / n, points.reduce((s, p) => s + p[1], 0) / n];
  }
  a *= 0.5;
  return [cx / (6 * a), cy / (6 * a)];
}

export function parseViewBox(viewBox: string): { x: number; y: number; width: number; height: number } {
  const [x, y, width, height] = viewBox.trim().split(/[\s,]+/).map(Number);
  if ([x, y, width, height].some((n) => !Number.isFinite(n))) throw new Error(`viewBox inválido: ${viewBox}`);
  return { x, y, width, height };
}
