/**
 * Arcane System — DATA DRIVEN
 *
 * Arcane definitions come from WFCD via game-data.json (168 arcanes).
 * Only ICD, duration, stack behavior requires manual annotation since
 * WFCD doesn't expose trigger mechanics as structured data.
 *
 * MILESTONE 3: 168 arcanes data-driven via WFCD.
 */

import { gameData } from '../../data/game-data';
import type { EffectTrigger } from './effect-types';
import type { ArcaneDatum } from '../../data/game-data';

export type ArcaneTrigger = EffectTrigger | 'conditional';

export interface ArcaneEffectDef {
  stat: string;
  value: number;
  category: 'FLAT' | 'MULTIPLIER';
  perStack?: number;
  condition?: string;
}

export interface ArcaneDef {
  name: string;
  uniqueName: string;
  category: string;
  trigger: ArcaneTrigger;
  icd: number;
  duration: number;
  maxStacks: number;
  refreshes: boolean;
  effects: ArcaneEffectDef[];
  rarity: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

/**
 * Manual trigger/ICD/duration metadata for known arcanes.
 * WFCD does not expose trigger conditions — these are curated from wiki research.
 * Only covers arcanes with known trigger profiles; unknown triggers default to 'on_damage_taken'.
 */
const ARC_TRIGGER_DATA: Record<string, { trigger: ArcaneTrigger; icd: number; duration: number; maxStacks: number; refreshes: boolean }> = {
  'Arcane Energize': { trigger: 'on_energy_pickup', icd: 15, duration: 0, maxStacks: 1, refreshes: false },
  'Arcane Grace': { trigger: 'on_damage_taken', icd: 6, duration: 6, maxStacks: 1, refreshes: false },
  'Arcane Guardian': { trigger: 'on_damage_taken', icd: 20, duration: 20, maxStacks: 1, refreshes: true },
  'Arcane Avenger': { trigger: 'on_damage_taken', icd: 10, duration: 12, maxStacks: 1, refreshes: true },
  'Arcane Aegis': { trigger: 'on_damage_taken', icd: 10, duration: 12, maxStacks: 1, refreshes: true },
  'Arcane Barrier': { trigger: 'on_damage_taken', icd: 20, duration: 0, maxStacks: 1, refreshes: false },
  'Arcane Nullifier': { trigger: 'on_damage_taken', icd: 4, duration: 4, maxStacks: 1, refreshes: false },
  'Arcane Ultimatum': { trigger: 'on_finisher', icd: 10, duration: 30, maxStacks: 1, refreshes: true },
  'Arcane Trickery': { trigger: 'on_finisher', icd: 10, duration: 20, maxStacks: 1, refreshes: true },
  'Arcane Fury': { trigger: 'on_critical_hit', icd: 6, duration: 18, maxStacks: 2, refreshes: true },
  'Arcane Strike': { trigger: 'on_critical_hit', icd: 4, duration: 24, maxStacks: 1, refreshes: true },
  'Arcane Velocity': { trigger: 'on_critical_hit', icd: 4, duration: 9, maxStacks: 1, refreshes: true },
  'Arcane Acceleration': { trigger: 'on_critical_hit', icd: 3, duration: 18, maxStacks: 1, refreshes: true },
  'Arcane Precision': { trigger: 'on_headshot', icd: 4, duration: 24, maxStacks: 1, refreshes: true },
  'Arcane Pistoleer': { trigger: 'on_headshot', icd: 6, duration: 4, maxStacks: 1, refreshes: false },
  'Arcane Rise': { trigger: 'on_reload', icd: 10, duration: 24, maxStacks: 2, refreshes: true },
  'Arcane Rage': { trigger: 'on_kill', icd: 4, duration: 24, maxStacks: 1, refreshes: true },
  'Arcane Primary Charger': { trigger: 'on_melee_kill', icd: 30, duration: 30, maxStacks: 1, refreshes: true },
  'Arcane Blade Charger': { trigger: 'on_heavy_attack', icd: 10, duration: 30, maxStacks: 1, refreshes: true },
  'Arcane Eruption': { trigger: 'on_health_pickup', icd: 5, duration: 0, maxStacks: 1, refreshes: false },
  'Arcane Bodyguard': { trigger: 'on_ability_cast', icd: 0, duration: 0, maxStacks: 1, refreshes: false },
  'Arcane Consequence': { trigger: 'on_aim_glide', icd: 3, duration: 30, maxStacks: 1, refreshes: true },
};

/**
 * Known stat-to-engine-bucket mapping for arcane stat lines.
 * Maps WFCD stat description keywords to engine stat names.
 */
const ARC_STAT_MAP: Record<string, (val: number) => { stat: string; value: number; category: 'FLAT' | 'MULTIPLIER' }> = {
  'Health': v => ({ stat: 'health', value: v, category: 'MULTIPLIER' }),
  'Shield': v => ({ stat: 'shields', value: v / 100, category: 'MULTIPLIER' }),
  'Shield Capacity': v => ({ stat: 'shields', value: v / 100, category: 'MULTIPLIER' }),
  'Armor': v => ({ stat: 'armor', value: v, category: 'FLAT' }),
  'Damage': v => ({ stat: 'base_damage', value: v, category: 'MULTIPLIER' }),
  'Critical Chance': v => ({ stat: 'crit_chance', value: v / 100, category: 'FLAT' }),
  'Critical Damage': v => ({ stat: 'crit_damage', value: v / 100, category: 'MULTIPLIER' }),
  'Critical Chance for Pistols': v => ({ stat: 'crit_chance', value: v / 200, category: 'MULTIPLIER' }),
  'Fire Rate': v => ({ stat: 'fire_rate', value: v, category: 'MULTIPLIER' }),
  'Melee Damage': v => ({ stat: 'base_damage', value: v, category: 'MULTIPLIER' }),
  'Attack Speed': v => ({ stat: 'attack_speed', value: v, category: 'MULTIPLIER' }),
  'Reload Speed': v => ({ stat: 'reload_speed_mult', value: v, category: 'MULTIPLIER' }),
  'Parkour Velocity': v => ({ stat: 'parkour_velocity', value: v, category: 'MULTIPLIER' }),
  'Sprint Speed': v => ({ stat: 'sprint_speed', value: v, category: 'MULTIPLIER' }),
  'Slide': v => ({ stat: 'slide', value: v, category: 'MULTIPLIER' }),
  'Bullet Jump': v => ({ stat: 'bullet_jump', value: v, category: 'MULTIPLIER' }),
  'Energy': v => ({ stat: 'energy', value: v, category: 'MULTIPLIER' }),
};

function parseArcaneStatLine(line: string): ArcaneEffectDef | null {
  const match = line.match(/^([+-]?\d+(?:\.\d+)?%?)\s*(.+)$/);
  if (!match) return null;
  const valueStr = match[1];
  const raw = match[2].trim();

  const isPercent = valueStr.includes('%');
  const value = parseFloat(valueStr) || 0;

  // Find matching stat
  for (const [keyword, mapper] of Object.entries(ARC_STAT_MAP)) {
    if (raw.includes(keyword)) {
      const result = mapper(value);
      return {
        stat: result.stat,
        value: isPercent ? result.value : result.value,
        category: result.category,
      };
    }
  }

  // Fallback: return raw stat line for manual processing
  return { stat: raw.toLowerCase().replace(/[^a-z_]/g, '_'), value, category: 'MULTIPLIER' };
}

function buildArcaneDef(datum: ArcaneDatum): ArcaneDef {
  const manual = ARC_TRIGGER_DATA[datum.name];
  const statLines = datum.statLines || [];
  const effects: ArcaneEffectDef[] = [];

  for (const line of statLines) {
    const parsed = parseArcaneStatLine(line);
    if (parsed) effects.push(parsed);
  }

  return {
    name: datum.name,
    uniqueName: datum.uniqueName,
    category: datum.isOperatorArcane ? 'operator' : datum.category,
    trigger: manual?.trigger ?? 'conditional',
    icd: manual?.icd ?? 10,
    duration: manual?.duration ?? 0,
    maxStacks: manual?.maxStacks ?? 1,
    refreshes: manual?.refreshes ?? false,
    effects: effects.length > 0 ? effects : [{ stat: 'unknown', value: 0, category: 'MULTIPLIER' }],
    rarity: datum.rarity,
    confidence: manual ? 'HIGH' : 'MEDIUM',
  };
}

const ARC_DEF_CACHE = new Map<string, ArcaneDef>();

export function getArcane(uniqueName: string): ArcaneDef | undefined {
  if (ARC_DEF_CACHE.has(uniqueName)) return ARC_DEF_CACHE.get(uniqueName);
  const datum = gameData.getArcaneData(uniqueName);
  if (!datum) return undefined;
  const def = buildArcaneDef(datum);
  ARC_DEF_CACHE.set(uniqueName, def);
  return def;
}

export function getArcanesByCategory(category: string): ArcaneDef[] {
  return gameData.getArcanesByCategory(category).map(buildArcaneDef);
}

export function getAllArcanes(): ArcaneDef[] {
  return (gameData.arcaneData || []).map(buildArcaneDef);
}

export function resolveArcaneEffect(
  arcane: ArcaneDef,
  stacks: number,
): { stat: string; value: number; category: 'FLAT' | 'MULTIPLIER' }[] {
  return arcane.effects.map(e => {
    let value = e.value;
    if (e.perStack && stacks > 1) value = e.value + e.perStack * (stacks - 1);
    if (arcane.maxStacks > 1) value = value * Math.min(stacks, arcane.maxStacks);
    return { stat: e.stat, value, category: e.category };
  });
}

export const ARCANS_DB = new Proxy({}, {
  get: (_target, prop: string) => {
    const arcane = gameData.arcaneData?.find(a => a.name === prop);
    return arcane ? getArcane(arcane.uniqueName) : undefined;
  },
}) as Record<string, ArcaneDef | undefined>;
