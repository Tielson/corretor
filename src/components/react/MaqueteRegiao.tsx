/**
 * Maquete da região. No build renderiza o pôster 2D (curvas de nível) e a
 * lista dos anúncios, que funcionam sem JavaScript e sem WebGL. No navegador,
 * decide se a cena 3D carrega sozinha (desktop) ou só após um toque
 * (celular, economia de dados, ?lite=1). A lista e os pinos compartilham o
 * mesmo destaque.
 */
import { Component, Suspense, lazy, useEffect, useRef, useState, type ReactNode } from 'react';
import type { ReliefPin } from '@/lib/relief-data';
import { readEnvironment, threeMode, type ThreeMode } from '@/lib/capabilities';
import { cn } from '@/lib/utils';
import { MaquetePoster } from './MaquetePoster';

const ReliefScene = lazy(() => import('./three/ReliefScene'));

interface Props {
  contours: Array<{ level: number; d: string }>;
  pins: ReliefPin[];
}

class SceneBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function MaqueteRegiao({ contours, pins }: Props) {
  const [mode, setMode] = useState<ThreeMode | null>(null);
  const [want3d, setWant3d] = useState(false);
  const [ready3d, setReady3d] = useState(false);
  const [failed, setFailed] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [running, setRunning] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const env = readEnvironment(window);
    const m = threeMode(env);
    setMode(m);
    setReduced(env.reducedMotion);
    if (m === 'auto') setWant3d(true);
  }, []);

  // Pausa a renderização quando a maquete sai da tela.
  useEffect(() => {
    const el = box.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => setRunning(entries.some((e) => e.isIntersecting)), {
      rootMargin: '100px',
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const show3d = want3d && !failed;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] lg:items-start">
      <div>
        <div
          ref={box}
          className="relative aspect-[3/2] overflow-hidden rounded-3xl border border-border bg-areia-100"
          data-lenis-prevent
        >
          <div className={cn('absolute inset-0 transition-opacity duration-700', show3d && ready3d ? 'opacity-0' : 'opacity-100')}>
            <MaquetePoster contours={contours} pins={pins} activeId={activeId} onHover={setActiveId} className="size-full" />
          </div>
          {show3d && (
            <div className={cn('absolute inset-0 transition-opacity duration-700', ready3d ? 'opacity-100' : 'opacity-0')}>
              <SceneBoundary onError={() => setFailed(true)}>
                <Suspense fallback={null}>
                  <ReliefScene
                    pins={pins}
                    activeId={activeId}
                    onActivate={setActiveId}
                    reducedMotion={reduced}
                    running={running}
                    onReady={() => setReady3d(true)}
                  />
                </Suspense>
              </SceneBoundary>
            </div>
          )}
          {show3d && !ready3d && (
            <p className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-md bg-cal/90 px-3 py-1 text-[0.82rem] text-nevoa" role="status">
              Montando a maquete…
            </p>
          )}
          <span className="pointer-events-none absolute left-3 top-3 rounded-md bg-cal/90 px-2 py-0.5 text-[0.75rem] text-grafite/85">
            Relevo ilustrativo, fora de escala
          </span>
          {mode === 'on-demand' && !want3d && (
            <button
              type="button"
              onClick={() => setWant3d(true)}
              className="absolute bottom-4 right-4 rounded-[10px] bg-mata px-4 py-2.5 text-[0.92rem] font-[600] text-cal shadow-lg hover:bg-mata-900"
            >
              Explorar em relevo 3D
            </button>
          )}
          {show3d && ready3d && (
            <button
              type="button"
              onClick={() => {
                setWant3d(false);
                setReady3d(false);
              }}
              className="absolute bottom-4 right-4 rounded-[10px] border border-border bg-cal/95 px-3 py-2 text-[0.85rem] font-[560] text-mata hover:bg-areia-100"
            >
              Ver mapa 2D
            </button>
          )}
        </div>
        <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[0.82rem] text-nevoa">
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-full bg-terra" aria-hidden="true" />
            Rural
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-full bg-mata" aria-hidden="true" />
            Urbano
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-3.5 rounded-full border-2 border-terra/40" aria-hidden="true" />
            Localização aproximada
          </span>
          {show3d && ready3d && <span>Arraste para girar a maquete.</span>}
          {failed && <span>A maquete 3D não carregou; o mapa 2D mostra as mesmas posições.</span>}
        </p>
      </div>

      <ol className="divide-y divide-border border-y border-border lg:mt-0">
        {pins.map((pin) => (
          <li key={pin.id}>
            <a
              href={pin.href}
              onMouseEnter={() => setActiveId(pin.id)}
              onMouseLeave={() => setActiveId(null)}
              onFocus={() => setActiveId(pin.id)}
              onBlur={() => setActiveId(null)}
              className={cn(
                'flex items-baseline justify-between gap-4 px-2 py-3 transition-colors hover:text-mata',
                activeId === pin.id && 'bg-areia-100',
              )}
            >
              <span className="min-w-0">
                <span className="flex items-center gap-2 font-[560]">
                  <span
                    aria-hidden="true"
                    className={cn('inline-block size-2 shrink-0 rounded-full', pin.zone === 'rural' ? 'bg-terra' : 'bg-mata')}
                  />
                  <span className="truncate">{pin.title}</span>
                </span>
                <span className="block pl-4 text-[0.85rem] text-nevoa">
                  {pin.place}
                  {pin.approximate && ', localização aproximada'}
                </span>
              </span>
              <span className="type-data shrink-0 text-right text-[0.9rem] text-grafite">{pin.price}</span>
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}
