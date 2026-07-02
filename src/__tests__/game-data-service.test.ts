import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../browser/data/game-data.json', () => ({
  default: {
    exaltedWeapons: {
      '/Lotus/Powersuits/Excalibur/ExcaliburPrime': {
        name: 'Exalted Umbra Blade',
        slot: 'melee',
        uniqueName: '/Lotus/Weapons/Tenno/Exalted/ExaltedPrimeBlade',
      },
    },
    incarnonWeapons: ['/Lotus/Weapons/Tenno/Bows/BratonPrime'],
    helminthAbilities: [
      { donorUniqueName: '/Lotus/Powersuits/Excalibur/Excalibur', donorName: 'Excalibur', abilityName: 'Radial Blind' },
    ],
    focusSchools: [
      { name: 'Madurai', wayBounds: [] },
    ],
    squadBuffs: [
      { name: 'Growing Power', effect: '+25% Ability Strength' },
    ],
    enemies: [
      { name: 'Grineer Lancer', faction: 'Grineer', baseHealth: 100, baseArmor: 100, weakness: ['Puncture'], resistance: [], immune: [] },
      { name: 'Corpus Crewman', faction: 'Corpus', baseHealth: 60, baseArmor: 50, weakness: ['Impact'], resistance: [], immune: [] },
    ],
    shardDefs: [
      { color: 'azure', label: 'Azure', stats: [{ stat: 'max_shield', category: 'FLAT', value: 50, group: 'shard_buff' }] },
      { color: 'crimson', label: 'Crimson', stats: [{ stat: 'melee_crit_damage', category: 'MULTIPLICATIVE', value: 0.25, group: 'shard_buff' }] },
    ],
  },
}));

import { GameDataService } from '../browser/data/game-data-service';

describe('GameDataService', () => {
  let service: GameDataService;

  beforeEach(() => {
    service = new GameDataService();
  });

  it('returns exalted weapons map', () => {
    const ew = service.exaltedWeapons;
    expect(ew['/Lotus/Powersuits/Excalibur/ExcaliburPrime']).toBeDefined();
    expect(ew['/Lotus/Powersuits/Excalibur/ExcaliburPrime'].name).toBe('Exalted Umbra Blade');
  });

  it('returns incarnon weapons list', () => {
    expect(service.incarnonWeapons).toContain('/Lotus/Weapons/Tenno/Bows/BratonPrime');
  });

  it('returns helminth abilities', () => {
    expect(service.helminthAbilities.length).toBe(1);
    expect(service.helminthAbilities[0].abilityName).toBe('Radial Blind');
  });

  it('returns focus schools', () => {
    expect(service.focusSchools.length).toBe(1);
    expect(service.focusSchools[0].name).toBe('Madurai');
  });

  it('returns squad buffs', () => {
    expect(service.squadBuffs.length).toBe(1);
    expect(service.squadBuffs[0].name).toBe('Growing Power');
  });

  it('returns enemies', () => {
    expect(service.enemies.length).toBe(2);
    expect(service.enemies[0].name).toBe('Grineer Lancer');
  });

  it('returns shard defs', () => {
    expect(service.shardDefs.length).toBe(2);
    expect(service.shardDefs[0].color).toBe('azure');
  });

  describe('getExaltedForWarframe', () => {
    it('returns entry for known warframe', () => {
      const entry = service.getExaltedForWarframe('/Lotus/Powersuits/Excalibur/ExcaliburPrime');
      expect(entry).toBeDefined();
      expect(entry!.slot).toBe('melee');
    });

    it('returns undefined for unknown warframe', () => {
      expect(service.getExaltedForWarframe('nonexistent')).toBeUndefined();
    });
  });

  describe('isIncarnonWeapon', () => {
    it('returns true for known incarnon', () => {
      expect(service.isIncarnonWeapon('/Lotus/Weapons/Tenno/Bows/BratonPrime')).toBe(true);
    });

    it('returns false for unknown', () => {
      expect(service.isIncarnonWeapon('nonexistent')).toBe(false);
    });
  });

  describe('getEnemyByName', () => {
    it('finds existing enemy', () => {
      const enemy = service.getEnemyByName('Grineer Lancer');
      expect(enemy).toBeDefined();
      expect(enemy!.faction).toBe('Grineer');
    });

    it('returns undefined for unknown', () => {
      expect(service.getEnemyByName('unknown')).toBeUndefined();
    });
  });

  describe('getHelminthByDonor', () => {
    it('finds existing donor', () => {
      const h = service.getHelminthByDonor('/Lotus/Powersuits/Excalibur/Excalibur');
      expect(h).toBeDefined();
      expect(h!.abilityName).toBe('Radial Blind');
    });

    it('returns undefined for unknown', () => {
      expect(service.getHelminthByDonor('unknown')).toBeUndefined();
    });
  });

  describe('getShardDef', () => {
    it('finds existing shard color', () => {
      const s = service.getShardDef('azure');
      expect(s).toBeDefined();
      expect(s!.color).toBe('azure');
    });

    it('returns undefined for unknown', () => {
      expect(service.getShardDef('unknown')).toBeUndefined();
    });
  });

  describe('getHealth', () => {
    it('returns ok when enemies exist', () => {
      const health = service.getHealth();
      expect(health.ok).toBe(true);
    });
  });
});
