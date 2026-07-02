import { describe, it, expect } from 'vitest';
import { calculateOverguardDamage, overguardEffectiveHp } from '../engine/systems/overguard';

describe('overguard', () => {
  it('overguard absorbs damage with 50% DR', () => {
    const result = calculateOverguardDamage({
      maxOverguard: 1000, currentOverguard: 1000,
      rawDamage: 1000, factionMultiplier: 1,
      isSteelPath: false,
    });
    expect(result.damageToOverguard).toBe(500);
    expect(result.overguardRemaining).toBe(500);
    expect(result.excessDamageToHealth).toBe(0);
  });

  it('overguard excess damage bleeds to health', () => {
    const result = calculateOverguardDamage({
      maxOverguard: 200, currentOverguard: 200,
      rawDamage: 1000, factionMultiplier: 1,
      isSteelPath: false,
    });
    expect(result.damageToOverguard).toBe(200);
    expect(result.overguardRemaining).toBe(0);
    expect(result.excessDamageToHealth).toBeGreaterThan(0);
  });

  it('returns no overguard when none active', () => {
    const result = calculateOverguardDamage({
      maxOverguard: 0, currentOverguard: 0,
      rawDamage: 500, factionMultiplier: 1,
      isSteelPath: false,
    });
    expect(result.overguardActive).toBe(false);
    expect(result.excessDamageToHealth).toBe(500);
  });

  it('overguard effective HP accounts for 50% DR', () => {
    expect(overguardEffectiveHp(1000)).toBe(2000);
    expect(overguardEffectiveHp(500)).toBe(1000);
  });
});
