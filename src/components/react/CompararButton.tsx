import { toast } from 'sonner';
import { COMPARE_LIMIT, addToCompare, removeFromCompare } from '@/lib/compare';
import { cn } from '@/lib/utils';
import { useCompare } from './hooks/useStored';

interface Props {
  id: string;
  title: string;
  /** Lote específico (empreendimento). null = conjunto. */
  lotId?: string | null;
  className?: string;
}

/** Adiciona à comparação (até 3). O 4º é recusado com aviso. */
export default function CompararButton({ id, title, lotId = null, className }: Props) {
  const { items, setItems } = useCompare();
  const on = items.some((i) => i.listingId === id);
  const onClick = () => {
    if (on) {
      setItems(removeFromCompare(items, id));
      toast('Removido da comparação');
      return;
    }
    const r = addToCompare(items, { listingId: id, lotId });
    if (!r.ok && r.reason === 'limite') {
      toast.warning(`A comparação aceita até ${COMPARE_LIMIT} opções`, {
        description: 'Remova uma das opções para incluir esta.',
        action: { label: 'Ver comparação', onClick: () => (window.location.href = '/comparar/') },
      });
      return;
    }
    setItems(r.items);
    toast.success(`${title} na comparação`, {
      description: `${r.items.length} de ${COMPARE_LIMIT} opções.`,
      action: { label: 'Comparar agora', onClick: () => (window.location.href = '/comparar/') },
    });
  };
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        'inline-flex min-h-10 items-center gap-2 rounded-[10px] px-3 text-[0.9rem] font-[560] transition-colors',
        on ? 'bg-folha-100 text-mata' : 'text-grafite/80 hover:bg-areia-100 hover:text-mata',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn('grid size-4 place-items-center rounded-[4px] border text-[0.7rem]', on ? 'border-mata bg-mata text-cal' : 'border-input')}
      >
        {on ? '✓' : ''}
      </span>
      Comparar
    </button>
  );
}
