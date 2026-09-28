/** Página de favoritos: lê o navegador depois da hidratação. */
import type { CardModel } from '@/lib/card';
import { toggleFavorite } from '@/lib/compare';
import { ListingCardView } from './ListingCardView';
import { useFavorites } from './hooks/useStored';
import FavoritoButton from './FavoritoButton';
import CompararButton from './CompararButton';

interface Props {
  cards: Record<string, CardModel>;
}

export default function FavoritosLista({ cards }: Props) {
  const { ids, setIds, loaded, persistent } = useFavorites();
  if (!loaded) return <p className="text-nevoa">Carregando favoritos…</p>;

  const available = ids.filter((id) => cards[id]);
  const missing = ids.filter((id) => !cards[id]);

  return (
    <div>
      {!persistent && (
        <p className="mb-6 rounded-xl border border-st-reservado/30 bg-st-reservado-bg px-4 py-3 text-[0.9rem] text-st-reservado">
          O armazenamento deste navegador está bloqueado. Os favoritos funcionam, mas só até você fechar a página.
        </p>
      )}
      {ids.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-input p-8 text-center">
          <p className="type-display text-2xl">Nenhum favorito ainda</p>
          <p className="mx-auto mt-2 max-w-[48ch] text-grafite/80">
            Toque no coração de um anúncio para guardá-lo aqui e comparar com calma depois.
          </p>
          <a href="/terrenos/" className="mt-5 inline-flex min-h-11 items-center rounded-[10px] bg-mata px-5 font-[600] text-cal hover:bg-mata-900">
            Ver o catálogo
          </a>
        </div>
      ) : (
        <>
          <ul className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {available.map((id) => (
              <li key={id}>
                <ListingCardView
                  card={cards[id]}
                  actions={<FavoritoButton id={id} title={cards[id].title} />}
                  footer={<CompararButton id={id} title={cards[id].title} />}
                />
              </li>
            ))}
          </ul>
          {missing.length > 0 && (
            <div className="mt-10 rounded-2xl border border-border bg-card p-5">
              <p className="font-[560]">
                {missing.length === 1 ? '1 favorito não está mais disponível' : `${missing.length} favoritos não estão mais disponíveis`}
              </p>
              <p className="mt-1 text-[0.9rem] text-nevoa">O anúncio foi removido do catálogo ou vendido.</p>
              <button
                type="button"
                onClick={() => setIds(missing.reduce((acc, id) => toggleFavorite(acc, id), ids))}
                className="mt-3 text-[0.9rem] font-[560] text-mata underline decoration-areia decoration-2 underline-offset-4"
              >
                Remover da lista
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
