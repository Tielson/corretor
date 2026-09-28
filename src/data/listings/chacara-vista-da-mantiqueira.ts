import type { Terreno } from '@/types/listing';
import { demoPhoto } from '../media';
import { est } from '../common';

const U = '2026-09-22T16:20:00-03:00';

export const chacaraVistaDaMantiqueira: Terreno = {
  id: 'chacara-vista-da-mantiqueira',
  slug: 'chacara-vista-da-mantiqueira',
  code: 'TER-EXT-05',
  kind: 'terreno',
  zone: 'rural',
  title: 'Chácara Vista da Mantiqueira',
  municipio: 'Extrema',
  uf: 'MG',
  regiao: 'Sul de Minas',
  summary: 'Terreno de 5.200 m² com lago e vista aberta para a serra, a 1,5 km do asfalto e 110 km de São Paulo.',
  description:
    'Chácara em terreno avulso de 5.200 m², com um pequeno lago na parte baixa e gramado na parte alta. O acesso tem 1,5 km de estrada de terra a partir da rodovia. É uma das opções rurais mais próximas da capital paulista no catálogo.',
  regionInfo:
    'Extrema é o primeiro município mineiro pela Fernão Dias, a cerca de 110 km de São Paulo. Tem comércio e serviços completos, além de áreas rurais com relevo de serra.',
  highlights: ['Lago no terreno', '1,5 km do asfalto', '110 km de São Paulo'],
  interesses: ['lazer', 'chacara', 'moradia'],
  media: [demoPhoto('lago-sitio.jpg', 'foto'), demoPhoto('por-do-sol-serra.jpg', 'foto'), demoPhoto('hero-serra.jpg', 'foto')],
  videos: [],
  location: {
    center: { lat: -22.833, lng: -46.293 },
    entrance: null,
    precision: 'exata',
    addressText: 'Estrada do Bairro dos Tenentes, km 1,5, Extrema/MG (endereço demonstrativo)',
    references: ['Portão verde com muro de pedra', 'Em frente ao ponto de ônibus do bairro'],
    distances: [est('Centro de Extrema', 8, 14), est('Bragança Paulista', 38, 40), est('São Paulo', 110, 95)],
  },
  access: {
    highway: 'Rodovia Fernão Dias (BR-381), saída para o Bairro dos Tenentes',
    dirtRoadKm: 1.5,
    conditions: 'Estrada de terra plana e bem conservada, segundo o proprietário',
    arrivalPoint: 'Portão verde com muro de pedra, em frente ao ponto de ônibus',
  },
  features: {
    water: 'Poço artesiano no terreno e lago abastecido por mina',
    energy: 'Padrão de energia instalado',
    internet: 'Fibra óptica disponível na estrada, segundo o proprietário',
    relief: 'suave',
    fencing: 'Muro de pedra na frente e cerca viva nas laterais',
    accessType: 'misto',
    extra: {
      'Lago': 'Aproximadamente 300 m² de lâmina d’água',
    },
  },
  infrastructure: {
    items: [
      { key: 'agua', label: 'Água', status: 'existente', note: 'Poço artesiano no terreno' },
      { key: 'energia', label: 'Energia elétrica', status: 'existente', note: 'Padrão instalado' },
      { key: 'internet', label: 'Internet cabeada', status: 'existente', note: 'Fibra óptica na estrada' },
    ],
  },
  priceCents: 32000000,
  areaM2: 5200,
  commercial: {
    priceCents: 32000000,
    downPaymentCents: 9600000,
    installments: 24,
    installmentCents: 933333,
    adjustments: null,
    charges: null,
    updatedAt: U,
  },
  documents: {
    text: 'Informação demonstrativa: segundo o proprietário, o imóvel possui escritura e matrícula própria. Peça as certidões atualizadas ao corretor.',
    updatedAt: U,
  },
  faq: [
    {
      id: 'cv-lago',
      question: 'O lago fica dentro do terreno?',
      answer: 'Sim. Segundo o proprietário, o lago de cerca de 300 m² fica na parte baixa do terreno e é abastecido por uma mina.',
      topic: 'medidas',
      anchor: 'caracteristicas',
      keywords: ['lago', 'agua', 'mina'],
    },
  ],
  related: ['sitio-pedra-branca', 'residencial-colinas-de-extrema'],
  featured: false,
  status: 'publicado',
  updatedAt: U,
  availability: 'Disponível na última atualização',
};
