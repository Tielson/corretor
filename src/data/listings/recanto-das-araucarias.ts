import type { Empreendimento } from '@/types/listing';
import type { Lot, LotStatus } from '@/types/lot';
import { demoPhoto } from '../media';
import { est } from '../common';
import videos from '@/assets/demo/videos.json';

const U = '2026-09-18T10:00:00-03:00';

const lot = (
  number: string,
  block: string,
  areaM2: number,
  priceReais: number | null,
  status: LotStatus,
  polygon: Array<[number, number]>,
  dimensions: string | null,
): Lot => ({
  id: `ra-${block.toLowerCase()}${number}`,
  number,
  block,
  areaM2,
  dimensions,
  priceCents: priceReais === null ? null : priceReais * 100,
  status,
  updatedAt: U,
  polygon,
});

/*
 * Caso de teste da regra do mesmo lote: os lotes da quadra A são menores e
 * mais baratos, os da quadra B são maiores e mais caros. Um filtro "até
 * R$ 200 mil e a partir de 5.000 m²" NÃO pode retornar este empreendimento,
 * porque nenhum lote disponível atende às duas condições ao mesmo tempo.
 */
const lots: Lot[] = [
  lot('01', 'A', 2100, 158000, 'disponivel', [[60, 66], [160, 76], [156, 282], [56, 282]], '30 × 70 m'),
  lot('02', 'A', 2300, 165000, 'vendido', [[160, 76], [270, 84], [266, 282], [156, 282]], '32 × 72 m'),
  lot('03', 'A', 2000, 150000, 'disponivel', [[270, 84], [365, 88], [361, 282], [266, 282]], '28 × 71 m'),
  lot('04', 'A', 2600, 182000, 'reservado', [[365, 88], [485, 87], [481, 282], [361, 282]], '36 × 72 m'),
  lot('05', 'A', 2200, 160000, 'disponivel', [[485, 87], [590, 81], [586, 282], [481, 282]], '31 × 71 m'),
  lot('06', 'A', 2450, null, 'sob_consulta', [[590, 81], [705, 72], [701, 282], [586, 282]], null),
  lot('07', 'A', 2350, 171000, 'vendido', [[705, 72], [815, 60], [811, 282], [701, 282]], '33 × 71 m'),
  lot('08', 'A', 2800, 196000, 'disponivel', [[815, 60], [940, 47], [936, 282], [811, 282]], '38 × 74 m'),
  lot('01', 'B', 5200, 330000, 'disponivel', [[64, 352], [204, 352], [200, 577], [60, 577]], '52 × 100 m'),
  lot('02', 'B', 5600, 348000, 'vendido', [[204, 352], [354, 352], [350, 586], [200, 577]], '54 × 104 m'),
  lot('03', 'B', 5000, 318000, 'reservado', [[354, 352], [489, 352], [485, 599], [350, 586]], '48 × 104 m'),
  lot('04', 'B', 6400, 392000, 'disponivel', [[489, 352], [649, 352], [645, 615], [485, 599]], '58 × 110 m'),
  lot('05', 'B', 5400, null, 'sob_consulta', [[649, 352], [794, 352], [790, 623], [645, 615]], null),
  lot('06', 'B', 6000, 372000, 'disponivel', [[794, 352], [944, 352], [940, 622], [790, 623]], '55 × 109 m'),
];

const aerea = videos[0];

