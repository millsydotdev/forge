import { describe, it, expect, beforeEach } from 'vitest';
import { toBuildCore } from '../features/build-planner/services/build-core-mapper';
import type { WarframeState, WeaponState, CompanionState, HelminthState, ModSlot } from '../features/build-planner/model';
import { Polarity } from '../engine/build-core';

const baseMod: ModSlot = {
  uniqueName: '/Lotus/Mods/Warframe/Intensify',
  name: 'Intensify',
  rank: 9, maxRank: 9, baseDrain: 6,
  polarity: Polarity.MADURAI,
};

const baseWeapon = (overrides: Partial<WeaponState> = {}): WeaponState => ({
  id: '/Lotus/Weapons/Tenno/Bows/BratonPrime',
  mods: [],
  exilus: null,
  arcanes: [null, null],
  slotPolarities: Array(9).fill(Polarity.UNIVERSAL) as Polarity[],
  ...overrides,
});

const emptyWeapon = (): WeaponState => ({
  id: '', mods: [], exilus: null, arcanes: [null, null],
  slotPolarities: Array(9).fill(Polarity.UNIVERSAL) as Polarity[],
});

function defaultWeapons(): Record<string, WeaponState> {
  return { primary: emptyWeapon(), secondary: emptyWeapon(), melee: emptyWeapon() };
}

const baseWarframe = (overrides: Partial<WarframeState> = {}): WarframeState => ({
  id: '/Lotus/Powersuits/Excalibur/ExcaliburPrime',
  aura: null,
  exilus: null,
  mods: [],
  arcanes: [null, null],
  shards: Array.from({ length: 5 }, () => ({ color: null, isTau: false })),
  slotPolarities: Array(10).fill(Polarity.UNIVERSAL) as Polarity[],
  exaltedWeapon: null,
  ...overrides,
});

const baseCompanion: CompanionState = {
  id: '', compType: 'sentinel', mods: [], slotPolarities: Array(8).fill(Polarity.UNIVERSAL) as Polarity[],
  weaponId: '', weaponMods: [], weaponSlotPolarities: Array(8).fill(Polarity.UNIVERSAL) as Polarity[],
};

const baseHelminth: HelminthState = { enabled: false, donorId: '', slotIndex: 0 };

