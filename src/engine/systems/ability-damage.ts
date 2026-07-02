/**
 * Ability Damage Framework
 *
 * Calculates damage for warframe abilities using their in-game formulas.
 *
 * Standard abilities: damage = base × abilityStrength
 * Pseudo-exalted (stat-stick): damage = (base + weaponModDamage) × strength
 * Channeled: energyPerSecond = baseCost × (2 - efficiency)
 * Duration-based: duration = baseDuration × abilityDuration
 * Toggle: energy on cast + energy per second
 */

import type { CalculatedStats } from '../stat-processor/types';

export interface AbilityDamageParams {
  abilityName: string;
  baseDamage: number;
  baseDuration: number;
  baseRange: number;
  baseCost: number;
  castTime: number;
  cooldown: number;
  strength: number;
  duration: number;
  range: number;
  efficiency: number;
  isChanneled: boolean;
  damageType: string;
  scalingStat: 'strength' | 'duration' | 'range' | 'efficiency';
  scalingFactor: number;
  usesStatStick: boolean;
  statStickDamage?: number;
  dotDamage?: boolean;
  dotDuration?: number;
}

export interface AbilityDamageResult {
  damagePerCast: number;
  damagePerSecond: number;
  sustainedDps: number;
  effectiveDuration: number;
  effectiveRange: number;
  energyCost: number;
  energyPerSecond: number;
}

/**
 * Calculate final ability damage accounting for the specific scaling stat.
 * Most abilities scale with strength, but some scale with range or duration.
 */
function calculateScaledDamage(
  baseDamage: number,
  scalingStatValue: number,
  scalingFactor: number,
  statStickDamage: number,
  usesStatStick: boolean,
): number {
  const base = usesStatStick ? baseDamage + (statStickDamage || 0) : baseDamage;
  return base * (1 + (scalingStatValue - 1) * scalingFactor);
}

/**
 * Calculate energy cost.
 * Channeled: cost = base × (2 - efficiency) per second
 * Standard: cost = base × (2 - efficiency) per cast (clamped min 25%)
 */
function calculateEnergyCost(
  baseCost: number,
  efficiency: number,
  isChanneled: boolean,
): { costPerCast: number; costPerSecond: number } {
  const effectiveEff = Math.min(efficiency, 1.75);
  const costMult = Math.max(2 - effectiveEff, 0.25);

  if (isChanneled) {
    return { costPerCast: 0, costPerSecond: baseCost * costMult };
  }
  const cost = baseCost * costMult;
  return { costPerCast: Math.max(Math.round(cost), 0), costPerSecond: 0 };
}

/**
 * Calculate full ability damage and efficiency metrics.
 */
export function calculateAbilityDamage(params: AbilityDamageParams): AbilityDamageResult {
  const {
    baseDamage,
    baseDuration,
    baseRange,
    baseCost,
    castTime,
    cooldown,
    strength,
    duration,
    range,
    efficiency,
    isChanneled,
    scalingStat,
    scalingFactor,
    usesStatStick,
    statStickDamage = 0,
  } = params;

  // Determine which stat drives damage scaling
  const scalingStatValue = scalingStat === 'strength' ? strength
    : scalingStat === 'duration' ? duration
    : scalingStat === 'range' ? range
    : efficiency;

  const scaledDamage = calculateScaledDamage(
    baseDamage, scalingStatValue, scalingFactor, statStickDamage, usesStatStick,
  );

  const effectiveDuration = baseDuration * duration;
  const effectiveRange = baseRange * range;
  const { costPerCast, costPerSecond } = calculateEnergyCost(baseCost, efficiency, isChanneled);

  // DPS calculation
  const effectiveCastTime = castTime + cooldown;
  const damagePerSecond = effectiveCastTime > 0 ? scaledDamage / effectiveCastTime : scaledDamage;
  const sustainedDps = isChanneled
    ? scaledDamage / 1 // channeled: per-second tick
    : scaledDamage / Math.max(effectiveCastTime, 0.1);

  return {
    damagePerCast: Math.round(scaledDamage),
    damagePerSecond: Math.round(damagePerSecond),
    sustainedDps: Math.round(sustainedDps),
    effectiveDuration,
    effectiveRange,
    energyCost: costPerCast,
    energyPerSecond: costPerSecond,
  };
}

/**
 * Get all ability damage results for a warframe from the CalculatedStats.
 */
export function getAbilityDamageResults(_result: CalculatedStats): Record<string, AbilityDamageResult> {
  // This would pull from per-warframe ability definitions.
  // For now returns empty — framework is in place for the data layer.
  return {};
}
