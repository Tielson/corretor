import { site as defaultSite, type SiteConfig } from '@/config/site';

export interface SeoInput {
  /** Título da página, sem a marca. */
  title: string;
  description: string;
  /** Caminho absoluto a partir da raiz, ex.: /terrenos/sitio-x/ */
  path: string;
  /** URL absoluta ou caminho de imagem para Open Graph. */
  image?: string | null;
  imageAlt?: string | null;
  type?: 'website' | 'article';
}

export interface SeoMeta {
  title: string;
  description: string;
  canonical: string;
  robots: string;
  ogType: 'website' | 'article';
  ogImage: string;
  ogImageAlt: string;
  twitterCard: 'summary_large_image';
  siteName: string;
  locale: 'pt_BR';
}

export const OG_FALLBACK = '/og-fallback.jpg';
const MAX_DESCRIPTION = 160;

export function truncateDescription(text: string, max = MAX_DESCRIPTION): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:]+$/, '')}…`;
}

export function absoluteUrl(pathOrUrl: string, cfg: SiteConfig = defaultSite): string {
  return new URL(pathOrUrl, cfg.siteUrl).href;
}

export function buildSeo(input: SeoInput, cfg: SiteConfig = defaultSite): SeoMeta {
  const brand = cfg.brand;
  const title = input.title === brand ? brand : `${input.title} | ${brand}`;
  return {
    title,
    description: truncateDescription(input.description),
    canonical: absoluteUrl(input.path, cfg),
    robots: cfg.indexable ? 'index, follow' : 'noindex',
    ogType: input.type ?? 'website',
    ogImage: absoluteUrl(input.image ?? OG_FALLBACK, cfg),
    ogImageAlt: input.imageAlt ?? `Paisagem rural ilustrativa de ${brand}`,
    twitterCard: 'summary_large_image',
    siteName: brand,
    locale: 'pt_BR',
  };
}
