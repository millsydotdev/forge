/**
 * Enemy System — DATA DRIVEN
 *
 * Enemy definitions come from WFCD via game-data.json.
 * Only boss mechanics, eximus types, and difficulty scaling rules
 * are manually curated since they depend on observed behavior.
 *
 * MILESTONE 3: Enemies data-driven from WFCD; fallback hardcoded list
 * provides 10 baseline entries when WFCD Enemy.json is unavailable.
 */

import { gameData } from '../../data/game-data';
import type { EnemyDef } from '../../data/game-data';

export type DifficultyMode = 'normal' | 'steel_path' | 'sortie' | 'archon_hunt';

export interface DifficultyModifiers {
  healthMultiplier: number;
  shieldMultiplier: number;
  armorMultiplier: number;
  damageMultiplier: number;
  enemyLevelOffset: number;
}

export const DIFFICULTY_MODIFIERS: Record<DifficultyMode, DifficultyModifiers> = {
  normal: { healthMultiplier: 1, shieldMultiplier: 1, armorMultiplier: 1, damageMultiplier: 1, enemyLevelOffset: 0 },
  steel_path: { healthMultiplier: 2.5, shieldMultiplier: 2.5, armorMultiplier: 0.5, damageMultiplier: 2.5, enemyLevelOffset: 100 },
  sortie: { healthMultiplier: 1, shieldMultiplier: 1, armorMultiplier: 1, damageMultiplier: 1, enemyLevelOffset: 50 },
  archon_hunt: { healthMultiplier: 3, shieldMultiplier: 3, armorMultiplier: 0.5, damageMultiplier: 3, enemyLevelOffset: 75 },
};

export const EXIMUS_TYPES: Record<string, { overguardBase: number; overguardScaling: number; damageReduction: number }> = {
  'Arson': { overguardBase: 300, overguardScaling: 200, damageReduction: 0.1 },
  'Blitz': { overguardBase: 250, overguardScaling: 150, damageReduction: 0.1 },
  'Energy Leech': { overguardBase: 250, overguardScaling: 150, damageReduction: 0.1 },
  'Guardian': { overguardBase: 800, overguardScaling: 400, damageReduction: 0.2 },
  'Jade Light': { overguardBase: 500, overguardScaling: 300, damageReduction: 0.15 },
  'Leech': { overguardBase: 300, overguardScaling: 200, damageReduction: 0.1 },
  'Shock': { overguardBase: 250, overguardScaling: 150, damageReduction: 0.1 },
  'Sniper': { overguardBase: 200, overguardScaling: 120, damageReduction: 0.1 },
  'Toxic': { overguardBase: 300, overguardScaling: 200, damageReduction: 0.1 },
  'Voltaic': { overguardBase: 400, overguardScaling: 250, damageReduction: 0.15 },
};

export const FACTION_DEFS: Record<string, { healthTypes: string[]; armorTypes: string[]; shieldTypes: string[]; specialRules: string[] }> = {
  'Grineer': { healthTypes: ['Cloned Flesh', 'Flesh'], armorTypes: ['Ferrite', 'Alloy'], shieldTypes: ['None'], specialRules: ['Armor scales with level'] },
  'Corpus': { healthTypes: ['Flesh', 'Robotic'], armorTypes: ['Ferrite', 'None'], shieldTypes: ['Shield', 'Proto Shield'], specialRules: ['Shields scale with level'] },
  'Infested': { healthTypes: ['Infested Flesh', 'Infested'], armorTypes: ['Fossilized', 'None'], shieldTypes: ['None'], specialRules: ['No shields', 'Ancient healers grant 90% DR'] },
  'Corrupted': { healthTypes: ['Cloned Flesh', 'Flesh', 'Robotic'], armorTypes: ['Ferrite', 'Alloy'], shieldTypes: ['Shield'], specialRules: ['Mix of all factions'] },
  'Sentient': { healthTypes: ['Sentient'], armorTypes: ['Alloy', 'Ferrite'], shieldTypes: ['Shield', 'Proto Shield'], specialRules: ['Adaptation: -10% per hit, 60% cap', 'Void ignores adaptation'] },
  'Orokin': { healthTypes: ['Orokin'], armorTypes: ['Ferrite', 'Alloy'], shieldTypes: ['Shield'], specialRules: ['Void: +50% bonus'] },
};

