import { describe, it, expect } from 'vitest';
import { applyDamageAttenuation, isAttenuatedEnemy } from '../engine/systems/damage-attenuation';

describe('damage attenuation', () => {
  it('passes damage below threshold unchanged', () => {
    const result = applyDamageAttenuation({
      type: 'threshold', baseDamage: 0, rawDamage: 1000,
      threshold: 2000, attenuationFactor: 0.05,
    });
    expect(result.finalDamage).toBe(1000);
    expect(result.attenuationApplied).toBe(0);
  });

  it('reduces damage above threshold', () => {
    const result = applyDamageAttenuation({
      type: 'threshold', baseDamage: 0, rawDamage: 10000,
      threshold: 2000, attenuationFactor: 0.05,
    });
    expect(result.finalDamage).toBeLessThan(10000);
    expect(result.finalDamage).toBeGreaterThan(2000);
    expect(result.attenuationApplied).toBeGreaterThan(0);
  });

  it('DR-based attenuation increases with damage', () => {
    const small = applyDamageAttenuation({
      type: 'dr_based', baseDamage: 0, rawDamage: 1000,
      attenuationConstant: 0.0002,
    });
    const large = applyDamageAttenuation({
      type: 'dr_based', baseDamage: 0, rawDamage: 100000,
      attenuationConstant: 0.0002,
    });
    expect(small.effectiveDr).toBeLessThan(large.effectiveDr);
    expect(large.effectiveDr).toBeLessThan(1);
  });

  it('identifies attenuated enemies', () => {
    expect(isAttenuatedEnemy('Archon Ruk')).toBe(true);
    expect(isAttenuatedEnemy('Demolyst R-9')).toBe(true);
    expect(isAttenuatedEnemy('Lancer')).toBe(false);
  });
});
