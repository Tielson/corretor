export const SOB_CONSULTA = 'Preço sob consulta';

const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const brlWhole = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/**
 * Centavos -> "R$ 1.234,56". Valores inteiros em reais omitem ",00"
 * (ex.: 18000000 -> "R$ 180.000"). O espaço após "R$" é não separável.
 */
export function formatCents(cents: number, opts: { forceCents?: boolean } = {}): string {
  if (!Number.isFinite(cents)) throw new TypeError('Valor monetário inválido');
  const reais = cents / 100;
  const whole = Number.isInteger(reais) && !opts.forceCents;
  return (whole ? brlWhole : brl).format(reais);
}

/** Preço ou "Preço sob consulta". `null` nunca vira zero. */
export function formatPrice(cents: number | null): string {
  return cents === null ? SOB_CONSULTA : formatCents(cents);
}

/** Forma curta para chips e filtros: "R$ 180 mil", "R$ 1,2 mi". */
export function formatCentsShort(cents: number): string {
  const reais = cents / 100;
  const nf = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
  if (reais >= 1_000_000) return `R$ ${nf(reais / 1_000_000)} mi`;
  if (reais >= 1_000) return `R$ ${nf(reais / 1_000)} mil`;
  return formatCents(cents);
}

export const reaisToCents = (reais: number): number => Math.round(reais * 100);
export const centsToReais = (cents: number): number => cents / 100;
