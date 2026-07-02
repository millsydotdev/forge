import type { CompanionState, HelminthState, WarframeState, WeaponState } from '../model';
import type { BuildCore, CompanionBuild, EquippedMod, Polarity, WeaponBuild } from '../../../engine/build-core';
import { polarityMatches } from '../../../engine/polarity';

export interface BuildSnapshot {
  mr: number;
  warframe: WarframeState;
  weapons: Record<string, WeaponState>;
  companion: CompanionState;
  helminth: HelminthState;
  notes: string;
}

export interface EncodedWeapon {
  i: string;
  m?: [string, number][];
  p?: Polarity[];
  ar?: ([string, number] | null)[];
  e?: [string, number];
}

interface EncodedCompanion {
  i: string;
  t: string;
  m?: [string, number][];
  p?: Polarity[];
  w?: {
    i: string;
    m?: [string, number][];
    p?: Polarity[];
  };
}

export interface EncodedBuild {
  v: number;
  mr: number;
  notes: string;
  f?: string;
  a?: [string, number];
  e?: [string, number];
  m?: [string, number][];
  p?: Polarity[];
  ar?: ([string, number] | null)[];
  sh?: ({ color: string | null; isTau: boolean } | null)[];
  h?: [string, number];
  wp?: EncodedWeapon;
  ws?: EncodedWeapon;
  wm?: EncodedWeapon;
  wg?: EncodedWeapon;
  wl?: EncodedWeapon;
  c?: EncodedCompanion;
}

/**
 * Encode a complete build snapshot into a compact `tndx1:` codec string.
 * @param snapshot - Build state including warframe, weapons, companion, helminth, shards, notes, MR
 * @returns Base64-encoded JSON string prefixed with `tndx1:` (e.g., `tndx1:eyJ2IjoxLCJtciI6MzAs...`)
 */
export function encodeBuild(snapshot: BuildSnapshot): string {
  const { mr, warframe, weapons, companion, helminth, notes } = snapshot;
  const output: EncodedBuild = { v: 1, mr, notes: notes || '' };
  if (warframe.id) {
    output.f = warframe.id;
    if (warframe.aura) output.a = [warframe.aura.uniqueName, warframe.aura.rank];
    if (warframe.exilus) output.e = [warframe.exilus.uniqueName, warframe.exilus.rank];
    output.m = warframe.mods.map(mod => [mod.uniqueName, mod.rank]);
    output.p = warframe.slotPolarities;
    output.ar = warframe.arcanes.map(arcane => arcane ? [arcane.uniqueName, arcane.rank] : null);
    output.sh = warframe.shards.map(s => s.color ? { color: s.color, isTau: s.isTau } : null);
  }
  if (helminth.enabled && helminth.donorId) output.h = [helminth.donorId, helminth.slotIndex];
  const WEAPON_ENCODE_MAP: Record<string, 'wp' | 'ws' | 'wm' | 'wg' | 'wl'> = {
    primary: 'wp', secondary: 'ws', melee: 'wm',
    'arch-gun': 'wg', 'arch-melee': 'wl',
  };
  for (const slot of ['primary', 'secondary', 'melee', 'arch-gun', 'arch-melee']) {
    const weapon = weapons[slot];
    if (!weapon?.id) continue;
    const encoded: EncodedWeapon = {
      i: weapon.id,
      m: weapon.mods.map(mod => [mod.uniqueName, mod.rank]),
      p: weapon.slotPolarities,
      ar: weapon.arcanes.map(arcane => arcane ? [arcane.uniqueName, arcane.rank] : null),
    };
    if (weapon.exilus) encoded.e = [weapon.exilus.uniqueName, weapon.exilus.rank];
    output[WEAPON_ENCODE_MAP[slot]] = encoded;
  }
  if (companion.id) {
    output.c = {
      i: companion.id,
      t: companion.compType,
      m: companion.mods.map(mod => [mod.uniqueName, mod.rank]),
      p: companion.slotPolarities,
    };
    if (companion.weaponId) {
      output.c.w = {
        i: companion.weaponId,
        m: companion.weaponMods.map(mod => [mod.uniqueName, mod.rank]),
        p: companion.weaponSlotPolarities,
      };
    }
  }
  try {
    return `tndx1:${btoa(JSON.stringify(output))}`;
  } catch {
    return '';
  }
}

/**
 * Decode a `tndx1:` build code into the structured `EncodedBuild` object.
 * @param code - Build code string starting with `tndx1:`
 * @returns Parsed EncodedBuild (version 1)
 * @throws {Error} If code doesn't start with `tndx1:` or version != 1
 */
export function decodeBuild(code: string): EncodedBuild {
  if (!code.startsWith('tndx1:')) throw new Error('Invalid build code');
  const snapshot = JSON.parse(atob(code.slice(6)));
  if (snapshot.v !== 1) throw new Error('Unknown build version');
  return snapshot as EncodedBuild;
}

/**
 * Migrate a build code to the current version (v1).
 * Currently a no-op since v1 is current; extend for future versions.
 * @param code - Any valid `tndx1:` build code
 * @returns Migrated code (currently same as input)
 */
