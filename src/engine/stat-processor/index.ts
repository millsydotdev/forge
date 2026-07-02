import type { BuildCore, CompanionBuild, EquippedMod } from '../build-core';
import type { Modifier } from '../modifier';
import { gameData } from '../../data/game-data';
import { groupModifiersByKey, buildBreakdown } from '../calc-breakdown';
import { applyConditions } from './conditions';
import { bucketify, resolveFlat, resolveMultiplied } from './bucket-ops';
import { resolveMods, resolveArcanes, resolveShards, sortMods } from './mod-utils';
import { resolveEnemy } from './enemy';
import { calculateSingleWeapon } from './weapon-calc';
import type { ItemResolver, CalculatedStats, CompanionStats, HelminthAbilityStats, SetBonusInfo, WarframeBreakdowns, WeaponStats, EnemySummaryStats } from './types';
import { shieldGateEhpMultiplier } from '../systems/shield-gating';
import { adaptationMaxEhpMultiplier } from '../systems/adaptation';
import { getWarframeAbilityDef } from '../systems/warframe-abilities';
import { getResolvedFocusModifiers } from '../systems/focus-system';
import { resolveBondMods } from '../systems/companion-system';
import { calcSentientAdaptation, isSteelPathEnabled, BOSS_MECHANICS } from '../systems/enemy-system';
import { logger } from '../../utils/logger';

const ABILITY_STATS = ['strength', 'duration', 'range', 'efficiency'];

// Stats that can be auto-discovered from bucket groups.
// Format: [bucketKey (stat::group), resultField, label, defaultMultiplier]
// defaultMultiplier = 1 for %-based multiplicative stats where 1 = base/100%.
// defaultMultiplier = 0 for flat additive stats or where 0 = no effect.
const AUTO_FRAME_STATS: [string, string, string, number][] = [
  ['shield_recharge::warframe_shields', 'shieldRecharge', 'Shield Recharge', 1],
  ['shield_recharge_delay::warframe_shields', 'shieldRechargeDelay', 'Shield Recharge Delay', 1],
  ['parkour_velocity::warframe_move', 'parkourVelocity', 'Parkour Velocity', 1],
  ['aim_glide_dur::warframe_move', 'aimGlideDuration', 'Aim Glide Duration', 1],
  ['overguard_max::warframe_overguard', 'overguard', 'Overguard Max', 1],
  ['casting_speed::warframe_ability', 'castingSpeed', 'Casting Speed', 1],
  ['health_regen::warframe_health', 'healthRegen', 'Health Regen', 0],
  ['bullet_jump::warframe_movement', 'bulletJump', 'Bullet Jump', 1],
  ['slide::warframe_movement', 'slide', 'Slide', 1],
  ['friction::warframe_movement', 'friction', 'Friction', 1],
  ['jump_height::warframe_movement', 'jumpHeight', 'Jump Height', 1],
  ['dodge_speed::warframe_movement', 'dodgeSpeed', 'Dodge Speed', 1],
  ['mobility::warframe_movement', 'mobility', 'Mobility', 1],
  ['damage_block::warframe_block', 'damageBlock', 'Damage Block', 1],
  ['parry_angle::warframe_block', 'parryAngle', 'Parry Angle', 1],
  ['stagger_on_block::warframe_block', 'staggerOnBlock', 'Stagger on Block', 0],
  ['stun_on_block::warframe_block', 'stunOnBlock', 'Stun on Block', 0],
  ['dodge_dr::warframe_block', 'dodgeDr', 'Dodge DR', 0],
  ['bullet_jump_dr::warframe_block', 'bulletJumpDr', 'Bullet Jump DR', 0],
  ['bleedout_reduction::warframe_survival', 'bleedoutReduction', 'Bleedout Reduction', 1],
  ['revive_speed::warframe_survival', 'reviveSpeed', 'Revive Speed', 1],
  ['bleedout_damage::warframe_survival', 'bleedoutDamage', 'Bleedout Damage', 1],
  ['revive_damage_taken::warframe_survival', 'reviveDamageTaken', 'Revive Damage Taken', 1],
  ['resist_knockdown::warframe_resist_chance', 'knockdownChance', 'Knockdown Resist', 0],
  ['knockdown_recovery::warframe_movement', 'knockdownRecovery', 'Knockdown Recovery', 1],
  ['stagger_recovery::warframe_movement', 'staggerRecovery', 'Stagger Recovery', 1],
];
const WEAPON_SLOTS = ['primary', 'secondary', 'melee', 'arch-gun', 'arch-melee'] as const;

