import { describe, expect, it } from 'vitest';
import {
  M2_PER_HA,
  describeFootballFields,
  formatArea,
  formatAreaFull,
  formatAreaRange,
  haToM2,
  m2ToHa,
} from '@/lib/area';

describe('area', () => {
  it('converte m² <-> ha com 1 ha = 10.000 m²', () => {
    expect(M2_PER_HA).toBe(10000);
    expect(m2ToHa(25000)).toBe(2.5);
    expect(haToM2(4.8)).toBe(48000);
    expect(m2ToHa(haToM2(1.24))).toBeCloseTo(1.24);
  });
  it('exibe ha a partir de 10.000 m²', () => {
    expect(formatArea(9999)).toBe('9.999 m²');
    expect(formatArea(10000)).toBe('1 ha');
    expect(formatArea(12400)).toBe('1,24 ha');
    expect(formatAreaFull(12400)).toBe('12.400 m² (1,24 ha)');
    expect(formatAreaFull(360)).toBe('360 m²');
  });
  it('formata intervalos', () => {
    expect(formatAreaRange({ minM2: 2000, maxM2: 6400 })).toBe('2.000 m² a 6.400 m²');
    expect(formatAreaRange({ minM2: 2000, maxM2: 25000 })).toBe('2.000 m² a 2,5 ha');
    expect(formatAreaRange({ minM2: 10500, maxM2: 25000 })).toBe('1,05 a 2,5 ha');
    expect(formatAreaRange({ minM2: 360, maxM2: 360 })).toBe('360 m²');
  });
  it('equivalência em campos de futebol', () => {
    expect(describeFootballFields(12400)).toBe('cerca de 1,7 campo de futebol');
    expect(describeFootballFields(48000)).toBe('cerca de 6,7 campos de futebol');
    expect(describeFootballFields(7140)).toBe('cerca de 1 campo de futebol');
    expect(describeFootballFields(360)).toBeNull();
  });
});
