import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@wfcd/items', () => {
  const items = [
    { uniqueName: '/Lotus/Upgrades/Mods/PointBlank', name: 'Point Blank', category: 'Mods', type: 'Shotgun', baseDrain: 4, fusionLimit: 5, polarity: 'Vazarin', rarity: 'Common', levelStats: [{ stats: ['90% Damage'] }] },
    { uniqueName: '/Lotus/Upgrades/Mods/Sets/Umbral/UmbralIntensify', name: 'Umbral Intensify', category: 'Mods', type: 'Warframe', baseDrain: 6, fusionLimit: 5, polarity: 'Madurai', rarity: 'Legendary', modSet: '/Lotus/Upgrades/Mods/Sets/Umbral/UmbralSet' },
    { uniqueName: '/Lotus/Upgrades/Mods/Sets/Umbral/UmbralSet', name: 'Umbral Set', category: 'Mods', modSetPath: '/Lotus/Upgrades/Mods/Sets/Umbral/UmbralSet', numUpgradesInSet: 3, stats: ['+5% Ability Strength'] },
    { uniqueName: '/Lotus/Powersuits/Excalibur/Excalibur', name: 'Excalibur', category: 'Warframes', health: 100, shield: 100, armor: 225, sprintSpeed: 1.0, power: 100 },
    { uniqueName: '/Lotus/Weapons/Tenno/Primary/Braton', name: 'Braton', category: 'Primary', type: 'Rifle', totalDamage: 21 },
    { uniqueName: '/Lotus/Upgrades/Arcanes/ArcaneGuardian', name: 'Arcane Guardian', category: 'Arcanes', type: 'Arcane', rarity: 'Legendary', levelStats: [{ stats: ['300 Armor'] }] },
    { uniqueName: '/Lotus/Operators/Default', name: 'Operator', category: 'Operator', health: 100, shield: 0, armor: 0, power: 100, sprintSpeed: 1.0 },
    { uniqueName: 'pet/sahasa', name: 'Sahasa Kubrow', category: 'Pets', type: 'Kubrow' },
  ];
  return { default: function () { return items; } };
});

import { WfcdDataService } from '../browser/services/wfcd-data-service';

describe('WfcdDataService', () => {
  let service: WfcdDataService;

  beforeEach(() => {
    service = new WfcdDataService();
    service.load();
  });

  describe('getItems', () => {
    it('returns all items when no category', () => {
      const items = service.getItems();
      expect(items.length).toBeGreaterThanOrEqual(6);
    });

    it('filters by category', () => {
      const mods = service.getItems('Mods');
      expect(mods.length).toBe(3);
      expect(mods[0].category).toBe('Mods');
    });

    it('filters by weapon category', () => {
      const primaries = service.getItems('Primary');
      expect(primaries.length).toBe(1);
      expect(primaries[0].category).toBe('Primary');
    });

    it('returns empty for unknown category', () => {
      const items = service.getItems('Unknown');
      expect(items).toEqual([]);
    });
  });

  describe('getItemDetail', () => {
    it('returns detail for known uniqueName', () => {
      const detail = service.getItemDetail('/Lotus/Powersuits/Excalibur/Excalibur');
      expect(detail).toBeDefined();
    });

    it('returns null for unknown uniqueName', () => {
      expect(service.getItemDetail('unknown')).toBeNull();
    });
  });

  describe('getters', () => {
    it('getMod returns mod by uniqueName', () => {
      const mod = service.getMod('/Lotus/Upgrades/Mods/PointBlank');
      expect(mod).toBeDefined();
      expect(mod!.name).toBe('Point Blank');
    });

    it('getWarframe returns warframe', () => {
      const wf = service.getWarframe('/Lotus/Powersuits/Excalibur/Excalibur');
      expect(wf).toBeDefined();
      expect(wf!.name).toBe('Excalibur');
    });

    it('getWeapon returns weapon', () => {
      const wp = service.getWeapon('/Lotus/Weapons/Tenno/Primary/Braton');
      expect(wp).toBeDefined();
    });

    it('getArcane returns arcane', () => {
      const a = service.getArcane('/Lotus/Upgrades/Arcanes/ArcaneGuardian');
      expect(a).toBeDefined();
      expect(a!.name).toBe('Arcane Guardian');
    });

    it('getOperator returns operator', () => {
      const op = service.getOperator('/Lotus/Operators/Default');
      expect(op).toBeDefined();
    });

    it('getCompanion returns companion', () => {
      const c = service.getCompanion('pet/sahasa');
      expect(c).toBeDefined();
    });

    it('returns undefined for missing', () => {
      expect(service.getMod('unknown')).toBeUndefined();
    });
  });

  describe('getHealth', () => {
    it('returns ok with positive counts', () => {
      const health = service.getHealth();
      expect(health.ok).toBe(true);
      expect(health.warframes).toBe(1);
      expect(health.mods).toBe(3);
      expect(health.weapons).toBe(1);
    });
  });
});
