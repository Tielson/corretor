export type LotStatus = 'disponivel' | 'reservado' | 'vendido' | 'sob_consulta';

export interface Lot {
  id: string;
  number: string;
  block: string | null;
  areaM2: number;
  /** Medidas disponíveis em texto (ex.: "20 × 60 m"). */
  dimensions: string | null;
  priceCents: number | null;
  status: LotStatus;
  updatedAt: string;
  /** Pontos no viewBox do SVG da planta; null = sem geometria cadastrada. */
  polygon: Array<[number, number]> | null;
}

export interface Plan {
  kind: 'svg' | 'imagem';
  /** Obrigatório quando kind = 'svg'. */
  viewBox: string | null;
  imageUrl: string | null;
  pdfUrl: string | null;
  /** Planta ilustrativa, não é levantamento técnico. */
  demonstrativa: boolean;
  updatedAt: string;
}
