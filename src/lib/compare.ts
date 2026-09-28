/** Lógica pura de favoritos e comparação (sem DOM). */

export const COMPARE_LIMIT = 3;

export interface CompareItem {
  listingId: string;
  /** null = empreendimento comparado como conjunto. */
  lotId: string | null;
}

export type CompareResult = { ok: true; items: CompareItem[] } | { ok: false; items: CompareItem[]; reason: 'limite' | 'duplicado' };

export function addToCompare(items: readonly CompareItem[], item: CompareItem): CompareResult {
  if (items.some((i) => i.listingId === item.listingId)) {
    return { ok: false, items: [...items], reason: 'duplicado' };
  }
  if (items.length >= COMPARE_LIMIT) return { ok: false, items: [...items], reason: 'limite' };
  return { ok: true, items: [...items, item] };
}

export function removeFromCompare(items: readonly CompareItem[], listingId: string): CompareItem[] {
  return items.filter((i) => i.listingId !== listingId);
}

export function setCompareScope(items: readonly CompareItem[], listingId: string, lotId: string | null): CompareItem[] {
  return items.map((i) => (i.listingId === listingId ? { ...i, lotId } : i));
}

export function toggleFavorite(ids: readonly string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
}

/** Sanitiza o que vier do armazenamento (pode estar corrompido ou em formato antigo). */
export function parseCompareItems(value: unknown): CompareItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (v): v is CompareItem =>
        typeof v === 'object' &&
        v !== null &&
        typeof (v as CompareItem).listingId === 'string' &&
        ((v as CompareItem).lotId === null || typeof (v as CompareItem).lotId === 'string'),
    )
    .slice(0, COMPARE_LIMIT);
}

export function parseIdList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
}
