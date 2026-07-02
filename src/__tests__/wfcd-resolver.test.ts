import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../data/game-data', () => ({
  gameData: {
    getShardDef: vi.fn((color: string) => {
      const defs: Record<string, { color: string; label: string; stats: { stat: string; category: string; value: number; group: string }[] }> = {
        azure: { color: 'azure', label: 'Azure', stats: [{ stat: 'max_shield', category: 'FLAT', value: 50, group: 'shard_buff' }] },
        crimson: { color: 'crimson', label: 'Crimson', stats: [{ stat: 'melee_crit_damage', category: 'MULTIPLICATIVE', value: 0.25, group: 'shard_buff' }] },
      };
      return defs[color] ?? undefined;
    }),
  },
}));

import { WfcdResolver } from '../data/wfcd-resolver';
import type { IWfcdDataService } from '../data/wfcd-service-interface';

function createMockDataService(): IWfcdDataService {
  return {
    getMod: vi.fn(),
    getModsByName: vi.fn(),
    getAllMods: vi.fn(),
    getWarframe: vi.fn(),
    getAllWarframes: vi.fn(),
    getWeapon: vi.fn(),
    getAllWeapons: vi.fn(),
    getArcane: vi.fn(),
    getCompanion: vi.fn(),
    getAllCompanions: vi.fn(),
    getModSetPath: vi.fn(),
    getSetDef: vi.fn(),
    getAllSets: vi.fn(),
    getOperator: vi.fn(),
    getAllOperators: vi.fn(),
    getOperatorArcane: vi.fn(),
    getAllOperatorArcanes: vi.fn(),
    getArchwing: vi.fn(),
    getAllArchwings: vi.fn(),
    getItems: vi.fn(),
    getItemDetail: vi.fn(),
    getHealth: vi.fn(),
  } as unknown as IWfcdDataService;
}

