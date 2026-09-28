/**
 * Catálogo interativo: busca, filtros combináveis, ordenação, cards/mapa e
 * estado na URL. Toda regra de negócio vem de src/lib (filters, sort, url-state).
 */
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, LayoutGroup, MotionConfig, motion } from 'motion/react';
import type { CatalogProps } from '@/lib/catalog-props';
import {
  DEFAULT_FILTERS,
  applyFilters,
  countHiddenByUnknownPrice,
  describeFilters,
  eligibleLots,
  type Filters,
} from '@/lib/filters';
import { SORT_KEYS, SORT_LABEL, sortListings, type SortKey } from '@/lib/sort';
import { DEFAULT_STATE, parseCatalogState, serializeCatalogState, type CatalogState, type ViewMode } from '@/lib/url-state';
import { catalogStore } from '@/lib/catalog-store';
import { isEmpreendimento } from '@/types/listing';
import { messages } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';
import { ListingCardView } from '../ListingCardView';
import { WaAction } from '../WaAction';
import { Filtros } from './Filtros';
import FavoritoButton from '../FavoritoButton';
import CompararButton from '../CompararButton';

interface Props extends CatalogProps {
  /** Ilha do mapa (client:only), recebida como slot nomeado "map". */
  map?: ReactNode;
}

function scopeLabel(f: Filters, base: CatalogProps['base'], filtered: boolean): string {
  const parts: string[] = [];
  if (base.tipo === 'empreendimento' || f.tipo === 'empreendimento') parts.push('Empreendimentos');
  else if (f.tipo === 'terreno') parts.push('Terrenos avulsos');
  if (f.zona === 'rural') parts.push('no campo');
  if (f.zona === 'urbano') parts.push('na cidade');
  if (parts.length === 0) return filtered ? 'Busca em todos os anúncios' : 'Mostrando todos os anúncios';
  const text = parts.join(' ');
  return `Mostrando: ${text.charAt(0).toUpperCase()}${text.slice(1)}`;
}

