export interface AbilityDpsResult {
  name: string;
  slotIndex: number;
  isHelminth: boolean;
  damagePerCast: number;
  dps: number;
  cooldown: number;
  duration: number;
  range: number;
  cost: number;
  damageType: string;
  castTime: number;
}

const ABILITY_BASE: Record<string, { baseDamage: number; scalingStat: string; scalingFactor: number; damageType: string; baseDuration: number; baseRange: number; baseCost: number; castTime: number; cooldown: number; dot?: boolean }> = {
  // Generic ability damage profiles keyed by keyword
  'slash':     { baseDamage: 300,  scalingStat: 'strength', scalingFactor: 1.0, damageType: 'Slash',    baseDuration: 6,  baseRange: 10, baseCost: 25,  castTime: 0.5, cooldown: 0, dot: true },
  'heat':      { baseDamage: 350,  scalingStat: 'strength', scalingFactor: 1.0, damageType: 'Heat',     baseDuration: 6,  baseRange: 8,  baseCost: 25,  castTime: 0.5, cooldown: 0, dot: true },
  'toxin':     { baseDamage: 250,  scalingStat: 'strength', scalingFactor: 1.0, damageType: 'Toxin',    baseDuration: 10, baseRange: 8,  baseCost: 25,  castTime: 0.4, cooldown: 0, dot: true },
  'electric':  { baseDamage: 400,  scalingStat: 'strength', scalingFactor: 1.0, damageType: 'Electric', baseDuration: 3,  baseRange: 15, baseCost: 25,  castTime: 0.3, cooldown: 0, dot: true },
  'cold':      { baseDamage: 200,  scalingStat: 'strength', scalingFactor: 1.0, damageType: 'Cold',     baseDuration: 8,  baseRange: 10, baseCost: 25,  castTime: 0.5, cooldown: 0 },
  'blast':     { baseDamage: 500,  scalingStat: 'strength', scalingFactor: 1.0, damageType: 'Blast',    baseDuration: 0,  baseRange: 6,  baseCost: 25,  castTime: 0.6, cooldown: 0 },
  'radiation': { baseDamage: 450,  scalingStat: 'strength', scalingFactor: 1.0, damageType: 'Radiation',baseDuration: 12, baseRange: 10, baseCost: 25,  castTime: 0.5, cooldown: 0 },
  'viral':     { baseDamage: 100,  scalingStat: 'strength', scalingFactor: 0.5, damageType: 'Viral',    baseDuration: 6,  baseRange: 10, baseCost: 25,  castTime: 0.4, cooldown: 0 },
  'corrosive': { baseDamage: 150,  scalingStat: 'strength', scalingFactor: 0.5, damageType: 'Corrosive',baseDuration: 8,  baseRange: 8,  baseCost: 25,  castTime: 0.4, cooldown: 0 },
  'gas':       { baseDamage: 200,  scalingStat: 'strength', scalingFactor: 1.0, damageType: 'Gas',      baseDuration: 6,  baseRange: 6,  baseCost: 25,  castTime: 0.5, cooldown: 0, dot: true },
  'magnetic':  { baseDamage: 300,  scalingStat: 'strength', scalingFactor: 1.0, damageType: 'Magnetic', baseDuration: 4,  baseRange: 12, baseCost: 25,  castTime: 0.4, cooldown: 0 },
  'void':      { baseDamage: 500,  scalingStat: 'strength', scalingFactor: 1.0, damageType: 'Void',     baseDuration: 8,  baseRange: 10, baseCost: 25,  castTime: 0.5, cooldown: 0 },
  'true':      { baseDamage: 1000, scalingStat: 'strength', scalingFactor: 1.5, damageType: 'True',     baseDuration: 0,  baseRange: 5,  baseCost: 50,  castTime: 0.8, cooldown: 0 },
};

function matchAbility(name: string): typeof ABILITY_BASE[string] | null {
  const lower = name.toLowerCase();
  for (const [key, profile] of Object.entries(ABILITY_BASE)) {
    if (lower.includes(key)) return profile;
  }
  return null;
}

export function estimateAbilityDps(
  name: string,
  strength: number,
  duration: number,
  efficiency: number,
  range: number,
): AbilityDpsResult | null {
  const profile = matchAbility(name);
  if (!profile) return null;

  const effMultiplier = Math.min(efficiency, 1.75);
  const cost = Math.max(profile.baseCost * (2 - effMultiplier), 0);
  const effectiveDuration = profile.baseDuration * duration;
  const effectiveRange = profile.baseRange * range;
  const scaledDamage = profile.baseDamage * strength * profile.scalingFactor;

  const castTime = profile.castTime;
  const totalTimePerCast = castTime + (profile.cooldown > 0 ? profile.cooldown : 0.5);
  const dps = scaledDamage / totalTimePerCast;

  return {
    name,
    slotIndex: 0,
    isHelminth: false,
    damagePerCast: Math.round(scaledDamage),
    dps: Math.round(dps),
    cooldown: profile.cooldown,
    duration: effectiveDuration,
    range: effectiveRange,
    cost: Math.round(cost),
    damageType: profile.damageType,
    castTime,
  };
}

import { gameData } from '../data/game-data';

export const HELMINTH_ABILITIES: Record<string, { donor: string; abilityName: string; baseDamage: number; scalingStat: string; scalingFactor: number; damageType: string }> =
  Object.fromEntries(gameData.helminthAbilities.map(h => [
    h.donorUniqueName,
    {
      donor: h.donorName,
      abilityName: h.abilityName,
      baseDamage: h.baseDamage,
      scalingStat: h.scalingStat,
      scalingFactor: h.scalingFactor,
      damageType: h.damageType,
    },
  ]));