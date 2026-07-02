import { describe, it, expect } from 'vitest';
import { resolveIncarnonBonuses, isIncarnonWeapon } from '../engine/systems/incarnon';

describe('incarnon evolutions', () => {
  it('returns no bonuses for evolution stage 0', () => {
    const result = resolveIncarnonBonuses({
      weaponId: '/Lotus/Weapons/Tenno/Rifle/Torid', evolutionStage: 0, baseStats: {},
    });
    expect(Object.keys(result.statBonuses).length).toBe(0);
  });

  it('accumulates evolution bonuses', () => {
    const result = resolveIncarnonBonuses({
      weaponId: '/Lotus/Weapons/Tenno/Rifle/Torid', evolutionStage: 3, baseStats: {},
    });
    expect(Object.keys(result.statBonuses).length).toBeGreaterThan(0);
  });

  it('identifies incarnon weapons', () => {
    expect(isIncarnonWeapon('/Lotus/Weapons/Tenno/Rifle/Torid')).toBe(true);
    expect(isIncarnonWeapon('/Lotus/Weapons/Tenno/Rifle/Braton')).toBe(false);
  });

  it('unknown weapons return empty bonuses', () => {
    const result = resolveIncarnonBonuses({
      weaponId: '/Lotus/Weapons/Tenno/Rifle/Braton', evolutionStage: 3, baseStats: {},
    });
    expect(Object.keys(result.statBonuses).length).toBe(0);
  });
});
