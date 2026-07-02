import type { CalcBreakdown } from '../calc-breakdown';
import type { Modifier } from '../modifier';
import type {
  EquippedArcane,
  EquippedMod,
  EquippedShard,
} from '../build-core';

export interface SetBonusInfo {
  count: number;
  maxPieces: number;
  label: string;
  statStrings: string[];
  activeBonus: string;
}

export interface ItemResolver {
   resolveMod(mod: EquippedMod): Modifier[];
   resolveArcane(arcane: EquippedArcane): Modifier[];
   resolveShard(shard: EquippedShard): Modifier[];
   resolveWarframePassive(id: string): Modifier[];
   resolveWeaponPassive(id: string): Modifier[];
   resolveCompanionPassive(id: string): Modifier[];
   resolveOperator(id: string): Modifier[];
   getModSet(mod: EquippedMod): { modSetPath: string; setDef: { numUpgradesInSet: number; stats: string[]; name: string } | null } | null;
   resolveSetBonusStat(rawStat: string, source: string): Modifier[];
}

export interface CompanionStats {
  health: number;
  shields: number;
  armor: number;
  ehp: number;
  shieldRecharge: number;
  healthRegen: number;
}

export interface HelminthAbilityStats {
  abilityName: string;
  donorName: string;
  baseDamage: number;
  scaledDamage: number;
  damageType: string;
  scalingStat: string;
  slotIndex: number;
}

export interface CalculatedStats {
   // ── Warframe core ────────────────────────────────────
   strength: number;
   duration: number;
   range: number;
   efficiency: number;
   health: number;
   shields: number;
   armor: number;
   energy: number;
   ehp: number;
   sprintSpeed: number;
   overguard?: number;
   castingSpeed?: number;
   healthRegen?: number;

   // ── Movement ─────────────────────────────────────────
   shieldRecharge?: number;
   shieldRechargeDelay?: number;
   parkourVelocity?: number;
   aimGlideDuration?: number;
   bulletJump?: number;
   slide?: number;
   friction?: number;
   jumpHeight?: number;
   dodgeSpeed?: number;
   mobility?: number;

   // ── Survival ─────────────────────────────────────────
   bleedoutReduction?: number;
   reviveSpeed?: number;
   bleedoutDamage?: number;
   reviveDamageTaken?: number;
   shieldGateDuration?: number;
   knockdownChance?: number;
   knockdownRecovery?: number;
   staggerRecovery?: number;

   // ── Block / Parry ────────────────────────────────────
   damageBlock?: number;
   parryAngle?: number;
   staggerOnBlock?: number;
   stunOnBlock?: number;
   dodgeDr?: number;
   bulletJumpDr?: number;

   // ── Resistances ──────────────────────────────────────
   resistances?: Record<string, number>;

   // ── Derived ──────────────────────────────────────────
   weapons: Record<string, WeaponStats>;
   companion?: CompanionStats;
   setBonuses?: SetBonusInfo[];
   helminthAbility?: HelminthAbilityStats;
   enemy?: EnemySummaryStats;
   breakdowns?: WarframeBreakdowns;

   // ── Shield Gating ───────────────────────────────────
   shieldGatingEhp?: number;
   shieldGateMultiplier?: number;

   // ── Overguard ───────────────────────────────────────
   overguardEhp?: number;
   effectiveOverguard?: number;

   // ── Adaptation ──────────────────────────────────────
   adaptationEhpMultiplier?: number;
   adaptationMaxDr?: number;

   // ── Stealth / Finisher ──────────────────────────────
   stealthDamageMultiplier?: number;
   finisherDamageMultiplier?: number;

   // ── Ability Damage ──────────────────────────────────
   abilityDamageResults?: Record<string, AbilityDamageResult>;

   // ── Incarnon ────────────────────────────────────────
   incarnonBonuses?: Record<string, number>;
   hasIncarnonForm?: boolean;

