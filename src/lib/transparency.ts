/**
 * Ficha de transparência: quais informações do anúncio foram confirmadas
 * e quais não foram disponibilizadas. Nada é deduzido.
 */
import type { Listing } from '@/types/listing';
import { isEmpreendimento } from '@/types/listing';
import { priceInfo } from './listing';

export interface TransparencyItem {
  key: string;
  label: string;
  /** Âncora da seção onde o item aparece na página de detalhe. */
  anchor: string;
  confirmed: boolean;
}

export interface TransparencyReport {
  items: TransparencyItem[];
  total: number;
  confirmed: number;
  missing: TransparencyItem[];
}

export function transparencyReport(listing: Listing): TransparencyReport {
  const f = listing.features;
  const a = listing.access;
  const infraKnown = (key: string) =>
    listing.infrastructure.items.some((i) => i.key === key && i.status !== 'nao_informada');

  const items: TransparencyItem[] = [
    { key: 'preco', label: 'Preço', anchor: 'condicoes', confirmed: priceInfo(listing).mode !== 'sob_consulta' },
    { key: 'endereco', label: 'Endereço ou referência de localização', anchor: 'localizacao', confirmed: listing.location.addressText !== null || listing.location.references.length > 0 },
    { key: 'rodovia', label: 'Rodovia de acesso', anchor: 'acesso', confirmed: a.highway !== null },
    { key: 'terra', label: 'Trecho de estrada de terra', anchor: 'acesso', confirmed: a.dirtRoadKm !== null },
    { key: 'condicoes_estrada', label: 'Condições da estrada', anchor: 'acesso', confirmed: a.conditions !== null },
    { key: 'chegada', label: 'Ponto de chegada', anchor: 'acesso', confirmed: a.arrivalPoint !== null || listing.location.entrance !== null },
    { key: 'agua', label: 'Água', anchor: 'caracteristicas', confirmed: f.water !== null || infraKnown('agua') },
    { key: 'energia', label: 'Energia', anchor: 'caracteristicas', confirmed: f.energy !== null || infraKnown('energia') },
    { key: 'internet', label: 'Internet', anchor: 'caracteristicas', confirmed: f.internet !== null },
    { key: 'relevo', label: 'Relevo', anchor: 'caracteristicas', confirmed: f.relief !== null },
    { key: 'cercamento', label: 'Cercamento', anchor: 'caracteristicas', confirmed: f.fencing !== null },
    { key: 'distancias', label: 'Distâncias até cidades de referência', anchor: 'localizacao', confirmed: listing.location.distances.length > 0 },
    { key: 'condicoes', label: 'Condições comerciais', anchor: 'condicoes', confirmed: listing.commercial !== null },
    { key: 'documentos', label: 'Informações documentais', anchor: 'documentacao', confirmed: listing.documents !== null },
  ];

  if (isEmpreendimento(listing)) {
    items.push({ key: 'planta', label: 'Planta do empreendimento', anchor: 'lotes', confirmed: listing.plan !== null });
  }

  const missing = items.filter((i) => !i.confirmed);
  return { items, total: items.length, confirmed: items.length - missing.length, missing };
}
