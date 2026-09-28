/**
 * Relevo ilustrativo da maquete 3D (sem DOM, sem three.js).
 * O relevo é procedural e fora de escala; só a posição relativa dos pinos
 * vem das coordenadas cadastradas.
 */
import type { LatLng } from '@/types/location';

export interface GeoBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface ReliefSize {
  width: number;
  depth: number;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/**
 * Lat/lng -> coordenadas da maquete. x cresce para leste; z cresce para o sul
 * (o norte fica ao fundo da cena, longe da câmera).
 */
export function projectToRelief(point: LatLng, bounds: GeoBounds, size: ReliefSize): { x: number; z: number } {
  const u = clamp((point.lng - bounds.west) / (bounds.east - bounds.west), 0, 1);
  const v = clamp((bounds.north - point.lat) / (bounds.north - bounds.south), 0, 1);
  return { x: (u - 0.5) * size.width, z: (v - 0.5) * size.depth };
}

/** PRNG determinístico (mulberry32). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeLattice(seed: number, size: number): Float32Array {
  const rnd = mulberry32(seed);
  const lattice = new Float32Array(size * size);
  for (let i = 0; i < lattice.length; i++) lattice[i] = rnd();
  return lattice;
}

const smooth = (t: number) => t * t * (3 - 2 * t);

function valueNoise(lattice: Float32Array, size: number, x: number, y: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = smooth(x - xi);
  const yf = smooth(y - yi);
  const idx = (ix: number, iy: number) => lattice[((iy % size) + size) % size * size + (((ix % size) + size) % size)];
  const a = idx(xi, yi);
  const b = idx(xi + 1, yi);
  const c = idx(xi, yi + 1);
  const d = idx(xi + 1, yi + 1);
  return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
}

export interface HeightfieldOptions {
  resolution: number;
  seed: number;
  octaves?: number;
  /** Número de degraus (placas) da maquete. */
  steps?: number;
}

/**
 * Gera alturas normalizadas [0, 1] numa grade resolution × resolution,
 * com uma crista diagonal (sugestão de serra) e degraus de maquete.
 */
export function generateHeightfield({ resolution, seed, octaves = 5, steps = 9 }: HeightfieldOptions): Float32Array {
  const size = 64;
  const lattice = makeLattice(seed, size);
  const out = new Float32Array(resolution * resolution);
  let min = Infinity;
  let max = -Infinity;
  for (let j = 0; j < resolution; j++) {
    for (let i = 0; i < resolution; i++) {
      const u = i / (resolution - 1);
      const v = j / (resolution - 1);
      let amp = 1;
      let freq = 3;
      let h = 0;
      let norm = 0;
      for (let o = 0; o < octaves; o++) {
        h += amp * valueNoise(lattice, size, u * freq, v * freq);
        norm += amp;
        amp *= 0.5;
        freq *= 2.03;
      }
      h /= norm;
      // Crista da serra correndo de sudoeste a nordeste.
      const ridge = 1 - Math.abs(u * 0.9 - v * 0.75 - 0.1) * 1.6;
      h = h * 0.65 + clamp(ridge, 0, 1) * 0.55;
      // Bordas mais baixas, como uma peça de maquete recortada.
      const edge = Math.min(u, 1 - u, v, 1 - v);
      h *= smooth(clamp(edge * 5, 0, 1)) * 0.35 + 0.65;
      out[j * resolution + i] = h;
      if (h < min) min = h;
      if (h > max) max = h;
    }
  }
  const range = max - min || 1;
  for (let k = 0; k < out.length; k++) out[k] = quantize((out[k] - min) / range, steps);
  return out;
}

/** Arredonda para o degrau inferior (efeito de placas empilhadas). */
export function quantize(h: number, steps: number): number {
  if (steps <= 1) return clamp(h, 0, 1);
  return Math.floor(clamp(h, 0, 0.99999) * steps) / (steps - 1);
}

/** Altura interpolada numa posição (x, z) da maquete. */
export function sampleHeight(field: Float32Array, resolution: number, size: ReliefSize, x: number, z: number): number {
  const u = clamp(x / size.width + 0.5, 0, 1) * (resolution - 1);
  const v = clamp(z / size.depth + 0.5, 0, 1) * (resolution - 1);
  const i = Math.round(u);
  const j = Math.round(v);
  return field[j * resolution + i];
}

/** Segmento de curva de nível em coordenadas normalizadas [0, 1]. */
export type Segment = [number, number, number, number];

/**
 * Curvas de nível por marching squares sobre um campo contínuo (não quantizado).
 * Retorna segmentos soltos; bom o bastante para desenhar em SVG.
 */
export function contourSegments(field: Float32Array, resolution: number, level: number): Segment[] {
  const out: Segment[] = [];
  const n = resolution - 1;
  const at = (i: number, j: number) => field[j * resolution + i];
  const lerp = (a: number, b: number) => (level - a) / (b - a || 1e-9);
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const a = at(i, j);
      const b = at(i + 1, j);
      const c = at(i + 1, j + 1);
      const d = at(i, j + 1);
      const idx = (a >= level ? 8 : 0) | (b >= level ? 4 : 0) | (c >= level ? 2 : 0) | (d >= level ? 1 : 0);
      if (idx === 0 || idx === 15) continue;
      const top: [number, number] = [(i + lerp(a, b)) / n, j / n];
      const right: [number, number] = [(i + 1) / n, (j + lerp(b, c)) / n];
      const bottom: [number, number] = [(i + lerp(d, c)) / n, (j + 1) / n];
      const left: [number, number] = [i / n, (j + lerp(a, d)) / n];
      const seg = (p: [number, number], q: [number, number]) => out.push([p[0], p[1], q[0], q[1]]);
      switch (idx) {
        case 1: case 14: seg(left, bottom); break;
        case 2: case 13: seg(bottom, right); break;
        case 3: case 12: seg(left, right); break;
        case 4: case 11: seg(top, right); break;
        case 5: seg(left, top); seg(bottom, right); break;
        case 6: case 9: seg(top, bottom); break;
        case 7: case 8: seg(left, top); break;
        case 10: seg(left, bottom); seg(top, right); break;
      }
    }
  }
  return out;
}

/** Parâmetros compartilhados entre a maquete 3D e o mapa estático de curvas. */
export const RELIEF = {
  seed: 1947,
  steps: 9,
  size: { width: 12, depth: 8 } as ReliefSize,
} as const;
