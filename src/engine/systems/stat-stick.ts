/**
 * Stat-Stick System
 *
 * Some warframe abilities scale with equipped melee weapon mods.
 * These abilities use "stat sticks" — weapons that only exist to
 * provide mod bonuses to the ability.
 *
 * Affected abilities:
 *   - Gara: Shattered Lash (1)
 *   - Atlas: Landslide (1)
 *   - Khora: Whipclaw (1)
 *   - Ash: Blade Storm (4, with augment)
 *   - Excalibur: Slash Dash (1) — partial
 *   - Valkyr: Warcry (2) — melee speed only
 *
 * The stat-stick weapon's damage mods, elemental mods, and rivens
 * all contribute to the ability's base damage.
 */

export const STAT_STICK_ABILITIES: Record<string, {
  abilityName: string;
  slotIndex: number;
  scalesWith: ('damage' | 'elemental' | 'crit' | 'status' | 'riven')[];
  damageShare: number;
}> = {
  'Gara':       { abilityName: 'Shattered Lash', slotIndex: 1, scalesWith: ['damage', 'elemental'], damageShare: 0.5 },
  'Atlas':      { abilityName: 'Landslide', slotIndex: 1, scalesWith: ['damage', 'elemental', 'crit', 'riven'], damageShare: 1.0 },
  'Khora':      { abilityName: 'Whipclaw', slotIndex: 1, scalesWith: ['damage', 'elemental', 'crit', 'status', 'riven'], damageShare: 1.0 },
  'Ash':        { abilityName: 'Blade Storm', slotIndex: 4, scalesWith: ['damage'], damageShare: 0.35 },
  'Excalibur':  { abilityName: 'Slash Dash', slotIndex: 1, scalesWith: ['damage'], damageShare: 0.25 },
  'Valkyr':     { abilityName: 'Warcry', slotIndex: 2, scalesWith: ['damage'], damageShare: 0.0 }, // melee speed only
};

export interface StatStickParams {
  warframeName: string;
  abilitySlotIndex: number;
  statStickWeaponId: string;
  totalDamageFromMods: number;
  elementalDamageFromMods: number;
  critChanceFromMods: number;
  statusChanceFromMods: number;
  rivenDisposition: number;
  rivenBonuses: Record<string, number>;
}

export interface StatStickResult {
  usesStatStick: boolean;
  bonusDamage: number;
  bonusElemental: number;
  bonusCritChance: number;
  bonusStatusChance: number;
  totalDamageContribution: number;
}

/**
 * Calculate the damage contribution from a stat-stick weapon to an ability.
 *
 * Formula (simplified):
 *   contribution = sumOfRelevantModBonuses × damageShare
 *
 * Where relevant mods depend on the ability's scalesWith configuration.
 */
export function calculateStatStickContribution(params: StatStickParams): StatStickResult {
  const { warframeName, abilitySlotIndex, totalDamageFromMods, rivenDisposition } = params;

  // Find matching ability definition
  const def = Object.entries(STAT_STICK_ABILITIES).find(([key]) =>
    warframeName.toLowerCase().includes(key.toLowerCase()),
  )?.[1];
  if (!def || def.slotIndex !== abilitySlotIndex) {
    return {
      usesStatStick: false, bonusDamage: 0, bonusElemental: 0,
      bonusCritChance: 0, bonusStatusChance: 0, totalDamageContribution: 0,
    };
  }

  let contribution = 0;

  if (def.scalesWith.includes('damage')) {
    contribution += totalDamageFromMods * def.damageShare;
  }
  if (def.scalesWith.includes('elemental')) {
    contribution += params.elementalDamageFromMods * def.damageShare;
  }
  if (def.scalesWith.includes('riven')) {
    // Riven bonuses scale with disposition
    const rivenContribution = Object.values(params.rivenBonuses).reduce((s, v) => s + v, 0);
    contribution += rivenContribution * rivenDisposition * 0.5;
  }

  return {
    usesStatStick: true,
    bonusDamage: Math.round(totalDamageFromMods * def.damageShare),
    bonusElemental: Math.round(params.elementalDamageFromMods * def.damageShare),
    bonusCritChance: def.scalesWith.includes('crit') ? params.critChanceFromMods * 0.5 : 0,
    bonusStatusChance: def.scalesWith.includes('status') ? params.statusChanceFromMods * 0.5 : 0,
    totalDamageContribution: Math.round(contribution),
  };
}

/**
 * Determine if a warframe ability uses a stat stick.
 */
export function isStatStickAbility(warframeName: string, abilitySlotIndex: number): boolean {
  return Object.entries(STAT_STICK_ABILITIES).some(([key, def]) =>
    warframeName.toLowerCase().includes(key.toLowerCase()) && def.slotIndex === abilitySlotIndex,
  );
}
