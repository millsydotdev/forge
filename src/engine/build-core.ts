/**
 * ─────────────────────────────────────────────────────────
 * BuildCore — the sandbox state that represents one build.
 * Every item (mod, arcane, shard) is a "Modifier provider".
 * The StatProcessor iterates these, collects their
 * Modifiers, and resolves them in Warframe order.
 * ─────────────────────────────────────────────────────────
 */

import type { Modifier } from './modifier';

// ── Polarity ────────────────────────────────────────────
export enum Polarity {
  MADURAI = 'MADURAI',
  VAZARIN = 'VAZARIN',
  NAIRU = 'NAIRU',
  UMBRA = 'UMBRA',
  PENJAGA = 'PENJAGA',
  UNIVERSAL = 'UNIVERSAL',
}

// ── Equipped Item Reference ─────────────────────────────
// Points into a static JSON data set (e.g. WFCD warframe-items).
// The rank and slot polarity are user-configured; the resolver
// looks up the base item and computes the effect at the given rank.

export interface EquippedMod {
  id: string;
  rank: number;
  slotPolarity: Polarity;
  polarityMatch: boolean;
  rivenData?: { positives: { stat: string; value: number }[]; negative: { stat: string; value: number } | null };
}

export interface EquippedArcane {
  id: string;
  rank: number;
}

export interface EquippedShard {
  id: string;
  color: 'azure' | 'amber' | 'crimson' | 'violet' | 'topaz' | 'emerald';
  isTau: boolean;
}

export interface HelminthAbility {
  donorWarframeId: string;
  slotIndex: number;
  replacesAbilityIndex: number;
}

// ── Slotted Item Groups ─────────────────────────────────

export interface WarframeBuild {
  id: string;
  aura: EquippedMod | null;
  exilus: EquippedMod | null;
  normalMods: EquippedMod[];
  arcanes: [EquippedArcane | null, EquippedArcane | null];
  shards: EquippedShard[];
  helminth: HelminthAbility | null;
  exaltedWeapon: WeaponBuild | null;
}

export interface WeaponBuild {
  id: string;
  slot: 'primary' | 'secondary' | 'melee' | 'arch-gun' | 'arch-melee';
  normalMods: EquippedMod[];
  exilus: EquippedMod | null;
  arcanes: [EquippedArcane | null, EquippedArcane | null];
  /** Active attack mode for weapons with multiple attacks (Incarnon, alt-fire, etc.) */
  attackMode?: 'normal' | 'alt' | 'incarnon';
}

export interface CompanionBuild {
   id: string;
   type: 'sentinel' | 'beast' | 'moa' | 'hound' | 'predasite' | 'vulpaphyla';
   normalMods: EquippedMod[];
   slotPolarities: Polarity[];
   weapon: {
     id: string;
     normalMods: EquippedMod[];
     slotPolarities: Polarity[];
   } | null;
 }

export interface OperatorBuild {
   id: string;
   focusNodes: string[]; // uniqueNames of focus nodes
   arcane: EquippedArcane | null;
}

// ── Enemy Target State ─────────────────────────────────
// When present, the stat processor folds enemy armor DR, health/armor/
// shield class multipliers, level scaling, and weakness/resistance
// into per-shot damage, and produces TTK / shots-to-kill / effective DPS.
export interface EnemyTargetState {
  targetName: string;
  level: number;
  /** 0–1 fraction of armor stripped by abilities (e.g. Terrify, Tharros Strike). */
  armorStripped: number;
  /** 0–10 corrosive projection stacks (each removes 26% of remaining base armor). */
  corrosiveStacks: number;
  /** Heat proc reduces armor by 50% while active. */
  heatProc: boolean;
  /** Number of enemies hit per trigger pull (AoE / punch-through). */
  multiTarget: number;
  /** Number of active electric status stacks on the target (affects Violet shards). */
  electricStacks?: number;
}

// ── Conditional Triggers ───────────────────────────────
// Toggles that activate conditional mod bonuses (on-kill, on-headshot,
// aim-glide, etc.) and stack counters (galvanized stacks, primary decrees).
export interface ConditionalTriggerState {
  onKill: boolean;
  onHeadshot: boolean;
  onSlashProc: boolean;
  galvanizedStacks: number;
  primaryDecrees: number;
  onAimGlide: boolean;
  onWallLatch: boolean;
  onSlide: boolean;
  onSpawn: boolean;
  /** Current melee combo tier (0 = no combo, 1 = 1.5x, 2 = 2x, 3 = 2.5x, 4 = 3x). Drives Blood Rush / Weeping Wounds. */
  comboTier: number;

  // ── NEW condition triggers (were previously dead) ────
  /** Mods that activate on critical hit */
  onCriticalHit: boolean;
  /** Mods that activate on status effect */
  onStatusEffect: boolean;
  /** Mods that activate while airborne */
  airborne: boolean;
  /** Mods that activate while crouching */
  crouching: boolean;
  /** Mods that activate while blocking */
  blocking: boolean;
  /** Mods that activate vs lifted enemies */
  onLiftedEnemy: boolean;
  /** Mods that activate while invisible */
  invisible: boolean;
  /** Number of equipped school mods (for per-school-mod bonuses) */
  perSchoolMod: number;
  /** Mods that activate on weak point hits */
  onWeakPoint: boolean;
  /** Mods that activate on final shot of magazine */
  onFinalShot: boolean;
  /** Mod is active inside marked zone */
  markedZone: boolean;
  /** Mods that activate on health orb pickup */
  onHealthPickup: boolean;
  /** Mods that activate on energy orb pickup */
  onEnergyPickup: boolean;
  /** Mods that activate on ammo pickup */
  onAmmoPickup: boolean;
  /** Mods that activate after a mercy kill */
  onMercy: boolean;
  /** Mods that activate after hacking */
  onHacking: boolean;
}

// ── Root Build ──────────────────────────────────────────

export interface BuildCore {
   name: string;
   warframe: WarframeBuild;
   primary: WeaponBuild | null;
   secondary: WeaponBuild | null;
   melee: WeaponBuild | null;
   'arch-gun': WeaponBuild | null;
   'arch-melee': WeaponBuild | null;
   companion: CompanionBuild | null;
   operator: OperatorBuild | null;
   targetFaction?: string;
   isAiming?: boolean;
   activeStatuses?: number;
   /** Optional enemy target for vs-enemy DPS / TTK calculation. */
   enemy?: EnemyTargetState;
   /** Conditional mod triggers (on-kill, aim-glide, galvanized stacks, etc.). */
   conditionalTriggers?: ConditionalTriggerState;
   /**
    * External buffs (focus school, squad buffs) injected by the UI as
    * extra Modifiers. Consumed by the stat processor so Roar/Eclipse/
    * Warcry/Xata's Whisper/Vex Armor actually affect weapon DPS, not
    * just ability stats.
    */
   buffs?: Modifier[];
}
