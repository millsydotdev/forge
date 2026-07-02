import type { Polarity } from '../../engine/build-core';
import type { WeaponStats } from '../../engine/stat-processor';
import { effectiveCost, modDrainAtRank, polarityMatches } from '../../engine/polarity';

export interface ItemOption {
  uniqueName: string;
  name: string;
  category: string;
  type?: string;
  imageName?: string;
  baseDrain?: number;
  fusionLimit?: number;
  polarity?: string;
  rarity?: string;
  compatName?: string;
  count?: number;
}

export interface AbilityInfo {
  uniqueName?: string;
  name: string;
  description?: string;
  imageName?: string;
}

export interface WarframeDetail extends ItemOption {
  description?: string;
  health?: number;
  shield?: number;
  armor?: number;
  power?: number;
  sprintSpeed?: number;
  masteryReq?: number;
  abilities?: AbilityInfo[];
  passiveDescription?: string;
}

export interface ModSlot {
  uniqueName: string;
  name: string;
  rank: number;
  maxRank: number;
  baseDrain: number;
  polarity: Polarity;
  type?: string;
  imageName?: string;
  rarity?: string;
  compatName?: string;
  modSet?: string;
}

export interface ArcaneSlot {
  uniqueName: string;
  name: string;
  rank: number;
  maxRank: number;
}

export type ShardColor = 'crimson' | 'azure' | 'amber' | 'violet' | 'topaz' | 'emerald';
export type WeaponSlot = 'primary' | 'secondary' | 'melee' | 'companion';

/** Ownership state for any item — purely informational, never restricts usage */
export type OwnershipState = 'owned' | 'missing' | 'wishlisted' | 'favorite' | 'upgradeable' | 'unknown';
export type BuildSlot = WeaponSlot | 'warframe' | 'companion_weapon' | 'exalted_weapon' | 'amp' | 'railjack' | 'kdrive' | 'necramech' | 'archwing' | 'parazon' | 'zaw' | 'kitgun' | 'operator' | 'arch-gun' | 'arch-melee';

export interface WeaponState {
  id: string;
  mods: ModSlot[];
  exilus: ModSlot | null;
  arcanes: [ArcaneSlot | null, ArcaneSlot | null];
  slotPolarities: Polarity[];
  incarnonStage?: number;
  /** Active attack mode for multi-mode weapons (Incarnon, alt-fire) */
  attackMode?: 'normal' | 'alt' | 'incarnon';
}

export interface ShardSlot {
  color: ShardColor | null;
  isTau: boolean;
}

export interface WarframeState {
  id: string;
  aura: ModSlot | null;
  exilus: ModSlot | null;
  mods: ModSlot[];
  arcanes: [ArcaneSlot | null, ArcaneSlot | null];
  shards: ShardSlot[];
  slotPolarities: Polarity[];
  exaltedWeapon: WeaponState | null;
}

export interface CompanionState {
  id: string;
  compType: string;
  mods: ModSlot[];
  slotPolarities: Polarity[];
  weaponId: string;
  weaponMods: ModSlot[];
  weaponSlotPolarities: Polarity[];
}

export interface HelminthState {
  enabled: boolean;
  donorId: string;
  slotIndex: number;
}

export const SLOT_LABEL: Record<string, string> = {
  warframe: 'Warframe',
  primary: 'Primary',
  secondary: 'Secondary',
  melee: 'Melee',
  'arch-gun': 'Arch-Gun',
  'arch-melee': 'Arch-Melee',
  companion: 'Companion',
  companion_weapon: 'Companion Weapon',
  exalted_weapon: 'Exalted Weapon',
  amp: 'AMP',
  railjack: 'Railjack',
  kdrive: 'K-Drive',
  necramech: 'Necramech',
  archwing: 'Archwing',
  parazon: 'Parazon',
  zaw: 'ZAW',
  kitgun: 'KITGUN',
  operator: 'OPERATOR',
};

export const NAV_CATEGORIES: { key: BuildSlot | 'exalted_weapon'; icon: string; label: string }[] = [
  { key: 'warframe', icon: 'accessibility_new', label: 'Frame' },
  { key: 'primary', icon: 'ads_click', label: 'Primary' },
  { key: 'secondary', icon: 'radio_button_checked', label: 'Secondary' },
  { key: 'melee', icon: 'swords', label: 'Melee' },
  { key: 'arch-gun', icon: 'rocket_launch', label: 'Arch-Gun' },
  { key: 'arch-melee', icon: 'swords', label: 'Arch-Melee' },
  { key: 'companion', icon: 'pets', label: 'Companion' },
  { key: 'amp', icon: 'bolt', label: 'AMP' },
  { key: 'zaw', icon: 'handyman', label: 'ZAW' },
  { key: 'kitgun', icon: 'build', label: 'KITGUN' },
  { key: 'operator', icon: 'person', label: 'OPERATOR' },
  { key: 'railjack', icon: 'flight', label: 'RJ' },
  { key: 'kdrive', icon: 'skateboarding', label: 'KD' },
  { key: 'parazon', icon: 'vpn_key', label: 'Parazon' },
  { key: 'archwing', icon: 'flight_takeoff', label: 'Arch' },
  { key: 'necramech', icon: 'smart_toy', label: 'Mech' },
];

import { gameData } from '../../data/game-data';

