import type { Terreno } from '@/types/listing';
import { demoPhoto } from '../media';
import { est } from '../common';

const U = '2026-09-05T08:45:00-03:00';

export const terrenoRibeiraoDasPedras: Terreno = {
  id: 'terreno-ribeirao-das-pedras',
  slug: 'terreno-ribeirao-das-pedras',
  code: 'TER-BRA-06',
  kind: 'terreno',
  zone: 'rural',
  title: 'Terreno à beira do Ribeirão das Pedras',
  municipio: 'Brazópolis',
  uf: 'MG',
  regiao: 'Sul de Minas',
  summary: 'Terreno rural de 2,1 hectares com frente para ribeirão, trilha na mata e acesso por estrada de terra de 6 km.',
  description:
    'Terreno de 2,1 ha com uma faixa de mata ao longo do Ribeirão das Pedras e uma área aberta de pasto. Há uma trilha antiga que desce até o ribeirão. A área de preservação ao longo do curso d’água deve ser respeitada em qualquer uso.',
  regionInfo:
    'Brazópolis fica entre Paraisópolis e Itajubá, com tradição em agricultura familiar e turismo rural. É uma cidade pequena, com serviços básicos.',
  highlights: ['Frente para ribeirão', 'Trilha na mata', '2,1 hectares'],
  interesses: ['lazer', 'chacara'],
  media: [demoPhoto('trilha-mata.jpg', 'foto'), demoPhoto('nascente.jpg', 'foto'), demoPhoto('neblina-serra.jpg', 'foto')],
  videos: [],
  location: {
    center: { lat: -22.49, lng: -45.6 },
    entrance: null,
    precision: 'exata',
    addressText: 'Estrada do Bairro Ribeirão das Pedras, km 6, zona rural de Brazópolis/MG (endereço demonstrativo)',
    references: ['Depois da escola rural, segunda porteira à direita'],
    distances: [est('Centro de Brazópolis', 10, 22), est('Itajubá', 32, 40), est('São Paulo', 232, 215)],
  },
  access: {
    highway: 'MG-295, entre Paraisópolis e Brazópolis',
    dirtRoadKm: 6,
    conditions: 'Estrada de terra com trechos estreitos; o proprietário recomenda evitar dias de chuva forte',
    arrivalPoint: 'Segunda porteira à direita depois da escola rural',
  },
  features: {
    water: 'Ribeirão na divisa do terreno',
    energy: 'Rede da concessionária a 400 m, segundo o proprietário',
    internet: null,
    relief: 'suave',
    fencing: 'Cerca de arame em três lados',
    accessType: 'terra',
    extra: {
      'Vegetação': 'Mata ciliar e pasto',
    },
  },
  infrastructure: {
    items: [
      { key: 'agua', label: 'Água', status: 'existente', note: 'Ribeirão na divisa' },
      { key: 'energia', label: 'Energia elétrica', status: 'nao_informada', note: 'Rede a 400 m; ligação no terreno não informada' },
    ],
  },
  priceCents: 41000000,
  areaM2: 21000,
  commercial: {
    priceCents: 41000000,
    downPaymentCents: null,
    installments: null,
    installmentCents: null,
    adjustments: null,
    charges: null,
    updatedAt: U,
  },
  documents: null,
  faq: [],
  related: ['terras-do-cafezal', 'sitio-pedra-branca'],
  featured: false,
  status: 'publicado',
  updatedAt: U,
  availability: 'Disponível na última atualização',
};
