import type { Empreendimento } from '@/types/listing';
import type { Lot, LotStatus } from '@/types/lot';
import { demoPhoto } from '../media';
import { est } from '../common';

const U = '2026-09-12T15:00:00-03:00';

const lot = (number: string, areaM2: number, priceReais: number | null, status: LotStatus, dimensions: string): Lot => ({
  id: `rc-${number}`,
  number,
  block: '1',
  areaM2,
  dimensions,
  priceCents: priceReais === null ? null : priceReais * 100,
  status,
  updatedAt: U,
  polygon: null,
});

export const residencialColinasDeExtrema: Empreendimento = {
  id: 'residencial-colinas-de-extrema',
  slug: 'residencial-colinas-de-extrema',
  code: 'URB-EXT-08',
  kind: 'empreendimento',
  zone: 'urbano',
  title: 'Residencial Colinas de Extrema',
  municipio: 'Extrema',
  uf: 'MG',
  regiao: 'Sul de Minas',
  summary: 'Pequeno loteamento urbano com 6 lotes de 250 a 420 m², em rua asfaltada, a 3 km do centro de Extrema.',
  description:
    'Loteamento urbano de uma única quadra, com 6 lotes voltados para uma rua asfaltada. Os lotes têm leve declive para os fundos. A planta do loteamento ainda não foi disponibilizada para o site.',
  regionInfo:
    'Extrema tem crescimento urbano acelerado por causa da proximidade com São Paulo e dos centros de distribuição instalados às margens da Fernão Dias.',
  highlights: ['Lotes de 250 a 420 m²', 'Rua asfaltada', '3 km do centro'],
  interesses: ['moradia'],
  media: [demoPhoto('cidade-aerea.jpg', 'aerea'), demoPhoto('bairro-residencial.jpg', 'foto'), demoPhoto('terreno-urbano.jpg', 'foto')],
  videos: [],
  location: {
    center: { lat: -22.86, lng: -46.33 },
    entrance: null,
    precision: 'exata',
    addressText: 'Rua Projetada 3, Residencial Colinas, Extrema/MG (endereço demonstrativo)',
    references: ['Acesso pela avenida principal, sentido bairro Ponte Nova'],
    distances: [est('Centro de Extrema', 3, 8), est('São Paulo', 108, 90)],
  },
  access: {
    highway: 'Rodovia Fernão Dias (BR-381), saída para o centro de Extrema',
    dirtRoadKm: 0,
    conditions: 'Rua asfaltada',
    arrivalPoint: 'Início da Rua Projetada 3',
  },
  features: {
    water: 'Rede pública de água',
    energy: 'Rede pública de energia',
    internet: null,
    relief: 'suave',
    fencing: null,
    accessType: 'asfalto',
    extra: {
      'Esgoto': 'Rede pública',
    },
  },
  infrastructure: {
    items: [
      { key: 'agua', label: 'Água', status: 'existente', note: 'Rede pública' },
      { key: 'energia', label: 'Energia elétrica', status: 'existente', note: 'Rede pública' },
      { key: 'esgoto', label: 'Esgoto', status: 'existente', note: 'Rede pública' },
      { key: 'iluminacao', label: 'Iluminação pública', status: 'prevista', note: 'Postes instalados, iluminação prevista' },
    ],
  },
  commercial: null,
  documents: {
    text: 'Informação demonstrativa: segundo o loteador, o loteamento tem aprovação municipal e registro em cartório. Confirme a matrícula de cada lote com o corretor.',
    updatedAt: U,
  },
  faq: [],
  related: ['terreno-jardim-das-palmeiras', 'chacara-vista-da-mantiqueira'],
  featured: false,
  status: 'publicado',
  updatedAt: U,
  availability: '3 lotes disponíveis na última atualização',
  lots: [
    lot('1', 250, 139000, 'disponivel', '10 × 25 m'),
    lot('2', 250, 139000, 'vendido', '10 × 25 m'),
    lot('3', 300, 158000, 'disponivel', '12 × 25 m'),
    lot('4', 320, 165000, 'reservado', '12,8 × 25 m'),
    lot('5', 420, 210000, 'disponivel', '14 × 30 m'),
    lot('6', 380, null, 'sob_consulta', '12,7 × 30 m'),
  ],
  plan: null,
};