   // ── Stat Stick ──────────────────────────────────────
   statStickContribution?: number;
   usesStatStick?: boolean;

   // ── Damage Attenuation (enemy) ──────────────────────
   enemyAttenuationDr?: number;
   enemyAttenuatedEhp?: number;

   // ═════════════════════════════════════════════════════════
   // NEW: Milestone 2 fields
   // ═════════════════════════════════════════════════════════

   // ── Focus School ────────────────────────────────────
   focusSchool?: string;
   focusPassives?: { stat: string; value: number; source: string }[];

   // ── Operator ────────────────────────────────────────
   operatorHealth?: number;
   operatorShields?: number;
   operatorArmor?: number;
   operatorEnergy?: number;
   operatorAmpDamage?: number;
   operatorCritChance?: number;
   operatorCritMultiplier?: number;

   // ── Companion Extended ──────────────────────────────
   companionPrecepts?: string[];
   companionBondEffects?: { stat: string; value: number }[];
   companionWeaponStats?: WeaponStats;

   // ── Enemy Extended ──────────────────────────────────
   difficultyMode?: string;
   steelPathMultiplier?: number;
   eximusOverguard?: number;
   sentientAdaptation?: number;
   bossMechanics?: string[];

   // ── Ability Damage Extended ─────────────────────────
   abilityScalingDetails?: Record<string, {
     baseDamage: number;
     scaledDamage: number;
     scalingStat: string;
     scalingFactor: number;
     abilityName: string;
     damageType: string;
     energyCost: number;
     cooldown: number;
   }>;

   // ── Warframe Passives ───────────────────────────────
   passiveEffects?: { stat: string; value: number; category: string }[];

   // ── Effect Engine Integration ───────────────────────
   activeEffects?: string[];
   effectTriggerCounters?: Record<string, number>;

   // ── Build Health / Optimization ─────────────────────
   statCoveragePercentage?: number;
   missingStats?: string[];
   warningFlags?: string[];
}

export interface AbilityDamageResult {
  damagePerCast: number;
  damagePerSecond: number;
  sustainedDps: number;
  effectiveDuration: number;
  effectiveRange: number;
  energyCost: number;
  energyPerSecond: number;
  abilityName: string;
  damageType: string;
}

export interface DoTStats {
  slashBleedTick: number;
  slashBleedDps: number;
  heatBurnTick: number;
  heatBurnDps: number;
  toxinTick: number;
  toxinDps: number;
  gasTick: number;
  gasDps: number;
  electricTick: number;
  electricDps: number;
  totalDotDps: number;
}

export interface EnemyDamageStats {
  damagePerShotVsShield: number;
  damagePerShotVsHealth: number;
  damagePerTypeVsHealth: Record<string, number>;
  damagePerTypeVsShield: Record<string, number>;
  shotsToBreakShield: number;
  shotsToKillHealth: number;
  shotsToKill: number;
  timeToKill: number;
  sustainedTimeToKill: number;
  effectiveDps: number;
  burstEffectiveDps: number;
  multiTargetEffectiveDps: number;
}

export interface EnemySummaryStats {
  name: string;
  faction: string;
  level: number;
  scaledHealth: number;
  scaledShields: number;
  effectiveArmor: number;
  dr: number;
  ehp: number;
  healthType: string;
  armorType: string;
  shieldType: string;
  weakness: string[];
  resistance: string[];
  immune: string[];
  multiTarget: number;
}