describe('WfcdResolver', () => {
  let resolver: WfcdResolver;
  let mockData: ReturnType<typeof createMockDataService>;

  beforeEach(() => {
    mockData = createMockDataService();
    resolver = new WfcdResolver(mockData);
  });

  describe('resolveWarframePassive', () => {
    it('returns base stats for a known warframe', () => {
      vi.mocked(mockData.getWarframe).mockReturnValue({
        uniqueName: '/Lotus/Powersuits/Excalibur/Excalibur',
        name: 'Excalibur',
        health: 100,
        shield: 100,
        armor: 225,
        sprintSpeed: 1.0,
        power: 100,
      } as never);

      const mods = resolver.resolveWarframePassive('/Lotus/Powersuits/Excalibur/Excalibur');
      expect(mods).toHaveLength(5);
      expect(mods[0]).toMatchObject({ stat: 'base_health', value: 100 });
      expect(mods[1]).toMatchObject({ stat: 'base_shield', value: 100 });
      expect(mods[2]).toMatchObject({ stat: 'base_armor', value: 225 });
      expect(mods[3]).toMatchObject({ stat: 'sprint_speed', value: 1.0 });
      expect(mods[4]).toMatchObject({ stat: 'base_energy', value: 100 });
    });

    it('returns empty array for unknown warframe', () => {
      vi.mocked(mockData.getWarframe).mockReturnValue(undefined);
      expect(resolver.resolveWarframePassive('unknown')).toEqual([]);
    });
  });

  describe('resolveCompanionPassive', () => {
    it('returns base companion stats', () => {
      vi.mocked(mockData.getCompanion).mockReturnValue({
        uniqueName: 'companion/sahasa',
        name: 'Sahasa Kubrow',
        health: 100,
        shield: 100,
        armor: 50,
      } as never);

      const mods = resolver.resolveCompanionPassive('companion/sahasa');
      expect(mods).toHaveLength(3);
      expect(mods[0]).toMatchObject({ stat: 'companion_base_health', value: 100 });
      expect(mods[1]).toMatchObject({ stat: 'companion_base_shield', value: 100 });
      expect(mods[2]).toMatchObject({ stat: 'companion_base_armor', value: 50 });
    });

    it('returns empty array for unknown companion', () => {
      vi.mocked(mockData.getCompanion).mockReturnValue(undefined);
      expect(resolver.resolveCompanionPassive('unknown')).toEqual([]);
    });
  });

  describe('resolveOperator', () => {
    it('returns operator base stats', () => {
      vi.mocked(mockData.getOperator).mockReturnValue({
        uniqueName: '/Lotus/Operators/Operator',
        name: 'Operator',
        health: 100,
        shield: 0,
        armor: 0,
        power: 100,
        sprintSpeed: 1.0,
      } as never);

      const mods = resolver.resolveOperator('/Lotus/Operators/Operator');
      expect(mods).toHaveLength(5);
      expect(mods[0]).toMatchObject({ stat: 'operator_base_health', value: 100 });
      expect(mods[1]).toMatchObject({ stat: 'operator_base_shield', value: 0 });
      expect(mods[2]).toMatchObject({ stat: 'operator_base_armor', value: 0 });
      expect(mods[3]).toMatchObject({ stat: 'operator_base_energy', value: 100 });
      expect(mods[4]).toMatchObject({ stat: 'operator_sprint_speed', value: 1.0 });
    });

    it('uses defaults for missing fields', () => {
      vi.mocked(mockData.getOperator).mockReturnValue({
        uniqueName: '/Lotus/Operators/Operator',
        name: 'Operator',
      } as never);

      const mods = resolver.resolveOperator('/Lotus/Operators/Operator');
      expect(mods[0]).toMatchObject({ stat: 'operator_base_health', value: 100 });
      expect(mods[1]).toMatchObject({ stat: 'operator_base_shield', value: 100 });
      expect(mods[2]).toMatchObject({ stat: 'operator_base_armor', value: 0 });
      expect(mods[4]).toMatchObject({ stat: 'operator_sprint_speed', value: 1 });
    });
  });

  describe('resolveWeaponPassive', () => {
    it('returns weapon base stats', () => {
      vi.mocked(mockData.getWeapon).mockReturnValue({
        uniqueName: '/Lotus/Weapons/Tenno/Primary/Braton',
        name: 'Braton',
        totalDamage: 21,
        multishot: 1,
        criticalChance: 0.12,
        criticalMultiplier: 2.0,
        fireRate: 8.33,
        procChance: 0.06,
        reloadTime: 2.2,
        damageTypes: { Impact: 4.2, Puncture: 8.4, Slash: 8.4 },
      } as never);

      const mods = resolver.resolveWeaponPassive('/Lotus/Weapons/Tenno/Primary/Braton');
      expect(mods).toHaveLength(10);
      expect(mods[0]).toMatchObject({ stat: 'base_damage', value: 21 });
      expect(mods[1]).toMatchObject({ stat: 'multishot', value: 1 });
      expect(mods[2]).toMatchObject({ stat: 'crit_chance', value: 0.12 });
      expect(mods[3]).toMatchObject({ stat: 'crit_damage', value: 2.0 });
      expect(mods[4]).toMatchObject({ stat: 'fire_rate', value: 8.33 });
      expect(mods[5]).toMatchObject({ stat: 'status_chance', value: 0.06 });
      expect(mods[6]).toMatchObject({ stat: 'reload_speed', value: 2.2 });
    });

    it('handles damagePerShot format', () => {
      vi.mocked(mockData.getWeapon).mockReturnValue({
        uniqueName: '/Lotus/Weapons/Tenno/Secondary/Lato',
        name: 'Lato',
        totalDamage: 24,
        multishot: 1,
        criticalChance: 0.1,
        criticalMultiplier: 2.0,
        fireRate: 6.0,
        procChance: 0.1,
        reloadTime: 1.0,
        damagePerShot: [4.8, 4.8, 14.4],
      } as never);

      const mods = resolver.resolveWeaponPassive('/Lotus/Weapons/Tenno/Secondary/Lato');
      expect(mods.length).toBeGreaterThan(7);
      const dmgMods = mods.filter(m => m.stat.startsWith('damage_'));
      expect(dmgMods.length).toBeGreaterThanOrEqual(3);
    });

    it('returns empty array for unknown weapon', () => {
      vi.mocked(mockData.getWeapon).mockReturnValue(undefined);
      expect(resolver.resolveWeaponPassive('unknown')).toEqual([]);
    });
  });

  describe('resolveShard', () => {
    it('resolves normal shard', () => {
      const mods = resolver.resolveShard({ color: 'azure', isTau: false });
      expect(mods).toHaveLength(1);
      expect(mods[0]).toMatchObject({ stat: 'max_shield', value: 50 });
    });

    it('resolves tauforged shard with 1.5 multiplier', () => {
      const mods = resolver.resolveShard({ color: 'crimson', isTau: true });
      expect(mods).toHaveLength(1);
      expect(mods[0]).toMatchObject({ stat: 'melee_crit_damage', value: 0.375 });
    });

    it('returns empty for unknown shard color', () => {
      const mods = resolver.resolveShard({ color: 'unknown', isTau: false });
      expect(mods).toEqual([]);
    });
  });

  describe('resolveMod', () => {
    it('resolves a mod with levelStats', () => {
      vi.mocked(mockData.getMod).mockReturnValue({
        uniqueName: '/Lotus/Upgrades/Mods/Shotgun/PointBlank',
        name: 'Point Blank',
        levelStats: [
          { stats: ['90% Damage'] },
          { stats: ['180% Damage'] },
        ],
      } as never);

      const mods = resolver.resolveMod({ id: '/Lotus/Upgrades/Mods/Shotgun/PointBlank', rank: 0 });
      expect(mods.length).toBeGreaterThanOrEqual(1);
    });

    it('returns empty for mod without levelStats', () => {
      vi.mocked(mockData.getMod).mockReturnValue({
        uniqueName: '/Lotus/Upgrades/Mods/EmptyMod',
        name: 'Empty Mod',
      } as never);

      expect(resolver.resolveMod({ id: '/Lotus/Upgrades/Mods/EmptyMod', rank: 0 })).toEqual([]);
    });
  });
});
