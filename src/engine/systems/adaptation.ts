/**
 * Adaptation System
 *
 * Adaptation mod grants stacking damage resistance against
 * the most recently received damage type.
 *
 * Rules:
 * - Starts at 0% resistance
 * - Each hit of a new type adds 1 stack (10% resistance)
 * - Max 90% resistance to a single type (9-10 stacks)
 * - Max 1 type tracked at a time (resets when new type is taken)
 * - 90% DR cap for all types (NOT 100%)
 * - Does NOT apply to overguard damage
 * - Does NOT apply to true damage (toxin bypasses shields, slash bypasses armor)
 *
 * Formula:
 *   adaptationDR = min(0.90, stacks × 0.10)
 *   effectiveDamage = incomingDamage × (1 - min(adaptationDR, 0.90))
 */

export interface AdaptationParams {
  incomingDamage: number;
  damageType: string;
  currentStacks: number;
  currentDamageType: string;
  adaptationCap: number;
  overguardActive: boolean;
  damageIgnoresAdaptation: boolean;
}

export interface AdaptationResult {
  damageReduced: boolean;
  dr: number;
  damageAfterAdaptation: number;
  newStacks: number;
  newDamageType: string;
}

const ADAPTATION_DR_PER_STACK = 0.10;
const ADAPTATION_MAX_DR = 0.90;
const ADAPTATION_MAX_STACKS = 10;
const ADAPTATION_NEW_TYPE_RESET = true;

/**
 * Damage types that bypass Adaptation:
 * - True damage (finishers, some abilities)
 * - Toxin (bypasses shields, Adaptation may apply to health only)
 * - Slash bleed (true damage, ignores all DR)
 */
const BYPASSES_ADAPTATION = new Set(['true', 'tau']);

export function calculateAdaptation(params: AdaptationParams): AdaptationResult {
  const {
    incomingDamage,
    damageType,
    currentStacks,
    currentDamageType,
    overguardActive,
    damageIgnoresAdaptation,
  } = params;

  // Overguard: Adaptation does NOT apply
  if (overguardActive) {
    return {
      damageReduced: false,
      dr: 0,
      damageAfterAdaptation: incomingDamage,
      newStacks: currentStacks,
      newDamageType: currentDamageType,
    };
  }

  // Some damage types bypass Adaptation entirely
  if (damageIgnoresAdaptation || BYPASSES_ADAPTATION.has(damageType)) {
    return {
      damageReduced: false,
      dr: 0,
      damageAfterAdaptation: incomingDamage,
      newStacks: currentStacks,
      newDamageType: currentDamageType,
    };
  }

  // Check if the incoming damage type matches the currently tracked type
  const isSameType = damageType === currentDamageType;

  if (isSameType) {
    // Same type: stacks accumulate, DR increases
    const newStacks = Math.min(currentStacks + 1, ADAPTATION_MAX_STACKS);
    const dr = Math.min(newStacks * ADAPTATION_DR_PER_STACK, ADAPTATION_MAX_DR);
    const damageAfterAdaptation = incomingDamage * (1 - dr);

    return {
      damageReduced: true,
      dr,
      damageAfterAdaptation,
      newStacks,
      newDamageType: currentDamageType,
    };
  }

  // New damage type: reset stacks (if ADAPTATION_NEW_TYPE_RESET is true)
  // or build separate stack for new type (if false)
  if (ADAPTATION_NEW_TYPE_RESET) {
    return {
      damageReduced: false,
      dr: 0,
      damageAfterAdaptation: incomingDamage,
      newStacks: 1,
      newDamageType: damageType,
    };
  }

  // Multi-type tracking (future: track map of type→stacks)
  return {
    damageReduced: false,
    dr: 0,
    damageAfterAdaptation: incomingDamage,
    newStacks: 1,
    newDamageType: damageType,
  };
}

/**
 * Calculate effective EHP multiplier from Adaptation at max stacks.
 */
export function adaptationMaxEhpMultiplier(): number {
  return 1 / (1 - ADAPTATION_MAX_DR);
}
