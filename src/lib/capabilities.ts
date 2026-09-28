/**
 * Decide se o 3D pode carregar sozinho ou deve esperar um toque.
 * Função pura sobre um "ambiente" para ser testável; `readEnvironment` lê o navegador.
 */

export interface Environment {
  webgl: boolean;
  reducedMotion: boolean;
  saveData: boolean;
  /** effectiveType da Network Information API, quando existir. */
  effectiveType: string | null;
  finePointer: boolean;
  viewportWidth: number;
  /** ?lite=1 força o modo leve (útil para testes). */
  forceLite: boolean;
}

export type ThreeMode = 'auto' | 'on-demand' | 'off';

export function threeMode(env: Environment): ThreeMode {
  if (!env.webgl) return 'off';
  const slow = env.saveData || env.effectiveType === 'slow-2g' || env.effectiveType === '2g' || env.effectiveType === '3g';
  if (env.forceLite || slow) return 'on-demand';
  // Celular: só carrega após o toque, para não pesar na primeira visita.
  if (!env.finePointer || env.viewportWidth < 768) return 'on-demand';
  return 'auto';
}

export function hasWebGL(doc: Document): boolean {
  try {
    const canvas = doc.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

export function readEnvironment(win: Window): Environment {
  const nav = win.navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } };
  const params = new URLSearchParams(win.location.search);
  return {
    webgl: hasWebGL(win.document),
    reducedMotion: win.matchMedia('(prefers-reduced-motion: reduce)').matches,
    saveData: nav.connection?.saveData === true,
    effectiveType: nav.connection?.effectiveType ?? null,
    finePointer: win.matchMedia('(pointer: fine)').matches,
    viewportWidth: win.innerWidth,
    forceLite: params.get('lite') === '1',
  };
}
