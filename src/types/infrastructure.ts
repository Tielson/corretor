export type InfraStatus = 'existente' | 'prevista' | 'nao_informada';

export interface InfraItem {
  key: string;
  label: string;
  status: InfraStatus;
  note: string | null;
}

/** Os filtros consultam apenas itens com status = 'existente'. */
export interface Infrastructure {
  items: InfraItem[];
}
