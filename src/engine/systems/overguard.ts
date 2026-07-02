/**
 * Overguard System
 *
 * Overguard is a separate health bar with specific damage rules:
 * - 50% DR from all sources (innate)
 * - NOT affected by faction damage type multipliers
 * - Immune to status effects while overguard active
 * - Not affected by stealth multipliers
 * - Adaptation does NOT apply to overguard
 * - Not affected by damage type modifiers against health/shields
 */

export interface OverguardParams {
  maxOverguard: number;
  currentOverguard: number;
  rawDamage: number;
  damageType?: string;
  factionMultiplier: number;
  isSteelPath: boolean;
}

export interface OverguardResult {
  damageToOverguard: number;
  overguardRemaining: number;
  overguardDamageReduction: number;
  excessDamageToHealth: number;
  overguardActive: boolean;
}

const OVERGUARD_INNATE_DR = 0.5;

/**
 * Calculate damage against overguard.
 * Overguard has 50% innate DR and ignores faction multipliers.
 */
export function calculateOverguardDamage(params: OverguardParams): OverguardResult {
  const {
    currentOverguard,
    rawDamage,
  } = params;

  const overguardActive = currentOverguard > 0;
  if (!overguardActive) {
    return {
      damageToOverguard: 0,
      overguardRemaining: 0,
      overguardDamageReduction: 0,
      excessDamageToHealth: rawDamage,
      overguardActive: false,
    };
  }

  // Overguard DR applies regardless of faction multipliers
  const ogDr = OVERGUARD_INNATE_DR;
  const damageAfterDr = rawDamage * (1 - ogDr);

  // Faction multipliers do NOT affect overguard damage
  // (confirmed by DE and community testing)
  const damageToOverguard = damageAfterDr;

  if (damageToOverguard >= currentOverguard) {
    const excess = damageToOverguard - currentOverguard;
    return {
      damageToOverguard: currentOverguard,
      overguardRemaining: 0,
      overguardDamageReduction: ogDr,
      excessDamageToHealth: excess,
      overguardActive: false,
    };
  }

  return {
    damageToOverguard,
    overguardRemaining: currentOverguard - damageToOverguard,
    overguardDamageReduction: ogDr,
    excessDamageToHealth: 0,
    overguardActive: true,
  };
}

/**
 * Calculate the effective EHP contributed by overguard.
 * Takes into account the 50% innate DR.
 */
export function overguardEffectiveHp(maxOverguard: number): number {
  return maxOverguard / (1 - OVERGUARD_INNATE_DR);
}

/**
 * Determine whether a status effect can be applied given overguard status.
 * Overguard grants immunity to all status effects while active.
 */
export function canApplyStatus(overguardActive: boolean): boolean {
  return !overguardActive;
}
