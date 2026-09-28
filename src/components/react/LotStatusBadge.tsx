import type { LotStatus } from '@/types/lot';
import { LOT_STATUS_LABEL } from '@/lib/lots';
import { cn } from '@/lib/utils';

const STYLE: Record<LotStatus, string> = {
  disponivel: 'bg-st-disponivel-bg text-st-disponivel border-st-disponivel/30',
  reservado: 'bg-st-reservado-bg text-st-reservado border-st-reservado/30',
  vendido: 'bg-st-vendido-bg text-st-vendido border-st-vendido/30 line-through decoration-1',
  sob_consulta: 'bg-st-consulta-bg text-st-consulta border-st-consulta/30',
};

const ICON: Record<LotStatus, string> = {
  disponivel: '●',
  reservado: '◐',
  vendido: '○',
  sob_consulta: '?',
};

/** Situação do lote com cor, símbolo e texto. */
export function LotStatusBadge({ status, className }: { status: LotStatus; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[0.8rem] font-[560] whitespace-nowrap',
        STYLE[status],
        className,
      )}
    >
      <span aria-hidden="true" className="no-underline">
        {ICON[status]}
      </span>
      {LOT_STATUS_LABEL[status]}
    </span>
  );
}
