import { describe, it, expect } from 'vitest';
import { resolveBondMods, BOND_MODS, KNOWN_PRECEPTS } from '../engine/systems/companion-system';

describe('Companion System', () => {
  it('BOND_MODS has known bond mods', () => {
    expect(BOND_MODS['Tenacious Bond']).toBeDefined();
    expect(BOND_MODS['Momentous Bond']).toBeDefined();
    expect(BOND_MODS['Reinforced Bond']).toBeDefined();
    expect(BOND_MODS['Viral Bond']).toBeDefined();
  });

  it('Tenacious Bond requires 1200 shields', () => {
    expect(BOND_MODS['Tenacious Bond'].requiresShields).toBe(1200);
  });

  it('KNOWN_PRECEPTS contains common precepts', () => {
    expect(KNOWN_PRECEPTS['Ghost']).toBeDefined();
    expect(KNOWN_PRECEPTS['Guardian']).toBeDefined();
    expect(KNOWN_PRECEPTS['Sacrifice']).toBeDefined();
    expect(KNOWN_PRECEPTS['Medi-Ray']).toBeDefined();
  });

  it('resolveBondMods returns effects when condition met', () => {
    const effects = resolveBondMods(['Tenacious Bond'], 1200, 0);
    expect(effects.length).toBeGreaterThan(0);
    expect(effects[0].stat).toBe('crit_damage');
    expect(effects[0].value).toBe(0.5);
  });

  it('resolveBondMods returns empty when shields insufficient', () => {
    const effects = resolveBondMods(['Tenacious Bond'], 800, 0);
    expect(effects.length).toBe(0);
  });

  it('resolveBondMods returns empty for unknown bond', () => {
    const effects = resolveBondMods(['Fake Bond'], 1200, 0);
    expect(effects.length).toBe(0);
  });

  it('Momentous Bond requires kills', () => {
    expect(BOND_MODS['Momentous Bond'].requiresKills).toBe(10);
  });
});
