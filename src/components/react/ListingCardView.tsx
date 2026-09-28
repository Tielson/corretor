import type { ReactNode } from 'react';
import type { CardModel } from '@/lib/card';
import { formatCents, SOB_CONSULTA } from '@/lib/money';
import { cn } from '@/lib/utils';
import { LotBar } from './LotBar';

interface Props {
  card: CardModel;
  /** Ações sobre a imagem (favoritar). */
  actions?: ReactNode;
  /** Ações no rodapé (comparar). */
  footer?: ReactNode;
  size?: 'default' | 'wide' | 'compact';
  /** Primeira dobra: carrega a imagem cedo. */
  eager?: boolean;
  /** Destaque da busca (ex.: "3 lotes nesta faixa"). */
  note?: string | null;
}

export function PriceBlock({ card, large = false }: { card: CardModel; large?: boolean }) {
  const p = card.price;
  return (
    <div>
      <p className="text-[0.8rem] text-nevoa">
        {p.mode === 'total' ? 'Preço total' : p.mode === 'a_partir_de' ? 'Lotes a partir de' : 'Preço'}
      </p>
      <p
        className={cn(
          'type-data font-[620] text-mata',
          large ? 'text-[1.75rem] leading-tight' : 'text-[1.4rem] leading-tight',
          p.mode === 'sob_consulta' && 'text-[1.1rem] font-[560]',
        )}
      >
        {p.cents === null ? SOB_CONSULTA : formatCents(p.cents)}
      </p>
      {card.terms && (
        <p className="mt-1 text-[0.8rem] text-nevoa">
          {[card.terms.downPayment, card.terms.installments].filter(Boolean).join(' e ')}
        </p>
      )}
    </div>
  );
}

export function ListingCardView({ card, actions, footer, size = 'default', eager = false, note }: Props) {
  const wide = size === 'wide';
  const compact = size === 'compact';
  return (
    <article
      className={cn(
        'group relative flex gap-4',
        wide ? 'flex-col md:grid md:grid-cols-[1.35fr_1fr] md:gap-8' : compact ? 'flex-col sm:flex-row' : 'flex-col',
      )}
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl bg-areia-100',
          wide ? 'aspect-[4/3] md:aspect-auto md:min-h-[22rem]' : compact ? 'aspect-[4/3] sm:w-56 sm:shrink-0' : 'aspect-[4/3]',
        )}
        style={{ viewTransitionName: `foto-${card.id}` }}
      >
        {card.image ? (
          <img
            src={card.image.src}
            srcSet={card.image.srcSet}
            sizes={wide ? '(min-width: 768px) 60vw, 100vw' : '(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw'}
            width={card.image.width}
            height={card.image.height}
            alt={card.image.alt}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-[var(--ease-terra)] group-hover:scale-[1.025]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-nevoa">
            Imagem indisponível
          </div>
        )}
        {card.image?.illustrative && (
          <span className="absolute bottom-2.5 left-2.5 rounded-md bg-grafite/70 px-2 py-0.5 text-[0.72rem] text-cal backdrop-blur-sm">
            Imagem ilustrativa
          </span>
        )}
        {actions && <div className="absolute right-2.5 top-2.5 z-10">{actions}</div>}
      </div>

      <div className={cn('flex min-w-0 flex-1 flex-col', wide && 'md:py-2')}>
        <p className="text-[0.85rem] text-folha">
          {card.category} em {card.place}
        </p>
        <h3 className={cn('mt-1', wide ? 'text-2xl sm:text-3xl' : 'text-xl')}>
          <a
            href={card.href}
            className="rounded-sm after:absolute after:inset-0 after:content-[''] focus-visible:outline-offset-4"
          >
            {card.title}
          </a>
        </h3>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <PriceBlock card={card} large={wide} />
          {card.area && (
            <div className={cn(!compact && "sm:text-right")}>
              <p className="text-[0.8rem] text-nevoa">{card.kind === 'empreendimento' ? 'Lotes disponíveis' : 'Área'}</p>
              <p className="type-data text-lg font-[560] text-grafite">{card.area}</p>
            </div>
          )}
        </div>

        {note && <p className="mt-3 rounded-lg bg-folha-100 px-3 py-1.5 text-[0.85rem] text-mata">{note}</p>}

        {card.lots && <LotBar summary={card.lots} className="mt-4" />}

        {!compact && card.highlights.length > 0 && (
          <ul className="mt-4 flex flex-col gap-1 text-[0.92rem] text-grafite/85">
            {card.highlights.map((h) => (
              <li key={h} className="flex items-baseline gap-2">
                <span className="relative top-[-0.1em] inline-block h-px w-3 shrink-0 bg-terra" aria-hidden="true" />
                {h}
              </li>
            ))}
          </ul>
        )}

        <div className="relative z-10 mt-auto flex items-center justify-between gap-3 pt-5">
          <a
            href={card.href}
            className="inline-flex h-10 items-center rounded-[10px] border border-input px-4 text-[0.92rem] font-[560] text-mata transition-colors hover:border-mata hover:bg-areia-100"
          >
            Ver detalhes
          </a>
          {footer}
        </div>
      </div>
    </article>
  );
}
