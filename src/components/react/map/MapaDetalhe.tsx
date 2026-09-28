/**
 * Mapa da página de detalhe (ilha client:only). O Leaflet só é baixado
 * quando o bloco entra na tela.
 */
import { useEffect, useRef, useState } from 'react';
import type { MapPoint } from '@/lib/map-points';
import { LazyMapShell, MapFallback, MapaLeaflet } from './LazyMap';

interface Props {
  points: MapPoint[];
  approximate: boolean;
}

export default function MapaDetalhe({ points, approximate }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: '200px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="h-full min-h-[20rem]">
      {visible ? (
        <LazyMapShell>
          <MapaLeaflet points={points} approximateRadius={approximate ? 1500 : undefined} height="100%" />
        </LazyMapShell>
      ) : (
        <MapFallback label="O mapa carrega quando esta seção aparece na tela." />
      )}
      <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-border bg-card px-4 py-2 text-[0.8rem] text-nevoa">
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-2.5 rounded-full bg-terra" aria-hidden="true" />
          Terreno
        </span>
        {points.some((p) => p.kind === 'entrada') && (
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-full bg-ipe" aria-hidden="true" />
            Ponto de entrada informado
          </span>
        )}
        {approximate && <span>Círculo tracejado: localização aproximada</span>}
      </div>
    </div>
  );
}
