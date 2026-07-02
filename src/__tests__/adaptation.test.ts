import { describe, it, expect } from 'vitest';
import { calculateAdaptation, adaptationMaxEhpMultiplier } from '../engine/systems/adaptation';

describe('adaptation', () => {
  it('first hit of a new type starts building adaptation', () => {
    const result = calculateAdaptation({
      incomingDamage: 100, damageType: 'heat',
      currentStacks: 0, currentDamageType: '',
      adaptationCap: 0.9, overguardActive: false,
      damageIgnoresAdaptation: false,
    });
    expect(result.dr).toBe(0);
    expect(result.newStacks).toBe(1);
    expect(result.newDamageType).toBe('heat');
  });

  it('same damage type builds DR per stack', () => {
    const result = calculateAdaptation({
      incomingDamage: 100, damageType: 'heat',
      currentStacks: 4, currentDamageType: 'heat',
      adaptationCap: 0.9, overguardActive: false,
      damageIgnoresAdaptation: false,
    });
    expect(result.dr).toBe(0.5);
    expect(result.newStacks).toBe(5);
    expect(result.damageAfterAdaptation).toBe(50);
  });

  it('accumulates to 90% DR after 10 stacks', () => {
    const state = { stacks: 0, dmgType: '' };
    for (let i = 0; i < 11; i++) {
      const r = calculateAdaptation({
        incomingDamage: 100, damageType: 'heat',
        currentStacks: state.stacks, currentDamageType: state.dmgType,
        adaptationCap: 0.9, overguardActive: false,
        damageIgnoresAdaptation: false,
      });
      state.stacks = r.newStacks;
      state.dmgType = r.newDamageType;
    }
    expect(state.stacks).toBe(10);
  });

  it('caps at 90% DR', () => {
    const result = calculateAdaptation({
      incomingDamage: 100, damageType: 'heat',
      currentStacks: 20, currentDamageType: 'heat',
      adaptationCap: 0.9, overguardActive: false,
      damageIgnoresAdaptation: false,
    });
    expect(result.dr).toBe(0.9);
    expect(result.damageAfterAdaptation).toBeCloseTo(10, 0);
  });

  it('does not apply when overguard is active', () => {
    const result = calculateAdaptation({
      incomingDamage: 100, damageType: 'heat',
      currentStacks: 5, currentDamageType: 'heat',
      adaptationCap: 0.9, overguardActive: true,
      damageIgnoresAdaptation: false,
    });
    expect(result.dr).toBe(0);
    expect(result.damageAfterAdaptation).toBe(100);
  });

  it('EHP multiplier at max stacks is 10x', () => {
    const mult = adaptationMaxEhpMultiplier();
    expect(mult).toBeCloseTo(10, 0);
  });

  it('new damage type resets adaptation', () => {
    const result = calculateAdaptation({
      incomingDamage: 100, damageType: 'cold',
      currentStacks: 5, currentDamageType: 'heat',
      adaptationCap: 0.9, overguardActive: false,
      damageIgnoresAdaptation: false,
    });
    expect(result.dr).toBe(0);
    expect(result.newStacks).toBe(1);
    expect(result.newDamageType).toBe('cold');
  });

  it('true damage bypasses adaptation', () => {
    const result = calculateAdaptation({
      incomingDamage: 100, damageType: 'true',
      currentStacks: 9, currentDamageType: 'true',
      adaptationCap: 0.9, overguardActive: false,
      damageIgnoresAdaptation: true,
    });
    expect(result.damageAfterAdaptation).toBe(100);
  });
});
