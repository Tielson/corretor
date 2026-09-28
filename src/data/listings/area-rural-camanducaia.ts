import type { Terreno } from '@/types/listing';
import { demoPhoto } from '../media';
import { est } from '../common';

const U = '2026-08-29T11:00:00-03:00';

/**
 * Anúncio com várias informações ainda não fornecidas: preço sob consulta,
 * localização aproximada, sem condições comerciais e sem bloco documental.
 * Serve para demonstrar "Informação não disponibilizada".
 */
export const areaRuralCamanducaia: Terreno = {
  id: 'area-rural-camanducaia',
  slug: 'area-rural-camanducaia',
  code: 'TER-CAM-04',
  kind: 'terreno',
  zone: 'rural',
  title: 'Área rural de 12 hectares em Camanducaia',
  municipio: 'Camanducaia',
  uf: 'MG',
  regiao: 'Serra da Mantiqueira',
  summary: 'Área de pastagem com 12 hectares entre Camanducaia e Monte Verde. Preço sob consulta; localização exata informada na visita.',
  description:
    'Área rural de 12 ha usada hoje como pastagem, com relevo que alterna trechos planos e encostas. O proprietário prefere não divulgar a localização exata antes do primeiro contato, por isso o mapa mostra uma posição aproximada. Preço, condições e documentação são informados pelo corretor.',
  regionInfo:
    'Camanducaia fica às margens da Fernão Dias e inclui o distrito de Monte Verde, destino turístico de montanha. A zona rural tem propriedades de pecuária leiteira e áreas de reflorestamento.',
  highlights: ['12 hectares', 'Próxima à Fernão Dias', 'Pastagem formada'],
  interesses: ['uso_rural'],
  media: [demoPhoto('pasto-cavalos.jpg', 'foto'), demoPhoto('cerca-pasto.jpg', 'foto'), demoPhoto('estrada-terra.jpg', 'foto')],
  videos: [],
  location: {
    center: { lat: -22.79, lng: -46.09 },
    entrance: { lat: -22.7862, lng: -46.0968 },
    precision: 'aproximada',
    addressText: null,
    references: ['Região entre o centro de Camanducaia e o distrito de Monte Verde'],
    distances: [est('Centro de Camanducaia', 9, 15), est('Monte Verde', 22, 35), est('São Paulo', 142, 120)],
  },
  access: {
    highway: 'Rodovia Fernão Dias (BR-381), saída para Camanducaia',
    dirtRoadKm: null,
    conditions: null,
    arrivalPoint: null,
  },
  features: {
    water: null,
    energy: 'Rede da concessionária na estrada, segundo o proprietário',
    internet: null,
    relief: 'suave',
    fencing: null,
    accessType: null,
    extra: {},
  },
  infrastructure: {
    items: [
      { key: 'energia', label: 'Energia elétrica', status: 'existente', note: 'Rede na estrada' },
      { key: 'agua', label: 'Água', status: 'nao_informada', note: null },
    ],
  },
  priceCents: null,
  areaM2: 120000,
  commercial: null,
  documents: null,
  faq: [
    {
      id: 'cam-local',
      question: 'Por que a localização é aproximada?',
      answer: 'O proprietário pediu para informar a posição exata apenas após o primeiro contato. O ponto do mapa indica a região; a rota leva ao ponto de acesso informado, que também deve ser confirmado.',
      topic: 'localizacao',
      anchor: 'localizacao',
      keywords: ['localização', 'mapa', 'aproximada', 'onde fica'],
    },
  ],
  related: ['sitio-pedra-branca', 'chacara-vista-da-mantiqueira'],
  featured: false,
  status: 'publicado',
  updatedAt: U,
  availability: null,
};
