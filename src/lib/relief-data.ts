/**
 * Dados da maquete da região calculados no build: curvas de nível (SVG) e
 * pinos dos anúncios. Serializáveis para a ilha React.
 */
import type { Listing } from '@/types/listing';
import { site } from '@/config/site';
import { contourSegments, generateHeightfield, projectToRelief, RELIEF } from './relief';
import { toCardModel } from './card';
import { formatCents, SOB_CONSULTA } from './money';

export const POSTER_W = 1200;
export const POSTER_H = 800;

export interface ReliefPin {
  id: string;
  title: string;
  href: string;
  place: string;
  zone: Listing['zone'];
  kind: Listing['kind'];
  /** Posição na maquete (unidades da cena). */
  x: number;
  z: number;
  /** Posição no pôster SVG. */
  px: number;
  py: number;
  price: string;
  area: string | null;
  approximate: boolean;
  /** Posição do rótulo no pôster, escolhida para não sobrepor outros rótulos. */
  label: { dx: number; dy: number; anchor: 'start' | 'middle' | 'end' };
}

const LABEL_FONT = 22;
const shortTitle = (t: string) => (t.length > 28 ? `${t.slice(0, 26)}…` : t);

type Box = { x0: number; y0: number; x1: number; y1: number };
const overlap = (a: Box, b: Box) => Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)) * Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0));

/** Escolhe, para cada pino, a posição de rótulo com menos sobreposição e dentro do quadro. */
export function placeLabels(points: Array<{ px: number; py: number; text: string }>): ReliefPin['label'][] {
  const placed: Box[] = points.map((p) => ({ x0: p.px - 14, y0: p.py - 14, x1: p.px + 14, y1: p.py + 14 }));
  return points.map((p) => {
    const w = p.text.length * LABEL_FONT * 0.52;
    const h = LABEL_FONT + 6;
    const candidates: Array<ReliefPin['label'] & { box: Box }> = [
      { dx: 0, dy: -24, anchor: 'middle', box: { x0: p.px - w / 2, y0: p.py - 24 - h, x1: p.px + w / 2, y1: p.py - 24 + 6 } },
      { dx: 0, dy: 40, anchor: 'middle', box: { x0: p.px - w / 2, y0: p.py + 40 - h + 6, x1: p.px + w / 2, y1: p.py + 46 } },
      { dx: 22, dy: 8, anchor: 'start', box: { x0: p.px + 22, y0: p.py + 8 - h + 6, x1: p.px + 22 + w, y1: p.py + 14 } },
      { dx: -22, dy: 8, anchor: 'end', box: { x0: p.px - 22 - w, y0: p.py + 8 - h + 6, x1: p.px - 22, y1: p.py + 14 } },
    ];
    let best = candidates[0];
    let bestScore = Infinity;
    for (const c of candidates) {
      const outside =
        Math.max(0, -c.box.x0) + Math.max(0, c.box.x1 - POSTER_W) + Math.max(0, -c.box.y0) + Math.max(0, c.box.y1 - POSTER_H);
      const score = placed.reduce((s, b) => s + overlap(c.box, b), 0) + outside * 400;
      if (score < bestScore) {
        bestScore = score;
        best = c;
      }
    }
    placed.push(best.box);
    return { dx: best.dx, dy: best.dy, anchor: best.anchor };
  });
}

export function reliefPins(listings: readonly Listing[]): ReliefPin[] {
  const base = listings.map((l) => {
    const { x, z } = projectToRelief(l.location.center, site.regiaoBounds, RELIEF.size);
    const card = toCardModel(l, null);
    const p = card.price;
    return {
      id: l.id,
      title: l.title,
      href: card.href,
      place: card.place,
      zone: l.zone,
      kind: l.kind,
      x,
      z,
      px: Math.round((x / RELIEF.size.width + 0.5) * POSTER_W),
      py: Math.round((z / RELIEF.size.depth + 0.5) * POSTER_H),
      price:
        p.cents === null ? SOB_CONSULTA : `${p.mode === 'a_partir_de' ? 'A partir de ' : ''}${formatCents(p.cents)}`,
      area: card.area,
      approximate: l.location.precision === 'aproximada',
    };
  });
  const labels = placeLabels(base.map((b) => ({ px: b.px, py: b.py, text: shortTitle(b.title) })));
  return base.map((b, i) => ({ ...b, label: labels[i] }));
}

export { shortTitle };

/** Curvas de nível em path SVG, uma por nível (mais altas = mais escuras). */
export function contourPaths(resolution = 64): Array<{ level: number; d: string }> {
  const raw = generateHeightfield({ resolution, seed: RELIEF.seed, steps: 1 });
  const levels = RELIEF.steps;
  const out: Array<{ level: number; d: string }> = [];
  for (let k = 1; k < levels; k++) {
    const level = k / levels;
    const segs = contourSegments(raw, resolution, level);
    const d = segs
      .map(
        ([x1, y1, x2, y2]) =>
          `M${(x1 * POSTER_W).toFixed(1)} ${(y1 * POSTER_H).toFixed(1)}L${(x2 * POSTER_W).toFixed(1)} ${(y2 * POSTER_H).toFixed(1)}`,
      )
      .join('');
    out.push({ level: k, d });
  }
  return out;
}