function collectAllMods(build: BuildCore): EquippedMod[] {
  const all: EquippedMod[] = [];
  const frame = build.warframe;
  if (frame.aura) all.push(frame.aura);
  if (frame.exilus) all.push(frame.exilus);
  all.push(...frame.normalMods);
  for (const slot of WEAPON_SLOTS) {
    const w = build[slot];
    if (!w) continue;
    if (w.exilus) all.push(w.exilus);
    all.push(...w.normalMods);
  }
  if (frame.exaltedWeapon) {
    if (frame.exaltedWeapon.exilus) all.push(frame.exaltedWeapon.exilus);
    all.push(...frame.exaltedWeapon.normalMods);
  }
  if (build.companion) {
    all.push(...build.companion.normalMods);
    if (build.companion.weapon) all.push(...build.companion.weapon.normalMods);
  }
  return all;
}

function collectSetBonuses(allMods: EquippedMod[], resolver: ItemResolver): SetBonusInfo[] {
  const counts = new Map<string, number>();
  const setInfo = new Map<string, { numUpgradesInSet: number; stats: string[]; name: string }>();

  for (const mod of allMods) {
    const set = resolver.getModSet(mod);
    if (!set) continue;
    counts.set(set.modSetPath, (counts.get(set.modSetPath) ?? 0) + 1);
    if (set.setDef && !setInfo.has(set.modSetPath)) {
      setInfo.set(set.modSetPath, set.setDef);
    }
  }

  const results: SetBonusInfo[] = [];
  for (const [modSetPath, count] of counts) {
    if (count < 2) continue;
    const info = setInfo.get(modSetPath);
    if (!info) continue;
    const maxPieces = info.numUpgradesInSet || info.stats.length || 6;
    const effectivePieces = Math.min(count, maxPieces);
    const activeIdx = Math.min(effectivePieces - 1, info.stats.length - 1);
    const label = modSetPath.split('/Sets/')[1]?.split('/')[0] ?? info.name;
    results.push({
      count,
      maxPieces,
      label,
      statStrings: info.stats,
      activeBonus: info.stats[activeIdx] ?? '',
    });
  }
  return results.sort((a, b) => b.count - a.count);
}

function calculateCompanion(
  companion: CompanionBuild,
  resolver: ItemResolver,
): CompanionStats | null {
  if (!companion.id) return null;

  const compMods = sortMods([
    ...resolver.resolveCompanionPassive(companion.id),
    ...resolveMods(resolver, companion.normalMods),
  ]);

  const compBuckets = bucketify(compMods);

  const baseHealth = resolveFlat(compBuckets, 'companion_base_health::companion_base');
  const baseShield = resolveFlat(compBuckets, 'companion_base_shield::companion_base');
  const baseArmor  = resolveFlat(compBuckets, 'companion_base_armor::companion_base');

  const health  = baseHealth  * (compBuckets.get('health::warframe_health')?.multiplier  ?? 1);
  const shields = baseShield  * (compBuckets.get('shields::warframe_shields')?.multiplier ?? 1);
  const armor   = baseArmor   * (compBuckets.get('armor::warframe_armor')?.multiplier    ?? 1);

  const ehp = health * (1 + armor / 300) + shields;

  const shieldRecharge = resolveFlat(compBuckets, 'shield_recharge::warframe_shields');
  const healthRegen = resolveFlat(compBuckets, 'companion_health_regen::companion_base');

  return { health, shields, armor, ehp, shieldRecharge, healthRegen };
}

/**
 * Calculate all stats for a complete build.
 * @param build - Complete build state (warframe, weapons, companion, helminth, shards, etc.)
 * @param resolver - Item resolver for mod/arcane/shard stat lookups (usually WfcdResolver)
 * @returns CalculatedStats with warframe, weapon, companion, enemy, and breakdown data
 */