export function migrateBuild(code: string): string {
  const decoded = decodeBuild(code);
  if (decoded.v === 1) return code;
  // Future: if (decoded.v === 2) return migrateV2toV3(decoded);
  return code;
}

function toModFromTuple(t: [string, number], slotPol: Polarity, modPol: Polarity): EquippedMod {
  return {
    id: t[0],
    rank: t[1],
    slotPolarity: slotPol,
    polarityMatch: polarityMatches(modPol, slotPol),
  };
}

const UNIVERSAL = 'UNIVERSAL' as Polarity;

/**
 * Decode a `tndx1:` build code into a `BuildCore` for the calculation engine.
 * Used when loading a shared build for stat calculation.
 * @param code - Build code string starting with `tndx1:`
 * @param _mr - Mastery Rank (reserved for future MR-dependent calculations)
 * @returns BuildCore or null if warframe not specified
 */
export function decodeToBuildCore(code: string, _mr: number): BuildCore | null {
  const json = decodeBuild(code);
  if (!json.f) return null;

  const wfPols: Polarity[] = json.p ?? Array(10).fill(UNIVERSAL);
  const auraMod = json.a ? toModFromTuple(json.a, wfPols[0], UNIVERSAL) : null;
  const exilusMod = json.e ? toModFromTuple(json.e, wfPols[1], UNIVERSAL) : null;
  const wfMods: EquippedMod[] = (json.m ?? []).map((t: [string, number], i: number) =>
    toModFromTuple(t, wfPols[i + 2] ?? UNIVERSAL, UNIVERSAL));

  const arcanes: [{ id: string; rank: number } | null, { id: string; rank: number } | null] = [
    json.ar?.[0] ? { id: json.ar[0][0], rank: json.ar[0][1] } : null,
    json.ar?.[1] ? { id: json.ar[1][0], rank: json.ar[1][1] } : null,
  ];

  const shards = (json.sh ?? []).map((s) => {
    if (!s) return { id: '', color: null as string | null, isTau: false };
    return { id: '', color: s.color ?? 'azure', isTau: ('isTau' in s ? s.isTau : false) ?? false };
  }).filter((s) => s.color);

  const helminth = json.h ? { donorWarframeId: json.h[0], slotIndex: json.h[1], replacesAbilityIndex: json.h[1] } : null;

  const weapons: Record<string, WeaponBuild> = {};
  for (const [key, slot] of [['wp', 'primary'], ['ws', 'secondary'], ['wm', 'melee'], ['wg', 'arch-gun'], ['wl', 'arch-melee']] as const) {
    const w = json[key as keyof typeof json] as EncodedWeapon | undefined;
    if (!w) continue;
    const wPols: Polarity[] = w.p ?? Array(9).fill(UNIVERSAL);
    weapons[slot] = {
      id: w.i,
      slot,
      normalMods: (w.m ?? []).map((t: [string, number], i: number) => toModFromTuple(t, wPols[i + 1] ?? UNIVERSAL, UNIVERSAL)),
      exilus: w.e ? toModFromTuple(w.e, wPols[0], UNIVERSAL) : null,
      arcanes: [
        w.ar?.[0] ? { id: w.ar[0][0], rank: w.ar[0][1] } : null,
        w.ar?.[1] ? { id: w.ar[1][0], rank: w.ar[1][1] } : null,
      ],
    };
  }

  let companion: CompanionBuild | null = null;
  const companionData = json.c;
  if (companionData) {
    const compPols: Polarity[] = companionData.p ?? Array(8).fill(UNIVERSAL);
    companion = {
      id: companionData.i,
      type: companionData.t as CompanionBuild['type'],
      normalMods: (companionData.m ?? []).map((t: [string, number], i: number) => toModFromTuple(t, compPols[i] ?? UNIVERSAL, UNIVERSAL)),
      slotPolarities: compPols,
      weapon: (() => {
        const w = companionData.w;
        if (!w) return null;
        return {
          id: w.i,
          normalMods: (w.m ?? []).map((t: [string, number], i: number) => toModFromTuple(t, (w.p ?? Array(8).fill(UNIVERSAL))[i] ?? UNIVERSAL, UNIVERSAL)),
          slotPolarities: w.p ?? Array(8).fill(UNIVERSAL),
        };
      })(),
    };
  }

  return {
    name: 'Saved Build',
    warframe: {
      id: json.f ?? '',
      aura: auraMod,
      exilus: exilusMod,
      normalMods: wfMods,
      arcanes: arcanes,
      shards,
      helminth,
      exaltedWeapon: null,
    },
    primary: weapons.primary ?? null,
    secondary: weapons.secondary ?? null,
    melee: weapons.melee ?? null,
    'arch-gun': weapons['arch-gun'] ?? null,
    'arch-melee': weapons['arch-melee'] ?? null,
    companion,
    targetFaction: '',
    isAiming: false,
    activeStatuses: 0,
  } as BuildCore;
}
