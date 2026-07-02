/**
 * Effect System — Core Type Definitions
 *
 * Everything in Warframe is modelled as:
 *   Entity → State → Effect → Rule → Resolver
 *
 * Every modifier that affects gameplay is an Effect.
 * Every Effect has a source, target, operation, value, and rules.
 */

export type EffectCategory =
  | 'flat'
  | 'percentage'
  | 'multiplicative'
  | 'additive'
  | 'exponential'
  | 'lookup'
  | 'piecewise'
  | 'conditional'
  | 'snapshot'
  | 'dynamic'
  | 'time_based'
  | 'stacking'
  | 'refresh'
  | 'decay';

export type EffectTarget =
  | 'warframe'
  | 'primary_weapon'
  | 'secondary_weapon'
  | 'melee_weapon'
  | 'archgun'
  | 'archmelee'
  | 'exalted_weapon'
  | 'companion'
  | 'companion_weapon'
  | 'operator'
  | 'amp'
  | 'archwing'
  | 'necramech'
  | 'enemy'
  | 'global';

export type EffectTrigger =
  | 'always'
  | 'on_kill'
  | 'on_headshot'
  | 'on_headshot_kill'
  | 'on_slash_proc'
  | 'on_critical_hit'
  | 'on_status_effect'
  | 'on_aim_glide'
  | 'on_wall_latch'
  | 'on_slide'
  | 'on_spawn'
  | 'on_melee_kill'
  | 'on_damage_taken'
  | 'on_reload'
  | 'on_ability_cast'
  | 'on_melee_kill'
  | 'on_heavy_attack'
  | 'on_slam'
  | 'on_finisher'
  | 'on_stealth_kill'
  | 'on_weakpoint'
  | 'on_final_shot'
  | 'on_mercy'
  | 'on_hack'
  | 'on_health_pickup'
  | 'on_energy_pickup'
  | 'on_ammo_pickup'
  | 'when_airborne'
  | 'when_crouching'
  | 'when_blocking'
  | 'when_invisible'
  | 'when_invulnerable'
  | 'when_shield_broken'
  | 'when_shield_gated'
  | 'when_reloading'
  | 'when_aiming'
  | 'when_sliding'
  | 'when_bullet_jumping'
  | 'when_overguard_active'
  | 'condition_met';

export type StackingRule =
  | 'additive'
  | 'multiplicative'
  | 'highest_only'
  | 'refreshes'
  | 'replaces'
  | 'unique'
  | 'mutually_exclusive';

export type DamageType =
  | 'impact' | 'puncture' | 'slash'
  | 'heat' | 'cold' | 'electric' | 'toxin'
  | 'blast' | 'corrosive' | 'gas' | 'magnetic' | 'radiation' | 'viral'
  | 'void'
  | 'true'
  | 'tau';

export interface EffectCondition {
  trigger: EffectTrigger;
  param?: number;
  paramKey?: string;
  stackLimit?: number;
  icd?: number;
  duration?: number;
}

export interface Effect {
  id: string;
  name: string;
  source: string;
  sourceType: 'mod' | 'arcane' | 'shard' | 'passive' | 'ability' | 'buff' | 'focus' | 'set_bonus';
  target: EffectTarget | EffectTarget[];
  category: EffectCategory;
  stat: string;
  stackingGroup: string;
  baseValue: number;
  operation: 'add' | 'multiply' | 'override' | 'replace';
  scaling?: {
    type: 'linear' | 'exponential' | 'diminishing';
    factor: number;
    maxStacks?: number;
  };
  condition?: EffectCondition;
  duration?: number;
  tags: string[];
  mutuallyExclusiveWith?: string[];
  priority: number;
  description: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
}

export interface EffectInstance {
  effect: Effect;
  currentValue: number;
  currentStacks: number;
  remainingDuration: number;
  timeSinceLastTrigger: number;
  active: boolean;
}

export interface GameState {
  warframe: WarframeGameState;
  weapons: Record<string, WeaponGameState>;
  companion: CompanionGameState;
  enemy: EnemyGameState;
  mission: MissionGameState;
}

export interface WarframeGameState {
  health: number;
  maxHealth: number;
  shields: number;
  maxShields: number;
  overshields: number;
  armor: number;
  energy: number;
  maxEnergy: number;
  isShieldBroken: boolean;
  isShieldGated: boolean;
  shieldGateTimer: number;
  isInvulnerable: boolean;
  invulnerabilityTimer: number;
  isInvisible: boolean;
  isAirborne: boolean;
  isSliding: boolean;
  isWallLatching: boolean;
  isBulletJumping: boolean;
  isCrouching: boolean;
  isBlocking: boolean;
  isAiming: boolean;
  isReloading: boolean;
  overguard: number;
  maxOverguard: number;
  comboMultiplier: number;
  comboCount: number;
  statusEffects: Map<DamageType, number>;
  adaptationStacks: Map<string, number>;
  activeArcanes: Map<string, ArcaneState>;
}

export interface ArcaneState {
  effectId: string;
  currentStacks: number;
  maxStacks: number;
  remainingDuration: number;
  icdRemaining: number;
  active: boolean;
}

export interface WeaponGameState {
  currentAmmo: number;
  maxAmmo: number;
  isReloading: boolean;
  reloadTimer: number;
  incarnonActive: boolean;
  incarnonCharge: number;
  incarnonMaxCharge: number;
  comboMultiplier: number;
  comboCount: number;
  zoomLevel: number;
  isAiming: boolean;
}

export interface CompanionGameState {
  isAlive: boolean;
  isActive: boolean;
  precepts: Map<string, boolean>;
}

export interface EnemyGameState {
  healthType: string;
  armorType: string;
  shieldType: string;
  faction: string;
  level: number;
  baseLevel: number;
  armorStripped: number;
  corrosiveStacks: number;
  heatProcActive: boolean;
  viralProcs: number;
  magneticProcs: number;
  hasOverguard: boolean;
  damageAttenuation: boolean;
  isBoss: boolean;
  isSteelPath: boolean;
  statusCaps: Map<DamageType, number>;
}

export interface MissionGameState {
  isSteelPath: boolean;
  isArchonHunt: boolean;
  isSortie: boolean;
  faction: string;
  missionLevel: number;
  enemyLevelMin: number;
  enemyLevelMax: number;
}
