/**
 * Fotos demonstrativas (Unsplash). Dimensões, crédito e texto alternativo vêm de
 * src/assets/demo/credits.json, gerado junto com o download das imagens.
 */
import type { Media, MediaType } from '@/types/media';
import credits from '@/assets/demo/credits.json';

interface Credit {
  file: string;
  width: number;
  height: number;
  photographer: string;
  photographerUrl: string;
  photoUrl: string;
  alt: string;
}

const list: Credit[] = credits;
const table = new Map<string, Credit>(list.map((c) => [c.file, c]));

export function creditOf(file: string): Credit {
  const c = table.get(file);
  if (!c) throw new Error(`Imagem demonstrativa sem crédito cadastrado: ${file}`);
  return c;
}

/** Foto ilustrativa com crédito e dimensões reais. */
export function demoPhoto(file: string, type: MediaType = 'foto', alt?: string): Media {
  const c = creditOf(file);
  return {
    type,
    url: file,
    alt: alt ?? c.alt,
    width: c.width,
    height: c.height,
    illustrative: true,
    credit: `Foto de ${c.photographer} no Unsplash`,
  };
}
