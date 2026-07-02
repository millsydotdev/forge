import { describe, it, expect } from 'vitest';
import {
  normalizeDamageTypeName,
  isValidDamageType,
  hitMultiplierVsHealth,
  hitMultiplierVsShield,
  type DamageTypeName,
} from '../data/damage-type-mods';

describe('normalizeDamageTypeName', () => {
  it('passes through lowercase valid names', () => {
    expect(normalizeDamageTypeName('impact')).toBe('impact');
    expect(normalizeDamageTypeName('slash')).toBe('slash');
    expect(normalizeDamageTypeName('corrosive')).toBe('corrosive');
  });

  it('normalizes title-case aliases', () => {
    expect(normalizeDamageTypeName('Slash')).toBe('slash');
    expect(normalizeDamageTypeName('Heat')).toBe('heat');
    expect(normalizeDamageTypeName('Electric')).toBe('electric');
  });

  it('normalizes Electricity to electric', () => {
    expect(normalizeDamageTypeName('Electricity')).toBe('electric');
  });

  it('returns null for unknown types', () => {
    expect(normalizeDamageTypeName('nonexistent')).toBeNull();
    expect(normalizeDamageTypeName('')).toBeNull();
  });
});

describe('isValidDamageType', () => {
  it('returns true for all 16 base types', () => {
    const types = ['impact','puncture','slash','heat','cold','electric','toxin',
      'blast','radiation','gas','magnetic','viral','corrosive','void','tau','true'];
    for (const t of types) {
      expect(isValidDamageType(t)).toBe(true);
    }
  });

  it('returns true for aliases', () => {
    expect(isValidDamageType('Electricity')).toBe(true);
    expect(isValidDamageType('Slash')).toBe(true);
  });

  it('returns false for unknown types', () => {
    expect(isValidDamageType('frost')).toBe(false);
    expect(isValidDamageType('')).toBe(false);
  });
});

describe('hitMultiplierVsHealth', () => {
  it('returns 1 + healthMod when armor <= 0', () => {
    // Viral vs Cloned Flesh: +0.5 → 1.5
    const mult = hitMultiplierVsHealth('viral' as DamageTypeName, 'Cloned Flesh', 'Ferrite', 0);
    expect(mult).toBeCloseTo(1.5, 4);
  });

  it('applies armor DR + armor type mod when armor > 0', () => {
    // Corrosive vs Ferrite: +0.75 health mod for Cloned Flesh is 0
    // So hMod=0, aMod=+0.75 for corrosive vs Ferrite
    // DR = 200/(200+300) = 0.4
    // (1 + 0 + 0.75) * (1 - 0.4) = 1.75 * 0.6 = 1.05
    const mult = hitMultiplierVsHealth('corrosive' as DamageTypeName, 'Cloned Flesh', 'Ferrite', 200);
    expect(mult).toBeCloseTo(1.05, 4);
  });

  it('returns negative multiplier for resisted damage types', () => {
    // Viral vs Fossilized: -0.5 → 0.5 at 0 armor
    const mult = hitMultiplierVsHealth('viral' as DamageTypeName, 'Fossilized', 'Ferrite', 0);
    expect(mult).toBeCloseTo(0.5, 4);
  });

  it('returns 0 multiplier at 300 armor if no mod bonus', () => {
    // Impact vs Cloned Flesh: no mod
    // DR = 300/600 = 0.5
    // (1 + 0) * 0.5 = 0.5
    const mult = hitMultiplierVsHealth('impact' as DamageTypeName, 'Cloned Flesh', 'Ferrite', 300);
    expect(mult).toBeCloseTo(0.5, 4);
  });

  it('handles unknown health type (no mod)', () => {
    const mult = hitMultiplierVsHealth('impact' as DamageTypeName, 'UnknownHealth', 'Ferrite', 0);
    expect(mult).toBe(1);
  });

  it('handles unknown armor type (no mod)', () => {
    const mult = hitMultiplierVsHealth('impact' as DamageTypeName, 'Cloned Flesh', 'UnknownArmor', 100);
    const dr = 100 / 400; // 0.25
    expect(mult).toBeCloseTo(1 * (1 - dr), 4);
  });

  it('Void vs Sentient: +0.5 at 0 armor', () => {
    const mult = hitMultiplierVsHealth('void' as DamageTypeName, 'Sentient', 'Ferrite', 0);
    expect(mult).toBeCloseTo(1.5, 4);
  });

  it('Toxin vs Cloned Flesh: +0.25 at 0 armor', () => {
    const mult = hitMultiplierVsHealth('toxin' as DamageTypeName, 'Cloned Flesh', 'Ferrite', 0);
    expect(mult).toBeCloseTo(1.25, 4);
  });

  it('Gas vs Cloned Flesh: -0.25 at 0 armor', () => {
    const mult = hitMultiplierVsHealth('gas' as DamageTypeName, 'Cloned Flesh', 'Ferrite', 0);
    expect(mult).toBeCloseTo(0.75, 4);
  });
});

describe('hitMultiplierVsShield', () => {
  it('returns 1 + shieldMod for known shield type', () => {
    // Magnetic vs Shield: +0.75 → 1.75
    const mult = hitMultiplierVsShield('magnetic' as DamageTypeName, 'Shield');
    expect(mult).toBeCloseTo(1.75, 4);
  });

  it('returns 1 for unknown shield type', () => {
    const mult = hitMultiplierVsShield('impact' as DamageTypeName, 'UnknownShield');
    expect(mult).toBe(1);
  });

  it('Impact vs Proto Shield: -0.25', () => {
    const mult = hitMultiplierVsShield('impact' as DamageTypeName, 'Proto Shield');
    expect(mult).toBeCloseTo(0.75, 4);
  });

  it('Cold vs Shield: +0.5', () => {
    const mult = hitMultiplierVsShield('cold' as DamageTypeName, 'Shield');
    expect(mult).toBeCloseTo(1.5, 4);
  });

  it('Toxin vs Shield: -0.25', () => {
    const mult = hitMultiplierVsShield('toxin' as DamageTypeName, 'Shield');
    expect(mult).toBeCloseTo(0.75, 4);
  });
});
