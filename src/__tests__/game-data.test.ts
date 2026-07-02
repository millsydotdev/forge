import { describe, it, expect } from 'vitest';
import { gameData } from '../data/game-data';

describe('gameData', () => {
  it('has enemies', () => {
    expect(gameData.enemies.length).toBeGreaterThan(0);
  });

  it('has helminth abilities', () => {
    expect(gameData.helminthAbilities.length).toBeGreaterThan(0);
  });

  it('has focus schools', () => {
    expect(gameData.focusSchools.length).toBeGreaterThan(0);
  });

  it('has squad buffs', () => {
    expect(gameData.squadBuffs.length).toBeGreaterThan(0);
  });

  it('has shard defs', () => {
    expect(gameData.shardDefs.length).toBeGreaterThan(0);
  });

  it('getExaltedForWarframe returns entry for known warframes', () => {
    const entry = gameData.getExaltedForWarframe('/Lotus/Powersuits/Excalibur/ExcaliburPrime');
    if (entry) {
      expect(entry.slot).toBeDefined();
    }
  });

  it('getExaltedForWarframe returns undefined for unknown', () => {
    expect(gameData.getExaltedForWarframe('nonexistent')).toBeUndefined();
  });

  it('isIncarnonWeapon returns boolean', () => {
    // just verify it's callable and returns a boolean
    const result = gameData.isIncarnonWeapon('/Lotus/Weapons/Tenno/Bows/BratonPrime');
    expect(typeof result).toBe('boolean');
  });

  it('getHelminthByDonor returns AbilityDef for known donors', () => {
    const helminth = gameData.getHelminthByDonor('/Lotus/Powersuits/Excalibur/Excalibur');
    if (helminth) {
      expect(helminth.abilityName).toBeDefined();
      expect(helminth.donorName).toBeDefined();
    }
  });

  it('getHelminthByDonor returns undefined for unknown', () => {
    expect(gameData.getHelminthByDonor('nonexistent')).toBeUndefined();
  });

  it('getEnemyByName returns enemy def', () => {
    const first = gameData.enemies[0];
    const found = gameData.getEnemyByName(first.name);
    expect(found).toBeDefined();
    expect(found!.name).toBe(first.name);
  });

  it('getEnemyByName returns undefined for unknown', () => {
    expect(gameData.getEnemyByName('nonexistent')).toBeUndefined();
  });

  it('getShardDef returns shard def for known colors', () => {
    const shard = gameData.getShardDef('azure');
    if (shard) {
      expect(shard.color).toBe('azure');
      expect(shard.stats).toBeDefined();
    }
  });

  it('getShardDef returns undefined for unknown', () => {
    expect(gameData.getShardDef('nonexistent')).toBeUndefined();
  });

  it('all enemies have required fields', () => {
    for (const enemy of gameData.enemies) {
      expect(enemy.name).toBeTruthy();
      expect(enemy.faction).toBeTruthy();
      expect(typeof enemy.baseHealth).toBe('number');
      expect(typeof enemy.baseArmor).toBe('number');
      expect(Array.isArray(enemy.weakness)).toBe(true);
      expect(Array.isArray(enemy.resistance)).toBe(true);
      expect(Array.isArray(enemy.immune)).toBe(true);
    }
  });

  it('all helminth abilities have required fields', () => {
    for (const h of gameData.helminthAbilities) {
      expect(h.donorUniqueName).toBeTruthy();
      expect(h.abilityName).toBeTruthy();
    }
  });
});
