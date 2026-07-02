export interface Ability {
  strength: number;
  duration: number;
  range: number;
  efficiency: number;
}

export interface AbilityMod {
  name: string;
  strength?: number;
  duration?: number;
  range?: number;
  efficiency?: number;
}

const EFFICIENCY_CAP = 1.75;

/**
 * Calculates final Warframe ability stats after applying all mod bonuses.
 *
 * Each stat sums its percentage modifiers additively, then multiplies the
 * base value by (1 + totalBonus).
 *
 *   finalStat = baseStat × (1 + sumOfBonuses)
 *
 * A +30% strength mod adds 0.30. If two such mods are equipped, total
 * bonus = 0.60, and final = base × 1.60.
 *
 * Efficiency is clamped to a maximum of 175% (1.75) — the Warframe hard cap.
 * Over-extended + Fleeting Expertise can push raw efficiency above this;
 * the excess is discarded.
 */
export function calculateAbilityStats(
  base: Ability,
  mods: AbilityMod[],
): Ability {
  const sum = { strength: 0, duration: 0, range: 0, efficiency: 0 };

  for (const mod of mods) {
    sum.strength += mod.strength ?? 0;
    sum.duration += mod.duration ?? 0;
    sum.range += mod.range ?? 0;
    sum.efficiency += mod.efficiency ?? 0;
  }

  const efficiency = Math.min(
    base.efficiency * (1 + sum.efficiency),
    EFFICIENCY_CAP,
  );

  return {
    strength: base.strength * (1 + sum.strength),
    duration: base.duration * (1 + sum.duration),
    range: base.range * (1 + sum.range),
    efficiency,
  };
}
