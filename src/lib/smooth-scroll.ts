/**
 * Scroll suave (Lenis) apenas quando faz sentido: ponteiro fino (mouse/trackpad),
 * sem preferência por movimento reduzido e sem economia de dados.
 * Áreas com `data-lenis-prevent` (mapa, planta, maquete) mantêm o scroll nativo.
 */
import Lenis from 'lenis';

export function shouldSmoothScroll(win: Window): boolean {
  const fine = win.matchMedia('(pointer: fine)').matches;
  const reduced = win.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nav = win.navigator as Navigator & { connection?: { saveData?: boolean } };
  const saveData = nav.connection?.saveData === true;
  return fine && !reduced && !saveData;
}

export function startSmoothScroll(): Lenis | null {
  if (typeof window === 'undefined' || !shouldSmoothScroll(window)) return null;
  const lenis = new Lenis({
    duration: 1.05,
    smoothWheel: true,
    anchors: { offset: -80 },
    prevent: (node) => node.closest?.('[data-lenis-prevent]') !== null,
  });
  const raf = (time: number) => {
    lenis.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
  return lenis;
}
