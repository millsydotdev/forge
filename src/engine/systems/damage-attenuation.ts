/**
 * Damage Attenuation System
 *
 * Used by Archons, Demolishers, Exploiters, and other boss enemies
 * to prevent one-shot kills from high-burst weapons.
 *
 * Two primary variants:
 *   1. Threshold-based: damage below threshold passes, above is reduced
 *   2. DR-based: increasing DR against repeated high-damage hits
 *
 * Reference: DE design concept (2019-present), community testing
 */

export type AttenuationType = 'threshold' | 'dr_based' | 'hybrid';

export interface DamageAttenuationParams {
  type: AttenuationType;
  baseDamage: number;
  rawDamage: number;
  threshold?: number;
  attenuationFactor?: number;
  attenuationConstant?: number;
  recentDamageHistory?: number[];
}

export interface DamageAttenuationResult {
  finalDamage: number;
  attenuationApplied: number;
  effectiveDr: number;
}

const DEFAULT_THRESHOLD = 2000;
const DEFAULT_ATTENUATION_FACTOR = 0.05;
const DEFAULT_DR_CONSTANT = 0.0002;

/**
 * Threshold-based attenuation (Archons, Exploiters):
 *   if rawDamage < threshold: final = rawDamage
 *   else: final = threshold + (rawDamage - threshold) × factor
 *
 * This allows moderate damage to pass through but heavily reduces
 * extreme burst damage.
 */
function thresholdAttenuation(
  rawDamage: number,
  threshold: number,
  factor: number,
): DamageAttenuationResult {
  if (rawDamage <= threshold) {
    return { finalDamage: rawDamage, attenuationApplied: 0, effectiveDr: 0 };
  }
  const excess = rawDamage - threshold;
  const reduced = threshold + excess * factor;
  const applied = rawDamage - reduced;
  return {
    finalDamage: reduced,
    attenuationApplied: applied,
    effectiveDr: applied / rawDamage,
  };
}

/**
 * DR-based attenuation (Demolishers):
 *   effectiveDR = 1 - 1 / (1 + rawDamage × constant)
 *
 * As raw damage increases, effective DR asymptotically approaches 100%.
 * This heavily penalizes extremely high-damage weapons.
 */
function drBasedAttenuation(
  rawDamage: number,
  constant: number,
): DamageAttenuationResult {
  const effectiveDr = 1 - (1 / (1 + rawDamage * constant));
  const finalDamage = rawDamage * (1 - effectiveDr);
  return {
    finalDamage: Math.max(finalDamage, 1),
    attenuationApplied: rawDamage - finalDamage,
    effectiveDr,
  };
}

/**
 * Hybrid attenuation:
 *   First apply threshold, then DR-based on the excess.
 *   Prevents both one-shots and rapid multi-kills.
 */
function hybridAttenuation(
  rawDamage: number,
  threshold: number,
  factor: number,
  constant: number,
): DamageAttenuationResult {
  const firstPass = thresholdAttenuation(rawDamage, threshold, factor);
  if (firstPass.finalDamage === rawDamage) return firstPass;
  return drBasedAttenuation(firstPass.finalDamage, constant * 0.1);
}

/**
 * Resolve damage after applying the enemy's attenuation.
 */
export function applyDamageAttenuation(
  params: DamageAttenuationParams,
): DamageAttenuationResult {
  const {
    type,
    rawDamage,
    threshold = DEFAULT_THRESHOLD,
    attenuationFactor = DEFAULT_ATTENUATION_FACTOR,
    attenuationConstant = DEFAULT_DR_CONSTANT,
  } = params;

  switch (type) {
    case 'threshold':
      return thresholdAttenuation(rawDamage, threshold, attenuationFactor);
    case 'dr_based':
      return drBasedAttenuation(rawDamage, attenuationConstant);
    case 'hybrid':
      return hybridAttenuation(rawDamage, threshold, attenuationFactor, attenuationConstant);
    default:
      return { finalDamage: rawDamage, attenuationApplied: 0, effectiveDr: 0 };
  }
}

/**
 * Known enemies with damage attenuation and their parameters.
 * Populated from game data; defaults used where exact values unknown.
 */
export interface AttenuatedEnemyDef {
  name: string;
  type: AttenuationType;
  threshold: number;
  factor: number;
  constant: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

export const ATTENUATED_ENEMIES: Record<string, AttenuatedEnemyDef> = {
  'Archon':      { name: 'Archon', type: 'threshold', threshold: 2000, factor: 0.05, constant: 0, confidence: 'MEDIUM' },
  'Demolyst':    { name: 'Demolyst', type: 'dr_based', threshold: 0, factor: 0, constant: 0.0002, confidence: 'MEDIUM' },
  'Demolisher':  { name: 'Demolisher', type: 'dr_based', threshold: 0, factor: 0, constant: 0.0002, confidence: 'MEDIUM' },
  'Exploiter':   { name: 'Exploiter', type: 'threshold', threshold: 3000, factor: 0.03, constant: 0, confidence: 'LOW' },
  'Profit-Taker':{ name: 'Profit-Taker', type: 'hybrid', threshold: 5000, factor: 0.1, constant: 0.0001, confidence: 'LOW' },
};

export function isAttenuatedEnemy(name: string): boolean {
  return Object.keys(ATTENUATED_ENEMIES).some(key => name.toLowerCase().includes(key.toLowerCase()));
}

export function getAttenuationForEnemy(name: string): DamageAttenuationParams {
  for (const [key, def] of Object.entries(ATTENUATED_ENEMIES)) {
    if (name.toLowerCase().includes(key.toLowerCase())) {
      return {
        type: def.type,
        baseDamage: 0,
        rawDamage: 0,
        threshold: def.threshold,
        attenuationFactor: def.factor,
        attenuationConstant: def.constant,
      };
    }
  }
  return { type: 'threshold', baseDamage: 0, rawDamage: 0 };
}
