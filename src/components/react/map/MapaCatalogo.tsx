/**
 * Mapa do catálogo (ilha client:only). Lê os resultados filtrados da store
 * compartilhada e só baixa o Leaflet quando o visitante escolhe o modo mapa.
 */
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { catalogStore } from '@/lib/catalog-store';
import type { MapPoint } from '@/lib/map-points';
import { LazyMapShell, MapaLeaflet } from './LazyMap';

interface Props {
  points: MapPoint[];
}

export default function MapaCatalogo({ points }: Props) {
  const snap = useSyncExternalStore(catalogStore.subscribe, catalogStore.get, catalogStore.get);
  const [opened, setOpened] = useState(false);
  useEffect(() => {
    if (snap.view === 'mapa') setOpened(true);
  }, [snap.view]);

  const visible = useMemo(() => {
    const order = new Map(snap.ids.map((id, i) => [id, i]));
    return points.filter((p) => order.has(p.id)).sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
  }, [points, snap.ids]);

  if (!opened) return null;
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-areia-100">
      <LazyMapShell>
        <MapaLeaflet
          points={visible}
          activeId={snap.activeId}
          onActivate={(id) => catalogStore.set({ activeId: id })}
          height="30rem"
        />
      </LazyMapShell>
      <p className="border-t border-border bg-card px-4 py-2 text-[0.8rem] text-nevoa">
        {visible.length} {visible.length === 1 ? 'anúncio' : 'anúncios'} no mapa, os mesmos da lista. Pinos com localização
        aproximada indicam só a região.
      </p>
    </div>
  );
}
