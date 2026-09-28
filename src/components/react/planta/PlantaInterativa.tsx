/**
 * Planta interativa do empreendimento. Planta SVG, maquete 3D (sob demanda),
 * lista acessível e painel do lote compartilham o MESMO estado de seleção.
 * Planta em imagem: zoom + lista independente, sem polígonos inventados.
 */
import { Suspense, lazy, useEffect, useId, useMemo, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import type { Lot, Plan } from '@/types/lot';
import { LOT_STATUS_LABEL, lotLabel, parseViewBox, polygonCentroid, polygonToPath } from '@/lib/lots';
import { formatArea, formatAreaFull } from '@/lib/area';
import { formatPrice } from '@/lib/money';
import { formatDateLong } from '@/lib/date';
import { messages } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';
import { LotStatusBadge } from '../LotStatusBadge';
import { LOT_FILL, LOT_STROKE } from '../PlantaStatic';
import { WaAction } from '../WaAction';
import { PanZoom } from './PanZoom';

const LotsScene = lazy(() => import('../three/LotsScene'));

interface Props {
  title: string;
  code: string;
  url: string;
  lots: Lot[];
  plan: Plan | null;
  /** Slot opcional para ações do lote (comparar), renderizado no painel. */
}

type Tab = '2d' | '3d';

function LotPanel({ lot, title, code, url, onClose }: { lot: Lot; title: string; code: string; url: string; onClose: () => void }) {
  const message = messages.lote({
    empreendimento: title,
    code,
    lotNumber: lot.number,
    block: lot.block,
    area: formatAreaFull(lot.areaM2),
    url,
  });
  return (
    <motion.div
      key={lot.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.22, ease: [0.22, 0.8, 0.24, 1] }}
      className="rounded-2xl border border-border bg-card p-5"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.82rem] text-nevoa">Lote selecionado</p>
          <h3 className="mt-0.5 text-xl">{lotLabel(lot)}</h3>
        </div>
        <button type="button" onClick={onClose} className="rounded-md px-2 py-1 text-[0.85rem] text-nevoa hover:bg-areia-100 hover:text-mata">
          Fechar
        </button>
      </div>
      <div className="mt-3">
        <LotStatusBadge status={lot.status} />
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-[0.92rem]">
        <div>
          <dt className="text-[0.78rem] text-nevoa">Área</dt>
          <dd className="type-data font-[560]">{formatAreaFull(lot.areaM2)}</dd>
        </div>
        <div>
          <dt className="text-[0.78rem] text-nevoa">Medidas</dt>
          <dd className="type-data">{lot.dimensions ?? <span className="italic text-nevoa">Não informadas</span>}</dd>
        </div>
        <div>
          <dt className="text-[0.78rem] text-nevoa">Preço do lote</dt>
          <dd className="type-data font-[620] text-mata">{formatPrice(lot.priceCents)}</dd>
        </div>
        <div>
          <dt className="text-[0.78rem] text-nevoa">Atualizado em</dt>
          <dd>{formatDateLong(lot.updatedAt)}</dd>
        </div>
      </dl>
      {lot.status === 'vendido' ? (
        <p className="mt-4 text-[0.9rem] text-nevoa">Este lote já foi vendido. Veja os disponíveis na lista.</p>
      ) : (
        <div className="mt-5">
          <WaAction message={message} className="w-full">
            Tenho interesse neste lote
          </WaAction>
          {lot.status === 'reservado' && (
            <p className="mt-2 text-[0.82rem] text-nevoa">Lote reservado: o corretor informa se a reserva ainda está ativa.</p>
          )}
        </div>
      )}
    </motion.div>
  );
}

