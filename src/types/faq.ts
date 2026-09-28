export interface Faq {
  id: string;
  question: string;
  answer: string;
  topic: FaqTopic;
  /** Âncora da seção relacionada na página (ex.: "acesso"). */
  anchor: string | null;
  keywords: string[];
}

export type FaqTopic =
  | 'localizacao'
  | 'acesso'
  | 'visita'
  | 'medidas'
  | 'infraestrutura'
  | 'condicoes'
  | 'documentacao'
  | 'geral';