function getWeaponBuffsFromFrame(
  frameMods: Modifier[],
  slot: string,
  energy: number,
  enemyState?: import('../build-core').EnemyTargetState,
): Modifier[] {
  const result: Modifier[] = [];

  for (const m of frameMods) {
    const isWeaponStat = m.stat.startsWith('weapon_') || 
                         m.stackingGroup.startsWith('weapon_') ||
                         ['base_damage', 'crit_chance', 'crit_damage', 'multishot', 'status_chance', 'status_duration', 'fire_rate', 'attack_speed', 'reload_speed_mult', 'magazine'].includes(m.stat) ||
                         m.stat.startsWith('elemental_') ||
                         m.stat.startsWith('physical_') ||
                         m.stat.startsWith('faction_');

    if (!isWeaponStat) continue;

    const sourceLower = m.source.toLowerCase();
    const statLower = m.stat.toLowerCase();

    let matchesSlot = false;
    if (slot === 'melee' || slot === 'exalted_weapon') {
      const isRangedOnly = sourceLower.includes('primary') || sourceLower.includes('secondary') || sourceLower.includes('shotgun') || sourceLower.includes('pistol') ||
                           statLower.includes('primary') || statLower.includes('secondary') || statLower.includes('pistol') || statLower.includes('shotgun');
      if (!isRangedOnly) {
        matchesSlot = true;
      }
    } else if (slot === 'primary' || slot === 'secondary') {
      const isMeleeOnly = sourceLower.includes('melee') || statLower.includes('melee') || statLower.includes('attack_speed') || statLower.includes('combo');
      if (!isMeleeOnly) {
        if (slot === 'primary') {
          const isSecondaryOnly = sourceLower.includes('secondary') || sourceLower.includes('pistol') || statLower.includes('secondary') || statLower.includes('pistol');
          if (!isSecondaryOnly) matchesSlot = true;
        } else {
          const isPrimaryOnly = sourceLower.includes('primary') || sourceLower.includes('rifle') || sourceLower.includes('shotgun') || statLower.includes('primary') || statLower.includes('rifle') || statLower.includes('shotgun');
          if (!isPrimaryOnly) matchesSlot = true;
        }
      }
    } else {
      const isSlotSpecific = sourceLower.includes('melee') || sourceLower.includes('primary') || sourceLower.includes('secondary');
      if (!isSlotSpecific) matchesSlot = true;
    }

    if (matchesSlot) {
      let finalValue = m.value;
      
      if (sourceLower.includes('archon shard (violet)') && statLower === 'crit_damage') {
        if (energy > 500) {
          finalValue = m.value * 2;
        }
        if (enemyState?.electricStacks && enemyState.electricStacks > 0) {
          const isTau = sourceLower.includes('tauforged');
          const perStack = isTau ? 0.015 : 0.01;
          finalValue += enemyState.electricStacks * perStack;
        }
      }

      result.push({
        ...m,
        value: finalValue,
      });
    }
  }

  return result;
}

/**
 * Calculate all stats for a complete build.
 * @param build - Complete build state (warframe, weapons, companion, helminth, shards, etc.)
 * @param resolver - Item resolver for mod/arcane/shard stat lookups (usually WfcdResolver)
 * @returns CalculatedStats with warframe, weapon, companion, enemy, and breakdown data
 */
