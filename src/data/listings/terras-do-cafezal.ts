import type { Empreendimento } from '@/types/listing';
import type { Lot, LotStatus } from '@/types/lot';
import { demoPhoto } from '../media';
import { est } from '../common';

const U = '2026-09-10T09:30:00-03:00';

const lot = (number: string, areaM2: number, priceReais: number | null, status: LotStatus, dimensions: string | null): Lot => ({
  id: `tc-${number}`,
  number,
  block: null,
  areaM2,
  dimensions,
  priceCents: priceReais === null ? null : priceReais * 100,
  status,
  updatedAt: U,
  // Planta em imagem: sem geometria cadastrada. Não inventar polígonos.
  polygon: null,
});

export const terrasDoCafezal: Empreendimento = {
  id: 'terras-do-cafezal',
  slug: 'terras-do-cafezal',
  code: 'EMP-PAR-02',
  kind: 'empreendimento',
  zone: 'rural',
  title: 'Terras do Cafezal',
  municipio: 'Paraisópolis',
  uf: 'MG',
  regiao: 'Sul de Minas',
  summary:
    'Glebas de 1 a 2,5 hectares em antiga área de café, com vista para a serra. Energia elétrica prevista pelo empreendedor.',
  description:
    'Terras do Cafezal divide uma antiga fazenda de café em 8 glebas, com frente para a estrada interna. O terreno tem relevo suave, boa insolação e parte das linhas de café ainda de pé nas glebas mais altas. A energia elétrica ainda não chegou às glebas: está prevista pelo empreendedor, sem data confirmada.',
  regionInfo:
    'Paraisópolis fica no alto da Serra da Mantiqueira mineira, com economia ligada à agricultura e ao turismo rural. O acesso principal é pela Fernão Dias, via Cambuí.',
  highlights: ['Glebas de 1 a 2,5 ha', 'Relevo suave', 'Vista para a serra'],
  interesses: ['chacara', 'uso_rural', 'lazer'],
  media: [
    demoPhoto('cafezal.jpg', 'foto'),
    demoPhoto('aerea-sitio.jpg', 'aerea'),
    demoPhoto('por-do-sol-serra.jpg', 'foto'),
    demoPhoto('cerca-pasto.jpg', 'foto'),
  ],
  videos: [],
  location: {
    center: { lat: -22.569, lng: -45.765 },
    entrance: null,
    precision: 'exata',
    addressText: 'Estrada Municipal Paraisópolis–Brazópolis, km 7, zona rural (endereço demonstrativo)',
    references: ['Entrada à esquerda após o posto de resfriamento de leite', 'Porteira azul com placa do empreendimento'],
    distances: [est('Centro de Paraisópolis', 9, 18), est('Pouso Alegre', 62, 70), est('São Paulo', 198, 185)],
  },
  access: {
    highway: 'Rodovia Fernão Dias (BR-381) até Cambuí, depois MG-295 até Paraisópolis',
    dirtRoadKm: 5.5,
    conditions: null,
    arrivalPoint: 'Porteira azul na estrada municipal, com placa do empreendimento',
  },
  features: {
    water: 'Poço semiartesiano coletivo informado pelo empreendedor',
    energy: null,
    internet: null,
    relief: 'suave',
    fencing: 'Glebas demarcadas com cerca de arame e mourões',
    accessType: 'misto',
    extra: {
      'Uso anterior': 'Plantio de café',
      'Altitude aproximada': '1.150 m',
    },
  },
  infrastructure: {
    items: [
      { key: 'agua', label: 'Água', status: 'existente', note: 'Poço semiartesiano coletivo' },
      { key: 'energia', label: 'Energia elétrica', status: 'prevista', note: 'Prevista pelo empreendedor, sem data confirmada' },
      { key: 'rua_interna', label: 'Rua interna cascalhada', status: 'existente', note: null },
      { key: 'internet', label: 'Internet cabeada', status: 'nao_informada', note: null },
      { key: 'portaria', label: 'Portaria', status: 'nao_informada', note: null },
    ],
  },
  commercial: {
    priceCents: null,
    downPaymentCents: null,
    installments: 60,
    installmentCents: null,
    adjustments: 'Parcelas reajustadas anualmente pelo IPCA, segundo o empreendedor',
    charges: null,
    updatedAt: U,
  },
  documents: {
    text: 'Informação demonstrativa: segundo o responsável, as glebas estão em processo de desmembramento no cartório de Paraisópolis. Peça ao corretor a situação atualizada de cada gleba.',
    updatedAt: U,
  },
  faq: [
    {
      id: 'tc-energia',
      question: 'Já tem energia elétrica nas glebas?',
      answer: 'Ainda não. A energia está prevista pelo empreendedor, sem data confirmada. Por isso ela não aparece como infraestrutura existente.',
      topic: 'infraestrutura',
      anchor: 'infraestrutura',
      keywords: ['energia', 'luz', 'eletrica', 'rede'],
    },
    {
      id: 'tc-planta',
      question: 'A planta mostra a posição exata das glebas?',
      answer: 'Não. A planta publicada é demonstrativa e serve para dar noção da divisão. Medidas e confrontações devem ser confirmadas no levantamento técnico com o corretor.',
      topic: 'medidas',
      anchor: 'lotes',
      keywords: ['planta', 'medidas', 'levantamento', 'posição'],
    },
  ],
  related: ['recanto-das-araucarias', 'terreno-ribeirao-das-pedras'],
  featured: true,
  status: 'publicado',
  updatedAt: U,
  availability: '4 glebas disponíveis na última atualização',
  lots: [
    lot('1', 10500, 285000, 'disponivel', '75 × 140 m'),
    lot('2', 12000, 310000, 'vendido', '80 × 150 m'),
    lot('3', 11200, 298000, 'disponivel', '80 × 140 m'),
    lot('4', 15800, null, 'sob_consulta', null),
    lot('5', 14000, 355000, 'reservado', '100 × 140 m'),
    lot('6', 18500, 420000, 'disponivel', '110 × 168 m'),
    lot('7', 22000, 495000, 'disponivel', '120 × 183 m'),
    lot('8', 25000, null, 'sob_consulta', null),
  ],
  plan: {
    kind: 'imagem',
    viewBox: null,
    imageUrl: '/demo/planta-terras-do-cafezal.png',
    pdfUrl: '/demo/planta-terras-do-cafezal.pdf',
    demonstrativa: true,
    updatedAt: U,
  },
};
