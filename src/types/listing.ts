import type { CommercialTerms, DocumentInfo } from './commercial';
import type { Faq } from './faq';
import type { Infrastructure } from './infrastructure';
import type { Access, Location } from './location';
import type { Lot, Plan } from './lot';
import type { Media, Video } from './media';

export type Zone = 'rural' | 'urbano';
export type ListingKind = 'terreno' | 'empreendimento';
export type Interesse = 'lazer' | 'chacara' | 'moradia' | 'uso_rural';
export type Relief = 'plano' | 'suave' | 'acidentado';
export type AccessType = 'asfalto' | 'terra' | 'misto';

export interface Features {
  water: string | null;
  energy: string | null;
  internet: string | null;
  relief: Relief | null;
  fencing: string | null;
  accessType: AccessType | null;
  extra: Record<string, string | null>;
}

export interface ListingBase {
  id: string;
  slug: string;
  code: string;
  kind: ListingKind;
  zone: Zone;
  title: string;
  municipio: string;
  uf: string;
  regiao: string | null;
  summary: string;
  description: string;
  regionInfo: string | null;
  /** Até 3 exibidos no card. */
  highlights: string[];
  /** Preferências de busca, não garantia de adequação. */
  interesses: Interesse[];
  media: Media[];
  videos: Video[];
  location: Location;
  access: Access;
  features: Features;
  infrastructure: Infrastructure;
  commercial: CommercialTerms | null;
  documents: DocumentInfo | null;
  faq: Faq[];
  /** ids relacionados */
  related: string[];
  featured: boolean;
  status: 'publicado' | 'rascunho';
  updatedAt: string;
  /** Disponibilidade informada (texto editorial). */
  availability: string | null;
}

export interface Terreno extends ListingBase {
  kind: 'terreno';
  areaM2: number;
  priceCents: number | null;
}

export interface Empreendimento extends ListingBase {
  kind: 'empreendimento';
  lots: Lot[];
  plan: Plan | null;
}

export type Listing = Terreno | Empreendimento;

export const isEmpreendimento = (l: Listing): l is Empreendimento => l.kind === 'empreendimento';
export const isTerreno = (l: Listing): l is Terreno => l.kind === 'terreno';
