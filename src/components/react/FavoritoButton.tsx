import { toast } from 'sonner';
import { toggleFavorite } from '@/lib/compare';
import { cn } from '@/lib/utils';
import { useFavorites } from './hooks/useStored';

interface Props {
  id: string;
  title: string;
  variant?: 'overlay' | 'inline';
}

/** Favoritar sem cadastro (fica salvo neste navegador). */
export default function FavoritoButton({ id, title, variant = 'overlay' }: Props) {
  const { ids, setIds, persistent } = useFavorites();
  const on = ids.includes(id);
  const onClick = () => {
    setIds(toggleFavorite(ids, id));
    toast(on ? 'Removido dos favoritos' : 'Salvo nos favoritos', {
      description: persistent
        ? on
          ? undefined
          : 'Os favoritos ficam salvos neste navegador.'
        : 'O armazenamento do navegador está bloqueado: os favoritos valem só até fechar a página.',
      action: on ? undefined : { label: 'Ver favoritos', onClick: () => (window.location.href = '/favoritos/') },
    });
  };
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      aria-label={on ? `Remover ${title} dos favoritos` : `Salvar ${title} nos favoritos`}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 transition-colors',
        variant === 'overlay'
          ? 'size-10 rounded-full bg-cal/92 text-mata shadow-sm backdrop-blur-sm hover:bg-cal'
          : 'min-h-10 rounded-[10px] border border-input px-3 text-[0.9rem] font-[560] text-mata hover:bg-areia-100',
      )}
    >
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
        <path
          d="M12 20.5s-7.5-4.4-7.5-10.2A4.3 4.3 0 0 1 12 7.7a4.3 4.3 0 0 1 7.5 2.6c0 5.8-7.5 10.2-7.5 10.2z"
          fill={on ? '#7b3a24' : 'none'}
          stroke={on ? '#7b3a24' : 'currentColor'}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
      {variant === 'inline' && (on ? 'Nos favoritos' : 'Favoritar')}
    </button>
  );
}
