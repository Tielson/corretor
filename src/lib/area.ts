/** 1 ha = 10.000 m². Unidade interna de todo o site: m². */
export const M2_PER_HA = 10_000;

/** Campo de futebol oficial de referência (105 × 68 m). */
export const FOOTBALL_FIELD = { widthM: 105, lengthM: 68, areaM2: 105 * 68 } as const;

export const m2ToHa = (m2: number): number => m2 / M2_PER_HA;
export const haToM2 = (ha: number): number => ha * M2_PER_HA;

const nf = (n: number, digits: number) =>
  n.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: digits });

export function formatM2(m2: number): string {
  return `${nf(Math.round(m2), 0)} m²`;
}

export function formatHa(m2: number): string {
  const ha = m2ToHa(m2);
  return `${nf(ha, ha < 10 ? 2 : 1)} ha`;
}

/** Exibição principal: hectares a partir de 10.000 m², m² abaixo disso. */
export function formatArea(m2: number): string {
  return m2 >= M2_PER_HA ? formatHa(m2) : formatM2(m2);
}

/** "12.400 m² (1,24 ha)" ou "450 m²". */
export function formatAreaFull(m2: number): string {
  return m2 >= M2_PER_HA ? `${formatM2(m2)} (${formatHa(m2)})` : formatM2(m2);
}

export interface AreaRange {
  minM2: number;
  maxM2: number;
}

export function areaRangeOf(values: number[]): AreaRange | null {
  if (values.length === 0) return null;
  return { minM2: Math.min(...values), maxM2: Math.max(...values) };
}

/** "De 1.000 m² a 2,4 ha" ou valor único quando min = max. */
export function formatAreaRange(range: AreaRange): string {
  if (range.minM2 === range.maxM2) return formatArea(range.minM2);
  const bothHa = range.minM2 >= M2_PER_HA;
  if (bothHa) return `${nf(m2ToHa(range.minM2), 2)} a ${formatHa(range.maxM2)}`;
  return `${formatArea(range.minM2)} a ${formatArea(range.maxM2)}`;
}

export function toFootballFields(m2: number): number {
  return m2 / FOOTBALL_FIELD.areaM2;
}

/**
 * Equivalência em campos de futebol, para dar noção de escala.
 * Retorna null para áreas pequenas, onde a comparação não ajuda.
 */
export function describeFootballFields(m2: number): string | null {
  const fields = toFootballFields(m2);
  if (fields < 0.3) return null;
  const rounded = Math.round(fields * 10) / 10;
  const value = nf(rounded, 1);
  return rounded < 1.05 && rounded > 0.95
    ? 'cerca de 1 campo de futebol'
    : `cerca de ${value} ${rounded >= 2 ? 'campos' : 'campo'} de futebol`;
}
