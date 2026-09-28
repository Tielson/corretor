export interface LatLng {
  lat: number;
  lng: number;
}

export interface Distance {
  label: string;
  km: number;
  minutes: number | null;
  /** Origem da estimativa (ex.: "Estimativa editorial"). */
  source: string;
  nature: 'estimativa' | 'medida';
}

export interface Location {
  center: LatLng;
  /** Ponto de chegada, separado do centro do terreno. */
  entrance: LatLng | null;
  precision: 'exata' | 'aproximada';
  addressText: string | null;
  references: string[];
  distances: Distance[];
}

export interface Access {
  highway: string | null;
  dirtRoadKm: number | null;
  conditions: string | null;
  arrivalPoint: string | null;
}
