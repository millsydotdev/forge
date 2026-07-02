import { describe, it, expect } from 'vitest';
import { calculateStatStickContribution, isStatStickAbility } from '../engine/systems/stat-stick';

describe('stat-stick', () => {
  it('identifies Khora Whipclaw as stat-stick ability', () => {
    expect(isStatStickAbility('Khora Prime', 1)).toBe(true);
  });

  it('identifies Atlas Landslide as stat-stick ability', () => {
    expect(isStatStickAbility('Atlas', 1)).toBe(true);
  });

  it('non-stat-stick abilities return false', () => {
    expect(isStatStickAbility('Excalibur', 4)).toBe(false);
    expect(isStatStickAbility('Rhino', 2)).toBe(false);
  });

  it('calculates stat-stick damage contribution', () => {
    const result = calculateStatStickContribution({
      warframeName: 'Khora',
      abilitySlotIndex: 1,
      statStickWeaponId: '/Lotus/Weapons/Tenno/Melee/JawSword',
      totalDamageFromMods: 200,
      elementalDamageFromMods: 100,
      critChanceFromMods: 0.5,
      statusChanceFromMods: 0.3,
      rivenDisposition: 1.0,
      rivenBonuses: {},
    });
    expect(result.usesStatStick).toBe(true);
    expect(result.totalDamageContribution).toBeGreaterThan(0);
  });

  it('returns zero contribution when no stat-stick ability match', () => {
    const result = calculateStatStickContribution({
      warframeName: 'Rhino',
      abilitySlotIndex: 2,
      statStickWeaponId: '',
      totalDamageFromMods: 200,
      elementalDamageFromMods: 100,
      critChanceFromMods: 0,
      statusChanceFromMods: 0,
      rivenDisposition: 0,
      rivenBonuses: {},
    });
    expect(result.usesStatStick).toBe(false);
    expect(result.totalDamageContribution).toBe(0);
  });
});
