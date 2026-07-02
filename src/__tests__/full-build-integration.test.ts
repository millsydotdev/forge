import { describe, it, expect } from 'vitest';
import { calculateBuild } from '../engine/stat-processor';
import { Polarity } from '../engine/build-core';
import type {
  BuildCore, EquippedMod, EquippedArcane, EquippedShard,
  WeaponBuild, CompanionBuild, EnemyTargetState, ConditionalTriggerState,
} from '../engine/build-core';
import type { ItemResolver, WeaponStats, DoTStats, EnemyDamageStats } from '../engine/stat-processor';
import type { Modifier } from '../engine/modifier';

// ─── Helper: create a resolver with canned data ────────────────────────

function fullResolver(): ItemResolver {
  return {
    resolveWarframePassive(id: string) {
      if (!id) return [];
      return [
        { stat: 'strength', category: 'FLAT', value: 1, stackingGroup: 'ability', source: 'base', priority: 0 },
        { stat: 'duration', category: 'FLAT', value: 1, stackingGroup: 'ability', source: 'base', priority: 0 },
        { stat: 'range', category: 'FLAT', value: 1, stackingGroup: 'ability', source: 'base', priority: 0 },
        { stat: 'efficiency', category: 'FLAT', value: 1, stackingGroup: 'ability', source: 'base', priority: 0 },
        { stat: 'base_health', category: 'FLAT', value: 100, stackingGroup: 'warframe_base', source: 'base', priority: 0 },
        { stat: 'base_shield', category: 'FLAT', value: 100, stackingGroup: 'warframe_base', source: 'base', priority: 0 },
        { stat: 'base_armor', category: 'FLAT', value: 100, stackingGroup: 'warframe_base', source: 'base', priority: 0 },
        { stat: 'base_energy', category: 'FLAT', value: 150, stackingGroup: 'warframe_base', source: 'base', priority: 0 },
        { stat: 'sprint_speed', category: 'FLAT', value: 1, stackingGroup: 'warframe_base', source: 'base', priority: 0 },
        { stat: 'health', category: 'FLAT', value: 0, stackingGroup: 'warframe_health', source: 'base', priority: 0 },
        { stat: 'shields', category: 'FLAT', value: 0, stackingGroup: 'warframe_shields', source: 'base', priority: 0 },
        { stat: 'armor', category: 'FLAT', value: 0, stackingGroup: 'warframe_armor', source: 'base', priority: 0 },
        { stat: 'energy', category: 'FLAT', value: 0, stackingGroup: 'warframe_energy', source: 'base', priority: 0 },
      ];
    },
    resolveWeaponPassive(id: string) {
      if (!id) return [];
      // Generic rifle base stats (Braton-like)
      return [
        { stat: 'base_damage', category: 'FLAT', value: 35, stackingGroup: 'weapon_base_damage', source: 'base', priority: 0 },
        { stat: 'damage_impact', category: 'FLAT', value: 5, stackingGroup: 'weapon_damage_types', source: 'base', priority: 0 },
        { stat: 'damage_puncture', category: 'FLAT', value: 19, stackingGroup: 'weapon_damage_types', source: 'base', priority: 0 },
        { stat: 'damage_slash', category: 'FLAT', value: 11, stackingGroup: 'weapon_damage_types', source: 'base', priority: 0 },
        { stat: 'fire_rate', category: 'FLAT', value: 7.6, stackingGroup: 'weapon_fire_rate', source: 'base', priority: 0 },
        { stat: 'multishot', category: 'FLAT', value: 1, stackingGroup: 'weapon_multishot', source: 'base', priority: 0 },
        { stat: 'crit_chance', category: 'FLAT', value: 0.22, stackingGroup: 'weapon_crit', source: 'base', priority: 0 },
        { stat: 'crit_damage', category: 'FLAT', value: 2.0, stackingGroup: 'weapon_crit_damage', source: 'base', priority: 0 },
        { stat: 'status_chance', category: 'FLAT', value: 0.22, stackingGroup: 'weapon_status', source: 'base', priority: 0 },
        { stat: 'magazine', category: 'FLAT', value: 75, stackingGroup: 'weapon_magazine', source: 'base', priority: 0 },
        { stat: 'reload_speed', category: 'FLAT', value: 2.4, stackingGroup: 'weapon_reload', source: 'base', priority: 0 },
      ];
    },
    resolveCompanionPassive() { return []; },
    resolveMod(mod: EquippedMod) {
      const results: Modifier[] = [];
      if (mod.id.includes('Serration')) {
        results.push({ stat: 'base_damage', category: 'MULTIPLIER', value: 1.65, stackingGroup: 'weapon_base_damage', source: mod.id, priority: 0 });
      }
      if (mod.id.includes('SplitChamber') || mod.id.includes('Split Chamber')) {
        results.push({ stat: 'multishot', category: 'MULTIPLIER', value: 0.9, stackingGroup: 'weapon_multishot', source: mod.id, priority: 0 });
      }
      if (mod.id.includes('PointStrike') || mod.id.includes('Point Strike')) {
        results.push({ stat: 'crit_chance', category: 'MULTIPLIER', value: 1.5, stackingGroup: 'weapon_crit', source: mod.id, priority: 0 });
      }
      if (mod.id.includes('VitalSense') || mod.id.includes('Vital Sense')) {
        results.push({ stat: 'crit_damage', category: 'MULTIPLIER', value: 1.2, stackingGroup: 'weapon_crit_damage', source: mod.id, priority: 0 });
      }
      if (mod.id.includes('Intensify')) {
        results.push({ stat: 'strength', category: 'MULTIPLIER', value: 0.30, stackingGroup: 'ability', source: mod.id, priority: 0 });
      }
      if (mod.id.includes('Continuity')) {
        results.push({ stat: 'duration', category: 'MULTIPLIER', value: 0.30, stackingGroup: 'ability', source: mod.id, priority: 0 });
      }
      if (mod.id.includes('Stretch')) {
        results.push({ stat: 'range', category: 'MULTIPLIER', value: 0.45, stackingGroup: 'ability', source: mod.id, priority: 0 });
      }
      if (mod.id.includes('Streamline')) {
        results.push({ stat: 'efficiency', category: 'MULTIPLIER', value: 0.30, stackingGroup: 'ability', source: mod.id, priority: 0 });
      }
      if (mod.id.includes('Vitality')) {
        results.push({ stat: 'health', category: 'MULTIPLIER', value: 4.4, stackingGroup: 'warframe_health', source: mod.id, priority: 0 });
      }
      if (mod.id.includes('SteelFiber') || mod.id.includes('Steel Fiber')) {
        results.push({ stat: 'armor', category: 'MULTIPLIER', value: 1.1, stackingGroup: 'warframe_armor', source: mod.id, priority: 0 });
      }
      if (mod.id.includes('Hellfire')) {
        results.push({ stat: 'elemental_heat', category: 'MULTIPLIER', value: 0.9, stackingGroup: 'weapon_elemental', source: mod.id, priority: 0 });
      }
      if (mod.id.includes('Stormbringer')) {
        results.push({ stat: 'elemental_electric', category: 'MULTIPLIER', value: 0.9, stackingGroup: 'weapon_elemental', source: mod.id, priority: 0 });
      }
      if (mod.id.includes('RifleAmmo') || mod.id.includes('Rifle Aptitude')) {
        results.push({ stat: 'status_chance', category: 'MULTIPLIER', value: 0.9, stackingGroup: 'weapon_status', source: mod.id, priority: 0 });
      }
      return results;
    },
    resolveArcane(arcane: EquippedArcane | null) {
      if (!arcane) return [];
      if (arcane.id.includes('ArcaneGuardian') || arcane.id.includes('Arcane Guardian')) {
        return [{ stat: 'armor', category: 'FLAT', value: 900, stackingGroup: 'warframe_armor', source: arcane.id, priority: 0 }];
      }
      if (arcane.id.includes('PrimaryMerciless') || arcane.id.includes('Primary Merciless')) {
        return [{ stat: 'base_damage', category: 'MULTIPLIER', value: 3.6, stackingGroup: 'weapon_base_damage', source: arcane.id, priority: 0 }];
      }
      return [];
    },
    resolveShard(_shard: EquippedShard) {
      return [{ stat: 'strength', category: 'FLAT', value: 0.10, stackingGroup: 'ability', source: 'shard', priority: 0 }];
    },
    getModSet() { return null; },
    resolveSetBonusStat() { return []; },
  };
}

