import { describe, it, expect } from 'vitest';
import { calculateShieldGating, shieldGateEhpMultiplier } from '../engine/systems/shield-gating';

describe('shield gating', () => {
  it('zero shields produce minimal gate benefit', () => {
    const result = calculateShieldGating({
      maxShields: 0, currentShields: 0, overshields: 0,
      shieldRechargeDelay: 1, shieldRechargeRate: 15,
      hasGateAvailable: true, isCurrentlyGated: false, gateTimerRemaining: 0,
    });
    expect(result.gateUptimeFraction).toBeGreaterThanOrEqual(0);
  });

  it('calculates gate uptime for a full shield gate', () => {
    const result = calculateShieldGating({
      maxShields: 300, currentShields: 300, overshields: 0,
      shieldRechargeDelay: 1, shieldRechargeRate: 30,
      hasGateAvailable: true, isCurrentlyGated: false, gateTimerRemaining: 0,
    });
    expect(result.gateUptimeFraction).toBeGreaterThan(0);
    expect(result.gateUptimeFraction).toBeLessThan(1);
  });

  it('shield gate EHP multiplier is 1.0 for no shields', () => {
    expect(shieldGateEhpMultiplier(0, 15, 1, 100)).toBe(1.0);
  });

  it('shield gate EHP multiplier is > 1 for shielded frames', () => {
    const mult = shieldGateEhpMultiplier(300, 15, 1, 100);
    expect(mult).toBeGreaterThan(1);
    expect(mult).toBeLessThan(10);
  });

  it('higher shield recharge gives higher multiplier', () => {
    const lowRecharge = shieldGateEhpMultiplier(300, 10, 1, 100);
    const highRecharge = shieldGateEhpMultiplier(300, 50, 1, 100);
    expect(highRecharge).toBeGreaterThan(lowRecharge);
  });
});
