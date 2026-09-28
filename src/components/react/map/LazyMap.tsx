/**
 * Carregamento sob demanda do mapa, com fronteira de erro. O bloco estático
 * de endereço e links fica fora desta ilha e continua visível em qualquer falha.
 */
import { Component, Suspense, lazy, type ReactNode } from 'react';

export const MapaLeaflet = lazy(() => import('./MapaLeaflet'));

export class MapErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) {
      return (
        <div className="grid h-full min-h-[18rem] place-items-center p-6 text-center">
          <div>
            <p className="font-[560] text-grafite">O mapa não carregou.</p>
            <p className="mt-1 text-[0.9rem] text-nevoa">Endereço, referências e links do Google Maps continuam disponíveis.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function MapFallback({ label = 'Carregando mapa…' }: { label?: string }) {
  return (
    <div className="grid h-full min-h-[18rem] place-items-center text-[0.92rem] text-nevoa" role="status">
      {label}
    </div>
  );
}

export function LazyMapShell({ children }: { children: ReactNode }) {
  return (
    <MapErrorBoundary>
      <Suspense fallback={<MapFallback />}>{children}</Suspense>
    </MapErrorBoundary>
  );
}
