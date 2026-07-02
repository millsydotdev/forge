export interface EnemyTarget {
  name: string;
  faction: string;
  baseHealth: number;
  baseShields: number;
  baseArmor: number;
  armorType: string;
  healthType: string;
  shieldType: string;
  weakness: string[];
  resistance: string[];
  immune: string[];
}

export interface EnemySimState {
  target: EnemyTarget;
  level: number;
  armorStripped: number;
  activeCorrosiveStacks: number;
  activeHeatProc: boolean;
  hasShields: boolean;
  multiTarget: number;
  activeElectricStacks?: number;
}

const BASE_ARMOR_EXP = 0.75;
const BASE_HEALTH_EXP = 0.5;
const BASE_SHIELD_EXP = 0.6;

export function scaleStats(base: number, level: number, exp: number): number {
  return base * (1 + Math.pow(Math.max(0, level - 1), exp));
}

export function calcEffectiveArmor(armor: number, level: number, armorStripped: number, corrosiveStacks: number): { armor: number; dr: number } {
  let scaled = scaleStats(armor, level, BASE_ARMOR_EXP);
  const corrosiveReduction = 1 - (1 - Math.pow(1 - 0.26, corrosiveStacks));
  scaled = scaled * (1 - armorStripped) * corrosiveReduction;
  const dr = scaled / (scaled + 300);
  return { armor: Math.max(0, scaled), dr };
}

export function calcEhp(health: number, shields: number, armor: number, level: number, armorStripped: number, corrosiveStacks: number): { health: number; shields: number; armor: number; dr: number; ehp: number } {
  const scaledHealth = scaleStats(health, level, BASE_HEALTH_EXP);
  const scaledShields = scaleStats(shields, level, BASE_SHIELD_EXP);
  const { armor: effArmor, dr } = calcEffectiveArmor(armor, level, armorStripped, corrosiveStacks);
  const ehp = scaledHealth / (1 - dr) + scaledShields;
  return { health: scaledHealth, shields: scaledShields, armor: effArmor, dr, ehp: Math.round(ehp) };
}

import { gameData } from '../data/game-data';

export const ENEMY_TARGETS: EnemyTarget[] = [...gameData.enemies];

export const DEFAULT_ENEMY_STATE: EnemySimState = {
  target: ENEMY_TARGETS[0],
  level: 100,
  armorStripped: 0,
  activeCorrosiveStacks: 0,
  activeHeatProc: false,
  hasShields: true,
  multiTarget: 1,
  activeElectricStacks: 0,
};