describe('toBuildCore', () => {
  beforeEach(() => {
    // clear localStorage before each test for riven-store
    localStorage.clear();
  });

  it('maps warframe state to BuildCore', () => {
    const core = toBuildCore(baseWarframe(), defaultWeapons(), baseCompanion, baseHelminth);
    expect(core.warframe.id).toBe('/Lotus/Powersuits/Excalibur/ExcaliburPrime');
    expect(core.warframe.aura).toBeNull();
    expect(core.warframe.normalMods).toEqual([]);
  });

  it('maps mods correctly', () => {
    const slotPolarities = Array(10).fill(Polarity.UNIVERSAL) as Polarity[];
    slotPolarities[2] = Polarity.MADURAI; // first normal mod slot (index 0 → slot index 2)
    const wf = baseWarframe({ mods: [baseMod], slotPolarities });
    const core = toBuildCore(wf, defaultWeapons(), baseCompanion, baseHelminth);
    expect(core.warframe.normalMods).toHaveLength(1);
    expect(core.warframe.normalMods[0].id).toBe('/Lotus/Mods/Warframe/Intensify');
    expect(core.warframe.normalMods[0].rank).toBe(9);
    expect(core.warframe.normalMods[0].slotPolarity).toBe(Polarity.MADURAI);
    expect(core.warframe.normalMods[0].polarityMatch).toBe(true);
  });

  it('maps aura mod', () => {
    const wf = baseWarframe({ aura: baseMod });
    const core = toBuildCore(wf, defaultWeapons(), baseCompanion, baseHelminth);
    expect(core.warframe.aura).not.toBeNull();
    expect(core.warframe.aura!.id).toBe('/Lotus/Mods/Warframe/Intensify');
  });

  it('maps exilus mod', () => {
    const wf = baseWarframe({ exilus: baseMod });
    const core = toBuildCore(wf, defaultWeapons(), baseCompanion, baseHelminth);
    expect(core.warframe.exilus).not.toBeNull();
    expect(core.warframe.exilus!.id).toBe('/Lotus/Mods/Warframe/Intensify');
  });

  it('maps arcanes', () => {
    const wf = baseWarframe({
      arcanes: [
        { uniqueName: '/Lotus/Arcane/ArcaneGuardian', name: 'Arcane Guardian', rank: 5, maxRank: 5 },
        null,
      ],
    });
    const core = toBuildCore(wf, defaultWeapons(), baseCompanion, baseHelminth);
    expect(core.warframe.arcanes[0]!.id).toBe('/Lotus/Arcane/ArcaneGuardian');
    expect(core.warframe.arcanes[0]!.rank).toBe(5);
    expect(core.warframe.arcanes[1]).toBeNull();
  });

  it('maps shards (non-null colors)', () => {
    const wf = baseWarframe({
      shards: [
        { color: 'azure', isTau: true },
        { color: 'crimson', isTau: false },
        { color: null, isTau: false },
        { color: null, isTau: false },
        { color: null, isTau: false },
      ],
    });
    const core = toBuildCore(wf, defaultWeapons(), baseCompanion, baseHelminth);
    expect(core.warframe.shards).toHaveLength(2);
    expect(core.warframe.shards[0].color).toBe('azure');
    expect(core.warframe.shards[0].isTau).toBe(true);
  });

  it('maps primary weapon', () => {
    const weapons = { ...defaultWeapons(), primary: baseWeapon({ mods: [baseMod] }) };
    const core = toBuildCore(baseWarframe(), weapons, baseCompanion, baseHelminth);
    expect(core.primary).not.toBeNull();
    expect(core.primary!.id).toBe('/Lotus/Weapons/Tenno/Bows/BratonPrime');
    expect(core.primary!.normalMods).toHaveLength(1);
    expect(core.secondary).toBeNull();
    expect(core.melee).toBeNull();
  });

  it('maps exilus on weapon', () => {
    const exilusMod: ModSlot = {
      uniqueName: '/Lotus/Mods/Rifle/Hush', name: 'Hush', rank: 5, maxRank: 5, baseDrain: 4,
      polarity: Polarity.NAIRU,
    };
    const weapons = { ...defaultWeapons(), primary: baseWeapon({ exilus: exilusMod }) };
    const core = toBuildCore(baseWarframe(), weapons, baseCompanion, baseHelminth);
    expect(core.primary!.exilus).not.toBeNull();
    expect(core.primary!.exilus!.id).toBe('/Lotus/Mods/Rifle/Hush');
  });

  it('maps companion', () => {
    const comp: CompanionState = {
      id: '/Lotus/Companions/Sentinel/Dethcube/Dethcube',
      compType: 'sentinel', mods: [baseMod], slotPolarities: Array(8).fill(Polarity.UNIVERSAL) as Polarity[],
      weaponId: '', weaponMods: [], weaponSlotPolarities: Array(8).fill(Polarity.UNIVERSAL) as Polarity[],
    };
    const core = toBuildCore(baseWarframe(), defaultWeapons(), comp, baseHelminth);
    expect(core.companion).not.toBeNull();
    expect(core.companion!.id).toBe('/Lotus/Companions/Sentinel/Dethcube/Dethcube');
    expect(core.companion!.normalMods).toHaveLength(1);
  });

  it('maps companion weapon', () => {
    const comp: CompanionState = {
      id: '/Lotus/Companions/Sentinel/Dethcube/Dethcube',
      compType: 'sentinel', mods: [], slotPolarities: Array(8).fill(Polarity.UNIVERSAL) as Polarity[],
      weaponId: '/Lotus/Weapons/Sentinel/DethMachineRifle/DethMachineRifle',
      weaponMods: [baseMod], weaponSlotPolarities: Array(8).fill(Polarity.UNIVERSAL) as Polarity[],
    };
    const core = toBuildCore(baseWarframe(), defaultWeapons(), comp, baseHelminth);
    expect(core.companion!.weapon).not.toBeNull();
    expect(core.companion!.weapon!.id).toBe('/Lotus/Weapons/Sentinel/DethMachineRifle/DethMachineRifle');
  });

  it('maps helminth when enabled', () => {
    const helminth: HelminthState = { enabled: true, donorId: '/Lotus/Powersuits/Excalibur/Excalibur', slotIndex: 2 };
    const core = toBuildCore(baseWarframe(), defaultWeapons(), baseCompanion, helminth);
    expect(core.warframe.helminth).not.toBeNull();
    expect(core.warframe.helminth!.donorWarframeId).toBe('/Lotus/Powersuits/Excalibur/Excalibur');
    expect(core.warframe.helminth!.slotIndex).toBe(2);
  });

  it('sets helminth to null when disabled', () => {
    const core = toBuildCore(baseWarframe(), defaultWeapons(), baseCompanion, baseHelminth);
    expect(core.warframe.helminth).toBeNull();
  });

  it('maps optional fields (targetFaction, isAiming, activeStatuses)', () => {
    const core = toBuildCore(baseWarframe(), defaultWeapons(), baseCompanion, baseHelminth, 'corpus', true, 3);
    expect(core.targetFaction).toBe('corpus');
    expect(core.isAiming).toBe(true);
    expect(core.activeStatuses).toBe(3);
  });

  it('handles riven mods (uniqueName starts with riven_custom_)', () => {
    const rivenMod: ModSlot = {
      uniqueName: 'riven_custom_abc123',
      name: 'Riven Mod',
      rank: 8, maxRank: 8, baseDrain: 18,
      polarity: Polarity.MADURAI,
    };
    const wf = baseWarframe({ mods: [rivenMod] });
    const core = toBuildCore(wf, defaultWeapons(), baseCompanion, baseHelminth);
    expect(core.warframe.normalMods).toHaveLength(1);
    expect(core.warframe.normalMods[0].rivenData).toBeUndefined();
  });

  it('handles empty warframe id', () => {
    const wf = baseWarframe({ id: '' });
    const core = toBuildCore(wf, defaultWeapons(), baseCompanion, baseHelminth);
    expect(core.warframe.id).toBe('');
  });

  it('handles no companion', () => {
    const comp: CompanionState = {
      id: '', compType: 'sentinel', mods: [], slotPolarities: Array(8).fill(Polarity.UNIVERSAL) as Polarity[],
      weaponId: '', weaponMods: [], weaponSlotPolarities: Array(8).fill(Polarity.UNIVERSAL) as Polarity[],
    };
    const core = toBuildCore(baseWarframe(), defaultWeapons(), comp, baseHelminth);
    expect(core.companion).toBeNull();
  });

  it('maps name field', () => {
    const core = toBuildCore(baseWarframe(), defaultWeapons(), baseCompanion, baseHelminth);
    expect(core.name).toBe('Forge Build');
  });
});