export const EXALTED_WEAPONS: Record<string, { name: string; slot: string }> = { ...gameData.exaltedWeapons };

export const COMPANION_HAS_WEAPON = new Set(['sentinel', 'moa', 'hound']);
export const SHARD_COLORS: { label: string; value: ShardColor }[] = gameData.shardDefs.map(s => ({
  label: s.label,
  value: s.color as ShardColor,
}));

export const SHARD_STAT_LABEL: Record<string, string> = Object.fromEntries(
  gameData.shardDefs.map(s => [s.color, s.label])
);

export const INCARNON_WEAPONS = gameData.incarnonWeapons;

export const INCARNON_STAGES = [
  { value: 0, label: 'Base (No Evolution)' },
  { value: 1, label: 'Evolution I' },
  { value: 2, label: 'Evolution II' },
  { value: 3, label: 'Evolution III' },
  { value: 4, label: 'Evolution IV' },
  { value: 5, label: 'Evolution V' },
];

export const DEFAULT_POLARITY = 'UNIVERSAL' as Polarity;
export const ALL_POLARITIES = ['MADURAI', 'VAZARIN', 'NAIRU', 'UMBRA', 'PENJAGA', 'UNIVERSAL'] as Polarity[];

const SLOT_MOD_TYPES: Record<string, string[]> = {
  warframe: ['Warframe Mod', 'Aura'],
  primary: ['Primary Mod', 'Shotgun Mod', 'Rifle Mod'],
  secondary: ['Secondary Mod', 'Pistol Mod'],
  melee: ['Melee Mod', 'Stance Mod'],
  'arch-gun': ['Arch-Gun Mod'],
  'arch-melee': ['Arch-Melee Mod'],
  companion: ['Companion Mod', 'Robotic Mod', 'Beast Mod', 'Kubrow Mod', 'Kavat Mod'],
  companion_weapon: ['Primary Mod', 'Shotgun Mod', 'Secondary Mod', 'Melee Mod'],
  exalted_weapon: ['Primary Mod', 'Shotgun Mod', 'Secondary Mod', 'Melee Mod'],
};

export const ARCANE_SLOT_COUNT: Record<string, number> = {
  warframe: 2,
  primary: 1,
  secondary: 1,
  melee: 1,
  'arch-gun': 0,
  'arch-melee': 0,
  exalted_weapon: 0,
  companion: 0,
  companion_weapon: 0,
};

export function matchesCompType(name: string, compType: string): boolean {
  if (compType === 'sentinel') return !name.includes('Moa') && !name.includes('Hound') && !name.includes('Kubrow') && !name.includes('Kavat') && !name.includes('Predasite') && !name.includes('Vulpaphyla') && !name.includes('Helminth');
  if (compType === 'moa') return name.includes('Moa');
  if (compType === 'hound') return name.includes('Hound');
  if (compType === 'predasite') return name.includes('Predasite');
  if (compType === 'vulpaphyla') return name.includes('Vulpaphyla');
  return name.includes('Kubrow') || name.includes('Kavat') || name.includes('Helminth Charger') || name.includes('Venari');
}

export function calcModCost(mod: ModSlot, slotPolarity: Polarity): number {
  return effectiveCost(modDrainAtRank(mod.baseDrain, mod.rank), polarityMatches(mod.polarity, slotPolarity));
}

export function countUniqueStatusTypes(stats: WeaponStats | undefined): number {
  if (!stats?.damagePerType) return 0;
  return Object.keys(stats.damagePerType).filter(key => (stats.damagePerType[key] ?? 0) > 0).length;
}

export function matchesSlotModType(mod: ItemOption, slot: string): boolean {
  const types = SLOT_MOD_TYPES[slot];
  if (!types) return true;
  const modType = (mod.type ?? '').toLowerCase();
  return types.some(type => modType.includes(type.toLowerCase()));
}

// ── Conditional Trigger Toggles ─────────────────────
import type { ConditionalTriggerState } from '../../engine/build-core';

export type ConditionalTriggers = ConditionalTriggerState;

export const DEFAULT_CONDITIONAL_TRIGGERS: ConditionalTriggers = {
  onKill: false,
  onHeadshot: false,
  onSlashProc: false,
  galvanizedStacks: 0,
  primaryDecrees: 0,
  onAimGlide: false,
  onWallLatch: false,
  onSlide: false,
  onSpawn: false,
  comboTier: 0,
  onCriticalHit: false,
  onStatusEffect: false,
  airborne: false,
  crouching: false,
  blocking: false,
  onLiftedEnemy: false,
  invisible: false,
  perSchoolMod: 0,
  onWeakPoint: false,
  onFinalShot: false,
  markedZone: false,
  onHealthPickup: false,
  onEnergyPickup: false,
  onAmmoPickup: false,
  onMercy: false,
  onHacking: false,
};

export const TRIGGER_LABELS: Partial<Record<keyof ConditionalTriggers, string>> = {
  onKill: 'On Kill',
  onHeadshot: 'On Headshot',
  onSlashProc: 'On Slash Proc',
  galvanizedStacks: 'Galvanized Stacks',
  primaryDecrees: 'Primary Decrees',
  onAimGlide: 'Aim Glide',
  onWallLatch: 'Wall Latch',
  onSlide: 'Slide',
  onSpawn: 'On Spawn',
  comboTier: 'Combo Tier',
};
