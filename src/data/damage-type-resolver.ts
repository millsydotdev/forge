/**
 * WFCD-Driven Damage Type Resolver
 *
 * Uses enemy resistances[] data from @wfcd/items (game-file sourced)
 * instead of the manually-curated tables in damage-type-mods.ts.
 *
 * The WFCD data is more authoritative because it comes directly from
 * game files rather than being manually transcribed from the wiki.
 *
 * Fallback: If WFCD data is unavailable for a specific health/armor/
 * shield type combination, falls back to the manual tables.
 */

import { gameData } from './game-data';
import type {} from './game-data';

// Cache for resolved resistance tables — built once from WFCD enemy data
let resistanceCache: {
  healthMods: Map<string, Map<string, number>>;
  armorMods: Map<string, Map<string, number>>;
  shieldMods: Map<string, Map<string, number>>;
} | null = null;

// WFCD element naming → engine DamageTypeName mapping
const WFCD_ELEMENT_MAP: Record<string, string> = {
  'Impact': 'impact', 'Puncture': 'puncture', 'Slash': 'slash',
  'Heat': 'heat', 'Cold': 'cold', 'Electric': 'electric', 'Toxin': 'toxin',
  'Blast': 'blast', 'Radiation': 'radiation', 'Gas': 'gas',
  'Magnetic': 'magnetic', 'Viral': 'viral', 'Corrosive': 'corrosive',
  'Void': 'void', 'Tau': 'tau', 'True': 'true',
  'None': 'none',
};

function buildResistanceCache(): void {
  const healthMods = new Map<string, Map<string, number>>();
  const armorMods = new Map<string, Map<string, number>>();
  const shieldMods = new Map<string, Map<string, number>>();

  const enemies = gameData.enemies || [];

  for (const enemy of enemies) {
    if (!enemy.resistances) continue;

    for (const res of enemy.resistances) {
      const type = res.type;
      if (!type || !res.affectors) continue;

      const targetMap = type.includes('Armor')
        ? armorMods
        : type === 'Shield' || type === 'Proto Shield'
        ? shieldMods
        : healthMods;

      if (!targetMap.has(type)) {
        targetMap.set(type, new Map());
      }
      const modMap = targetMap.get(type)!;

      for (const affector of res.affectors) {
        const element = WFCD_ELEMENT_MAP[affector.element] || affector.element.toLowerCase();
        const existing = modMap.get(element) ?? 0;
        modMap.set(element, existing + (affector.modifier ?? 0));
      }
    }
  }

  resistanceCache = { healthMods, armorMods, shieldMods };
}

function getResistanceMod(
  cache: Map<string, Map<string, number>>,
  type: string,
  dmgType: string,
): number | undefined {
  // Try exact match first
  const exact = cache.get(type);
  if (exact?.has(dmgType)) return exact.get(dmgType);

  // Try case-insensitive
  for (const [key, mods] of cache) {
    if (key.toLowerCase() === type.toLowerCase()) {
      for (const [dk, dv] of mods) {
        if (dk.toLowerCase() === dmgType.toLowerCase()) return dv;
      }
    }
  }

  // For health types, also check sub-strings
  if (type === 'Cloned Flesh' || type === 'Flesh' || type === 'Infested Flesh' ||
      type === 'Robotic' || type === 'Fossilized' || type === 'Infested' ||
      type === 'Sentient' || type === 'Orokin') {
    const healthFallback = cache.get(type);
    if (healthFallback?.has(dmgType)) return healthFallback.get(dmgType);
  }

  return undefined;
}

export function healthTypeMod(healthType: string, dmgType: string): number {
  if (!resistanceCache) buildResistanceCache();
  return getResistanceMod(resistanceCache!.healthMods, healthType, dmgType) ?? 0;
}

export function armorTypeMod(armorType: string, dmgType: string): number {
  if (!resistanceCache) buildResistanceCache();
  return getResistanceMod(resistanceCache!.armorMods, armorType, dmgType) ?? 0;
}

export function shieldTypeMod(shieldType: string, dmgType: string): number {
  if (!resistanceCache) buildResistanceCache();
  return getResistanceMod(resistanceCache!.shieldMods, shieldType, dmgType) ?? 0;
}

export function hitMultiplierVsHealth(
  dmgType: string,
  healthType: string,
  armorType: string,
  effectiveArmor: number,
): number {
  const hMod = healthTypeMod(healthType, dmgType);
  if (effectiveArmor <= 0) {
    return 1 + hMod;
  }
  const aMod = armorTypeMod(armorType, dmgType);
  const dr = effectiveArmor / (effectiveArmor + 300);
  return (1 + hMod + aMod) * (1 - dr);
}

export function hitMultiplierVsShield(
  dmgType: string,
  shieldType: string,
): number {
  return 1 + shieldTypeMod(shieldType, dmgType);
}

export function getResistanceStats(): { healthTypes: number; armorTypes: number; shieldTypes: number } {
  if (!resistanceCache) buildResistanceCache();
  return {
    healthTypes: resistanceCache!.healthMods.size,
    armorTypes: resistanceCache!.armorMods.size,
    shieldTypes: resistanceCache!.shieldMods.size,
  };
}
