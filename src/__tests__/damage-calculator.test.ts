import { describe, it, expect } from 'vitest';
import { calculateStatusProbabilities } from '../engine/damage-calculator';

describe('calculateStatusProbabilities', () => {
  it('returns correct probabilities for mixed physical + elemental', () => {
    const result = calculateStatusProbabilities({ impact: 100, slash: 100, heat: 50 });
    // Weighted: impact=400, slash=400, heat=50. Total=850.
    // impact=400/850*100=47.0588, slash=400/850*100=47.0588, heat=50/850*100=5.8824
    expect(result.impact).toBeCloseTo(47.06, 1);
    expect(result.slash).toBeCloseTo(47.06, 1);
    expect(result.heat).toBeCloseTo(5.88, 1);
  });

  it('sums probabilities to approximately 100%', () => {
    const result = calculateStatusProbabilities({ impact: 100, slash: 100, heat: 50 });
    const sum = Object.values(result).reduce((s, v) => s + v, 0);
    expect(sum).toBeCloseTo(100, 1);
  });

  it('handles single physical type', () => {
    const result = calculateStatusProbabilities({ slash: 100 });
    expect(result.slash).toBe(100);
  });

  it('handles single elemental type', () => {
    const result = calculateStatusProbabilities({ heat: 100 });
    expect(result.heat).toBe(100);
  });

  it('physical types have 4x weight over elemental', () => {
    const result = calculateStatusProbabilities({ impact: 50, heat: 200 });
    // Weighted: impact=200, heat=200. Total=400.
    expect(result.impact).toBeCloseTo(50, 1);
    expect(result.heat).toBeCloseTo(50, 1);
  });

  it('returns empty object for empty input', () => {
    const result = calculateStatusProbabilities({});
    expect(result).toEqual({});
  });

  it('returns empty object when all values are zero', () => {
    const result = calculateStatusProbabilities({ impact: 0, heat: 0 });
    expect(result).toEqual({});
  });

  it('returns empty object when all values are negative', () => {
    const result = calculateStatusProbabilities({ impact: -10, heat: -5 });
    expect(result).toEqual({});
  });

  it('handles all physical types', () => {
    const result = calculateStatusProbabilities({ impact: 100, puncture: 100, slash: 100 });
    // Each has same value and same weight (4x), so each = 33.33%
    expect(result.impact).toBeCloseTo(33.33, 1);
    expect(result.puncture).toBeCloseTo(33.33, 1);
    expect(result.slash).toBeCloseTo(33.33, 1);
  });

  it('handles multiple elemental types', () => {
    const result = calculateStatusProbabilities({ heat: 100, cold: 100, toxin: 100, electric: 100 });
    // Each weighted = 100*1 = 100. Total=400. Each = 25%.
    expect(result.heat).toBeCloseTo(25, 1);
    expect(result.cold).toBeCloseTo(25, 1);
    expect(result.toxin).toBeCloseTo(25, 1);
    expect(result.electric).toBeCloseTo(25, 1);
  });

  it('handles combined elements (blast, corrosive, etc.) with 1x weight', () => {
    const result = calculateStatusProbabilities({ blast: 100, corrosive: 100 });
    expect(result.blast).toBeCloseTo(50, 1);
    expect(result.corrosive).toBeCloseTo(50, 1);
  });

  it('mixed with some zero values ignores zeros', () => {
    const result = calculateStatusProbabilities({ impact: 100, heat: 0, slash: 100 });
    // impact=400, slash=400. Total=800.
    expect(result.impact).toBeCloseTo(50, 1);
    expect(result.slash).toBeCloseTo(50, 1);
    expect(result.heat).toBeUndefined();
  });

  it('handles fractional damage values', () => {
    const result = calculateStatusProbabilities({ slash: 25.5, heat: 10.2 });
    // slash=25.5*4=102, heat=10.2*1=10.2. Total=112.2.
    // slash=102/112.2*100=90.91, heat=10.2/112.2*100=9.09
    expect(result.slash).toBeCloseTo(90.91, 1);
    expect(result.heat).toBeCloseTo(9.09, 1);
  });

  it('handles void damage type', () => {
    const result = calculateStatusProbabilities({ void: 100 });
    expect(result.void).toBe(100);
  });

  it('handles physical vs elemental with extreme ratio', () => {
    const result = calculateStatusProbabilities({ impact: 1000, heat: 1 });
    // impact=4000, heat=1. Total=4001.
    // impact > 99.97%
    expect(result.impact).toBeGreaterThan(99.9);
    expect(result.heat).toBeLessThan(0.1);
  });
});