export function calculateBuild(
  build: BuildCore,
  resolver: ItemResolver,
): CalculatedStats {
  logger.mark('calc-start');
  const frame = build.warframe;
  const buffs = build.buffs ?? [];
  const conditionalTriggers = build.conditionalTriggers;

  const allModsForSets = collectAllMods(build);
  const setBonuses = collectSetBonuses(allModsForSets, resolver);
  const setBonusMods: Modifier[] = [];
  for (const sb of setBonuses) {
    if (!sb.activeBonus) continue;
    const parsed = resolver.resolveSetBonusStat(
      sb.activeBonus,
      `${sb.label} Set (${sb.count}/${sb.maxPieces})`,
    );
    setBonusMods.push(...parsed);
  }

  const frameMods = sortMods([
    ...resolver.resolveWarframePassive(frame.id),
    ...resolveMods(resolver, frame.normalMods),
    ...(frame.aura ? resolveMods(resolver, [frame.aura]) : []),
    ...(frame.exilus ? resolveMods(resolver, [frame.exilus]) : []),
    ...resolveArcanes(resolver, frame.arcanes),
    ...resolveShards(resolver, frame.shards),
    ...buffs,
    ...setBonusMods,
  ]);

  const conditionedFrameMods = applyConditions(frameMods, conditionalTriggers);
  const abilityBuckets = bucketify(conditionedFrameMods);
  const frameModGroups = groupModifiersByKey(conditionedFrameMods);
  const abilityStats: Record<string, number> = {};
  for (const stat of ABILITY_STATS) {
    const value = resolveMultiplied(abilityBuckets, `${stat}::ability`);
    abilityStats[stat] = value || 1;
  }
  abilityStats.efficiency = Math.min(abilityStats.efficiency, 1.75);

  const baseHealth = resolveFlat(abilityBuckets, 'base_health::warframe_base');
  const baseShield = resolveFlat(abilityBuckets, 'base_shield::warframe_base');
  const baseArmor  = resolveFlat(abilityBuckets, 'base_armor::warframe_base');
  const baseEnergy = resolveFlat(abilityBuckets, 'base_energy::warframe_base');
  const baseSprint = resolveFlat(abilityBuckets, 'sprint_speed::warframe_base') || 1;

  const healthBucket = abilityBuckets.get('health::warframe_health');
  const shieldBucket = abilityBuckets.get('shields::warframe_shields');
  const armorBucket  = abilityBuckets.get('armor::warframe_armor');
  const energyBucket = abilityBuckets.get('energy::warframe_energy');
  const sprintBucket = abilityBuckets.get('sprint_speed::warframe_move');

  const shardArmorFlat = resolveFlat(abilityBuckets, 'armor::warframe_armor');
  const shardHealthFlat = resolveFlat(abilityBuckets, 'health::warframe_health');
  const shardShieldFlat = resolveFlat(abilityBuckets, 'shields::warframe_shields');
  const shardEnergyFlat = resolveFlat(abilityBuckets, 'energy::warframe_energy');

  const healthMod = baseHealth * (healthBucket?.multiplier ?? 1);
  const health = healthMod + shardHealthFlat;
  const shieldsMod = baseShield * (shieldBucket?.multiplier ?? 1);
  const shields = shieldsMod + shardShieldFlat;
  const armorMod = baseArmor * (armorBucket?.multiplier ?? 1);
  const armor = armorMod + shardArmorFlat;
  const energyMod = baseEnergy * (energyBucket?.multiplier ?? 1);
  const energy = energyMod + shardEnergyFlat;
  const sprintSpeed = baseSprint * (sprintBucket?.multiplier ?? 1);

  const ehp = health * (1 + armor / 300) + shields;

  const targetFaction = build.targetFaction ?? '';
  const isAiming = build.isAiming ?? false;
  const activeStatuses = build.activeStatuses ?? 0;
  const enemyState = build.enemy;

  const auraDebuffMods = conditionedFrameMods.filter(
    m => m.stat === 'enemy_armor' || m.stat === 'enemy_shield',
  );

  const enemyResolved = enemyState ? resolveEnemy(enemyState, auraDebuffMods) : null;
  const enemySummary: EnemySummaryStats | undefined = enemyResolved?.summary;

  const weapons: Record<string, WeaponStats> = {};
  for (const slot of WEAPON_SLOTS) {
    const weapon = build[slot];
    if (!weapon) continue;

    const weaponBuffs = [
      ...buffs,
      ...getWeaponBuffsFromFrame(conditionedFrameMods, slot, energy, enemyState),
    ];

    weapons[slot] = calculateSingleWeapon(
      weapon.id,
      weapon.normalMods,
      weapon.exilus,
      weapon.arcanes,
      targetFaction,
      isAiming,
      activeStatuses,
      resolver,
      weaponBuffs,
      enemyState,
      conditionalTriggers,
      auraDebuffMods,
    );
  }

  if (frame.exaltedWeapon) {
    const exaltedBuffs = [
      ...buffs,
      ...getWeaponBuffsFromFrame(conditionedFrameMods, 'exalted_weapon', energy, enemyState),
    ];

    weapons['exalted_weapon'] = calculateSingleWeapon(
      frame.exaltedWeapon.id || `${frame.id}_exalted`,
      frame.exaltedWeapon.normalMods,
      frame.exaltedWeapon.exilus,
      frame.exaltedWeapon.arcanes,
      targetFaction,
      isAiming,
      activeStatuses,
      resolver,
      exaltedBuffs,
      enemyState,
      conditionalTriggers,
      auraDebuffMods,
    );
  }

  if (build.companion?.weapon) {
    const compWp = build.companion.weapon;
    weapons['companion_weapon'] = calculateSingleWeapon(
      compWp.id,
      compWp.normalMods,
      null,
      [null, null],
      targetFaction,
      isAiming,
      activeStatuses,
      resolver,
      [],
      enemyState,
      conditionalTriggers,
      auraDebuffMods,
    );
  }

let companionStats: CompanionStats | undefined;
    if (build.companion) {
      companionStats = calculateCompanion(build.companion, resolver) ?? undefined;
    }

    let helminthAbility: HelminthAbilityStats | undefined;
    if (frame.helminth) {
      const def = gameData.getHelminthByDonor(frame.helminth.donorWarframeId);
      if (def) {
        const scalingValue = abilityStats[def.scalingStat] ?? 1;
        const scaledDamage = def.baseDamage * (1 + (scalingValue - 1) * def.scalingFactor);
        helminthAbility = {
          abilityName: def.abilityName,
          donorName: def.donorName,
          baseDamage: def.baseDamage,
          scaledDamage,
          damageType: def.damageType,
          scalingStat: def.scalingStat,
          slotIndex: frame.helminth.slotIndex,
        };
      }
    }

  // ── Auto-discover all generic frame stats from buckets ─────────────
  // Instead of manually computing every stat, iterate through a known
  // list of (bucketKey, resultField, label, defaultMultiplier).
  const autoStats: Record<string, number> = {};
  const wfBreakdowns: WarframeBreakdowns = {};

  for (const [bucketKey, resultField, label, defaultMult] of AUTO_FRAME_STATS) {
    const bucket = abilityBuckets.get(bucketKey);
    const mods = frameModGroups.get(bucketKey) ?? [];
    if (!bucket && mods.length === 0) {
      // No bucket, no mods — skip entirely (leave undefined)
      continue;
    }
    const mult = bucket?.multiplier ?? defaultMult;
    const value = defaultMult === 0 ? mult : mult; // For defaultMult=0, value IS the multiplier (flat stats)
    autoStats[resultField] = value;
    // Build breakdown for any stat that has mods or a non-default value
    if (mods.length > 0 || (defaultMult !== 0 && Math.abs(mult - defaultMult) > 0.001)) {
      wfBreakdowns[resultField as keyof WarframeBreakdowns] = buildBreakdown(
        label, mods, defaultMult, mult - defaultMult, value,
      );
    }
  }

  const healthMods = frameModGroups.get('health::warframe_health') ?? [];
  wfBreakdowns.health = buildBreakdown(
    'Health', healthMods, baseHealth, (healthBucket?.multiplier ?? 1) - 1, health,
  );

  const shieldMods = frameModGroups.get('shields::warframe_shields') ?? [];
  wfBreakdowns.shields = buildBreakdown(
    'Shields', shieldMods, baseShield, (shieldBucket?.multiplier ?? 1) - 1, shields,
  );

  const armorMods = frameModGroups.get('armor::warframe_armor') ?? [];
  wfBreakdowns.armor = buildBreakdown(
    'Armor', armorMods, baseArmor, (armorBucket?.multiplier ?? 1) - 1, armor,
  );

  const energyMods = frameModGroups.get('energy::warframe_energy') ?? [];
  wfBreakdowns.energy = buildBreakdown(
    'Energy', energyMods, baseEnergy, (energyBucket?.multiplier ?? 1) - 1, energy,
  );

  for (const stat of ABILITY_STATS) {
    const statMods = frameModGroups.get(`${stat}::ability`) ?? [];
    const bucket = abilityBuckets.get(`${stat}::ability`);
    wfBreakdowns[stat as keyof WarframeBreakdowns] = buildBreakdown(
      stat.charAt(0).toUpperCase() + stat.slice(1),
      statMods, 0, (bucket?.multiplier ?? 1) - 1, abilityStats[stat],
    );
  }

  wfBreakdowns.ehp = {
    label: 'EHP', base: health, baseSource: 'Health',
    flats: [], multipliers: [],
    flatSum: health, multiplierSum: armor / 300,
    final: ehp,
    formula: `${health.toFixed(0)} × (1 + ${armor.toFixed(0)}/300) + ${shields.toFixed(0)} = ${ehp.toFixed(0)}`,
  };

  // ── Shield Gating ─────────────────────────────────────
  const shieldRechargeRate = resolveFlat(abilityBuckets, 'shield_recharge::warframe_shields') || 15;
  const shieldRechargeDelayStat = resolveFlat(abilityBuckets, 'shield_recharge_delay::warframe_shields') || 1;
  const shieldGateMult = shieldGateEhpMultiplier(shields, shieldRechargeRate, shieldRechargeDelayStat, armor);
  const shieldGateEhpCalc = ehp * shieldGateMult;

  // ── Overguard ────────────────────────────────────────
  const overguardVal = autoStats.overguard ?? 0;
  const overguardEhpVal = overguardVal > 0 ? Math.round(overguardVal * (1 + 0.5)) : undefined;

  // ── Adaptation ───────────────────────────────────────
  const adaptMult = adaptationMaxEhpMultiplier();

  // ════════════════════════════════════════════════════════
  // NEW: Focus School Integration
  // ════════════════════════════════════════════════════════
  let focusPassiveEffects: { stat: string; value: number; source: string }[] | undefined;
  if (build.operator?.focusNodes && build.operator.focusNodes.length > 0) {
    const focusSource = build.operator.focusNodes[0]?.split('/').pop()?.toLowerCase() ?? '';
    const activeNodes = build.operator.focusNodes.map(n => n.split('/').pop() ?? '');
    const focusMods = getResolvedFocusModifiers(focusSource, activeNodes);
    focusPassiveEffects = focusMods.map(m => ({
      stat: m.stat, value: m.value, source: m.source,
    }));
  }

  // ════════════════════════════════════════════════════════
  // NEW: Warframe Passive Effects
  // ════════════════════════════════════════════════════════
  const wfAbilityDef = getWarframeAbilityDef(frame.id);
  const passiveEffects = wfAbilityDef?.passiveEffects?.map(e => ({
    stat: e.stat, value: e.value, category: e.category,
  })) ?? [];

  // ════════════════════════════════════════════════════════
  // NEW: Ability Damage Details
  // ════════════════════════════════════════════════════════
  const abilityScalingDetails: Record<string, {
    baseDamage: number; scaledDamage: number; scalingStat: string;
    scalingFactor: number; abilityName: string; damageType: string;
    energyCost: number; cooldown: number;
  }> = {};
  if (wfAbilityDef) {
    for (const ability of wfAbilityDef.abilities) {
      if (ability.baseDamage > 0) {
        const scalingVal = abilityStats[ability.scalingStat] ?? 1;
        const scaledDamage = ability.baseDamage * (1 + (scalingVal - 1) * ability.scalingFactor);
        abilityScalingDetails[ability.name] = {
          baseDamage: ability.baseDamage,
          scaledDamage: Math.round(scaledDamage),
          scalingStat: ability.scalingStat,
          scalingFactor: ability.scalingFactor,
          abilityName: ability.name,
          damageType: ability.damageType,
          energyCost: Math.max(1, Math.round(ability.baseCost * Math.max(2 - abilityStats.efficiency, 0.25))),
          cooldown: ability.cooldown,
        };
      }
    }
  }

  // ════════════════════════════════════════════════════════
  // NEW: Operator Stats
  // ════════════════════════════════════════════════════════
  let operatorStats: Partial<CalculatedStats> | undefined;
  if (build.operator) {
    const opHealthMult = abilityBuckets.get('operator_health::operator')?.multiplier ?? 1;
    const opShieldMult = abilityBuckets.get('operator_shields::operator')?.multiplier ?? 1;
    const opArmorFlat = resolveFlat(abilityBuckets, 'operator_armor::operator') || 50;
    const opEnergyMult = abilityBuckets.get('operator_energy::operator')?.multiplier ?? 1;
    operatorStats = {
      operatorHealth: Math.round(250 * opHealthMult),
      operatorShields: Math.round(250 * opShieldMult),
      operatorArmor: Math.round(opArmorFlat),
      operatorEnergy: Math.round(100 * opEnergyMult),
      operatorAmpDamage: 0,
      operatorCritChance: 0.2,
      operatorCritMultiplier: 2,
    };
  }

  // ════════════════════════════════════════════════════════
  // NEW: Enemy System Extended (Steel Path, Eximus, Sentient)
  // ════════════════════════════════════════════════════════
  const enemySystemInfo: {
    difficultyMode?: string;
    steelPathMultiplier?: number;
    eximusOverguard?: number;
    sentientAdaptation?: number;
    bossMechanics?: string[];
  } = {};
  if (enemyState) {
    const def = gameData.getEnemyByName(enemyState.targetName);
    if (def) {
      const isSp = isSteelPathEnabled({ steelPath: false });
      enemySystemInfo.difficultyMode = isSp ? 'steel_path' : 'normal';
      enemySystemInfo.steelPathMultiplier = isSp ? 2.5 : 1;
      if (def.faction === 'Sentient' || def.healthType === 'Sentient') {
        enemySystemInfo.sentientAdaptation = calcSentientAdaptation(0);
      }
      for (const [bossName, mechanic] of Object.entries(BOSS_MECHANICS)) {
        if (def.name.toLowerCase().includes(bossName.toLowerCase())) {
          enemySystemInfo.bossMechanics = [
            ...(enemySystemInfo.bossMechanics ?? []),
            `${mechanic.name}: ${mechanic.damageAttenuationType} attenuation, ${mechanic.phases} phases`,
          ];
        }
      }
    }
  }

  // ════════════════════════════════════════════════════════
  // NEW: Bond Mods Integration
  // ════════════════════════════════════════════════════════
  let companionBondEffects: { stat: string; value: number }[] | undefined;
  if (build.companion && build.companion.normalMods.length > 0) {
    const bondModNames = build.companion.normalMods
      .map(m => m.id)
      .filter(id => id.toLowerCase().includes('bond'));
    if (bondModNames.length > 0) {
      const shieldTotal = shields;
      const killStacks = conditionalTriggers?.galvanizedStacks ?? 0;
      const bondEffects = resolveBondMods(bondModNames, shieldTotal, killStacks);
      companionBondEffects = bondEffects.map(e => ({ stat: e.stat, value: e.value }));
    }
  }

  return {
    // Always-present warframe core
    strength: abilityStats.strength,
    duration: abilityStats.duration,
    range: abilityStats.range,
    efficiency: abilityStats.efficiency,
    health,
    shields,
    armor,
    energy,
    ehp,
    sprintSpeed,
    // Auto-discovered stats (set individually to satisfy type safety)
    ...(autoStats.shieldRecharge !== undefined ? { shieldRecharge: autoStats.shieldRecharge } : {}),
    ...(autoStats.shieldRechargeDelay !== undefined ? { shieldRechargeDelay: autoStats.shieldRechargeDelay } : {}),
    ...(autoStats.parkourVelocity !== undefined ? { parkourVelocity: autoStats.parkourVelocity } : {}),
    ...(autoStats.aimGlideDuration !== undefined ? { aimGlideDuration: autoStats.aimGlideDuration } : {}),
    ...(autoStats.overguard !== undefined ? { overguard: autoStats.overguard } : {}),
    ...(autoStats.castingSpeed !== undefined ? { castingSpeed: autoStats.castingSpeed } : {}),
    ...(autoStats.healthRegen !== undefined ? { healthRegen: autoStats.healthRegen } : {}),
    ...(autoStats.bulletJump !== undefined ? { bulletJump: autoStats.bulletJump } : {}),
    ...(autoStats.slide !== undefined ? { slide: autoStats.slide } : {}),
    ...(autoStats.friction !== undefined ? { friction: autoStats.friction } : {}),
    ...(autoStats.jumpHeight !== undefined ? { jumpHeight: autoStats.jumpHeight } : {}),
    ...(autoStats.dodgeSpeed !== undefined ? { dodgeSpeed: autoStats.dodgeSpeed } : {}),
    ...(autoStats.mobility !== undefined ? { mobility: autoStats.mobility } : {}),
    ...(autoStats.damageBlock !== undefined ? { damageBlock: autoStats.damageBlock } : {}),
    ...(autoStats.parryAngle !== undefined ? { parryAngle: autoStats.parryAngle } : {}),
    ...(autoStats.staggerOnBlock !== undefined ? { staggerOnBlock: autoStats.staggerOnBlock } : {}),
    ...(autoStats.stunOnBlock !== undefined ? { stunOnBlock: autoStats.stunOnBlock } : {}),
    ...(autoStats.dodgeDr !== undefined ? { dodgeDr: autoStats.dodgeDr } : {}),
    ...(autoStats.bulletJumpDr !== undefined ? { bulletJumpDr: autoStats.bulletJumpDr } : {}),
    ...(autoStats.bleedoutReduction !== undefined ? { bleedoutReduction: autoStats.bleedoutReduction } : {}),
    ...(autoStats.reviveSpeed !== undefined ? { reviveSpeed: autoStats.reviveSpeed } : {}),
    ...(autoStats.bleedoutDamage !== undefined ? { bleedoutDamage: autoStats.bleedoutDamage } : {}),
    ...(autoStats.reviveDamageTaken !== undefined ? { reviveDamageTaken: autoStats.reviveDamageTaken } : {}),
    ...(autoStats.knockdownChance !== undefined ? { knockdownChance: autoStats.knockdownChance } : {}),
    ...(autoStats.knockdownRecovery !== undefined ? { knockdownRecovery: autoStats.knockdownRecovery } : {}),
    ...(autoStats.staggerRecovery !== undefined ? { staggerRecovery: autoStats.staggerRecovery } : {}),
    // Nested structures
    weapons,
    companion: companionStats,
    setBonuses,
    helminthAbility,
    enemy: enemySummary,
    breakdowns: wfBreakdowns,

    // ── Advanced Systems Output ──────────────────────────
    shieldGatingEhp: Math.round(shieldGateEhpCalc),
    shieldGateMultiplier: Math.round(shieldGateMult * 100) / 100,
    ...(overguardEhpVal !== undefined ? { overguardEhp: overguardEhpVal } : {}),
    adaptationEhpMultiplier: Math.round(adaptMult * 100) / 100,
    adaptationMaxDr: 0.9,
    stealthDamageMultiplier: 1.0,
    finisherDamageMultiplier: 1.0,
    abilityDamageResults: {},

    // ══════════════════════════════════════════════════════
    // NEW: Milestone 2 Integration Fields
    // ══════════════════════════════════════════════════════
    ...(focusPassiveEffects ? { focusPassives: focusPassiveEffects } : {}),
    ...(passiveEffects.length > 0 ? { passiveEffects } : {}),
    ...(Object.keys(abilityScalingDetails).length > 0 ? { abilityScalingDetails } : {}),
    ...(operatorStats || {}),
    ...(companionBondEffects ? { companionBondEffects } : {}),
    ...enemySystemInfo,
  } as CalculatedStats;

  logger.mark('calc-end');
  logger.measure('build-calculation', 'calc-start', 'calc-end');
}

// Re-export types and select internal functions for external consumption
export type {
  ItemResolver,
  CalculatedStats,
  WeaponStats,
  DoTStats,
  EnemyDamageStats,
  EnemySummaryStats,
  SetBonusInfo,
  CompanionStats,
  HelminthAbilityStats,
  WarframeBreakdowns,
  WeaponBreakdowns,
} from './types';
export type { ResolvedBucket } from './bucket-ops';
export { calculateSingleWeapon } from './weapon-calc';
export { calculateDoT } from './dot';
export { resolveEnemy, calculateEnemyDamage } from './enemy';
export { bucketify, resolveFlat, resolveMultiplied } from './bucket-ops';
