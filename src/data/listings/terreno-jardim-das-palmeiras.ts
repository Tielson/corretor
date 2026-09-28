import type { Terreno } from '@/types/listing';
import { demoPhoto } from '../media';
import { est } from '../common';

const U = '2026-09-15T10:10:00-03:00';

export const terrenoJardimDasPalmeiras: Terreno = {
  id: 'terreno-jardim-das-palmeiras',
  slug: 'terreno-jardim-das-palmeiras',
  code: 'URB-POU-07',
  kind: 'terreno',
  zone: 'urbano',
  title: 'Terreno plano no Jardim das Palmeiras',
  municipio: 'Pouso Alegre',
  uf: 'MG',
  regiao: 'Sul de Minas',
  summary: 'Lote urbano plano de 360 m² (12 × 30 m) em bairro residencial, com rua asfaltada e redes de água, esgoto e energia.',
  description:
    'Terreno urbano em rua asfaltada de bairro residencial, com 12 m de frente e 30 m de fundo. O lote é plano e está limpo. Padaria, escola e ponto de ônibus ficam a poucas quadras, segundo o proprietário.',
  regionInfo:
    'Pouso Alegre é o principal polo de serviços do Sul de Minas, com hospitais, universidades e comércio completo, às margens da Fernão Dias.',
  highlights: ['Plano, 12 × 30 m', 'Rua asfaltada', 'Água, esgoto e energia'],
  interesses: ['moradia'],
  media: [demoPhoto('terreno-urbano.jpg', 'foto'), demoPhoto('bairro-residencial.jpg', 'foto')],
  videos: [],
  location: {
    center: { lat: -22.245, lng: -45.92 },
    entrance: null,
    precision: 'exata',
    addressText: 'Rua das Palmeiras, 240, Jardim das Palmeiras, Pouso Alegre/MG (endereço demonstrativo)',
    references: ['Esquina com a Rua dos Ipês', 'Duas quadras da escola municipal'],
    distances: [est('Centro de Pouso Alegre', 4, 10), est('São Paulo', 200, 165)],
  },
  access: {
    highway: 'Rodovia Fernão Dias (BR-381), saída para o centro de Pouso Alegre',
    dirtRoadKm: 0,
    conditions: 'Rua asfaltada',
    arrivalPoint: 'Frente do lote na Rua das Palmeiras, 240',
  },
  features: {
    water: 'Rede pública de água',
    energy: 'Rede pública de energia',
    internet: 'Fibra óptica disponível na rua',
    relief: 'plano',
    fencing: 'Muro nos fundos; frente aberta',
    accessType: 'asfalto',
    extra: {
      'Esgoto': 'Rede pública',
      'Frente × fundo': '12 × 30 m',
    },
  },
  infrastructure: {
    items: [
      { key: 'agua', label: 'Água', status: 'existente', note: 'Rede pública' },
      { key: 'energia', label: 'Energia elétrica', status: 'existente', note: 'Rede pública' },
      { key: 'esgoto', label: 'Esgoto', status: 'existente', note: 'Rede pública' },
      { key: 'internet', label: 'Internet cabeada', status: 'existente', note: 'Fibra na rua' },
    ],
  },
  priceCents: 18500000,
  areaM2: 360,
  commercial: {
    priceCents: 18500000,
    downPaymentCents: 5550000,
    installments: 60,
    installmentCents: 215833,
    adjustments: 'Parcelas corrigidas anualmente pelo IPCA, segundo o proprietário',
    charges: 'IPTU de 2026 quitado, segundo o proprietário',
    updatedAt: U,
  },
  documents: {
    text: 'Informação demonstrativa: segundo o proprietário, o lote tem escritura e matrícula própria, sem ônus. Peça as certidões atualizadas ao corretor.',
    updatedAt: U,
  },
  faq: [
    {
      id: 'jp-medidas',
      question: 'Quais são as medidas do lote?',
      answer: 'São 12 m de frente por 30 m de fundo, totalizando 360 m², conforme informado pelo proprietário.',
      topic: 'medidas',
      anchor: 'resumo',
      keywords: ['medidas', 'frente', 'fundo', 'tamanho'],
    },
  ],
  related: ['residencial-colinas-de-extrema'],
  featured: false,
  status: 'publicado',
  updatedAt: U,
  availability: 'Disponível na última atualização',
};
