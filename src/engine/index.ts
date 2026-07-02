export { Polarity } from './build-core';
export type {
  EquippedMod, EquippedArcane, EquippedShard, HelminthAbility,
  WarframeBuild, WeaponBuild, CompanionBuild, OperatorBuild,
  EnemyTargetState, ConditionalTriggerState, BuildCore,
} from './build-core';

export type { ModifierCategory, ModifierCondition, Modifier } from './modifier';

export {
  parsePolarity, POLARITY_SYMBOL, POLARITY_COLOR, POLARITY_LABEL,
  polarityMatches, modDrainAtRank, effectiveCost, warframeCapacity, weaponCapacity,
} from './polarity';
export type { CapacityBreakdown, WarframeCapacityInput, WeaponCapacityInput } from './polarity';

export type { CalcContribution, CalcBreakdown } from './calc-breakdown';
export { buildBreakdown, groupModifiersByKey } from './calc-breakdown';

export type { DamageTypes } from './damage-calculator';
export { calculateStatusProbabilities } from './damage-calculator';

export type { Ability } from './ability-stats';
export { calculateAbilityStats } from './ability-stats';

export type { AbilityDpsResult } from './ability-dps';
export { estimateAbilityDps, HELMINTH_ABILITIES } from './ability-dps';

export type { EnemyTarget, EnemySimState } from './enemy-simulator';
export { scaleStats, calcEffectiveArmor, calcEhp, ENEMY_TARGETS, DEFAULT_ENEMY_STATE } from './enemy-simulator';

export { calculateBuild, calculateSingleWeapon, calculateDoT, resolveEnemy, calculateEnemyDamage } from './stat-processor';
export { bucketify, resolveFlat, resolveMultiplied } from './stat-processor/bucket-ops';
export type {
  ItemResolver, CalculatedStats, WeaponStats, DoTStats,
  EnemyDamageStats, EnemySummaryStats, SetBonusInfo,
  CompanionStats, HelminthAbilityStats, WarframeBreakdowns,
  WeaponBreakdowns,
} from './stat-processor/types';
export type { ResolvedBucket } from './stat-processor';

// ── Milestone 2: System Exports ────────────────────────
export { getWarframeAbilityDef, getAllWarframeAbilityDefs } from './systems/warframe-abilities';
export type { WarframeAbilityDef, AbilityDef, AugmentDef } from './systems/warframe-abilities';
export { getFocusSchool, getFocusPassives, getResolvedFocusModifiers, FOCUS_SCHOOLS } from './systems/focus-system';
export type { FocusSchoolDef, FocusNodeDef, FocusPassiveDef, FocusActiveDef } from './systems/focus-system';
export { resolveBondMods, BOND_MODS, KNOWN_PRECEPTS } from './systems/companion-system';
export type { BondModDef, PreceptDef, CompanionDef, CompanionType } from './systems/companion-system';
export { getDifficulty, DIFFICULTY_MODIFIERS, scaleEnemyHealth, scaleEnemyShields, scaleEnemyArmor, calcSentientAdaptation, calcEximusOverguard, isSteelPathEnabled, BOSS_MECHANICS, FACTION_DEFS, EXIMUS_TYPES } from './systems/enemy-system';
export type { DifficultyMode, DifficultyModifiers, BossMechanicDef } from './systems/enemy-system';
export { ARCANS_DB, getArcane, getArcanesByCategory, resolveArcaneEffect } from './systems/arcane-system';
export type { ArcaneDef, ArcaneTrigger, ArcaneEffectDef } from './systems/arcane-system';
export { resolveEffects, createEffectEngineState } from './systems/effect-engine';
export type { EffectEngineState, EffectResolutionResult } from './systems/effect-engine';
export {
  calculateAbilityDamage, calculateStealthFinisher, calculateShieldGating,
  shieldGateEhpMultiplier, calculateOverguardDamage, overguardEffectiveHp,
  calculateAdaptation, adaptationMaxEhpMultiplier,
  calculateBatteryWeaponDps, applyDamageAttenuation,
  calculateStatStickContribution, isStatStickAbility, STAT_STICK_ABILITIES,
  resolveIncarnonBonuses, isIncarnonWeapon,
} from './systems';