export const recantoDasAraucarias: Empreendimento = {
  id: 'recanto-das-araucarias',
  slug: 'recanto-das-araucarias',
  code: 'EMP-GON-01',
  kind: 'empreendimento',
  zone: 'rural',
  title: 'Recanto das Araucárias',
  municipio: 'Gonçalves',
  uf: 'MG',
  regiao: 'Serra da Mantiqueira',
  summary:
    'Loteamento rural de chácaras em encosta com araucárias, a 6 km do centro de Gonçalves. Lotes de 2.000 a 6.400 m², com água e energia existentes.',
  description:
    'O Recanto das Araucárias reúne 14 lotes em duas quadras, separadas por uma rua interna cascalhada. A quadra A fica na parte alta, com lotes a partir de 2.000 m² e vista para o vale. A quadra B, mais abaixo, tem lotes de 5.000 a 6.400 m², mais planos e próximos à mata de araucárias. A área comum preserva a mata existente e uma pequena nascente, segundo o responsável pelo empreendimento.',
  regionInfo:
    'Gonçalves é um município pequeno da Serra da Mantiqueira, conhecido pelo clima de montanha, pelas trilhas e pela produção artesanal. O comércio básico fica no centro; serviços maiores estão em Paraisópolis e Pouso Alegre.',
  highlights: ['Água e energia existentes', 'Vista para o vale', 'Mata de araucárias preservada'],
  interesses: ['lazer', 'chacara', 'moradia'],
  media: [
    demoPhoto('araucarias.jpg', 'foto'),
    demoPhoto('aerea-loteamento.jpg', 'aerea'),
    demoPhoto('neblina-serra.jpg', 'foto'),
    demoPhoto('estrada-terra.jpg', 'foto'),
    demoPhoto('trilha-mata.jpg', 'foto'),
  ],
  videos: aerea
    ? [
        {
          purpose: 'aerea',
          provider: 'youtube',
          videoId: aerea.videoId,
          title: 'Vídeo demonstrativo: Itamonte vista do alto, na Serra da Mantiqueira',
          description: `Sobrevoo de Itamonte (MG) publicado por ${aerea.author}, para dar noção da paisagem da serra. Não mostra o empreendimento.`,
          thumbnail: 'neblina-serra.jpg',
          captions: 'Resumo: imagens aéreas de montanhas, vales e da cidade de Itamonte. Sem narração.',
          demonstrativo: true,
        },
      ]
    : [],
  location: {
    center: { lat: -22.672, lng: -45.842 },
    entrance: { lat: -22.6705, lng: -45.8448 },
    precision: 'exata',
    addressText: 'Estrada Municipal do Bairro Serrano, km 4, zona rural de Gonçalves/MG (endereço demonstrativo)',
    references: ['Portão de madeira após a ponte sobre o ribeirão', 'Placa do empreendimento à direita, 200 m após a capela'],
    distances: [
      est('Centro de Gonçalves', 6, 15),
      est('Paraisópolis', 24, 35),
      est('Pouso Alegre', 78, 85),
      est('São Paulo', 205, 190),
    ],
  },
  access: {
    highway: 'Rodovia Fernão Dias (BR-381) até Cambuí, depois estrada asfaltada até Gonçalves',
    dirtRoadKm: 4,
    conditions: 'Estrada de terra cascalhada, com trechos de subida. Em períodos de chuva forte o responsável recomenda veículo mais alto.',
    arrivalPoint: 'Portão principal com placa do empreendimento, na Estrada Municipal do Bairro Serrano',
  },
  features: {
    water: 'Rede interna abastecida por poço semiartesiano coletivo',
    energy: 'Rede monofásica da concessionária na rua interna',
    internet: 'Sinal de celular 4G em parte dos lotes; internet via rádio disponível na região',
    relief: 'acidentado',
    fencing: 'Perímetro do empreendimento cercado; lotes sem cercamento individual',
    accessType: 'misto',
    extra: {
      'Vegetação': 'Araucárias e mata nativa na área comum',
      'Altitude aproximada': '1.350 m',
      'Rua interna': 'Cascalhada, 6 m de largura',
    },
  },
  infrastructure: {
    items: [
      { key: 'agua', label: 'Água', status: 'existente', note: 'Poço semiartesiano coletivo' },
      { key: 'energia', label: 'Energia elétrica', status: 'existente', note: 'Rede na rua interna' },
      { key: 'rua_interna', label: 'Rua interna cascalhada', status: 'existente', note: null },
      { key: 'portaria', label: 'Portaria', status: 'prevista', note: 'Prevista pelo empreendedor, sem data confirmada' },
      { key: 'internet', label: 'Internet cabeada', status: 'nao_informada', note: null },
    ],
  },
  commercial: {
    priceCents: null,
    downPaymentCents: null,
    installments: 48,
    installmentCents: null,
    adjustments: 'Saldo parcelado corrigido anualmente pelo IPCA, segundo o empreendedor',
    charges: null,
    updatedAt: U,
  },
  documents: {
    text: 'Informação demonstrativa: segundo o responsável, o empreendimento possui matrícula-mãe registrada e aprovação municipal do parcelamento. Confirme a documentação atualizada de cada lote antes de qualquer negociação.',
    updatedAt: U,
  },
  faq: [
    {
      id: 'ra-agua',
      question: 'Todos os lotes já têm água?',
      answer: 'Segundo o responsável, a rede interna de água, abastecida por poço semiartesiano coletivo, passa em frente a todos os lotes. A ligação dentro do lote é por conta do comprador.',
      topic: 'infraestrutura',
      anchor: 'infraestrutura',
      keywords: ['agua', 'poço', 'rede', 'abastecimento'],
    },
    {
      id: 'ra-portaria',
      question: 'O empreendimento tem portaria?',
      answer: 'Ainda não. A portaria está prevista pelo empreendedor, mas não há data confirmada. Por isso ela aparece como infraestrutura prevista, não existente.',
      topic: 'infraestrutura',
      anchor: 'infraestrutura',
      keywords: ['portaria', 'segurança', 'guarita'],
    },
    {
      id: 'ra-estrada',
      question: 'Carro comum chega até o empreendimento?',
      answer: 'São 4 km de estrada de terra cascalhada a partir do asfalto. O responsável informa que carro comum chega com tempo seco; com chuva forte, recomenda veículo mais alto.',
      topic: 'acesso',
      anchor: 'acesso',
      keywords: ['carro', 'estrada', 'terra', 'chuva', 'acesso'],
    },
    {
      id: 'ra-parcelas',
      question: 'É possível parcelar?',
      answer: 'O empreendedor informa parcelamento do saldo em até 48 vezes, corrigido pelo IPCA. Entrada e valor das parcelas dependem do lote e são confirmados pelo corretor.',
      topic: 'condicoes',
      anchor: 'condicoes',
      keywords: ['parcelar', 'parcelas', 'entrada', 'pagamento'],
    },
  ],
  related: ['terras-do-cafezal', 'sitio-pedra-branca'],
  featured: true,
  status: 'publicado',
  updatedAt: U,
  availability: '7 lotes disponíveis na última atualização',
  lots,
  plan: {
    kind: 'svg',
    viewBox: '0 0 1000 660',
    imageUrl: null,
    pdfUrl: null,
    demonstrativa: true,
    updatedAt: U,
  },
};
