import type { Polarity } from '../../../engine/build-core';
import type { ArcaneSlot, ModSlot, ShardSlot } from '../model';

export interface OverwolfMessage {
  id: string;
  data?: {
    uniqueNames?: string[];
    name?: string;
    warframe?: OverwolfLoadout['warframe'];
    weapons?: OverwolfLoadout['weapons'];
    companion?: OverwolfLoadout['companion'];
    [key: string]: unknown;
  };
}

export interface OverwolfModItem {
  uniqueName: string;
  rank: number | null;
}

export interface OverwolfArcaneItem {
  uniqueName: string;
  rank: number;
}

export interface OverwolfLoadout {
  warframe?: {
    id: string;
    aura?: OverwolfModItem;
    exilus?: OverwolfModItem;
    mods?: OverwolfModItem[];
    arcanes?: (OverwolfArcaneItem | null)[];
    shards?: ({ color: string | null; isTau?: boolean } | null)[];
    helminthDonor?: string;
  };
  weapons?: Record<string, {
    id: string;
    mods?: OverwolfModItem[];
    arcanes?: (OverwolfArcaneItem | null)[];
  }>;
  companion?: {
    id: string;
    weaponId?: string;
    mods?: OverwolfModItem[];
    weaponMods?: OverwolfModItem[];
  };
}

export interface LegacyLoadout {
  warframe?: {
    id?: string;
    aura?: ModSlot | null;
    exilus?: ModSlot | null;
    mods?: ModSlot[];
    slotPolarities?: Polarity[];
    shards?: ShardSlot[];
    arcanes?: [ArcaneSlot | null, ArcaneSlot | null];
    exaltedWeapon?: import('../model').WeaponState | null;
  };
  weapons?: {
    primary?: import('../model').WeaponState;
    secondary?: import('../model').WeaponState;
    melee?: import('../model').WeaponState;
  };
  companion?: {
    type?: string;
    id?: string;
    weaponId?: string;
    mods?: ModSlot[];
    weaponMods?: ModSlot[];
    slotPolarities?: Polarity[];
    weaponSlotPolarities?: Polarity[];
  };
}

export const CATEGORIES = [
  { key: 'warframe' }, { key: 'primary' }, { key: 'secondary' }, { key: 'melee' },
  { key: 'arch-gun' }, { key: 'arch-melee' }, { key: 'companion' },
];
