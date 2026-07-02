import { describe, it, expect } from 'vitest';
import { getArcane, getArcanesByCategory, resolveArcaneEffect, getAllArcanes } from '../engine/systems/arcane-system';

describe('Arcane System (Data-Driven)', () => {
  it('known arcanes are loadable from WFCD data', () => {
    const all = getAllArcanes();
    const energize = all.find(a => a.name === 'Arcane Energize');
    expect(energize).toBeDefined();
    expect(energize!.name).toBe('Arcane Energize');
  });

  it('Arcane Energize has legendary rarity from WFCD', () => {
    const all = getAllArcanes();
    const energize = all.find(a => a.name === 'Arcane Energize');
    expect(energize).toBeDefined();
    expect(energize!.rarity).toBe('Legendary');
  });

  it('gets arcanes by category', () => {
    const warframeArcanes = getArcanesByCategory('Warframe Arcane');
    expect(warframeArcanes.length).toBeGreaterThan(0);
  });

  it('all arcanes have valid data', () => {
    const all = getAllArcanes();
    expect(all.length).toBeGreaterThan(100);
    for (const arcane of all) {
      expect(arcane.uniqueName).toBeTruthy();
      expect(arcane.name).toBeTruthy();
      expect(arcane.rarity).toBeTruthy();
    }
  });

  it('resolveArcaneEffect returns effects', () => {
    const energize = getArcane('/Lotus/Upgrades/CosmeticEnhancers/Energy/Energized');
    if (energize) {
      const effects = resolveArcaneEffect(energize, 1);
      expect(Array.isArray(effects)).toBe(true);
    }
  });

  it('returns undefined for unknown arcane', () => {
    expect(getArcane('/Lotus/Fake/Arcane')).toBeUndefined();
  });
});
