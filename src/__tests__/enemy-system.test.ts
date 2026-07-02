import { describe, it, expect } from 'vitest';
import {
  getDifficulty,
  scaleEnemyHealth,
  calcSentientAdaptation, calcEximusOverguard,
  BOSS_MECHANICS, FACTION_DEFS, EXIMUS_TYPES,
} from '../engine/systems/enemy-system';

describe('Enemy System', () => {
  it('steel path has 2.5x health multiplier', () => {
    const sp = getDifficulty('steel_path');
    expect(sp.healthMultiplier).toBe(2.5);
    expect(sp.shieldMultiplier).toBe(2.5);
    expect(sp.enemyLevelOffset).toBe(100);
  });

  it('normal difficulty has 1x multipliers', () => {
    const normal = getDifficulty('normal');
    expect(normal.healthMultiplier).toBe(1);
    expect(normal.shieldMultiplier).toBe(1);
  });

  it('scales enemy health with level', () => {
    const normal = getDifficulty('normal');
    const health = scaleEnemyHealth(700, 1, 100, 0.5, normal);
    expect(health).toBeGreaterThan(700);
    expect(health).toBeLessThan(70000);
  });

  it('scales enemy health higher on steel path', () => {
    const normal = getDifficulty('normal');
    const sp = getDifficulty('steel_path');
    const normalHp = scaleEnemyHealth(700, 1, 100, 0.5, normal);
    const spHp = scaleEnemyHealth(700, 1, 100, 0.5, sp);
    expect(spHp).toBeGreaterThan(normalHp);
  });

  it('sentient adaptation reduces damage per hit', () => {
    const adapt0 = calcSentientAdaptation(0);
    expect(adapt0).toBe(1);
    const adapt10 = calcSentientAdaptation(10);
    expect(adapt10).toBeCloseTo(0.4);
    const adaptVoid = calcSentientAdaptation(10, 'void');
    expect(adaptVoid).toBe(1);
  });

  it('eximus overguard scales with level', () => {
    const og1 = calcEximusOverguard(300, 1, 200, false);
    expect(og1).toBeGreaterThan(300);
    const og100 = calcEximusOverguard(300, 100, 200, false);
    expect(og100).toBeGreaterThan(og1);
  });

  it('eximus overguard is higher on steel path', () => {
    const normal = calcEximusOverguard(300, 100, 200, false);
    const sp = calcEximusOverguard(300, 100, 200, true);
    expect(sp).toBeGreaterThan(normal);
  });

  it('BOSS_MECHANICS includes known bosses', () => {
    expect(BOSS_MECHANICS['Archon']).toBeDefined();
    expect(BOSS_MECHANICS['Demolyst']).toBeDefined();
    expect(BOSS_MECHANICS['Eidolon Teralyst']).toBeDefined();
    expect(BOSS_MECHANICS['Profit-Taker']).toBeDefined();
  });

  it('Archon has threshold attenuation', () => {
    const archon = BOSS_MECHANICS['Archon'];
    expect(archon.damageAttenuationType).toBe('threshold');
    expect(archon.damageAttenuationThreshold).toBe(2000);
    expect(archon.phases).toBe(3);
  });

  it('all factions defined', () => {
    expect(FACTION_DEFS['Grineer']).toBeDefined();
    expect(FACTION_DEFS['Corpus']).toBeDefined();
    expect(FACTION_DEFS['Infested']).toBeDefined();
    expect(FACTION_DEFS['Sentient']).toBeDefined();
  });

  it('Grineer use Cloned Flesh health type', () => {
    expect(FACTION_DEFS['Grineer'].healthTypes).toContain('Cloned Flesh');
  });

  it('all eximus types defined', () => {
    expect(EXIMUS_TYPES['Arson']).toBeDefined();
    expect(EXIMUS_TYPES['Jade Light']).toBeDefined();
    expect(EXIMUS_TYPES['Energy Leech']).toBeDefined();
  });
});
