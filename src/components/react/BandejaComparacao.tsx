/** Bandeja flutuante com as opções marcadas para comparar (até 3). */
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { COMPARE_LIMIT, removeFromCompare } from '@/lib/compare';
import { useCompare } from './hooks/useStored';

interface Props {
  titles: Record<string, string>;
}

export default function BandejaComparacao({ titles }: Props) {
  const { items, setItems } = useCompare();
  const onComparePage = typeof window !== 'undefined' && window.location.pathname.startsWith('/comparar');
  const show = items.length > 0 && !onComparePage;
  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {show && (
          <motion.aside
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 0.8, 0.24, 1] }}
            aria-label="Opções para comparar"
            className="on-dark fixed inset-x-3 z-40 mx-auto max-w-3xl rounded-2xl bg-mata p-3 text-cal shadow-[0_20px_50px_-20px_rgb(20_42_30/.7)] sm:inset-x-6"
            style={{ bottom: 'calc(var(--mobile-bar-h, 0px) + env(safe-area-inset-bottom, 0px) + 0.75rem)' }}
          >
            <div className="flex flex-wrap items-center gap-2">
              <p className="type-data px-1 text-[0.9rem] text-areia-100/85">
                {items.length}/{COMPARE_LIMIT}
              </p>
              <ul className="flex min-w-0 flex-1 flex-wrap gap-1.5">
                {items.map((i) => (
                  <li key={i.listingId} className="flex max-w-full items-center gap-1 rounded-lg bg-cal/12 py-1 pl-2.5 pr-1 text-[0.85rem]">
                    <span className="truncate">{titles[i.listingId] ?? 'Anúncio indisponível'}</span>
                    <button
                      type="button"
                      onClick={() => setItems(removeFromCompare(items, i.listingId))}
                      className="grid size-6 place-items-center rounded-md hover:bg-cal/15"
                      aria-label={`Remover ${titles[i.listingId] ?? 'item'} da comparação`}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
              <a href="/comparar/" className="rounded-[10px] bg-cal px-4 py-2 text-[0.9rem] font-[600] text-mata hover:bg-areia-100">
                Comparar
              </a>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
