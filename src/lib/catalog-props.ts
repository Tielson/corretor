/**
 * Props serializáveis da ilha do catálogo, montadas no build.
 * O anúncio vai "enxuto" (sem descrição longa, FAQ e mídia extra) para
 * reduzir o HTML, mas mantém o tipo Listing para reutilizar filters/sort.
 */
import type { Listing } from '@/types/listing';
import type { CardModel } from './card';
import { toCardModel } from './card';
import { listingCardImage } from './card-images';
import { infraOptions, localOptions } from './filters';

export function slimListing(l: Listing): Listing {
  return { ...l, description: '', regionInfo: null, faq: [], documents: null, videos: [], media: l.media.slice(0, 1) };
}

export interface CatalogOptions {
  locais: string[];
  infra: Array<{ key: string; label: string }>;
  relevos: Array<NonNullable<Listing['features']['relief']>>;
  acessos: Array<NonNullable<Listing['features']['accessType']>>;
  hasDistances: boolean;
}

export interface CatalogProps {
  listings: Listing[];
  cards: Record<string, CardModel>;
  options: CatalogOptions;
  referenceCity: string;
  /** Filtros fixos da página (ex.: /empreendimentos/ fixa tipo). */
  base: { tipo?: 'empreendimento' };
  path: string;
  siteUrl: string;
}

export async function buildCatalogProps(
  listings: readonly Listing[],
  opts: { referenceCity: string; base: CatalogProps['base']; path: string; siteUrl: string },
): Promise<CatalogProps> {
  const cards: Record<string, CardModel> = {};
  for (const l of listings) cards[l.id] = toCardModel(l, await listingCardImage(l));
  const relevos = [...new Set(listings.map((l) => l.features.relief).filter((r): r is NonNullable<typeof r> => r !== null))];
  const acessos = [
    ...new Set(listings.map((l) => l.features.accessType).filter((a): a is NonNullable<typeof a> => a !== null)),
  ];
  const ref = opts.referenceCity.toLowerCase();
  return {
    listings: listings.map(slimListing),
    cards,
    options: {
      locais: localOptions(listings),
      // Só oferece filtros de infraestrutura que existem em ao menos um anúncio.
      infra: infraOptions(listings).filter((o) =>
        listings.some((l) => l.infrastructure.items.some((i) => i.key === o.key && i.status === 'existente')),
      ),
      relevos,
      acessos,
      hasDistances: listings.some((l) => l.location.distances.some((d) => d.label.toLowerCase().includes(ref))),
    },
    referenceCity: opts.referenceCity,
    base: opts.base,
    path: opts.path,
    siteUrl: opts.siteUrl,
  };
}
