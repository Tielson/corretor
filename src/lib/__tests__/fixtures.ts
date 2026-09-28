import type { Empreendimento, Terreno } from '@/types/listing';
import type { Lot } from '@/types/lot';

const base = {
  code: 'X-01',
  zone: 'rural' as const,
  municipio: 'Gonçalves',
  uf: 'MG',
  regiao: 'Serra da Mantiqueira',
  summary: 'Resumo',
  description: 'Descrição',
  regionInfo: null,
  highlights: [],
  interesses: ['lazer' as const],
  media: [],
  videos: [],
  location: {
    center: { lat: -22.6, lng: -45.8 },
    entrance: null,
    precision: 'exata' as const,
    addressText: null,
    references: [],
    distances: [{ label: 'São Paulo', km: 200, minutes: 180, source: 'teste', nature: 'estimativa' as const }],
  },
  access: { highway: null, dirtRoadKm: null, conditions: null, arrivalPoint: null },
  features: { water: null, energy: null, internet: null, relief: null, fencing: null, accessType: null, extra: {} },
  infrastructure: { items: [] },
  commercial: null,
  documents: null,
  faq: [],
  related: [],
  featured: false,
  status: 'publicado' as const,
  updatedAt: '2026-09-01T00:00:00Z',
  availability: null,
};

export function makeTerreno(over: Partial<Terreno> = {}): Terreno {
  return { ...base, id: 't1', slug: 't1', title: 'Terreno', kind: 'terreno', areaM2: 1000, priceCents: 10000000, ...over };
}

export function makeLot(over: Partial<Lot> = {}): Lot {
  return {
    id: 'l1',
    number: '1',
    block: 'A',
    areaM2: 1000,
    dimensions: null,
    priceCents: 10000000,
    status: 'disponivel',
    updatedAt: '2026-09-01T00:00:00Z',
    polygon: null,
    ...over,
  };
}

export function makeEmp(lots: Lot[], over: Partial<Empreendimento> = {}): Empreendimento {
  return { ...base, id: 'e1', slug: 'e1', title: 'Empreendimento', kind: 'empreendimento', lots, plan: null, ...over };
}