function LotList({
  lots,
  selectedId,
  onSelect,
  onHover,
}: {
  lots: Lot[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}) {
  return (
    <ul className="max-h-[26rem] divide-y divide-border overflow-y-auto rounded-2xl border border-border bg-card" aria-label="Lista de lotes" data-lenis-prevent>
      {lots.map((lot) => {
        const selected = lot.id === selectedId;
        return (
          <li key={lot.id}>
            <button
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(lot.id)}
              onMouseEnter={() => onHover(lot.id)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(lot.id)}
              onBlur={() => onHover(null)}
              className={cn(
                'grid w-full grid-cols-[1fr_auto] items-center gap-x-3 gap-y-0.5 px-4 py-2.5 text-left transition-colors',
                selected ? 'bg-folha-100' : 'hover:bg-areia-100',
              )}
            >
              <span className={cn('font-[560]', lot.status === 'vendido' && 'text-nevoa')}>{lotLabel(lot)}</span>
              <LotStatusBadge status={lot.status} />
              <span className="type-data col-span-2 text-[0.85rem] text-nevoa">
                {formatArea(lot.areaM2)}, {formatPrice(lot.priceCents)}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function Legend() {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-[0.82rem] text-grafite/85" aria-label="Legenda">
      {(Object.keys(LOT_STATUS_LABEL) as Lot['status'][]).map((s) => (
        <li key={s} className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="inline-block size-3.5 rounded-[3px] border-2"
            style={{
              background: LOT_FILL[s],
              borderColor: LOT_STROKE[s],
              backgroundImage: s === 'vendido' ? 'repeating-linear-gradient(45deg, transparent 0 3px, rgb(138 129 121 / .45) 3px 4px)' : undefined,
            }}
          />
          {LOT_STATUS_LABEL[s]}
        </li>
      ))}
    </ul>
  );
}

function SvgPlan({
  lots,
  viewBox,
  title,
  selectedId,
  hoverId,
  onSelect,
  onHover,
}: {
  lots: Lot[];
  viewBox: string;
  title: string;
  selectedId: string | null;
  hoverId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}) {
  const vb = parseViewBox(viewBox);
  const titleId = useId();
  return (
    <svg viewBox={viewBox} className="block h-auto w-full select-none" role="img" aria-labelledby={titleId}>
      <title id={titleId}>{`Planta demonstrativa de ${title}. Use a lista de lotes para selecionar pelo teclado.`}</title>
      <defs>
        <pattern id="hatch-v" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="10" stroke="#8a8179" strokeWidth="2" opacity="0.35" />
        </pattern>
      </defs>
      <rect x={vb.x} y={vb.y} width={vb.width} height={vb.height} fill="#f3ecdb" />
      <path
        d={`M${vb.x} ${vb.y + vb.height * 0.48} C ${vb.width * 0.35} ${vb.height * 0.47}, ${vb.width * 0.65} ${vb.height * 0.5}, ${vb.x + vb.width} ${vb.y + vb.height * 0.48}`}
        stroke="#e6d8b8"
        strokeWidth={48}
        fill="none"
      />
      {lots.map((lot) => {
        if (!lot.polygon) return null;
        const [cx, cy] = polygonCentroid(lot.polygon);
        const d = polygonToPath(lot.polygon);
        const selected = lot.id === selectedId;
        const hovered = lot.id === hoverId;
        return (
          <g
            key={lot.id}
            onClick={() => onSelect(lot.id)}
            onMouseEnter={() => onHover(lot.id)}
            onMouseLeave={() => onHover(null)}
            style={{ cursor: 'pointer' }}
          >
            <path
              d={d}
              fill={LOT_FILL[lot.status]}
              stroke={selected ? '#1e3a2b' : LOT_STROKE[lot.status]}
              strokeWidth={selected ? 6 : hovered ? 4 : 2}
              style={{ transition: 'stroke-width 150ms' }}
            />
            {lot.status === 'vendido' && <path d={d} fill="url(#hatch-v)" pointerEvents="none" />}
            {selected && <path d={d} fill="#1e3a2b" opacity={0.12} pointerEvents="none" />}
            <text x={cx} y={cy - 4} textAnchor="middle" fontSize={26} fontWeight={700} fill="#1e3a2b" pointerEvents="none">
              {lot.block ? `${lot.block}-${lot.number}` : lot.number}
            </text>
            <text x={cx} y={cy + 22} textAnchor="middle" fontSize={16} fill="#1b1f1c" pointerEvents="none">
              {LOT_STATUS_LABEL[lot.status]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function PlantaInterativa({ title, code, url, lots, plan }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('2d');
  const [webgl, setWebgl] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const selected = useMemo(() => lots.find((l) => l.id === selectedId) ?? null, [lots, selectedId]);
  const isSvg = plan?.kind === 'svg' && plan.viewBox !== null && lots.some((l) => l.polygon !== null);

  useEffect(() => {
    try {
      const c = document.createElement('canvas');
      setWebgl(Boolean(c.getContext('webgl2') ?? c.getContext('webgl')));
    } catch {
      setWebgl(false);
    }
  }, []);

  const select = (id: string) => {
    setSelectedId((cur) => (cur === id ? cur : id));
    // No celular, leva o painel para a vista depois de escolher na planta.
    if (window.matchMedia('(max-width: 1023px)').matches) {
      window.setTimeout(() => panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 60);
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0">
          {isSvg && (
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex rounded-[10px] bg-areia-100 p-1" role="tablist" aria-label="Visualização da planta">
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === '2d'}
                  onClick={() => setTab('2d')}
                  className={cn('rounded-lg px-4 py-1.5 text-[0.92rem]', tab === '2d' ? 'bg-cal font-[600] text-mata shadow-sm' : 'text-grafite/75')}
                >
                  Planta 2D
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === '3d'}
                  disabled={!webgl}
                  title={webgl ? undefined : 'Seu navegador não oferece WebGL; use a planta 2D.'}
                  onClick={() => setTab('3d')}
                  className={cn(
                    'rounded-lg px-4 py-1.5 text-[0.92rem] disabled:opacity-50',
                    tab === '3d' ? 'bg-cal font-[600] text-mata shadow-sm' : 'text-grafite/75',
                  )}
                >
                  Maquete 3D
                </button>
              </div>
              <Legend />
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-border bg-areia-100">
            {isSvg && plan?.viewBox ? (
              tab === '3d' ? (
                <Suspense
                  fallback={
                    <div className="grid aspect-[1000/660] place-items-center text-[0.92rem] text-nevoa" role="status">
                      Montando a maquete…
                    </div>
                  }
                >
                  <LotsScene lots={lots} viewBox={plan.viewBox} selectedId={selectedId} hoverId={hoverId} onSelect={select} onHover={setHoverId} />
                </Suspense>
              ) : (
                <PanZoom label="planta">
                  <SvgPlan lots={lots} viewBox={plan.viewBox} title={title} selectedId={selectedId} hoverId={hoverId} onSelect={select} onHover={setHoverId} />
                </PanZoom>
              )
            ) : plan?.kind === 'imagem' && plan.imageUrl ? (
              <PanZoom label="planta em imagem">
                <img src={plan.imageUrl} alt={`Planta demonstrativa de ${title}`} width={1600} height={1100} className="block h-auto w-full" draggable={false} />
              </PanZoom>
            ) : (
              <p className="p-6 text-[0.92rem] text-nevoa">Planta não disponibilizada. A lista ao lado mostra todos os lotes.</p>
            )}
          </div>
          {tab === '3d' && isSvg && (
            <p className="mt-2 text-[0.82rem] text-nevoa">
              Arraste para girar. Alturas e relevo são ilustrativos; clique num lote ou use a lista para ver os dados.
            </p>
          )}
          {!isSvg && plan?.kind === 'imagem' && (
            <p className="mt-2 text-[0.82rem] text-nevoa">
              A planta em imagem não tem lotes clicáveis. Use a lista para ver os dados de cada lote.
            </p>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-4" ref={panelRef}>
          <AnimatePresence initial={false} mode="popLayout">
            {selected ? (
              <LotPanel key={selected.id} lot={selected} title={title} code={code} url={url} onClose={() => setSelectedId(null)} />
            ) : (
              <motion.p
                key="vazio"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl border border-dashed border-input p-5 text-[0.92rem] text-nevoa"
              >
                {isSvg ? 'Selecione um lote na planta ou na lista para ver área, preço e situação.' : 'Selecione um lote na lista para ver os detalhes.'}
              </motion.p>
            )}
          </AnimatePresence>
          <LotList lots={lots} selectedId={selectedId} onSelect={select} onHover={setHoverId} />
        </div>
      </div>
    </MotionConfig>
  );
}
