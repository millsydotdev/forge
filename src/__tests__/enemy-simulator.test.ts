import { describe, it, expect } from 'vitest';
import { scaleStats, calcEffectiveArmor, calcEhp } from '../engine/enemy-simulator';

describe('scaleStats', () => {
  it('returns base for level 1 (no scaling)', () => {
    expect(scaleStats(100, 1, 0.5)).toBe(100);
    expect(scaleStats(500, 1, 0.75)).toBe(500);
  });

  it('scales health with exponent 0.5', () => {
    // health * (1 + sqrt(level - 1))
    const result = scaleStats(100, 51, 0.5);
    expect(result).toBeCloseTo(100 * (1 + Math.sqrt(50)), 0);
  });

  it('scales shields with exponent 0.6', () => {
    const result = scaleStats(200, 101, 0.6);
    expect(result).toBeCloseTo(200 * (1 + Math.pow(100, 0.6)), 0);
  });

  it('scales armor with exponent 0.75', () => {
    const result = scaleStats(200, 100, 0.75);
    expect(result).toBeCloseTo(200 * (1 + Math.pow(99, 0.75)), 0);
  });

  it('clamps negative levels to 0 for exponent base', () => {
    const result = scaleStats(100, 0, 0.5);
    expect(result).toBe(100); // Math.max(0, -1) = 0, pow(0,0.5) = 0
  });

  it('handles level 2 edge case', () => {
    const result = scaleStats(100, 2, 0.5);
    expect(result).toBeCloseTo(100 * (1 + Math.pow(1, 0.5)), 0);
  });
});

describe('calcEffectiveArmor', () => {
  it('returns correct armor and DR at level 1 with no strip', () => {
    const result = calcEffectiveArmor(200, 1, 0, 0);
    // At level 1: scaleStats = 200 * (1 + 0^0.75) = 200
    // No strip or corrosive
    // DR = 200 / (200 + 300) = 0.4
    expect(result.armor).toBeCloseTo(200, 0);
    expect(result.dr).toBeCloseTo(0.4, 3);
  });

  it('applies armor strip fraction', () => {
    // 50% armor strip
    const result = calcEffectiveArmor(200, 1, 0.5, 0);
    expect(result.armor).toBeCloseTo(100, 0);
    expect(result.dr).toBeCloseTo(100 / 400, 3); // 0.25
  });

  it('applies corrosive stacks', () => {
    // 1 corrosive stack removes 26% of remaining armor
    const result = calcEffectiveArmor(200, 1, 0, 1);
    // scaled = 200
    // corrosiveReduction = 1 - (1 - 0.26^1) = 0.26
    // scaled = 200 * 1 * 0.74 = 148
    expect(result.armor).toBeCloseTo(148, 0);
  });

  it('applies multiple corrosive stacks', () => {
    const result = calcEffectiveArmor(200, 1, 0, 4);
    // corrosiveReduction = 0.74^4 (each stack removes 26% of remaining)
    const corrosiveReduction = Math.pow(0.74, 4);
    expect(result.armor).toBeCloseTo(200 * corrosiveReduction, 0);
  });

  it('combines armor strip and corrosive stacks', () => {
    const result = calcEffectiveArmor(1000, 50, 0.3, 2);
    // scaled = 1000 * (1 + 49^0.75)
    // corrosiveReduction = 0.74^2
    // final = scaled * (1 - 0.3) * corrosiveReduction
    const scaled = 1000 * (1 + Math.pow(49, 0.75));
    const corrosiveReduction = Math.pow(0.74, 2);
    const expectedArmor = scaled * 0.7 * corrosiveReduction;
    expect(result.armor).toBeCloseTo(expectedArmor, 0);
    expect(result.dr).toBeCloseTo(expectedArmor / (expectedArmor + 300), 3);
  });

  it('handles full armor strip (armorStripped = 1)', () => {
    const result = calcEffectiveArmor(200, 50, 1, 0);
    expect(result.armor).toBe(0);
    expect(result.dr).toBe(0);
  });

  it('handles >100% armor strip (armor clamped to 0, DR goes negative)', () => {
    const result = calcEffectiveArmor(200, 1, 2, 0);
    // scaled = 200, scaled * (1-2) = -200
    // Math.max(0, -200) = 0, but dr = -200 / (-200+300) = -2
    expect(result.armor).toBe(0);
    expect(result.dr).toBeLessThan(0);
  });

  it('handles high corrosive stacks (10+)', () => {
    const result = calcEffectiveArmor(20000, 100, 0, 10);
    const corrosiveReduction = Math.pow(0.74, 10);
    const scaled = 20000 * (1 + Math.pow(99, 0.75));
    const expectedArmor = scaled * corrosiveReduction;
    expect(result.armor).toBeCloseTo(expectedArmor, 0);
    expect(result.dr).toBeGreaterThan(0);
    expect(result.dr).toBeLessThan(1);
  });
});

describe('calcEhp', () => {
  it('calculates EHP at level 1 with no strip', () => {
    const result = calcEhp(300, 200, 200, 1, 0, 0);
    // health = 300, shields = 200
    // DR = 200/(200+300) = 0.4
    // EHP = 300/(1-0.4) + 200 = 500 + 200 = 700
    expect(result.health).toBeCloseTo(300, 0);
    expect(result.shields).toBeCloseTo(200, 0);
    expect(result.armor).toBeCloseTo(200, 0);
    expect(result.dr).toBeCloseTo(0.4, 2);
    expect(result.ehp).toBe(700);
  });

  it('calculates EHP at higher levels', () => {
    const result = calcEhp(300, 200, 200, 50, 0, 0);
    const scaledHealth = 300 * (1 + Math.sqrt(49)); // 300 * 8 = 2400
    const scaledShields = 200 * (1 + Math.pow(49, 0.6));
    const scaledArmor = 200 * (1 + Math.pow(49, 0.75));
    const dr = scaledArmor / (scaledArmor + 300);
    const expectedEhp = Math.round(scaledHealth / (1 - dr) + scaledShields);
    expect(result.health).toBeCloseTo(scaledHealth, 0);
    expect(result.armor).toBeCloseTo(scaledArmor, 0);
    expect(result.ehp).toBe(expectedEhp);
  });

  it('EHP increases with armor strip (less DR = more health damage)', () => {
    const noStrip = calcEhp(300, 200, 200, 50, 0, 0);
    const stripped = calcEhp(300, 200, 200, 50, 0.5, 0);
    expect(stripped.ehp).toBeLessThan(noStrip.ehp);
  });
});
