/** Lado do build: gera imagens otimizadas para cards e Open Graph. */
import { getImage } from 'astro:assets';
import type { Listing } from '@/types/listing';
import type { Media } from '@/types/media';
import { resolveImage } from './images';
import type { CardImage } from './card';
import { absoluteUrl } from './seo';

export async function cardImage(media: Media | undefined, widths = [480, 720, 1080]): Promise<CardImage | null> {
  if (!media) return null;
  const meta = resolveImage(media.url);
  if (!meta) return null;
  const img = await getImage({ src: meta, widths, format: 'webp', quality: 72 });
  const ratio = meta.height / meta.width;
  const w = widths[widths.length - 1];
  return {
    src: img.src,
    srcSet: img.srcSet.attribute,
    width: w,
    height: Math.round(w * ratio),
    alt: media.alt,
    credit: media.credit,
    illustrative: media.illustrative,
  };
}

export async function listingCardImage(listing: Listing): Promise<CardImage | null> {
  return cardImage(listing.media[0]);
}

/** Imagem 1200 × 630 em JPG para compartilhamento (existe no HTML do build). */
export async function ogImageFor(media: Media | undefined): Promise<string | null> {
  if (!media) return null;
  const meta = resolveImage(media.url);
  if (!meta) return null;
  const img = await getImage({ src: meta, width: 1200, height: 630, fit: 'cover', format: 'jpg', quality: 78 });
  return absoluteUrl(img.src);
}
