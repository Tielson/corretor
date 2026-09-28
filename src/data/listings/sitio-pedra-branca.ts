import type { Terreno } from '@/types/listing';
import { demoPhoto } from '../media';
import { est } from '../common';
import videos from '@/assets/demo/videos.json';

const U = '2026-09-20T14:00:00-03:00';
const acesso = videos[1];

export const sitioPedraBranca: Terreno = {
  id: 'sitio-pedra-branca',
  slug: 'sitio-pedra-branca',
  code: 'TER-SAP-03',
  kind: 'terreno',
  zone: 'rural',
  title: 'Sítio Pedra Branca',
  municipio: 'Sapucaí-Mirim',
  uf: 'MG',
  regiao: 'Serra da Mantiqueira',
  summary: 'Sítio de 4,8 hectares com nascente e riacho, pasto formado e mata ciliar, a 11 km do centro de Sapucaí-Mirim.',
  description:
    'Terreno avulso de 4,8 ha em vale da Mantiqueira. Tem nascente cadastrada pelo responsável, um riacho que corta a parte baixa e pasto formado na encosta. A parte plana próxima à estrada, de cerca de 3.000 m², é a área indicada pelo proprietário para uma futura sede. A possibilidade de construir deve ser confirmada na prefeitura e nos órgãos ambientais.',
  regionInfo:
    'Sapucaí-Mirim fica na divisa com São Paulo, perto de São Bento do Sapucaí e Campos do Jordão. Região de montanha, com turismo de natureza e pequenas propriedades rurais.',
  highlights: ['Nascente e riacho', 'Pasto formado', '4,8 hectares'],
  interesses: ['lazer', 'chacara', 'uso_rural', 'moradia'],
  media: [
    demoPhoto('riacho.jpg', 'foto'),
    demoPhoto('pasto-cavalos.jpg', 'foto'),
    demoPhoto('nascente.jpg', 'foto'),
    demoPhoto('aerea-sitio.jpg', 'aerea'),
  ],
  videos: acesso
    ? [
        {
          purpose: 'aerea',
          provider: 'youtube',
          videoId: acesso.videoId,
          title: 'Vídeo demonstrativo: sobrevoo da Pedra do Baú, vizinha a Sapucaí-Mirim',
          description: `Sobrevoo publicado por ${acesso.author}. Mostra a Pedra do Baú, em São Bento do Sapucaí (SP), a cerca de 20 km do terreno. Não mostra este terreno.`,
          thumbnail: 'estrada-terra.jpg',
          captions: 'Resumo: imagens aéreas da Pedra do Baú e das montanhas ao redor. Sem narração.',
          demonstrativo: true,
        },
      ]
    : [],
  location: {
    center: { lat: -22.76, lng: -45.725 },
    entrance: { lat: -22.7588, lng: -45.7282 },
    precision: 'exata',
    addressText: 'Estrada do Bairro Pedra Branca, s/n, zona rural de Sapucaí-Mirim/MG (endereço demonstrativo)',
    references: ['Porteira de madeira ao lado de um ipê amarelo', 'Após a ponte de concreto sobre o Rio Sapucaí-Mirim'],
    distances: [est('Centro de Sapucaí-Mirim', 11, 22), est('Campos do Jordão', 38, 55), est('São Paulo', 188, 180)],
  },
  access: {
    highway: 'Estrada asfaltada São Bento do Sapucaí–Sapucaí-Mirim',
    dirtRoadKm: 3,
    conditions: 'Estrada de terra batida, sem cascalho, com uma subida mais forte perto da porteira.',
    arrivalPoint: 'Porteira de madeira ao lado do ipê amarelo, na Estrada do Bairro Pedra Branca',
  },
  features: {
    water: 'Nascente e riacho no terreno, segundo o proprietário',
    energy: 'Rede da concessionária na estrada, a 150 m da porteira',
    internet: 'Sinal de celular fraco; internet via satélite usada por vizinhos',
    relief: 'acidentado',
    fencing: 'Cerca de arame em todo o perímetro',
    accessType: 'misto',
    extra: {
      'Vegetação': 'Pasto formado e mata ciliar ao longo do riacho',
      'Área plana indicada pelo proprietário': 'Cerca de 3.000 m² próximos à estrada',
    },
  },
  infrastructure: {
    items: [
      { key: 'agua', label: 'Água', status: 'existente', note: 'Nascente e riacho no terreno' },
      { key: 'energia', label: 'Energia elétrica', status: 'existente', note: 'Rede na estrada, a 150 m da porteira' },
      { key: 'internet', label: 'Internet cabeada', status: 'nao_informada', note: null },
    ],
  },
  priceCents: 69000000,
  areaM2: 48000,
  commercial: {
    priceCents: 69000000,
    downPaymentCents: 20700000,
    installments: 36,
    installmentCents: 1341667,
    adjustments: 'Parcelas corrigidas anualmente pelo IGP-M, segundo o proprietário',
    charges: null,
    updatedAt: U,
  },
  documents: {
    text: 'Informação demonstrativa: segundo o proprietário, o imóvel tem matrícula própria e Cadastro Ambiental Rural (CAR). Solicite as certidões atualizadas ao corretor antes de negociar.',
    updatedAt: U,
  },
  faq: [
    {
      id: 'pb-construir',
      question: 'Posso construir uma casa no sítio?',
      answer: 'O anúncio não confirma permissão para construir. O proprietário indica uma área plana perto da estrada, mas a possibilidade depende da prefeitura e dos órgãos ambientais. Pergunte ao corretor quais consultas já foram feitas.',
      topic: 'documentacao',
      anchor: 'documentacao',
      keywords: ['construir', 'casa', 'obra', 'licença', 'sede'],
    },
    {
      id: 'pb-nascente',
      question: 'A nascente pode ser usada para abastecimento?',
      answer: 'O uso da água de nascente depende de regras ambientais e, em alguns casos, de outorga. O anúncio informa que a nascente existe, não que o uso esteja autorizado.',
      topic: 'infraestrutura',
      anchor: 'caracteristicas',
      keywords: ['nascente', 'agua', 'riacho', 'outorga'],
    },
  ],
  related: ['area-rural-camanducaia', 'chacara-vista-da-mantiqueira'],
  featured: true,
  status: 'publicado',
  updatedAt: U,
  availability: 'Disponível na última atualização',
};