export interface WeaponStats {
  totalDamage: number;
  totalBase: number;
  elementalDamage: number;
  multishot: number;
  critChance: number;
  critMultiplier: number;
  fireRate: number;
  statusChance: number;
  reloadSpeed: number;
  magazine: number;
  avgShotDamage: number;
  avgDps: number;
  sustainedDps: number;
  burstDps: number;
  damagePerType: Record<string, number>;
  statusProbs: Record<string, number>;
  critTiers: { yellow: number; orange: number; red: number };
  dot: DoTStats;
  enemyDamage?: EnemyDamageStats;
  heavyWindUp?: number;
  heavyEfficiency?: number;
  initialCombo?: number;
  heavyCritChance?: number;
  comboDuration?: number;
  comboChance?: number;
  meleeRange?: number;
  recoil?: number;
  zoom?: number;
  projectileSpeed?: number;
  accuracy?: number;
  statusDuration?: number;
  headshotMultiplier?: number;
  headshotDps?: number;
  punchThrough?: number;
  maxAmmo?: number;
  blastRadius?: number;
  lifeSteal?: number;
  channelingDamage?: number;
  channelingCost?: number;
  slamAttack?: number;
  slideAttack?: number;
   finisherDamage?: number;
   breakdowns?: WeaponBreakdowns;

   // ── Battery / Charge Weapon ─────────────────────────
   isBatteryWeapon?: boolean;
   isChargeWeapon?: boolean;
   batterySustainedDps?: number;
   chargeTimeEffective?: number;

   // ── Incarnon Evolution ──────────────────────────────
   incarnonBonuses?: Record<string, number>;
   hasIncarnonForm?: boolean;
}

export interface WarframeBreakdowns {
  health?: CalcBreakdown;
  shields?: CalcBreakdown;
  armor?: CalcBreakdown;
  energy?: CalcBreakdown;
  strength?: CalcBreakdown;
  duration?: CalcBreakdown;
  range?: CalcBreakdown;
  efficiency?: CalcBreakdown;
  ehp?: CalcBreakdown;
  overguard?: CalcBreakdown;
  castingSpeed?: CalcBreakdown;
  healthRegen?: CalcBreakdown;
  shieldRecharge?: CalcBreakdown;
  shieldRechargeDelay?: CalcBreakdown;
  parkourVelocity?: CalcBreakdown;
  aimGlideDuration?: CalcBreakdown;
  bulletJump?: CalcBreakdown;
  slide?: CalcBreakdown;
  friction?: CalcBreakdown;
  jumpHeight?: CalcBreakdown;
  dodgeSpeed?: CalcBreakdown;
  mobility?: CalcBreakdown;
  bleedoutReduction?: CalcBreakdown;
  reviveSpeed?: CalcBreakdown;
  knockdownRecovery?: CalcBreakdown;
  staggerRecovery?: CalcBreakdown;
  damageBlock?: CalcBreakdown;
  parryAngle?: CalcBreakdown;
  staggerOnBlock?: CalcBreakdown;
  stunOnBlock?: CalcBreakdown;
  dodgeDr?: CalcBreakdown;
  bulletJumpDr?: CalcBreakdown;
}

export interface WeaponBreakdowns {
  baseDamage?: CalcBreakdown;
  multishot?: CalcBreakdown;
  critChance?: CalcBreakdown;
  critMultiplier?: CalcBreakdown;
  fireRate?: CalcBreakdown;
  statusChance?: CalcBreakdown;
  reloadSpeed?: CalcBreakdown;
  burstDps?: CalcBreakdown;
  sustainedDps?: CalcBreakdown;
  headshotMultiplier?: CalcBreakdown;
  headshotDamage?: CalcBreakdown;
  weakpointDamage?: CalcBreakdown;
  meleeRange?: CalcBreakdown;
  heavyWindUp?: CalcBreakdown;
  heavyEfficiency?: CalcBreakdown;
  heavyCritChance?: CalcBreakdown;
  comboDuration?: CalcBreakdown;
  comboChance?: CalcBreakdown;
  statusDuration?: CalcBreakdown;
  punchThrough?: CalcBreakdown;
  blastRadius?: CalcBreakdown;
  zoom?: CalcBreakdown;
  projectileSpeed?: CalcBreakdown;
  accuracy?: CalcBreakdown;
  recoil?: CalcBreakdown;
}
