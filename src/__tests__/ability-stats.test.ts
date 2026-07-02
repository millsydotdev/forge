import { describe, it, expect } from 'vitest';
import { calculateAbilityStats } from '../engine/ability-stats';

describe('calculateAbilityStats', () => {
  const base = { strength: 1, duration: 1, range: 1, efficiency: 1 };

  it('returns base stats with no mods', () => {
    const result = calculateAbilityStats(base, []);
    expect(result).toEqual({ strength: 1, duration: 1, range: 1, efficiency: 1 });
  });

  it('applies a single strength mod', () => {
    const result = calculateAbilityStats(base, [{ name: 'Intensify', strength: 0.3 }]);
    expect(result.strength).toBeCloseTo(1.3, 4);
    expect(result.duration).toBe(1);
  });

  it('additive stacking: two +30% strength mods = +60%', () => {
    const mods = [
      { name: 'Intensify', strength: 0.3 },
      { name: 'Transient Fortitude', strength: 0.55, duration: -0.275 },
    ];
    const result = calculateAbilityStats(base, mods);
    expect(result.strength).toBeCloseTo(1.85, 4);
    expect(result.duration).toBeCloseTo(0.725, 4);
  });

  it('caps efficiency at 1.75', () => {
    const result = calculateAbilityStats(
      { ...base, efficiency: 1 },
      [{ name: 'Fleeting Expertise', efficiency: 0.6, duration: -0.6 }],
    );
    expect(result.efficiency).toBe(1.6);
  });

  it('clamps efficiency above cap', () => {
    const result = calculateAbilityStats(
      { ...base, efficiency: 1 },
      [{ name: 'Fleeting Expertise', efficiency: 0.6 }, { name: 'Streamline', efficiency: 0.3 }],
    );
    expect(result.efficiency).toBe(1.75);
  });

  it('handles negative efficiency baseline', () => {
    const result = calculateAbilityStats(
      { ...base, efficiency: 0.5 },
      [{ name: 'Fleeting Expertise', efficiency: 0.6 }],
    );
    expect(result.efficiency).toBeCloseTo(0.8, 4);
  });

  it('handles multiple stats on one mod', () => {
    const mods = [
      { name: 'Narrow Minded', range: 0.66, duration: 0.99 },
    ];
    const result = calculateAbilityStats(base, mods);
    expect(result.range).toBeCloseTo(1.66, 4);
    expect(result.duration).toBeCloseTo(1.99, 4);
  });

  it('handles mod with no stat changes (all undefined)', () => {
    const result = calculateAbilityStats(base, [{ name: 'Empty Mod' }]);
    expect(result).toEqual(base);
  });

  it('handles many mods', () => {
    const mods = [
      { name: 'Intensify', strength: 0.3 },
      { name: 'Blind Rage', strength: 0.99, efficiency: -0.55 },
      { name: 'Narrow Minded', range: 0.66, duration: 0.99 },
      { name: 'Streamline', efficiency: 0.3 },
      { name: 'Fleeting Expertise', efficiency: 0.6 },
      { name: 'Stretch', range: 0.45 },
      { name: 'Augur Reach', range: 0.3 },
      { name: 'Primed Continuity', duration: 0.55 },
    ];
    const result = calculateAbilityStats(base, mods);
    expect(result.strength).toBeCloseTo(2.29, 4);
    expect(result.duration).toBeCloseTo(2.54, 4);
    expect(result.range).toBeCloseTo(2.41, 4);
    expect(result.efficiency).toBeCloseTo(1.35, 4);
  });

  it('handles non-default base values', () => {
    const result = calculateAbilityStats(
      { strength: 1.5, duration: 0.8, range: 1, efficiency: 1 },
      [{ name: 'Intensify', strength: 0.3 }],
    );
    expect(result.strength).toBeCloseTo(1.95, 4);
    expect(result.duration).toBe(0.8);
  });
});
