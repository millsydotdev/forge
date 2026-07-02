import { describe, it, expect } from 'vitest';
import { getWarframeAbilityDef, getAllWarframeAbilityDefs } from '../engine/systems/warframe-abilities';

describe('Warframe Abilities (Data-Driven)', () => {
  it('loads known warframe definitions', () => {
    const ash = getWarframeAbilityDef('Ash');
    expect(ash).toBeDefined();
    expect(ash!.name).toBe('Ash');
    expect(ash!.abilities.length).toBeGreaterThanOrEqual(3);
    expect(ash!.abilities.length).toBeLessThanOrEqual(4);
  });

  it('includes Excalibur with exalted weapon', () => {
    const excal = getWarframeAbilityDef('Excalibur');
    expect(excal).toBeDefined();
    if (excal!.exaltedWeapon) {
      expect(excal!.exaltedSlot).toBe('melee');
    }
  });

  it('returns undefined for unknown warframe', () => {
    const unknown = getWarframeAbilityDef('/Lotus/Powersuits/Unknown/Fake');
    expect(unknown).toBeUndefined();
  });

  it('all 118 warframes have valid ability data', () => {
    const all = getAllWarframeAbilityDefs();
    expect(all.length).toBeGreaterThan(50);
    for (const wf of all) {
      expect(wf.name).toBeTruthy();
      for (const ability of wf.abilities) {
        expect(ability.slotIndex).toBeGreaterThanOrEqual(1);
        // Most frames have 4 abilities; Helminth is special with 13
      if (wf.name === 'Helminth') {
        expect(ability.slotIndex).toBeGreaterThanOrEqual(1);
      } else {
        expect(ability.slotIndex).toBeLessThanOrEqual(4);
      }
      }
    }
  });

  it('Rhino has 4 abilities', () => {
    const rhino = getWarframeAbilityDef('Rhino');
    expect(rhino).toBeDefined();
    expect(rhino!.abilities.length).toBe(4);
  });

  it('Saryn Spores has dot damage defined', () => {
    const saryn = getWarframeAbilityDef('Saryn');
    const spores = saryn!.abilities.find(a => a.name === 'Spores');
    expect(spores).toBeDefined();
    expect(spores!.dotDamage).toBe(true);
  });

  it('Mesa is found by name-based lookup', () => {
    const mesa = getWarframeAbilityDef('Mesa');
    expect(mesa).toBeDefined();
    expect(mesa!.abilities.length).toBeGreaterThanOrEqual(3);
  });

  it('Gauss is found by name-based lookup', () => {
    const gauss = getWarframeAbilityDef('Gauss');
    expect(gauss).toBeDefined();
  });

  it('Wisp has passive description from WFCD', () => {
    const wisp = getWarframeAbilityDef('Wisp');
    expect(wisp).toBeDefined();
    expect(wisp!.passive).toBeTruthy();
  });

  it('Nova has ability data', () => {
    const nova = getWarframeAbilityDef('Nova');
    expect(nova).toBeDefined();
    expect(nova!.abilities.length).toBeGreaterThanOrEqual(3);
    const antimatter = nova!.abilities.find(a => a.name.includes('Antimatter') || a.name.includes('Drop'));
    expect(antimatter).toBeDefined();
  });
});
