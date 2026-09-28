import type { LotSummary } from '@/lib/lots';
import { LOT_STATUS_LABEL, LOT_STATUSES } from '@/lib/lots';
import { cn } from '@/lib/utils';

const SEGMENT: Record<(typeof LOT_STATUSES)[number], string> = {
  disponivel: 'bg-st-disponivel',
  reservado: 'bg-ipe',
  vendido: 'bg-st-vendido/45',
  sob_consulta: 'bg-st-consulta/70',
};

interface Props {
  summary: LotSummary;
  /** Mostra a legenda completa com os quatro status. */
  detailed?: boolean;
  className?: string;
}

/** Barra de disponibilidade dos lotes: cor + texto, nunca só cor. */
export function LotBar({ summary, detailed = false, className }: Props) {
  if (summary.total === 0) return null;
  const available = summary.disponivel;
  const label =
    available === 0
      ? `Nenhum lote disponível de ${summary.total}`
      : `${available} ${available === 1 ? 'lote disponível' : 'lotes disponíveis'} de ${summary.total}`;
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex h-1.5 w-full gap-0.5 overflow-hidden rounded-full" aria-hidden="true">
        {LOT_STATUSES.filter((s) => summary[s] > 0).map((s) => (
          <span key={s} className={SEGMENT[s]} style={{ flexGrow: summary[s], flexBasis: 0 }} />
        ))}
      </div>
      <p className="type-data text-[0.85rem] text-grafite/85">{label}</p>
      {detailed && (
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[0.8rem] text-nevoa">
          {LOT_STATUSES.map((s) => (
            <li key={s} className="flex items-center gap-1.5">
              <span className={cn('inline-block size-2.5 rounded-[3px]', SEGMENT[s])} aria-hidden="true" />
              {LOT_STATUS_LABEL[s]}: <span className="type-data">{summary[s]}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
