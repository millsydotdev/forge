import type { ConditionalTriggerState, EnemyTargetState, EquippedArcane, EquippedMod } from '../build-core';
import type { Modifier } from '../modifier';
import { calculateStatusProbabilities } from '../damage-calculator';
import { groupModifiersByKey, buildBreakdown } from '../calc-breakdown';
import type { ItemResolver, WeaponStats, WeaponBreakdowns, EnemyDamageStats } from './types';
import { bucketify, resolveFlat, sumMultipliersForGroup, collectDamageTypes } from './bucket-ops';
import { resolveMods, resolveArcanes, sortMods, adjustModifiers } from './mod-utils';
import { applyConditions } from './conditions';
import { combineElementals } from './elemental';
import { calculateDoT } from './dot';
import { resolveEnemy, calculateEnemyDamage } from './enemy';

export function calculateSingleWeapon(
  weaponId: string,
  normalMods: EquippedMod[],
  exilus: EquippedMod | null,
  arcanes: [EquippedArcane | null, EquippedArcane | null],
  targetFaction: string,
  isAiming: boolean,
  activeStatuses: number,
  resolver: ItemResolver,
  buffs: Modifier[] = [],
  enemyState?: EnemyTargetState,
  conditionalTriggers?: ConditionalTriggerState,
  auraDebuffMods: Modifier[] = [],
): WeaponStats {
  const weaponMods = sortMods([
    ...resolver.resolveWeaponPassive(weaponId),
    ...resolveMods(resolver, normalMods),
    ...(exilus ? resolveMods(resolver, [exilus]) : []),
    ...resolveArcanes(resolver, arcanes),
    ...buffs,
  ]);

  const conditionedMods = applyConditions(weaponMods, conditionalTriggers);
  const combinedMods = combineElementals(conditionedMods);
  const adjustedMods = adjustModifiers(combinedMods, isAiming);
  const weaponBuckets = bucketify(adjustedMods);
  const modGroups = groupModifiersByKey(adjustedMods);

  // 1. Base Damage & Condition Overload
  const baseDmgBucket = weaponBuckets.get('base_damage::weapon_base_damage');
  const baseMultiplier = baseDmgBucket?.multiplier ?? 1;
  const coBucket = weaponBuckets.get('co_damage::weapon_co');
  const coBonusPerStatus = coBucket ? (coBucket.multiplier - 1) : 0;
  const finalBaseDmgMult = baseMultiplier + (coBonusPerStatus * activeStatuses);
  const totalBase = (baseDmgBucket?.flat ?? 0) * finalBaseDmgMult;

  // 2. Faction Multiplier
  let factionMult = 1;
  if (targetFaction) {
    const factionKey = `faction_${targetFaction.toLowerCase()}`;
    const factionBucket = weaponBuckets.get(`${factionKey}::faction_damage`);
    if (factionBucket) {
      factionMult = factionBucket.multiplier;
    }
  }
  const factionAllBucket = weaponBuckets.get('faction_damage_all::faction_damage');
  if (factionAllBucket) {
    factionMult *= factionAllBucket.multiplier;
  }

  // 3. Elemental & Physical Breakdowns
  const baseElementalMultiplier = sumMultipliersForGroup(weaponBuckets, 'elemental', 'weapon_elemental');

  const totalBaseModded = totalBase * factionMult;
  const elementalDamage = totalBase * baseElementalMultiplier * factionMult;

  const baseDamageTypes = collectDamageTypes(weaponBuckets);
  const damagePerType: Record<string, number> = {};

  for (const [type, baseVal] of Object.entries(baseDamageTypes)) {
    if (['impact', 'puncture', 'slash'].includes(type)) {
      const typeMult = sumMultipliersForGroup(weaponBuckets, `physical_${type}`, 'weapon_physical');
      damagePerType[type] = baseVal * finalBaseDmgMult * (1 + typeMult) * factionMult;
    }
  }

  for (const [key, bucket] of weaponBuckets) {
    if (key.startsWith('elemental_') && key.endsWith('::weapon_elemental')) {
      const type = key.slice('elemental_'.length, key.indexOf('::'));
      const typeMult = bucket.multiplier - 1;
      if (typeMult > 0) {
        damagePerType[type] = (damagePerType[type] ?? 0) + (totalBase * typeMult * factionMult);
      }
    }
  }

  for (const [type, baseVal] of Object.entries(baseDamageTypes)) {
    if (!['impact', 'puncture', 'slash'].includes(type)) {
      damagePerType[type] = (damagePerType[type] ?? 0) + (baseVal * finalBaseDmgMult * factionMult);
    }
  }

  const totalDamage = Object.values(damagePerType).reduce((sum, v) => sum + v, 0);

  // 4. Multishot
  const multishotBucket = weaponBuckets.get('multishot::weapon_multishot');
  const multishot = (multishotBucket?.flat ?? 1) * (multishotBucket?.multiplier ?? 1) || 1;

  // 5. Critical Chance & Multiplier
  const critChanceBucket = weaponBuckets.get('crit_chance::weapon_crit');
  const critDmgBucket    = weaponBuckets.get('crit_damage::weapon_crit_damage');
  const critComboBonus = (weaponBuckets.get('crit_chance_combo::weapon_crit')?.multiplier ?? 1) - 1;

  const baseCrit = critChanceBucket?.flat ?? 0;
  const baseCritMult = (critChanceBucket?.multiplier ?? 1) + critComboBonus;
  const heavyCritChanceBucket = weaponBuckets.get('heavy_crit_chance::weapon_crit');
  const heavyCritBonus = heavyCritChanceBucket ? (heavyCritChanceBucket.multiplier - 1) : 0;

  const critChance = baseCrit * (baseCritMult + heavyCritBonus);
  const critMultiplier = (critDmgBucket?.flat ?? 2) * (critDmgBucket?.multiplier ?? 1) || 1;

  const heavyCritChance = baseCrit * (baseCritMult + heavyCritBonus * 2);

  // 6. Fire Rate / Attack Speed
  // Melee weapons use `fire_rate` for base cadence but `attack_speed` mods
  // for improvements. Combine both multipliers so both mod types apply.
  const fireRateBucket = weaponBuckets.get('fire_rate::weapon_fire_rate');
  const attackSpeedBucket = weaponBuckets.get('attack_speed::weapon_attack_speed');
  const fireRateFlat = fireRateBucket?.flat ?? 0;
  const fireRateMult = (fireRateBucket?.multiplier ?? 1) * (attackSpeedBucket?.multiplier ?? 1);
  const fireRate = fireRateFlat > 0
    ? fireRateFlat * fireRateMult
    : (attackSpeedBucket
        ? (attackSpeedBucket.flat ?? 1) * (attackSpeedBucket.multiplier ?? 1)
        : 1);

  // 7. Status Chance
  const statusBucket = weaponBuckets.get('status_chance::weapon_status');
  const statusComboBonus = (weaponBuckets.get('status_chance_combo::weapon_status')?.multiplier ?? 1) - 1;
  const statusChance = (statusBucket?.flat ?? 0) * ((statusBucket?.multiplier ?? 1) + statusComboBonus);

  // 8. Reload Speed
  const baseReload = resolveFlat(weaponBuckets, 'reload_speed::weapon_reload') || 2;
  const reloadMultBucket = weaponBuckets.get('reload_speed_mult::weapon_reload');
  const reloadSpeedMult = reloadMultBucket ? reloadMultBucket.multiplier : 1;
  const reloadSpeed = baseReload / Math.max(reloadSpeedMult, 0.01);

  // 9. Magazine
  const magazineBucket = weaponBuckets.get('magazine::weapon_magazine');
  const magazine = Math.max(1, Math.round((magazineBucket?.flat ?? 1) * (magazineBucket?.multiplier ?? 1)));

  // 10. DPS Calculations
  const critFactor = 1 + critChance * (critMultiplier - 1);
  const avgShotDamage = totalDamage * multishot * critFactor;

  const burstDps = avgShotDamage * fireRate;
  const shotsPerCycle = magazine;
  const timePerCycle = (shotsPerCycle / fireRate) + reloadSpeed;
  const sustainedDps = (avgShotDamage * shotsPerCycle) / timePerCycle;
  const avgDps = burstDps;

  const statusProbs = calculateStatusProbabilities(damagePerType);

  const critTiers = {
    yellow: Math.min(critChance, 1),
    orange: Math.max(0, Math.min(critChance - 1, 1)),
    red:    Math.max(0, critChance - 2),
  };

  // 11. Extra/Utility/Heavy Stats
  const heavyWindUpBucket = weaponBuckets.get('heavy_wind_up::weapon_heavy');
  const heavyWindUp = heavyWindUpBucket ? heavyWindUpBucket.multiplier : 1.0;
  const heavyEfficiencyBucket = weaponBuckets.get('heavy_efficiency::weapon_heavy');
  const heavyEfficiency = Math.min(0.9, Math.max(0, (heavyEfficiencyBucket?.multiplier ?? 1) - 1));
  const initialCombo = resolveFlat(weaponBuckets, 'initial_combo::weapon_heavy');
  const comboDuration = 5.0 + resolveFlat(weaponBuckets, 'combo_duration::weapon_combo');
  const comboChanceBucket = weaponBuckets.get('combo_chance::weapon_combo');
  const comboChance = comboChanceBucket ? (comboChanceBucket.multiplier - 1) : 0;

  const meleeRange = (resolveFlat(weaponBuckets, 'melee_range::weapon_range') || 2.5) * (weaponBuckets.get('melee_range::weapon_range')?.multiplier ?? 1);
  const recoil = 1.0 + (weaponBuckets.get('weapon_recoil::weapon_recoil')?.multiplier ?? 1) - 1.0;
  const zoom = 1.0 + (weaponBuckets.get('zoom::weapon_zoom')?.multiplier ?? 1) - 1.0;
  const projectileSpeed = 1.0 + (weaponBuckets.get('projectile_speed::weapon_speed')?.multiplier ?? 1) - 1.0;
  const accuracy = (resolveFlat(weaponBuckets, 'accuracy::weapon_accuracy') || 100) * (weaponBuckets.get('accuracy::weapon_accuracy')?.multiplier ?? 1);

  const statusDuration = weaponBuckets.get('status_duration::weapon_status')?.multiplier ?? 1;
  const headshotMultBonus = (weaponBuckets.get('headshot_multiplier::weapon_crit_damage')?.multiplier ?? 1) - 1;
  const headshotMultiplier = 2.0 + headshotMultBonus;
  const headshotDps = avgShotDamage * headshotMultiplier * fireRate;
  const punchThrough = resolveFlat(weaponBuckets, 'punch_through::weapon_utility');
  const maxAmmo = weaponBuckets.get('max_ammo::weapon_ammo')?.multiplier ?? 1;
  const blastRadius = weaponBuckets.get('blast_radius::weapon_utility')?.multiplier ?? 1;
  const lifeSteal = Math.max(0, (weaponBuckets.get('life_steal::weapon_lifesteal')?.multiplier ?? 1) - 1);
  const channelingDamage = weaponBuckets.get('channeling_damage::weapon_channeling')?.multiplier ?? 1;
  const channelingCost = weaponBuckets.get('channeling_cost::weapon_channeling')?.multiplier ?? 1;
  const slamAttack = weaponBuckets.get('slam_attack::weapon_melee_special')?.multiplier ?? 1;
  const slideAttack = weaponBuckets.get('slide_attack::weapon_melee_special')?.multiplier ?? 1;
  const finisherDamage = weaponBuckets.get('finisher_damage::weapon_melee_special')?.multiplier ?? 1;

  // ── Melee Follow-Through (multi-target damage reduction) ──
  const followThrough = weaponBuckets.get('melee_follow_through::weapon_melee')?.multiplier ?? 1;
  const multiTarget = enemyState?.multiTarget ?? 1;
  let followThroughMultiplier = 1;
  if (followThrough < 1 && multiTarget > 1) {
    // Each subsequent enemy hit applies follow-through reduction
    followThroughMultiplier = (1 - Math.pow(followThrough, multiTarget)) / ((1 - followThrough) * multiTarget);
    followThroughMultiplier = Math.max(followThroughMultiplier, followThrough);
  }

  // ── Falloff / follow-through ──
  // TODO(v2): Model weapon falloff properly
  // Variables exist in weapon data: falloff_start, falloff_end, falloff_reduction
  // Apply follow-through to multi-target DPS calculations
  const dot = calculateDoT(damagePerType, totalBaseModded, factionMult, fireRate, multishot, statusChance, statusProbs, weaponBuckets, statusDuration);

  let enemyDamage: EnemyDamageStats | undefined;
  if (enemyState) {
    const resolved = resolveEnemy(enemyState, auraDebuffMods);
    if (resolved) {
      // Apply follow-through to damage for multi-target enemy calcs
      const dmgForEnemy = Object.fromEntries(
        Object.entries(damagePerType).map(([k, v]) => [k, v * followThroughMultiplier]),
      );
      enemyDamage = calculateEnemyDamage(
        dmgForEnemy,
        avgShotDamage * followThroughMultiplier,
        fireRate,
        magazine,
        reloadSpeed,
        enemyState,
        resolved,
      );
    }
  }

  const breakdowns: WeaponBreakdowns = {};

  const baseDmgMods = modGroups.get('base_damage::weapon_base_damage') ?? [];
  breakdowns.baseDamage = buildBreakdown(
    'Base Damage', baseDmgMods, baseDmgBucket?.flat ?? 0, finalBaseDmgMult - 1, totalBase,
  );

  const msMods = modGroups.get('multishot::weapon_multishot') ?? [];
  breakdowns.multishot = buildBreakdown(
    'Multishot', msMods, multishotBucket?.flat ?? 1, (multishotBucket?.multiplier ?? 1) - 1, multishot,
  );

  const ccMods = modGroups.get('crit_chance::weapon_crit') ?? [];
  const ccComboMods = modGroups.get('crit_chance_combo::weapon_crit') ?? [];
  breakdowns.critChance = buildBreakdown(
    'Crit Chance', [...ccMods, ...ccComboMods], baseCrit, (baseCritMult + heavyCritBonus) - 1, critChance,
  );

  const cdMods = modGroups.get('crit_damage::weapon_crit_damage') ?? [];
  breakdowns.critMultiplier = buildBreakdown(
    'Crit Multiplier', cdMods, critDmgBucket?.flat ?? 2, (critDmgBucket?.multiplier ?? 1) - 1, critMultiplier,
  );

  const frMods = modGroups.get('fire_rate::weapon_fire_rate') ?? [];
  const asMods = modGroups.get('attack_speed::weapon_attack_speed') ?? [];
  breakdowns.fireRate = buildBreakdown(
    'Fire Rate', [...frMods, ...asMods],
    (fireRateBucket?.flat ?? 0) > 0 ? (fireRateBucket?.flat ?? 1) : (attackSpeedBucket?.flat ?? 1),
    (fireRateBucket?.flat ?? 0) > 0
      ? (fireRateBucket?.multiplier ?? 1) - 1
      : (attackSpeedBucket?.multiplier ?? 1) - 1,
    fireRate,
  );

  const scMods = modGroups.get('status_chance::weapon_status') ?? [];
  const scComboMods = modGroups.get('status_chance_combo::weapon_status') ?? [];
  breakdowns.statusChance = buildBreakdown(
    'Status Chance', [...scMods, ...scComboMods], statusBucket?.flat ?? 0,
    ((statusBucket?.multiplier ?? 1) + statusComboBonus) - 1, statusChance,
  );

  const rsmMods = modGroups.get('reload_speed_mult::weapon_reload') ?? [];
  const reloadFlatMods = modGroups.get('reload_speed::weapon_reload') ?? [];
  const reloadAllMods = [...reloadFlatMods, ...rsmMods];
  breakdowns.reloadSpeed = buildBreakdown(
    'Reload Speed', reloadAllMods, baseReload, reloadSpeedMult - 1, reloadSpeed,
  );

  breakdowns.burstDps = {
    label: 'Burst DPS', base: totalDamage, baseSource: 'Total Damage',
    flats: [], multipliers: [],
    flatSum: totalDamage, multiplierSum: 0,
    final: burstDps,
    formula: `${totalDamage.toFixed(1)} × ${multishot.toFixed(2)} multishot × ${critFactor.toFixed(3)} crit × ${fireRate.toFixed(1)}/s = ${burstDps.toFixed(1)}`,
  };

  breakdowns.sustainedDps = {
    label: 'Sustained DPS', base: avgShotDamage, baseSource: 'Avg Shot Damage',
    flats: [], multipliers: [],
    flatSum: avgShotDamage, multiplierSum: 0,
    final: sustainedDps,
    formula: `${avgShotDamage.toFixed(1)} × ${magazine} mag / (${(magazine / fireRate).toFixed(2)}s fire + ${reloadSpeed.toFixed(2)}s reload) = ${sustainedDps.toFixed(1)}`,
  };

  return {
    totalDamage,
    totalBase: totalBaseModded,
    elementalDamage,
    multishot,
    critChance,
    critMultiplier,
    fireRate,
    statusChance,
    reloadSpeed,
    magazine,
    avgShotDamage,
    avgDps,
    sustainedDps,
    burstDps,
    damagePerType,
    statusProbs,
    critTiers,
    dot,
    enemyDamage,
    heavyWindUp,
    heavyEfficiency,
    initialCombo,
    heavyCritChance,
    comboDuration,
    comboChance,
    meleeRange,
    recoil,
    zoom,
    projectileSpeed,
    accuracy,
    statusDuration,
    headshotMultiplier,
    headshotDps,
    punchThrough,
    maxAmmo,
    blastRadius,
    lifeSteal,
    channelingDamage,
    channelingCost,
    slamAttack,
    slideAttack,
    finisherDamage,
    breakdowns,
  };
}
