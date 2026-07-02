/**
 * Warframe Ability Definitions — DATA DRIVEN
 *
 * Ability names, descriptions, slots, and passives come from WFCD
 * via game-data.json. Only damage formulas, augment effects, and
 * scaling rules that cannot be expressed as data are hardcoded here.
 *
 * MILESTONE 3: 118 warframes now data-driven via WFCD.
 * Manual hardcodes only for damage formulas unknown in game data.
 */

import { gameData } from '../../data/game-data';

export interface AbilityDef {
  name: string;
  slotIndex: number;
  baseDamage: number;
  baseDuration: number;
  baseRange: number;
  baseCost: number;
  castTime: number;
  cooldown: number;
  isChanneled: boolean;
  damageType: string;
  scalingStat: 'strength' | 'duration' | 'range' | 'efficiency';
  scalingFactor: number;
  usesStatStick: boolean;
  dotDamage: boolean;
  dotDuration: number;
  augments: AugmentDef[];
  notes: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface AugmentDef {
  name: string;
  modifies: string;
  description: string;
  stat?: string;
  value?: number;
  category?: 'FLAT' | 'MULTIPLIER';
  condition?: string;
}

export interface WarframeAbilityDef {
  uniqueName: string;
  name: string;
  passive: string;
  passiveEffects: { stat: string; value: number; category: 'FLAT' | 'MULTIPLIER' }[];
  abilities: AbilityDef[];
  exaltedWeapon?: string;
  exaltedSlot?: string;
  helminthAbility?: string;
  notes: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

/**
 * Hardcoded ability damage formulas.
 * Only for abilities where baseDamage/scaling cannot be derived from
 * WFCD data. Each entry is a partial that patches over the baseline
 * of zero-damage (buffs/heals/debuffs).
 */
const ABILITY_DAMAGE_OVERRIDES: Record<string, Partial<AbilityDef>> = {
  // Ash
  'Shuriken': { baseDamage: 250, scalingFactor: 1, damageType: 'Slash', dotDamage: true, dotDuration: 6, baseCost: 25, baseDuration: 0, baseRange: 50 },
  'Blade Storm': { baseDamage: 2000, scalingFactor: 1, damageType: 'True', usesStatStick: true, baseCost: 100, baseDuration: 0, baseRange: 50 },
  // Excalibur
  'Slash Dash': { baseDamage: 500, scalingFactor: 1, damageType: 'Slash', usesStatStick: true, baseCost: 25, baseDuration: 0, baseRange: 20 },
  'Radial Javelin': { baseDamage: 500, scalingFactor: 1, damageType: 'Puncture', baseCost: 75, baseDuration: 0, baseRange: 25 },
  'Exalted Blade': { baseDamage: 250, scalingFactor: 1, damageType: 'Slash', isChanneled: true, baseCost: 25, baseDuration: 0, baseRange: 0 },
  // Rhino
  'Rhino Charge': { baseDamage: 400, scalingFactor: 1, damageType: 'Impact', baseCost: 25, baseDuration: 0, baseRange: 15 },
  'Rhino Stomp': { baseDamage: 800, scalingFactor: 1, damageType: 'Blast', baseCost: 100, baseDuration: 8, baseRange: 20 },
  // Saryn
  'Spores': { baseDamage: 25, scalingFactor: 1, damageType: 'Toxin', dotDamage: true, dotDuration: 12, baseCost: 25, baseDuration: 0, baseRange: 40 },
  'Miasma': { baseDamage: 875, scalingFactor: 1, damageType: 'Toxin', dotDamage: true, dotDuration: 6, baseCost: 100, baseDuration: 0, baseRange: 20 },
  // Mag
  'Pull': { baseDamage: 300, scalingFactor: 1, damageType: 'Magnetic', baseCost: 25, baseDuration: 0, baseRange: 25 },
  'Magnetize': { baseDamage: 200, scalingFactor: 1, damageType: 'Magnetic', baseCost: 50, baseDuration: 10, baseRange: 10 },
  'Polarize': { baseDamage: 250, scalingFactor: 1, damageType: 'Magnetic', baseCost: 75, baseDuration: 0, baseRange: 25 },
  'Crush': { baseDamage: 1500, scalingFactor: 1, damageType: 'Magnetic', baseCost: 100, baseDuration: 0, baseRange: 18 },
  // Volt
  'Shock': { baseDamage: 200, scalingFactor: 1, damageType: 'Electric', baseCost: 25, baseDuration: 0, baseRange: 25 },
  'Discharge': { baseDamage: 750, scalingFactor: 1, damageType: 'Electric', baseCost: 100, baseDuration: 0, baseRange: 20 },
  // Mesa
  'Peacemaker': { baseDamage: 750, scalingFactor: 1, damageType: 'Puncture', isChanneled: true, baseCost: 25, baseDuration: 0, baseRange: 50 },
  // Nova
  'Null Star': { baseDamage: 200, scalingFactor: 1, damageType: 'Slash', baseCost: 25, baseDuration: 0, baseRange: 0 },
  'Antimatter Drop': { baseDamage: 12000, scalingFactor: 1, damageType: 'Blast', baseCost: 25, baseDuration: 0, baseRange: 0 },
  'Molecular Prime': { baseDamage: 100, scalingFactor: 1, damageType: 'Blast', baseCost: 100, baseDuration: 30, baseRange: 25 },
  // Frost
  'Freeze': { baseDamage: 300, scalingFactor: 1, damageType: 'Cold', baseCost: 25, baseDuration: 0, baseRange: 35 },
  'Ice Wave': { baseDamage: 350, scalingFactor: 1, damageType: 'Cold', baseCost: 50, baseDuration: 0, baseRange: 20 },
  'Avalanche': { baseDamage: 1000, scalingFactor: 1, damageType: 'Cold', baseCost: 100, baseDuration: 8, baseRange: 20 },
  // Ember
  'Fireball': { baseDamage: 400, scalingFactor: 1, damageType: 'Heat', dotDamage: true, dotDuration: 6, baseCost: 25, baseDuration: 0, baseRange: 40 },
  'Fire Blast': { baseDamage: 600, scalingFactor: 1, damageType: 'Heat', baseCost: 50, baseDuration: 0, baseRange: 10 },
  'Inferno': { baseDamage: 800, scalingFactor: 1, damageType: 'Heat', dotDamage: true, dotDuration: 6, baseCost: 100, baseDuration: 0, baseRange: 30 },
  // Gauss
  'Mach Rush': { baseDamage: 400, scalingFactor: 1, damageType: 'Impact', baseCost: 25, baseDuration: 0, baseRange: 0 },
  'Thermal Sunder': { baseDamage: 500, scalingFactor: 1, damageType: 'Heat', baseCost: 25, baseDuration: 0, baseRange: 10 },
  // Wisp
  'Breach Surge': { baseDamage: 500, scalingFactor: 1, damageType: 'Radiation', baseCost: 75, baseDuration: 12, baseRange: 25 },
  'Sol Gate': { baseDamage: 2000, scalingFactor: 1, damageType: 'Heat', isChanneled: true, baseCost: 25, baseDuration: 0, baseRange: 30 },
  // Vauban
  'Tesla Nervos': { baseDamage: 100, scalingFactor: 1, damageType: 'Electric', baseCost: 25, baseDuration: 12, baseRange: 25 },
  'Photostrike': { baseDamage: 4000, scalingFactor: 1, damageType: 'Radiation', baseCost: 25, baseDuration: 0, baseRange: 50 },
  // Nekros
  'Soul Punch': { baseDamage: 500, scalingFactor: 1, damageType: 'Impact', baseCost: 25, baseDuration: 0, baseRange: 30 },
  // Trinity
  'Energy Vampire': { baseDamage: 0, scalingFactor: 0, damageType: 'Buff', baseCost: 50, baseDuration: 0, baseRange: 40 },
  // Loki
  'Radial Disarm': { baseDamage: 0, scalingFactor: 0, damageType: 'Buff', baseCost: 100, baseDuration: 15, baseRange: 25 },
};

/**
 * Augment overrides — manually curated from wiki data since WFCD
 * does not expose augment mechanics as structured data.
 */
const AUGMENT_OVERRIDES: Record<string, AugmentDef[]> = {
  'Shuriken': [{ name: 'Seeking Shuriken', modifies: 'Shuriken', description: 'Removes 100% armor on hit, +100% damage', stat: 'enemy_armor', value: -1, category: 'MULTIPLIER' }],
  'Smoke Screen': [{ name: 'Smoke Shadow', modifies: 'Smoke Screen', description: 'Invisibility applied to allies within 15m' }],
  'Blade Storm': [{ name: 'Rising Storm', modifies: 'Blade Storm', description: '+5s combo duration per kill from Blade Storm', stat: 'combo_duration', value: 5, category: 'FLAT' }],
  'Slash Dash': [{ name: 'Surging Dash', modifies: 'Slash Dash', description: '+1s invulnerability per enemy hit, max 3s' }],
  'Radial Blind': [{ name: 'Radiant Finish', modifies: 'Radial Blind', description: '+150% finisher damage to blinded enemies', stat: 'finisher_damage', value: 1.5, category: 'MULTIPLIER' }],
  'Radial Javelin': [{ name: 'Furious Javelin', modifies: 'Radial Javelin', description: '+50% melee damage per enemy hit, max 250%' }],
  'Exalted Blade': [{ name: 'Chromatic Blade', modifies: 'Exalted Blade', description: '+200% status chance, wave element from energy color', stat: 'status_chance', value: 2, category: 'MULTIPLIER' }],
  'Roar': [{ name: 'Piercing Roar', modifies: 'Roar', description: 'Strips 100% armor from enemies in range' }],
  'Rhino Charge': [{ name: 'Ironclad Charge', modifies: 'Rhino Charge', description: '+50% armor per enemy hit, max 250%' }],
  'Spores': [{ name: 'Venom Dose', modifies: 'Spores', description: 'Allies gain +80% Toxin damage to weapons' }],
  'Molten Strike': [{ name: 'Regenerative Molt', modifies: 'Molten Strike', description: 'Heals 50 health/s for 10s' }],
  'Miasma': [{ name: 'Revealing Spores', modifies: 'Miasma', description: 'Enemies visible through walls' }],
  'Pull': [{ name: 'Greedy Pull', modifies: 'Pull', description: 'Pulls energy orbs, ammo and resources' }],
  'Shock': [{ name: 'Shock Trooper', modifies: 'Shock', description: 'Allies gain +100% Electric damage to weapons' }],
  'Speed': [{ name: 'Shocking Speed', modifies: 'Speed', description: 'Deals 200 Electric damage/m sprinted near enemies' }],
  'Discharge': [{ name: 'Capacitance', modifies: 'Discharge', description: 'Restores 3% shields per enemy hit per tick' }],
  'Magnetize': [{ name: 'Magnetized Discharge', modifies: 'Magnetize', description: 'Hold to detonate bubble as AoE' }],
  'Freeze': [{ name: 'Freeze Force', modifies: 'Freeze', description: 'Allies gain +100% Cold damage to weapons' }],
  'Fireball': [{ name: 'Fireball Frenzy', modifies: 'Fireball', description: 'Allies gain +100% Heat damage to weapons' }],
};

/**
 * Passive effect overrides — manual because WFCD passives are prose text.
 */
const PASSIVE_EFFECTS: Record<string, { stat: string; value: number; category: 'FLAT' | 'MULTIPLIER' }[]> = {
  'Ash': [{ stat: 'status_damage', value: 0.25, category: 'MULTIPLIER' }],
  'Excalibur': [{ stat: 'attack_speed', value: 0.1, category: 'MULTIPLIER' }, { stat: 'base_damage', value: 0.1, category: 'MULTIPLIER' }],
  'Saryn': [{ stat: 'status_duration', value: 0.25, category: 'MULTIPLIER' }],
  'Volt': [{ stat: 'elemental_electric', value: 50, category: 'FLAT' }],
  'Loki': [{ stat: 'wall_latch_duration', value: 10, category: 'MULTIPLIER' }],
  'Wisp': [{ stat: 'base_damage', value: 0.5, category: 'MULTIPLIER' }],
  'Mesa': [{ stat: 'fire_rate', value: 0.25, category: 'MULTIPLIER' }],
  'Vauban': [{ stat: 'faction_damage_all', value: 0.25, category: 'MULTIPLIER' }],
  'Trinity': [{ stat: 'revive_speed', value: 0.25, category: 'MULTIPLIER' }],
  'Gauss': [{ stat: 'shield_recharge_delay', value: 0.5, category: 'MULTIPLIER' }],
  'Ember': [{ stat: 'strength', value: 0.35, category: 'MULTIPLIER' }],
};

/**
 * Known duration-based abilities (WFCD doesn't expose duration as structured data).
 * Format: abilityName -> baseDuration
 */
const KNOWN_DURATIONS: Record<string, number> = {
  'Roar': 30, 'Smoke Screen': 8, 'Invisibility': 12, 'Decoy': 12,
  'Radial Blind': 15, 'Radial Disarm': 15,
  'Wormhole': 0, 'Molecular Prime': 30,
  'Well of Life': 12, 'Energy Vampire': 0, 'Link': 20, 'Blessing': 0,
  'Terrify': 15, 'Desecrate': 0,
  'Iron Skin': 0, 'Rhino Stomp': 8,
  'Magnetize': 10, 'Polarize': 0,
  'Speed': 18, 'Electric Shield': 30, 'Discharge': 0,
  'Ballistic Battery': 0, 'Shooting Gallery': 30, 'Shatter Shield': 25,
  'Bastille': 20, 'Tesla Nervos': 12,
  'Snow Globe': 30, 'Avalanche': 8,
  'Spores': 0, 'Molten Strike': 0, 'Toxic Lash': 30,
  'Immolation': 0, 'Fire Blast': 0, 'Inferno': 0,
  'Mach Rush': 0, 'Kinetic Plating': 30, 'Thermal Sunder': 0, 'Redline': 30,
  'Reservoirs': 0, 'Breach Surge': 12, 'Sol Gate': 0,
  'Desiccation': 0, 'Fire Walker': 0, 'Rest & Rage': 0,
};

/**
 * Known range values for abilities.
 */
const KNOWN_RANGES: Record<string, number> = {
  'Roar': 25, 'Radial Blind': 25, 'Radial Disarm': 25,
  'Molecular Prime': 25, 'Terrify': 25,
  'Desecrate': 25, 'Bastille': 8, 'Snow Globe': 5,
  'Magnetize': 10, 'Crush': 18, 'Discharge': 20,
  'Shooting Gallery': 25,
};

/**
 * Known energy costs for abilities (fallback when WFCD doesn't provide).
 */
const KNOWN_COSTS: Record<string, number> = {
  'Shuriken': 25, 'Smoke Screen': 35, 'Teleport': 25, 'Blade Storm': 100,
  'Slash Dash': 25, 'Radial Blind': 50, 'Radial Javelin': 75, 'Exalted Blade': 25,
  'Rhino Charge': 25, 'Iron Skin': 50, 'Roar': 75, 'Rhino Stomp': 100,
  'Spores': 25, 'Toxic Lash': 50, 'Miasma': 100,
  'Pull': 25, 'Magnetize': 50, 'Polarize': 75, 'Crush': 100,
  'Shock': 25, 'Speed': 25, 'Electric Shield': 50, 'Discharge': 100,
  'Decoy': 25, 'Invisibility': 50, 'Switch Teleport': 25, 'Radial Disarm': 100,
  'Null Star': 25, 'Antimatter Drop': 25, 'Wormhole': 75, 'Molecular Prime': 100,
  'Well of Life': 25, 'Energy Vampire': 50, 'Link': 75, 'Blessing': 100,
  'Soul Punch': 25, 'Terrify': 50, 'Desecrate': 25, 'Shadows of the Dead': 100,
  'Fireball': 25, 'Immolation': 25, 'Fire Blast': 50, 'Inferno': 100,
  'Freeze': 25, 'Ice Wave': 50, 'Snow Globe': 50, 'Avalanche': 100,
  'Mach Rush': 25, 'Kinetic Plating': 50, 'Thermal Sunder': 25, 'Redline': 25,
  'Reservoirs': 25, 'Wil-O-Wisp': 50, 'Breach Surge': 75, 'Sol Gate': 25,
  'Ballistic Battery': 25, 'Shooting Gallery': 50, 'Shatter Shield': 50, 'Peacemaker': 25,
  'Tesla Nervos': 25, 'Minelayer': 50, 'Bastille': 100,
  'Lull': 25, 'Blood Altar': 25,
  'Desiccation': 25, 'Fire Walker': 25, 'Rest & Rage': 25,
  'Condemn': 25, 'Ensnare': 25, 'Reave': 25,
};

/**
 * Build a warframe ability definition from WFCD data + manual overrides.
 */
function buildAbilityDef(
  wfAbility: { name: string; description: string; uniqueName: string; slotIndex: number },
): AbilityDef {
  const override = ABILITY_DAMAGE_OVERRIDES[wfAbility.name];
  const augments = AUGMENT_OVERRIDES[wfAbility.name] ?? [];
  return {
    name: wfAbility.name,
    slotIndex: wfAbility.slotIndex || 0,
    baseDamage: override?.baseDamage ?? 0,
    baseDuration: KNOWN_DURATIONS[wfAbility.name] ?? (override?.baseDuration ?? 0),
    baseRange: KNOWN_RANGES[wfAbility.name] ?? (override?.baseRange ?? 0),
    baseCost: KNOWN_COSTS[wfAbility.name] ?? (override?.baseCost ?? 25),
    castTime: 0.5,
    cooldown: override?.cooldown ?? 0,
    isChanneled: override?.isChanneled ?? false,
    damageType: override?.damageType ?? 'Buff',
    scalingStat: override?.scalingFactor ? 'strength' : ('strength' as const),
    scalingFactor: override?.scalingFactor ?? 0,
    usesStatStick: override?.usesStatStick ?? false,
    dotDamage: override?.dotDamage ?? false,
    dotDuration: override?.dotDuration ?? 0,
    augments,
    notes: wfAbility.description,
    confidence: override?.baseDamage ? 'HIGH' : 'MEDIUM',
  };
}

/**
 * Get a data-driven warframe ability definition.
 * Uses WFCD data for ability names/descriptions, manual overrides for damage formulas.
 */
export function getWarframeAbilityDef(uniqueName: string): WarframeAbilityDef | undefined {
  let datum = gameData.warframeAbilityData[uniqueName];
  // Fallback: try name-based lookup (WFCD uniqueNames differ from display paths)
  if (!datum) {
    const shortName = uniqueName.split('/').pop()?.toLowerCase() || '';
    const nameMatch = Object.entries(gameData.warframeAbilityData).find(
      ([_, v]) => v.name.toLowerCase() === shortName,
    );
    if (nameMatch) datum = nameMatch[1];
  }
  if (!datum) return undefined;

  const wfName = datum.name;
  const shortName = wfName.split(' ')[0];

  return {
    uniqueName,
    name: wfName,
    passive: datum.passiveDescription || '',
    passiveEffects: PASSIVE_EFFECTS[shortName] ?? PASSIVE_EFFECTS[wfName] ?? [],
    abilities: datum.abilities.map(a => buildAbilityDef(a)),
    exaltedWeapon: gameData.exaltedWeapons[uniqueName]?.name,
    exaltedSlot: gameData.exaltedWeapons[uniqueName]?.slot,
    helminthAbility: undefined,
    notes: '',
    confidence: 'HIGH',
  };
}

export function getAllWarframeAbilityDefs(): WarframeAbilityDef[] {
  return Object.keys(gameData.warframeAbilityData)
    .map(uid => getWarframeAbilityDef(uid))
    .filter((d): d is WarframeAbilityDef => d !== undefined);
}
