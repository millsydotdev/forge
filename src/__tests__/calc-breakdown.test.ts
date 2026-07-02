import { describe, it, expect } from 'vitest';
import { buildBreakdown, groupModifiersByKey } from '../engine/calc-breakdown';
import type { Modifier } from '../engine/modifier';

describe('buildBreakdown', () => {
  it('handles only MULTIPLIER mods (no flats)', () => {
    const mods: Modifier[] = [
      { stat: 'base_damage', category: 'MULTIPLIER', value: 1.65, stackingGroup: 'weapon_base_damage', source: 'Serration', priority: 1 },
    ];
    const result = buildBreakdown('Base Damage', mods, 29, 1.65, 29 * 2.65);
    expect(result.label).toBe('Base Damage');
    expect(result.base).toBe(29);
    expect(result.baseSource).toBe('Base');
    expect(result.flatSum).toBe(29);
    expect(result.multiplierSum).toBe(1.65);
    expect(result.final).toBeCloseTo(76.85, 1);
    expect(result.flats).toHaveLength(0);
    expect(result.multipliers).toHaveLength(1);
    expect(result.multipliers[0].source).toBe('Serration');
    expect(result.formula).toContain('× (1 + 1.650)');
  });

  it('handles a single FLAT mod (no multipliers)', () => {
    const mods: Modifier[] = [
      { stat: 'base_damage', category: 'FLAT', value: 29, stackingGroup: 'weapon_base_damage', source: 'Braton Base', priority: 0 },
    ];
    const result = buildBreakdown('Base Damage', mods, 29, 0, 29);
    expect(result.base).toBe(29);
    expect(result.baseSource).toBe('Braton Base');
    expect(result.final).toBe(29);
    expect(result.formula).toBe('29 = 29.0');
  });

  it('handles flats + multipliers together', () => {
    const base: Modifier = { stat: 'base_damage', category: 'FLAT', value: 29, stackingGroup: 'weapon_base_damage', source: 'Braton Base', priority: 0 };
    const serration: Modifier = { stat: 'base_damage', category: 'MULTIPLIER', value: 1.65, stackingGroup: 'weapon_base_damage', source: 'Serration', priority: 1 };
    const heavyCal: Modifier = { stat: 'base_damage', category: 'MULTIPLIER', value: 1.65, stackingGroup: 'weapon_base_damage', source: 'Heavy Caliber', priority: 1 };
    const result = buildBreakdown('Base Damage', [base, serration, heavyCal], 29, 3.30, 29 * 4.30);
    expect(result.base).toBe(29);
    expect(result.multipliers).toHaveLength(2);
    expect(result.multiplierSum).toBe(3.30);
    expect(result.final).toBeCloseTo(124.7, 1);
  });

  it('sorts flats by priority', () => {
    const flat1: Modifier = { stat: 'test', category: 'FLAT', value: 10, stackingGroup: 'g', source: 'A', priority: 5 };
    const flat2: Modifier = { stat: 'test', category: 'FLAT', value: 20, stackingGroup: 'g', source: 'B', priority: 1 };
    const result = buildBreakdown('Test', [flat1, flat2], 30, 0, 30);
    // flats[0] should be the one with lowest priority (B, value=20)
    expect(result.flats).toHaveLength(1);
    expect(result.flats[0].source).toBe('A'); // A is second because of higher priority
  });

  it('sorts multipliers by priority', () => {
    const mult1: Modifier = { stat: 'test', category: 'MULTIPLIER', value: 0.5, stackingGroup: 'g', source: 'X', priority: 5 };
    const mult2: Modifier = { stat: 'test', category: 'MULTIPLIER', value: 0.3, stackingGroup: 'g', source: 'Y', priority: 1 };
    const result = buildBreakdown('Test', [mult1, mult2], 100, 0.8, 180);
    expect(result.multipliers[0].source).toBe('Y'); // Y has lower priority, comes first
    expect(result.multipliers[1].source).toBe('X');
  });

  it('handles empty mods array', () => {
    const result = buildBreakdown('Empty', [], 50, 0, 50);
    expect(result.base).toBe(50);
    expect(result.flatSum).toBe(50);
    expect(result.multiplierSum).toBe(0);
    expect(result.formula).toBe('50 = 50.0');
  });

  it('generates correct formula string for flats + mults', () => {
    const base: Modifier = { stat: 'base_damage', category: 'FLAT', value: 29, stackingGroup: 'g', source: 'Base', priority: 0 };
    const bonus: Modifier = { stat: 'base_damage', category: 'FLAT', value: 15, stackingGroup: 'g', source: 'Arcane', priority: 1 };
    const mult: Modifier = { stat: 'base_damage', category: 'MULTIPLIER', value: 0.5, stackingGroup: 'g', source: 'Mod', priority: 1 };
    const result = buildBreakdown('Test', [base, bonus, mult], 44, 0.5, 66);
    expect(result.formula).toContain('29');
    expect(result.formula).toContain('+15');
    expect(result.formula).toContain('× (1 + 0.500)');
    expect(result.formula).toContain('= 66.0');
  });
});

describe('groupModifiersByKey', () => {
  it('groups modifiers by stat::stackingGroup key', () => {
    const mods: Modifier[] = [
      { stat: 'base_damage', category: 'FLAT', value: 29, stackingGroup: 'weapon_base_damage', source: 'Base', priority: 0 },
      { stat: 'base_damage', category: 'MULTIPLIER', value: 1.65, stackingGroup: 'weapon_base_damage', source: 'Serration', priority: 1 },
      { stat: 'crit_chance', category: 'MULTIPLIER', value: 0.5, stackingGroup: 'weapon_crit', source: 'Point Strike', priority: 1 },
    ];
    const grouped = groupModifiersByKey(mods);
    expect(grouped.size).toBe(2);
    expect(grouped.has('base_damage::weapon_base_damage')).toBe(true);
    expect(grouped.has('crit_chance::weapon_crit')).toBe(true);
    expect(grouped.get('base_damage::weapon_base_damage')).toHaveLength(2);
    expect(grouped.get('crit_chance::weapon_crit')).toHaveLength(1);
  });

  it('returns empty map for empty input', () => {
    const grouped = groupModifiersByKey([]);
    expect(grouped.size).toBe(0);
  });

  it('groups mods with same key together', () => {
    const mods: Modifier[] = [
      { stat: 'base_damage', category: 'FLAT', value: 10, stackingGroup: 'g', source: 'A', priority: 0 },
      { stat: 'base_damage', category: 'FLAT', value: 20, stackingGroup: 'g', source: 'B', priority: 0 },
      { stat: 'base_damage', category: 'MULTIPLIER', value: 0.5, stackingGroup: 'g', source: 'C', priority: 1 },
    ];
    const grouped = groupModifiersByKey(mods);
    expect(grouped.get('base_damage::g')).toHaveLength(3);
  });
});
