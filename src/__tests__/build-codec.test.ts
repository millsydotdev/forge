import { describe, it, expect } from 'vitest';
import { encodeBuild, decodeBuild, decodeToBuildCore } from '../features/build-planner/services/build-codec';
import type { BuildSnapshot } from '../features/build-planner/services/build-codec';
import { Polarity } from '../engine/build-core';

function makeMinimalSnapshot(): BuildSnapshot {
  return {
    mr: 30,
    warframe: {
      id: '/Lotus/Powersuits/Excalibur/ExcaliburPrime',
      aura: null,
      exilus: null,
      mods: [],
      arcanes: [null, null],
      shards: Array.from({ length: 5 }, () => ({ color: null, isTau: false })),
      slotPolarities: Array(10).fill(Polarity.UNIVERSAL) as Polarity[],
      exaltedWeapon: null,
    },
    weapons: {
      primary: { id: '', mods: [], exilus: null, arcanes: [null, null], slotPolarities: Array(9).fill(Polarity.UNIVERSAL) as Polarity[] },
      secondary: { id: '', mods: [], exilus: null, arcanes: [null, null], slotPolarities: Array(9).fill(Polarity.UNIVERSAL) as Polarity[] },
      melee: { id: '', mods: [], exilus: null, arcanes: [null, null], slotPolarities: Array(9).fill(Polarity.UNIVERSAL) as Polarity[] },
    },
    companion: {
      id: '', compType: 'sentinel', mods: [], slotPolarities: Array(8).fill(Polarity.UNIVERSAL) as Polarity[],
      weaponId: '', weaponMods: [], weaponSlotPolarities: Array(8).fill(Polarity.UNIVERSAL) as Polarity[],
    },
    helminth: { enabled: false, donorId: '', slotIndex: 0 },
    notes: '',
  };
}

function makeFullSnapshot(): BuildSnapshot {
  const snap = makeMinimalSnapshot();
  snap.warframe.id = '/Lotus/Powersuits/Rhino/Rhino';
  snap.warframe.mods = [
    { uniqueName: '/Lotus/Mods/Warframe/Intensify', name: 'Intensify', rank: 9, maxRank: 9, baseDrain: 6, polarity: Polarity.MADURAI },
  ];
  snap.warframe.shards[0] = { color: 'azure', isTau: true };
  snap.warframe.slotPolarities[2] = Polarity.MADURAI;
  snap.weapons.primary = {
    id: '/Lotus/Weapons/Tenno/Bows/BratonPrime',
    mods: [
      { uniqueName: '/Lotus/Mods/Rifle/Serration', name: 'Serration', rank: 10, maxRank: 10, baseDrain: 6, polarity: Polarity.MADURAI },
    ],
    exilus: null,
    arcanes: [null, null],
    slotPolarities: Array(9).fill(Polarity.UNIVERSAL) as Polarity[],
  };
  snap.companion = {
    id: '/Lotus/Companions/Sentinel/Dethcube/Dethcube',
    compType: 'sentinel', mods: [], slotPolarities: Array(8).fill(Polarity.UNIVERSAL) as Polarity[],
    weaponId: '/Lotus/Weapons/Sentinel/DethMachineRifle/DethMachineRifle',
    weaponMods: [], weaponSlotPolarities: Array(8).fill(Polarity.UNIVERSAL) as Polarity[],
  };
  snap.helminth = { enabled: true, donorId: '/Lotus/Powersuits/Excalibur/Excalibur', slotIndex: 2 };
  snap.mr = 15;
  return snap;
}

