import type { AccessType, Interesse, ListingKind, Relief, Zone } from '@/types/listing';
import { DEFAULT_FILTERS, type Filters } from './filters';
import { SORT_KEYS, type SortKey } from './sort';

export type ViewMode = 'cards' | 'mapa';

export interface CatalogState {
  filters: Filters;
  sort: SortKey;
  view: ViewMode;
}

export const DEFAULT_STATE: CatalogState = { filters: DEFAULT_FILTERS, sort: 'destaque', view: 'cards' };

const ZONES: readonly Zone[] = ['rural', 'urbano'];
const KINDS: readonly ListingKind[] = ['terreno', 'empreendimento'];
const RELIEFS: readonly Relief[] = ['plano', 'suave', 'acidentado'];
const ACCESS: readonly AccessType[] = ['asfalto', 'terra', 'misto'];
const INTERESSES: readonly Interesse[] = ['lazer', 'chacara', 'moradia', 'uso_rural'];

const oneOf = <T extends string>(value: string | null, allowed: readonly T[]): T | null =>
  value !== null && (allowed as readonly string[]).includes(value) ? (value as T) : null;

const listOf = <T extends string>(value: string | null, allowed: readonly T[]): T[] => {
  if (!value) return [];
  const seen = new Set<T>();
  for (const part of value.split(',')) {
    const v = oneOf(part.trim(), allowed);
    if (v) seen.add(v);
  }
  // Ordem canônica para que a URL seja idempotente.
  return allowed.filter((a) => seen.has(a));
};

const positiveInt = (value: string | null): number | null => {
  if (value === null || value.trim() === '') return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : null;
};

const slugList = (value: string | null): string[] =>
  value
    ? [...new Set(value.split(',').map((s) => s.trim()).filter((s) => /^[a-z0-9_-]+$/.test(s)))].sort()
    : [];

/** Query string -> estado. Valores inválidos voltam ao padrão. */
export function parseCatalogState(search: string | URLSearchParams, base: Partial<Filters> = {}): CatalogState {
  const d = { ...DEFAULT_FILTERS, ...base };
  const p = typeof search === 'string' ? new URLSearchParams(search) : search;
  const precoMin = positiveInt(p.get('pmin'));
  const precoMax = positiveInt(p.get('pmax'));
  const filters: Filters = {
    q: (p.get('q') ?? '').slice(0, 120),
    zona: oneOf(p.get('zona'), [...ZONES, 'todos'] as const) ?? d.zona,
    tipo: oneOf(p.get('tipo'), [...KINDS, 'todos'] as const) ?? d.tipo,
    local: p.get('local')?.trim() || null,
    // Na URL o preço vai em reais inteiros; internamente, centavos.
    precoMinCents: precoMin === null ? null : precoMin * 100,
    precoMaxCents: precoMax === null ? null : precoMax * 100,
    areaMinM2: positiveInt(p.get('amin')),
    areaMaxM2: positiveInt(p.get('amax')),
    relevo: listOf(p.get('relevo'), RELIEFS),
    acesso: listOf(p.get('acesso'), ACCESS),
    infra: slugList(p.get('infra')),
    distMaxKm: positiveInt(p.get('dist')),
    interesse: oneOf(p.get('interesse'), INTERESSES),
  };
  const sort = oneOf(p.get('ordem'), SORT_KEYS) ?? DEFAULT_STATE.sort;
  const view = oneOf(p.get('modo'), ['cards', 'mapa'] as const) ?? DEFAULT_STATE.view;
  return { filters, sort, view };
}

/** Estado -> query string, omitindo os valores padrão. */
export function serializeCatalogState(state: CatalogState, base: Partial<Filters> = {}): string {
  const f = state.filters;
  const d = { ...DEFAULT_FILTERS, ...base };
  const p = new URLSearchParams();
  if (f.q.trim()) p.set('q', f.q.trim());
  if (f.zona !== d.zona) p.set('zona', f.zona);
  if (f.tipo !== d.tipo) p.set('tipo', f.tipo);
  if (f.local) p.set('local', f.local);
  if (f.interesse) p.set('interesse', f.interesse);
  if (f.precoMinCents !== null) p.set('pmin', String(Math.round(f.precoMinCents / 100)));
  if (f.precoMaxCents !== null) p.set('pmax', String(Math.round(f.precoMaxCents / 100)));
  if (f.areaMinM2 !== null) p.set('amin', String(f.areaMinM2));
  if (f.areaMaxM2 !== null) p.set('amax', String(f.areaMaxM2));
  if (f.relevo.length) p.set('relevo', RELIEFS.filter((r) => f.relevo.includes(r)).join(','));
  if (f.acesso.length) p.set('acesso', ACCESS.filter((a) => f.acesso.includes(a)).join(','));
  if (f.infra.length) p.set('infra', [...new Set(f.infra)].sort().join(','));
  if (f.distMaxKm !== null) p.set('dist', String(f.distMaxKm));
  if (state.sort !== DEFAULT_STATE.sort) p.set('ordem', state.sort);
  if (state.view !== DEFAULT_STATE.view) p.set('modo', state.view);
  return p.toString();
}

/** URL do catálogo com filtros (usada pela busca rápida e atalhos da home). */
export function catalogUrl(partial: Partial<Filters>, path = '/terrenos/'): string {
  const qs = serializeCatalogState({ ...DEFAULT_STATE, filters: { ...DEFAULT_FILTERS, ...partial } });
  return qs ? `${path}?${qs}` : path;
}