export default function Catalogo(props: Props) {
  const { listings, cards, options, referenceCity, base, path, siteUrl, map } = props;
  const baseFilters: Partial<Filters> = base.tipo ? { tipo: base.tipo } : {};
  const initial: CatalogState = { ...DEFAULT_STATE, filters: { ...DEFAULT_FILTERS, ...baseFilters } };
  const [state, setState] = useState<CatalogState>(initial);
  const [ready, setReady] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const filtersRef = useRef<HTMLDivElement>(null);

  // Lê a URL só no navegador, depois da hidratação (o HTML do build mostra tudo).
  useEffect(() => {
    const parsed = parseCatalogState(window.location.search, baseFilters);
    setState(parsed);
    const f = parsed.filters;
    if (f.relevo.length || f.acesso.length || f.infra.length || f.distMaxKm !== null) setMoreOpen(true);
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready) return;
    const qs = serializeCatalogState(state, baseFilters);
    const url = `${path}${qs ? `?${qs}` : ''}`;
    if (url !== `${window.location.pathname}${window.location.search}`) window.history.replaceState(window.history.state, '', url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, ready]);

  const ctx = useMemo(() => ({ referenceCity }), [referenceCity]);
  const f = state.filters;
  const results = useMemo(() => sortListings(applyFilters(listings, f, ctx), state.sort), [listings, f, ctx, state.sort]);
  const hiddenByPrice = useMemo(() => countHiddenByUnknownPrice(listings, f, ctx), [listings, f, ctx]);
  const priceOrArea = f.precoMinCents !== null || f.precoMaxCents !== null || f.areaMinM2 !== null || f.areaMaxM2 !== null;
  const infraLabels = useMemo(() => Object.fromEntries(options.infra.map((o) => [o.key, o.label])), [options.infra]);
  const active = describeFilters(f, { infra: infraLabels }).filter(
    (d) => !(base.tipo && d === 'Empreendimentos'),
  );
  const isDefault =
    serializeCatalogState({ filters: f, sort: 'destaque', view: 'cards' }, baseFilters) === '';

  useEffect(() => {
    catalogStore.set({ ids: results.map((r) => r.id), view: state.view, activeId });
  }, [results, state.view, activeId]);

  const update = (patch: Partial<Filters>) => setState((s) => ({ ...s, filters: { ...s.filters, ...patch } }));
  const clear = () => setState((s) => ({ ...s, filters: { ...DEFAULT_FILTERS, ...baseFilters } }));
  const setView = (view: ViewMode) => setState((s) => ({ ...s, view }));
  const shareUrl = (() => {
    const qs = serializeCatalogState(state, baseFilters);
    return new URL(`${path}${qs ? `?${qs}` : ''}`, siteUrl).href;
  })();

  return (
    <MotionConfig reducedMotion="user">
      <div ref={filtersRef} className="scroll-mt-24">
        <Filtros
          filters={f}
          onChange={update}
          options={options}
          referenceCity={referenceCity}
          lockTipo={Boolean(base.tipo)}
          moreOpen={moreOpen}
          onToggleMore={() => setMoreOpen((o) => !o)}
        />
      </div>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
        <div aria-live="polite">
          <p className="text-[0.9rem] text-nevoa">{scopeLabel(f, base, !isDefault)}</p>
          <p className="type-display mt-1 text-2xl">
            {results.length} {results.length === 1 ? 'anúncio encontrado' : 'anúncios encontrados'}
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="mb-1 block text-[0.8rem] text-nevoa">Ordenar por</span>
            <span className="relative block">
              <select
                value={state.sort}
                onChange={(e) => setState((s) => ({ ...s, sort: e.target.value as SortKey }))}
                className="h-11 appearance-none rounded-[10px] border border-input bg-cal pl-3 pr-8 text-[0.95rem]"
              >
                {SORT_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {SORT_LABEL[k]}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-nevoa" aria-hidden="true">
                ▾
              </span>
            </span>
          </label>
          <div className="flex rounded-[10px] bg-areia-100 p-1" role="group" aria-label="Modo de exibição">
            {(['cards', 'mapa'] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={state.view === v}
                onClick={() => setView(v)}
                className={cn(
                  'rounded-lg px-4 py-1.5 text-[0.92rem]',
                  state.view === v ? 'bg-cal font-[600] text-mata shadow-sm' : 'text-grafite/75 hover:text-mata',
                )}
              >
                {v === 'cards' ? 'Cards' : 'Mapa'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {(active.length > 0 || !isDefault) && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {active.map((a) => (
            <span key={a} className="rounded-md bg-folha-100 px-2.5 py-1 text-[0.85rem] text-mata">
              {a}
            </span>
          ))}
          <button
            type="button"
            onClick={clear}
            className="px-2 py-1 text-[0.88rem] font-[560] text-mata underline decoration-areia decoration-2 underline-offset-4 hover:decoration-mata"
          >
            Limpar filtros
          </button>
        </div>
      )}
      {hiddenByPrice > 0 && (
        <p className="mt-3 text-[0.85rem] text-nevoa">
          {hiddenByPrice === 1
            ? '1 anúncio com preço sob consulta não entra no filtro de preço.'
            : `${hiddenByPrice} anúncios com preço sob consulta não entram no filtro de preço.`}{' '}
          Preço sob consulta não é tratado como zero.
        </p>
      )}

      <div className={cn('mt-8', state.view !== 'mapa' && 'hidden')} data-lenis-prevent>
        {map ?? (
          <div className="grid min-h-[24rem] place-items-center rounded-2xl border border-border bg-areia-100 p-6 text-center text-nevoa">
            Mapa indisponível nesta página.
          </div>
        )}
      </div>

      {results.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-input bg-card p-8 text-center sm:p-12">
          <p className="type-display text-2xl">Nenhum anúncio atende a todos os filtros</p>
          <p className="mx-auto mt-3 max-w-[52ch] text-grafite/80">
            Ajuste os filtros para ampliar a busca ou envie os critérios ao corretor, que pode ter opções ainda não
            publicadas.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => filtersRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="min-h-11 rounded-[10px] border border-input px-4 font-[560] text-mata hover:bg-areia-100"
            >
              Ajustar filtros
            </button>
            <WaAction message={messages.buscaVazia({ filters: active, url: shareUrl })}>Enviar esta busca ao corretor</WaAction>
            <button
              type="button"
              onClick={clear}
              className="min-h-11 px-3 font-[560] text-mata underline decoration-areia decoration-2 underline-offset-4"
            >
              Limpar filtros
            </button>
          </div>
        </div>
      ) : (
        <LayoutGroup>
          {/* A chave remonta a lista quando o estado da URL é aplicado: sem animação de saída na carga. */}
          <ul
            key={ready ? "url" : "build"}
            className={cn(
              'mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3',
              state.view === 'mapa' && 'lg:grid-cols-3',
            )}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {results.map((l) => {
                const card = cards[l.id];
                if (!card) return null;
                const lots = isEmpreendimento(l) && priceOrArea ? eligibleLots(l.lots, f).length : null;
                return (
                  <motion.li
                    key={l.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.32, ease: [0.22, 0.8, 0.24, 1] }}
                    onMouseEnter={() => setActiveId(l.id)}
                    onMouseLeave={() => setActiveId(null)}
                    onFocus={() => setActiveId(l.id)}
                  >
                    <ListingCardView
                      card={card}
                      actions={<FavoritoButton id={l.id} title={l.title} />}
                      footer={<CompararButton id={l.id} title={l.title} />}
                      note={
                        lots !== null
                          ? `${lots} ${lots === 1 ? 'lote atende' : 'lotes atendem'} a preço e área ao mesmo tempo`
                          : null
                      }
                    />
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        </LayoutGroup>
      )}
    </MotionConfig>
  );
}
