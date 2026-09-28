/**
 * Resolve Media.url para imagens otimizáveis pelo astro:assets.
 * Fotos demonstrativas ficam em src/assets/demo/; o dado guarda só o nome do arquivo.
 */
import type { ImageMetadata } from 'astro';

const modules = import.meta.glob<{ default: ImageMetadata }>('/src/assets/demo/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
});

const byName = new Map<string, ImageMetadata>();
for (const [path, mod] of Object.entries(modules)) {
  byName.set(path.split('/').pop() as string, mod.default);
}

/** null quando a imagem não existe (a UI mostra "mídia indisponível"). */
export function resolveImage(url: string): ImageMetadata | null {
  const name = url.split('/').pop() ?? url;
  return byName.get(name) ?? null;
}

export function hasImage(url: string): boolean {
  return resolveImage(url) !== null;
}
