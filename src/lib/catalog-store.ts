/**
 * Estado compartilhado entre ilhas do catálogo (lista e mapa) na mesma página.
 * As ilhas são raízes React separadas; este módulo é o ponto de contato.
 */
import type { ViewMode } from './url-state';

export interface CatalogSnapshot {
  /** ids dos anúncios nos resultados atuais, na ordem exibida. */
  ids: string[];
  view: ViewMode;
  /** Anúncio em destaque (hover/foco no card ou no marcador). */
  activeId: string | null;
}

type Listener = () => void;

export function createCatalogStore(initial: CatalogSnapshot) {
  let snap = initial;
  const listeners = new Set<Listener>();
  return {
    get: () => snap,
    set(patch: Partial<CatalogSnapshot>) {
      const next = { ...snap, ...patch };
      if (
        next.view === snap.view &&
        next.activeId === snap.activeId &&
        next.ids.length === snap.ids.length &&
        next.ids.every((id, i) => id === snap.ids[i])
      ) {
        return;
      }
      snap = next;
      listeners.forEach((l) => l());
    },
    subscribe(l: Listener) {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
  };
}

export const catalogStore = createCatalogStore({ ids: [], view: 'cards', activeId: null });
