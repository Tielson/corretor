import type { Distance } from '@/types/location';

export const EDITORIAL = 'Estimativa editorial (demonstração)';

export const est = (label: string, km: number, minutes: number | null): Distance => ({
  label,
  km,
  minutes,
  source: EDITORIAL,
  nature: 'estimativa',
});
