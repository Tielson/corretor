const long = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Sao_Paulo' });
const short = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Sao_Paulo' });

/** "18 de setembro de 2026" */
export const formatDateLong = (iso: string): string => long.format(new Date(iso));
/** "18/09/2026" */
export const formatDateShort = (iso: string): string => short.format(new Date(iso));

/** 190 -> "3 h 10 min"; 45 -> "45 min"; 120 -> "2 h" */
export function formatMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = Math.round(total % 60);
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}
