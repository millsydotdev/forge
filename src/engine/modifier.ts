/**
 * Modifier — the atomic stat change produced by one item.
 *
 * Two categories cover Warframe math:
 *
 *   FLAT       → summed with other FLAT modifiers in the same group
 *   MULTIPLIER → summed with other MULTIPLIER modifiers in the same group,
 *                 then applied as (1 + sum) × total(FLAT)
 *
 * Example (Serration + Heavy Caliber on Braton):
 *   Braton base:   { stat: 'base_damage', category: FLAT,      value: 29 }
 *   Serration:     { stat: 'base_damage', category: MULTIPLIER, value: 1.65 }
 *   Heavy Caliber: { stat: 'base_damage', category: MULTIPLIER, value: 1.65 }
 *   ─────────────────────────────────────────────────────────────────────────
 *   FLAT sum = 29       │  MULTIPLIER sum = 3.30  │  result = 29 × (1 + 3.30) = 124.7
 */

export type ModifierCategory = 'FLAT' | 'MULTIPLIER';

/**
 * Optional condition that controls when a modifier is active.
 * Galvanized on-kill bonuses, on-headshot stacking buffs, aim-glide
 * conditionals, etc. only apply when their trigger is satisfied.
 */
export interface ModifierCondition {
  type:
    | 'onKill'
    | 'onHeadshot'
    | 'onHeadshotKill'
    | 'onSlashProc'
    | 'galvanizedStacks'
    | 'onAimGlide'
    | 'onWallLatch'
    | 'onSlide'
    | 'onSpawn'
    | 'onMeleeKill'
    | 'onCriticalHit'
    | 'onStatusEffect'
    | 'airborne'
    | 'whenCrouching'
    | 'whenBlocking'
    | 'onLiftedEnemy'
    | 'whileInvisible'
    | 'perComboMultiplier'
    | 'perSchoolMod'
    | 'weakPoint'
    | 'finalShot'
    | 'markedZone'
    | 'onHealthPickup'
    | 'onEnergyPickup'
    | 'onAmmoPickup'
    | 'onMercy'
    | 'onHacking';
  /** For stackable bonuses (Galvanized): max stacks the value can be multiplied by. */
  maxStacks?: number;
}

export interface Modifier {
  /** Target stat — e.g. 'base_damage', 'crit_chance', 'strength' */
  stat: string;

  /** How this value combines with others in the same stackingGroup */
  category: ModifierCategory;

  /** Numeric value. FLAT: raw number; MULTIPLIER: 1.65 = +165% */
  value: number;

  /** Items sharing this key are processed together */
  stackingGroup: string;

  /** Human-readable source for tooltips */
  source: string;

  /** Lower runs first (0 = base values, 1 = mods) */
  priority: number;

  /** Optional condition — modifier only applies when this trigger is active. */
  condition?: ModifierCondition;

  /**
   * Traceability fields — identify where this modifier came from.
   * These enable the Formula Explorer to answer:
   *   "Why does this value exist?"
   *   "Which effects contributed?"
   *   "Which formulas were used?"
   */
  sourceType?: 'mod' | 'arcane' | 'shard' | 'passive' | 'ability' | 'buff' | 'focus' | 'set_bonus' | 'base' | 'effect' | 'unknown';
  /** Knowledge Base entry ID for the formula that produced this modifier */
  kbRef?: string;
  /** Reference ID of the source item (WFCD uniqueName) */
  sourceRef?: string;
}
