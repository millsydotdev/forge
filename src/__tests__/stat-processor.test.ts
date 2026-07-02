import { describe, it, expect } from 'vitest';
import { calculateBuild, type ItemResolver } from '../engine/stat-processor';
import { Polarity, type BuildCore } from '../engine/build-core';

function mockResolver(): ItemResolver {
  return {
    resolveWarframePassive(id: string) {
      if (!id) return [];
      return [
        { stat: 'strength',      category: 'FLAT', value: 1,   stackingGroup: 'ability',         source: 'base', priority: 0 },
        { stat: 'duration',      category: 'FLAT', value: 1,   stackingGroup: 'ability',         source: 'base', priority: 0 },
        { stat: 'range',         category: 'FLAT', value: 1,   stackingGroup: 'ability',         source: 'base', priority: 0 },
        { stat: 'efficiency',    category: 'FLAT', value: 1,   stackingGroup: 'ability',         source: 'base', priority: 0 },
        { stat: 'base_health',   category: 'FLAT', value: 100, stackingGroup: 'warframe_base',   source: 'base', priority: 0 },
        { stat: 'base_shield',   category: 'FLAT', value: 100, stackingGroup: 'warframe_base',   source: 'base', priority: 0 },
        { stat: 'base_armor',    category: 'FLAT', value: 100, stackingGroup: 'warframe_base',   source: 'base', priority: 0 },
        { stat: 'base_energy',   category: 'FLAT', value: 100, stackingGroup: 'warframe_base',   source: 'base', priority: 0 },
        { stat: 'sprint_speed',  category: 'FLAT', value: 1,   stackingGroup: 'warframe_base',   source: 'base', priority: 0 },
        { stat: 'health',        category: 'FLAT', value: 0,   stackingGroup: 'warframe_health', source: 'base', priority: 0 },
        { stat: 'shields',       category: 'FLAT', value: 0,   stackingGroup: 'warframe_shields',source: 'base', priority: 0 },
        { stat: 'armor',         category: 'FLAT', value: 0,   stackingGroup: 'warframe_armor',  source: 'base', priority: 0 },
        { stat: 'energy',        category: 'FLAT', value: 0,   stackingGroup: 'warframe_energy', source: 'base', priority: 0 },
      ];
    },
    resolveWeaponPassive() { return []; },
    resolveCompanionPassive() { return []; },
    resolveMod(mod) {
      if (mod.id === '/Lotus/Mods/Warframe/Intensify') {
        return [{ stat: 'strength', category: 'MULTIPLIER', value: 0.30, stackingGroup: 'ability', source: 'Intensify', priority: 0 }];
      }
      return [];
    },
    resolveArcane() { return []; },
    resolveShard(shard) {
      if (shard.color === 'violet') {
        return [
          {
            stat: 'crit_damage',
            category: 'MULTIPLIER',
            value: shard.isTau ? 0.15 : 0.1,
            stackingGroup: 'weapon_crit_damage',
            source: `Melee Crit Archon Shard (violet)${shard.isTau ? ' Tauforged' : ''}`,
            priority: 0,
          },
        ];
      }
      return [];
    },
    getModSet() { return null; },
    resolveSetBonusStat() { return []; },
  };
}

function emptyBuild(): BuildCore {
  return {
    name: 'test',
    warframe: { id: '', aura: null, exilus: null, normalMods: [], arcanes: [null, null], shards: [], helminth: null, exaltedWeapon: null },
    primary: null, secondary: null, melee: null, companion: null,
  };
}