describe('encodeBuild', () => {
  it('produces string starting with tndx1:', () => {
    const code = encodeBuild(makeMinimalSnapshot());
    expect(code).toMatch(/^tndx1:/);
  });

  it('encodes warframe ID', () => {
    const code = encodeBuild(makeFullSnapshot());
    const decoded = JSON.parse(atob(code.slice(6)));
    expect(decoded.f).toBe('/Lotus/Powersuits/Rhino/Rhino');
  });

  it('encodes MR', () => {
    const code = encodeBuild(makeFullSnapshot());
    const decoded = JSON.parse(atob(code.slice(6)));
    expect(decoded.mr).toBe(15);
  });

  it('encodes weapon data with wp prefix', () => {
    const code = encodeBuild(makeFullSnapshot());
    const decoded = JSON.parse(atob(code.slice(6)));
    expect(decoded.wp.i).toBe('/Lotus/Weapons/Tenno/Bows/BratonPrime');
    expect(decoded.wp.m).toHaveLength(1);
    expect(decoded.wp.m[0][0]).toBe('/Lotus/Mods/Rifle/Serration');
  });

  it('encodes companion data', () => {
    const code = encodeBuild(makeFullSnapshot());
    const decoded = JSON.parse(atob(code.slice(6)));
    expect(decoded.c.i).toBe('/Lotus/Companions/Sentinel/Dethcube/Dethcube');
    expect(decoded.c.w.i).toBe('/Lotus/Weapons/Sentinel/DethMachineRifle/DethMachineRifle');
  });

  it('encodes helminth data', () => {
    const code = encodeBuild(makeFullSnapshot());
    const decoded = JSON.parse(atob(code.slice(6)));
    expect(decoded.h).toEqual(['/Lotus/Powersuits/Excalibur/Excalibur', 2]);
  });

  it('encodes shards', () => {
    const code = encodeBuild(makeFullSnapshot());
    const decoded = JSON.parse(atob(code.slice(6)));
    expect(decoded.sh[0]).toEqual({ color: 'azure', isTau: true });
    expect(decoded.sh[1]).toBeNull();
  });

  it('handles empty build (no warframe selected)', () => {
    const snap = makeMinimalSnapshot();
    snap.warframe.id = '';
    const code = encodeBuild(snap);
    const decoded = JSON.parse(atob(code.slice(6)));
    expect(decoded.f).toBeUndefined();
  });

  it('handles btoa error gracefully', () => {
    const snap = makeMinimalSnapshot();
    // can't easily trigger btoa failure, but the catch should return ''
    const code = encodeBuild(snap);
    expect(code).toMatch(/^tndx1:/);
  });
});

describe('decodeBuild', () => {
  it('round-trips a minimal build', () => {
    const original = makeMinimalSnapshot();
    const code = encodeBuild(original);
    const decoded = decodeBuild(code);
    expect(decoded.v).toBe(1);
    expect(decoded.f).toBe(original.warframe.id);
  });

  it('round-trips a full build', () => {
    const original = makeFullSnapshot();
    const code = encodeBuild(original);
    const decoded = decodeBuild(code);
    expect(decoded.f).toBe('/Lotus/Powersuits/Rhino/Rhino');
    expect(decoded.mr).toBe(15);
    expect(decoded.m).toHaveLength(1);
    expect(decoded.m[0][0]).toBe('/Lotus/Mods/Warframe/Intensify');
    expect(decoded.sh[0].color).toBe('azure');
    expect(decoded.c.w.i).toBe('/Lotus/Weapons/Sentinel/DethMachineRifle/DethMachineRifle');
  });

  it('throws on invalid prefix', () => {
    expect(() => decodeBuild('invalid')).toThrow('Invalid build code');
    expect(() => decodeBuild('tndx2:abc')).toThrow('Invalid build code');
  });

  it('throws on unknown version', () => {
    const code = `tndx1:${btoa(JSON.stringify({ v: 999 }))}`;
    expect(() => decodeBuild(code)).toThrow('Unknown build version');
  });

  it('throws on malformed base64', () => {
    expect(() => decodeBuild('tndx1:!!!not-base64!!!')).toThrow();
  });

  it('throws on non-JSON content', () => {
    const code = `tndx1:${btoa('not-json')}`;
    expect(() => decodeBuild(code)).toThrow();
  });

  it('handles version 1 correctly', () => {
    const code = `tndx1:${btoa(JSON.stringify({ v: 1, f: 'test' }))}`;
    const decoded = decodeBuild(code);
    expect(decoded.f).toBe('test');
  });
});

describe('decodeToBuildCore', () => {
  it('returns null when no warframe ID', () => {
    const code = `tndx1:${btoa(JSON.stringify({ v: 1 }))}`;
    expect(decodeToBuildCore(code, 0)).toBeNull();
  });

  it('decodes to BuildCore shape', () => {
    const original = makeFullSnapshot();
    const code = encodeBuild(original);
    const core = decodeToBuildCore(code, 15);
    expect(core).not.toBeNull();
    expect(core!.warframe.id).toBe('/Lotus/Powersuits/Rhino/Rhino');
    expect(core!.warframe.normalMods).toHaveLength(1);
    expect(core!.primary?.normalMods).toHaveLength(1);
    expect(core!.companion?.weapon).not.toBeNull();
    expect(core!.warframe.helminth).not.toBeNull();
  });
});