export interface BossMechanicDef {
  name: string;
  damageAttenuationType: string;
  damageAttenuationThreshold: number;
  damageAttenuationFactor: number;
  damageAttenuationConstant: number;
  phases: number;
  weakpoints: string[];
  immunity: string[];
  specialMechanics: string[];
}

export const BOSS_MECHANICS: Record<string, BossMechanicDef> = {
  'Archon': { name: 'Archon', damageAttenuationType: 'threshold', damageAttenuationThreshold: 2000, damageAttenuationFactor: 0.05, damageAttenuationConstant: 0, phases: 3, weakpoints: ['Head'], immunity: ['Impact', 'Puncture', 'Slash', 'Gas', 'Magnetic', 'Blast', 'Radiation'], specialMechanics: ['Sentient adaptation', 'Narmer override'] },
  'Demolyst': { name: 'Demolyst', damageAttenuationType: 'dr_based', damageAttenuationThreshold: 0, damageAttenuationFactor: 0, damageAttenuationConstant: 0.0002, phases: 1, weakpoints: ['Back canister'], immunity: ['Viral'], specialMechanics: ['Nullifier pulse', 'Disruption conduit'] },
  'Eidolon Teralyst': { name: 'Eidolon Teralyst', damageAttenuationType: 'threshold', damageAttenuationThreshold: 1000, damageAttenuationFactor: 0.01, damageAttenuationConstant: 0, phases: 4, weakpoints: ['Synovia (4 limbs)'], immunity: ['Slash', 'Puncture', 'Impact'], specialMechanics: ['Shield gate vs non-Void', 'Void required for shield damage'] },
  'Profit-Taker': { name: 'Profit-Taker', damageAttenuationType: 'hybrid', damageAttenuationThreshold: 5000, damageAttenuationFactor: 0.1, damageAttenuationConstant: 0.0001, phases: 5, weakpoints: ['Shield pylons', 'Leg joints'], immunity: [], specialMechanics: ['Rotating damage type weaknesses', 'Orb filaments'] },
  'Exploiter': { name: 'Exploiter', damageAttenuationType: 'threshold', damageAttenuationThreshold: 3000, damageAttenuationFactor: 0.03, damageAttenuationConstant: 0, phases: 3, weakpoints: ['Coolant vents'], immunity: [], specialMechanics: ['Thermia required', 'Vent cracking'] },
};

export function scaleEnemyHealth(baseHealth: number, baseLevel: number, currentLevel: number, exp = 0.5, diff: DifficultyModifiers): number {
  return Math.round(baseHealth * (1 + Math.pow(Math.max(0, currentLevel - baseLevel), exp)) * diff.healthMultiplier);
}

export function scaleEnemyShields(baseShields: number, baseLevel: number, currentLevel: number, exp = 0.6, diff: DifficultyModifiers): number {
  return Math.round(baseShields * (1 + Math.pow(Math.max(0, currentLevel - baseLevel), exp)) * diff.shieldMultiplier);
}

export function scaleEnemyArmor(baseArmor: number, baseLevel: number, currentLevel: number, exp = 0.75, diff: DifficultyModifiers): number {
  return Math.round(baseArmor * (1 + Math.pow(Math.max(0, currentLevel - baseLevel), exp)) * diff.armorMultiplier);
}

export function calcSentientAdaptation(hitCount: number, damageType?: string): number {
  if (damageType === 'void') return 1;
  return 1 - Math.min(hitCount * 0.1, 0.6);
}

export function calcEximusOverguard(base: number, level: number, scaling: number, steelPath: boolean): number {
  return Math.round((base + scaling * (1 + (level - 1) * 0.01)) * (steelPath ? 2.5 : 1));
}

export function getDifficulty(name: DifficultyMode): DifficultyModifiers {
  return DIFFICULTY_MODIFIERS[name] ?? DIFFICULTY_MODIFIERS.normal;
}

export function isSteelPathEnabled(flags?: { steelPath?: boolean; sortie?: boolean; archonHunt?: boolean }): boolean {
  return flags?.steelPath ?? false;
}

export function getEffectiveEnemyLevel(baseLevel: number, difficulty: DifficultyMode): number {
  return baseLevel + DIFFICULTY_MODIFIERS[difficulty].enemyLevelOffset;
}

export function getEnemies(): EnemyDef[] {
  return gameData.enemies || [];
}

export function getEnemyByName(name: string): EnemyDef | undefined {
  return gameData.getEnemyByName(name);
}