describe('calculateBuild', () => {
  it('returns CalculatedStats for an empty build', () => {
    const result = calculateBuild(emptyBuild(), mockResolver());
    expect(result).toBeDefined();
    expect(typeof result.strength).toBe('number');
    expect(typeof result.duration).toBe('number');
    expect(typeof result.range).toBe('number');
    expect(typeof result.efficiency).toBe('number');
    expect(typeof result.health).toBe('number');
    expect(typeof result.shields).toBe('number');
    expect(typeof result.armor).toBe('number');
    expect(typeof result.energy).toBe('number');
    expect(typeof result.ehp).toBe('number');
    expect(typeof result.sprintSpeed).toBe('number');
    expect(result.weapons).toBeDefined();
  });

  it('returns base stats when no mods are equipped', () => {
    const build: BuildCore = {
      ...emptyBuild(),
      warframe: {
        id: '/Lotus/Powersuits/Excalibur/ExcaliburPrime',
        aura: null, exilus: null, normalMods: [],
        arcanes: [null, null], shards: [], helminth: null, exaltedWeapon: null,
      },
    };
    const result = calculateBuild(build, mockResolver());
    expect(result.strength).toBe(1);
    expect(result.duration).toBe(1);
    expect(result.range).toBe(1);
    expect(result.efficiency).toBe(1);
    expect(result.health).toBe(100);
    expect(result.sprintSpeed).toBe(1);
  });

  it('applies Intensify for +30% ability strength', () => {
    const build: BuildCore = {
      ...emptyBuild(),
      warframe: {
        id: '/Lotus/Powersuits/Excalibur/ExcaliburPrime',
        aura: null, exilus: null,
        normalMods: [{
          id: '/Lotus/Mods/Warframe/Intensify', rank: 9,
          slotPolarity: Polarity.MADURAI, polarityMatch: true,
        }],
        arcanes: [null, null], shards: [], helminth: null, exaltedWeapon: null,
      },
    };
    const result = calculateBuild(build, mockResolver());
    expect(result.strength).toBeCloseTo(1.3, 2);
  });

  it('returns zero-based stats when warframe has no ID (no passive)', () => {
    const build: BuildCore = {
      ...emptyBuild(),
      warframe: {
        id: '', aura: null, exilus: null,
        normalMods: [],
        arcanes: [null, null], shards: [], helminth: null, exaltedWeapon: null,
      },
    };
    const resolver = mockResolver();
    // override to return empty for empty id
    resolver.resolveWarframePassive = () => [];
    const result = calculateBuild(build, resolver);
    expect(result.strength).toBe(1); // falls through to 1
    expect(result.health).toBe(0);
    expect(result.armor).toBe(0);
  });

  describe('Violet Archon Shard crit scaling', () => {
    const resolver = mockResolver();
    // mock resolving passive with base melee weapon
    resolver.resolveWeaponPassive = (id) => {
      if (id === 'melee_weapon') {
        return [
          { stat: 'crit_damage', category: 'FLAT', value: 2.0, stackingGroup: 'weapon_crit_damage', source: 'base', priority: 0 },
        ];
      }
      return [];
    };

    it('applies basic Melee Critical Damage (+10% / +15%)', () => {
      const build: BuildCore = {
        ...emptyBuild(),
        warframe: {
          id: 'excalibur', aura: null, exilus: null, normalMods: [], arcanes: [null, null],
          shards: [{ id: '', color: 'violet', isTau: false }], helminth: null, exaltedWeapon: null,
        },
        melee: { id: 'melee_weapon', slot: 'melee', normalMods: [], exilus: null, arcanes: [null, null] },
      };
      const result = calculateBuild(build, resolver);
      // Base: 2.0. Shard: +10% multiplier. Result: 2.0 * (1 + 0.1) = 2.2
      expect(result.weapons.melee.critMultiplier).toBeCloseTo(2.2, 2);
    });

    it('doubles Violet shard Melee Critical Damage when Max Energy is > 500', () => {
      const build: BuildCore = {
        ...emptyBuild(),
        warframe: {
          id: 'excalibur', aura: null, exilus: null, normalMods: [], arcanes: [null, null],
          shards: [{ id: '', color: 'violet', isTau: false }], helminth: null, exaltedWeapon: null,
        },
        melee: { id: 'melee_weapon', slot: 'melee', normalMods: [], exilus: null, arcanes: [null, null] },
      };
      // Mock resolver to return high energy (e.g. 600 base energy)
      const highEnergyResolver = {
        ...resolver,
        resolveWarframePassive(id: string) {
          const passives = resolver.resolveWarframePassive(id);
          return passives.map(p => p.stat === 'base_energy' ? { ...p, value: 600 } : p);
        }
      };
      const result = calculateBuild(build, highEnergyResolver);
      // Base: 2.0. Shard value doubled: +20% multiplier. Result: 2.0 * (1 + 0.2) = 2.4
      expect(result.weapons.melee.critMultiplier).toBeCloseTo(2.4, 2);
    });

    it('scales Melee Critical Damage based on target Electric Stacks', () => {
      const build: BuildCore = {
        ...emptyBuild(),
        warframe: {
          id: 'excalibur', aura: null, exilus: null, normalMods: [], arcanes: [null, null],
          shards: [{ id: '', color: 'violet', isTau: false }], helminth: null, exaltedWeapon: null,
        },
        melee: { id: 'melee_weapon', slot: 'melee', normalMods: [], exilus: null, arcanes: [null, null] },
        enemy: {
          targetName: 'Heavy Gunner',
          level: 100,
          armorStripped: 0,
          corrosiveStacks: 0,
          heatProc: false,
          multiTarget: 1,
          electricStacks: 4, // 4 stacks
        }
      };
      const result = calculateBuild(build, resolver);
      // Base: 2.0. Shard base: 0.1. 4 stacks of electric: 4 * 1% = +4% (0.04).
      // Total Shard multiplier: 0.1 + 0.04 = 0.14.
      // Result: 2.0 * (1 + 0.14) = 2.28
      expect(result.weapons.melee.critMultiplier).toBeCloseTo(2.28, 2);
    });
  });
});