// ─── Helper: build a full loadout ──────────────────────────────────────

function makeMod(id: string, rank: number): EquippedMod {
  return { id, rank, slotPolarity: Polarity.MADURAI, polarityMatch: true };
}

function makeArcane(id: string, rank: number): EquippedArcane {
  return { id, rank };
}

function makeShard(color: 'azure' | 'crimson' | 'amber', isTau: boolean): EquippedShard {
  return { id: '', color, isTau };
}

function makeFullBuild(): BuildCore {
  const primaryWeapon: WeaponBuild = {
    id: '/Lotus/Weapons/Tenno/Rifle/BratonPrime',
    slot: 'primary',
    normalMods: [
      makeMod('/Lotus/Mods/Rifle/Serration', 10),
      makeMod('/Lotus/Mods/Rifle/SplitChamber', 5),
      makeMod('/Lotus/Mods/Rifle/PointStrike', 5),
      makeMod('/Lotus/Mods/Rifle/VitalSense', 5),
      makeMod('/Lotus/Mods/Rifle/Hellfire', 5),
      makeMod('/Lotus/Mods/Rifle/Stormbringer', 5),
      makeMod('/Lotus/Mods/Rifle/RifleAptitude', 5),
    ],
    exilus: null,
    arcanes: [makeArcane('/Lotus/Arcane/PrimaryMerciless', 5), null],
  };

  const secondaryWeapon: WeaponBuild = {
    id: '/Lotus/Weapons/Tenno/Pistol/LexPrime',
    slot: 'secondary',
    normalMods: [],
    exilus: null,
    arcanes: [null, null],
  };

  const meleeWeapon: WeaponBuild = {
    id: '/Lotus/Weapons/Tenno/Melee/GramPrime',
    slot: 'melee',
    normalMods: [],
    exilus: null,
    arcanes: [null, null],
  };

  const companion: CompanionBuild = {
    id: '/Lotus/Companions/Sentinel/Dethcube/Dethcube',
    type: 'sentinel',
    normalMods: [],
    slotPolarities: Array(8).fill(Polarity.UNIVERSAL) as Polarity[],
    weapon: {
      id: '/Lotus/Weapons/Sentinel/DethMachineRifle/DethMachineRifle',
      normalMods: [],
      slotPolarities: Array(8).fill(Polarity.UNIVERSAL) as Polarity[],
    },
  };

  const enemyState: EnemyTargetState = {
    targetName: 'Corpus Tech',
    level: 100,
    armorStripped: 0,
    corrosiveStacks: 0,
    heatProc: false,
    multiTarget: 1,
  };

  const conditionalTriggers: ConditionalTriggerState = {
    onKill: true,
    onHeadshot: true,
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

  return {
    name: 'Full Integration Test Build',
    warframe: {
      id: '/Lotus/Powersuits/Excalibur/ExcaliburPrime',
      aura: null,
      exilus: null,
      normalMods: [
        makeMod('/Lotus/Mods/Warframe/Intensify', 9),
        makeMod('/Lotus/Mods/Warframe/Continuity', 9),
        makeMod('/Lotus/Mods/Warframe/Stretch', 9),
        makeMod('/Lotus/Mods/Warframe/Streamline', 9),
        makeMod('/Lotus/Mods/Warframe/Vitality', 10),
        makeMod('/Lotus/Mods/Warframe/SteelFiber', 10),
      ],
      arcanes: [makeArcane('/Lotus/Arcane/ArcaneGuardian', 5), null],
      shards: [makeShard('azure', true), makeShard('crimson', false)],
      helminth: {
        donorWarframeId: '/Lotus/Powersuits/Excalibur/Excalibur',
        slotIndex: 2,
        replacesAbilityIndex: 2,
      },
      exaltedWeapon: null,
    },
    primary: primaryWeapon,
    secondary: secondaryWeapon,
    melee: meleeWeapon,
    companion,
    targetFaction: 'corpus',
    isAiming: false,
    activeStatuses: 0,
    enemy: enemyState,
    conditionalTriggers,
    buffs: [],
  };
}

// ─── The Test ──────────────────────────────────────────────────────────

describe('full build integration', () => {
  it('produces complete CalculatedStats with all breakdowns', () => {
    const build = makeFullBuild();
    const resolver = fullResolver();
    const result = calculateBuild(build, resolver);

    // ── Warframe ability stats ──
    expect(result.strength).toBeGreaterThan(1);
    expect(result.duration).toBeGreaterThan(1);
    expect(result.range).toBeGreaterThan(1);
    expect(result.efficiency).toBeGreaterThanOrEqual(1);
    expect(result.efficiency).toBeLessThanOrEqual(1.75);

    // Intensify (+30% mult) + 2 shards (+0.10 flat each)
    // = (1 + 0.10 + 0.10) × (1 + 0.30) = 1.20 × 1.30 = 1.56
    expect(result.strength).toBeCloseTo(1.56, 4);

    // ── Warframe durability ──
    expect(result.health).toBeGreaterThan(0);
    expect(result.shields).toBeGreaterThan(0);
    expect(result.armor).toBeGreaterThan(0);
    expect(result.energy).toBeGreaterThan(0);
    expect(result.ehp).toBeGreaterThan(result.health);

    // Primary: base 100 health × (1 + 4.4) = 540
    expect(result.health).toBeCloseTo(540, 0);
    // Shields: 100 base, no mods = 100
    expect(result.shields).toBeCloseTo(100, 0);
    // Steel Fiber +110% → 100 × (1 + 1.10) = 210, Arcane Guardian +900 → total 1110
    expect(result.armor).toBeCloseTo(1110, 0);
    // EHP = 540 / (1 - 1110/1410) + 100 = 540 / (1 - 0.7872) + 100 = 540 / 0.2128 + 100 ≈ 2637
    expect(result.ehp).toBeGreaterThan(2000);
    expect(result.ehp).toBeLessThan(3000);

    // ── Weapon stats (primary) ──
    expect(result.weapons.primary).toBeDefined();
    const primary = result.weapons.primary as WeaponStats;
    expect(primary.totalDamage).toBeGreaterThan(0);
    expect(primary.totalBase).toBeGreaterThan(0);
    expect(primary.multishot).toBeGreaterThan(1);
    expect(primary.fireRate).toBeGreaterThan(0);
    expect(primary.critChance).toBeGreaterThan(0.5); // 22% × (1 + 1.5) = 55%
    expect(primary.critMultiplier).toBeGreaterThan(2);
    expect(primary.statusChance).toBeGreaterThan(0);
    expect(primary.magazine).toBe(75);
    expect(primary.reloadSpeed).toBeGreaterThan(0);
    expect(primary.avgDps).toBeGreaterThan(0);
    expect(primary.sustainedDps).toBeGreaterThan(0);
    expect(primary.burstDps).toBeGreaterThan(0);

    // Damage per type should include physical + elemental
    expect(primary.damagePerType).toBeDefined();
    expect(Object.keys(primary.damagePerType).length).toBeGreaterThan(0);

    // Status probabilities
    expect(primary.statusProbs).toBeDefined();

    // Crit tiers
    expect(primary.critTiers.yellow).toBeGreaterThan(0);
    expect(primary.critTiers.orange).toBeGreaterThanOrEqual(0);

    // DoT stats
    expect(primary.dot).toBeDefined();
    const dot = primary.dot as DoTStats;
    expect(typeof dot.slashBleedTick).toBe('number');
    expect(typeof dot.heatBurnDps).toBe('number');
    expect(typeof dot.totalDotDps).toBe('number');

    // ── Enemy damage (TTK/DPS) ──
    expect(primary.enemyDamage).toBeDefined();
    const enemyDmg = primary.enemyDamage as EnemyDamageStats;
    expect(enemyDmg.damagePerShotVsHealth).toBeGreaterThan(0);
    expect(enemyDmg.damagePerShotVsShield).toBeGreaterThanOrEqual(0);
    expect(enemyDmg.damagePerTypeVsHealth).toBeDefined();
    expect(Object.keys(enemyDmg.damagePerTypeVsHealth).length).toBeGreaterThan(0);
    expect(enemyDmg.shotsToKill).toBeGreaterThan(0);
    expect(enemyDmg.timeToKill).toBeGreaterThan(0);
    expect(enemyDmg.sustainedTimeToKill).toBeGreaterThan(0);
    expect(enemyDmg.effectiveDps).toBeGreaterThan(0);
    expect(enemyDmg.burstEffectiveDps).toBeGreaterThan(0);
    expect(enemyDmg.multiTargetEffectiveDps).toBeGreaterThan(0);

    // ── Enemy summary ──
    expect(result.enemy).toBeDefined();
    expect(result.enemy!.name).toBe('Corpus Tech');
    expect(result.enemy!.level).toBe(100);
    expect(result.enemy!.scaledHealth).toBeGreaterThan(0);
    expect(result.enemy!.effectiveArmor).toBeGreaterThanOrEqual(0);
    expect(result.enemy!.ehp).toBeGreaterThan(0);

    // ── Companion ──
    expect(result.companion).toBeDefined();

    // ── Set bonuses ──
    expect(result.setBonuses).toBeDefined();

    // ── Warframe breakdowns (PoB-style) ──
    expect(result.breakdowns).toBeDefined();
    expect(result.breakdowns!.health).toBeDefined();
    expect(result.breakdowns!.strength).toBeDefined();
    expect(result.breakdowns!.duration).toBeDefined();
    expect(result.breakdowns!.ehp).toBeDefined();

    // ── Secondary & melee (present even with empty mods) ──
    expect(result.weapons.secondary).toBeDefined();
    expect(result.weapons.melee).toBeDefined();
  });
});
